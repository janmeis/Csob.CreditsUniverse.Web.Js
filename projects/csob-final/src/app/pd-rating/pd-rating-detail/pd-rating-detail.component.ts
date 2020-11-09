import { Location } from '@angular/common';
import { AfterViewInit, Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, of } from 'rxjs';
import { first, map, mergeMap, tap } from 'rxjs/operators';
import { EnumValue } from '../../app-common/components/editor-enum/editor-enum.component';
import { AppConfig } from 'projects/services/src/public-api';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { CodebooksService } from 'projects/services/src/public-api';
import { SecurityService } from 'projects/services/src/public-api';
import { UrlHelperService } from 'projects/services/src/public-api';
import { MessageBoxDialogComponent } from '../../app-common/components/message-box-dialog/message-box-dialog.component';
import { FinancialStatementSelectDialogComponent } from '../../financial/financial-select-dialog/financial-select-dialog.component';
import { CanComponentDeactivate } from 'projects/services/src/public-api';
import { SelectedPartyService } from 'projects/services/src/public-api';
import { TranslationService } from 'projects/services/src/public-api';
import { UserNotificationService } from 'projects/services/src/public-api';
import { UserProgressService } from 'projects/services/src/public-api';
import { FinancialApiService } from 'projects/services/src/public-api';
import { PdRatingApiService } from 'projects/services/src/public-api';
import { EAnswerType, ECriterionType, EPDRatingCategory, EStatePDRating, IExportOptions, IFinStatDataDto, IFinStatTabDto, IPDRatingApprovedDto, IPDRatingCritDto, IPDRatingDataDto, IPDRatingEditDto, IPDRatingItemValueDto, IPDRatingSectionDto, IPDRatingTabDto, IPDRSelectedAnswerSaveDto } from 'projects/services/src/public-api';
import { PDRSelectedAnswerDto } from 'projects/services/src/public-api';
import { PdRatingExportDialogComponent } from '../components/pd-rating-export-dialog/pd-rating-export-dialog.component';
import { PdRatingSelectDialogComponent } from '../components/pd-rating-select-dialog/pd-rating-select-dialog.component';
import { TabLabel, TabType } from '../models/pd-overview';
import { IPartyHeaderDto } from 'projects/services/src/public-api';

@UntilDestroy()
@Component({
    selector: 'app-pd-rating-detail',
    templateUrl: './pd-rating-detail.component.html',
    styleUrls: ['./pd-rating-detail.component.less'],
})
export class PDRatingDetailComponent extends BasePermissionsComponent implements CanComponentDeactivate, OnInit, OnDestroy, AfterViewInit {
    @ViewChild('form') form: NgForm;
    mode: 'new' | 'loading' | 'edit' | 'completed';
    id: number;
    model: IPDRatingDataDto;
    EAnswerType = EAnswerType;
    EStatePDRating = EStatePDRating;
    selectedTab: TabLabel;
    tabs: TabLabel[] = [];
    TabType = TabType;
    canComplete = false;
    canCopy = false;
    canChangeFinData = false;
    canCalculate = false;
    canExport = false;
    stateFinished = false;
    selectedEssSection: number;
    finModel: IFinStatDataDto;
    finSelectedTab: IFinStatTabDto;
    currentParty: IPartyHeaderDto = null;
    exportOptions = {
        IsCollapsed: true,
        IsHeaderCollapsed: true,
    } as IExportOptions;
    isFinDataChanged = false;
    isFromMonitoring = false;
    pdRatingCategoryEnumValues: EnumValue[];
    pdRatingApproved: IPDRatingApprovedDto;

    private readonly lockedMessage = this.translation.$$get('pd_rating_detail.pd_rating_locked');
    private readonly unlockedMessage = this.translation.$$get('pd_rating_detail.pd_rating_unlocked');
    private lockingStateInterval: any;
    private isLoading = false;
    private selectedTabType: TabType = TabType.Result;
    private monitoringQueryParams: Params = {};

    constructor(
        private appConfig: AppConfig,
        private codebooksService: CodebooksService,
        private finApi: FinancialApiService,
        private injector: Injector,
        private notification: UserNotificationService,
        private pdApi: PdRatingApiService,
        public progress: UserProgressService,
        private route: ActivatedRoute,
        private router: Router,
        private selectedPartyService: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        protected securityService: SecurityService,
        private urlHelper: UrlHelperService,
        private location: Location) {
        super(securityService);
    }

    ngOnInit() {
        this.getUrlParams();
        this.id = +this.route.snapshot.paramMap.get('id');
        this.isFinDataChanged = false;
        this.setSelectedTabFromUrl();

        this.progress.runProgress(
            this.selectedPartyService.partyHeader.pipe(
                tap(data => {
                    this.currentParty = data;
                    super.fillRights(data);
                }),
                mergeMap(_ => this.codebooksService.GetCodebook('EPDRatingCategory')),
                mergeMap(category => this.finApi.getExistsConsolidationFinishFV(this.currentParty.Id).pipe(
                    tap(exists => {
                        const filteredCategory = exists || this.stateFinished ? category : category.filter(c => c.Value != EPDRatingCategory.Comparison);
                        this.pdRatingCategoryEnumValues = filteredCategory.map(c => ({ value: c.Value, text: c.Text } as EnumValue));
                    })
                )),
                mergeMap(() => {
                    if (!this.id) {
                        this.mode = 'new';
                        this.title.setTitle(this.translation.$$get('pd_rating_detail.create_and_compute_new_pd_rating'));
                        // TODO: Systém vyhledá PD model klienta v entitě / poli "Party/PD model"
                        // (TODO)pokud tam není, měl by ho uživatel umět zadat, nebo vrátíme chybu, ať si ho zadá
                        const pdRatingModel = +this.route.snapshot.queryParamMap.get('pdRatingModel');

                        return this.pdApi.getNewCalculatePDRating(pdRatingModel);
                    }

                    this.title.setTitle(this.translation.$$get('pd_rating_detail.pd_rating_detail'));
                    this.mode = 'loading';
                    this.mode = 'edit';
                    // todo: set mode according to state of data
                    // this.mode = 'completed'
                    return this.pdApi.getPDRatingDetail(this.id);
                }),
                tap(data => this.model = data),
                tap(_ => this.fillPdData()))
        ).subscribe();
    }

    ngAfterViewInit(): void {
        if (this.form && this.form.form) {
            this.form.form.markAsPristine();
        }
    }

    ngOnDestroy() {
        if (this.lockingStateInterval)
            clearInterval(this.lockingStateInterval);
    }

    onTabSelect(selectEvent) {
        this.isLoading = true;

        const tabIndex = selectEvent.index;
        this.selectedTab = this.tabs[tabIndex];

        this.isLoading = false;
    }

    onFinTabSelect(selectEvent) {
        const tabIndex = selectEvent.index;
        this.finSelectedTab = this.finModel.Tabs[tabIndex];
    }

    private update(id: number) {
        this.progress.runProgress(this.pdApi.getPDRatingDetail(id).pipe(
            tap(data => this.model = data)
        )).subscribe(() => this.fillPdData());
    }

    getName(section: IPDRatingSectionDto, criteria: IPDRatingCritDto) {
        return `s${section.Id}_q${criteria.CritTempId}`;
    }
    onEssSectionClicked(section: IPDRatingSectionDto) {
        this.onValueChanged();
        this.selectedEssSection = section.Id;
        const essTab = this.selectedTab.Content as IPDRatingTabDto;
        essTab.Sections.forEach(s => {
            this.createIfNotExists(s.Criterions[0]);
            s.Criterions[0].SelectedAnswerDto.BoolChoice = s.Id === section.Id;
        });
    }
    onSave() {
        this.notification.clear();
        this.selectedTabType = this.selectedTab.Type;;

        this.progress.runProgress(
            this.saveAndRefresh())
            .subscribe(result => {
                if (result) {
                    this.notification.success(this.translation.$$get('pd_rating_detail.data_was_saved'));
                    this.router.navigate(['detail', this.id], { relativeTo: this.route.parent, replaceUrl: true, queryParams: { selectedTabType: this.selectedTab.Type } });
                }
            });
    }

    saveAndRefresh() {
        return this.save().pipe(
            mergeMap(saved => {
                if (saved) {
                    this.form.reset();
                    return this.pdApi.getPDRatingDetail(this.id).pipe(
                        tap(model => {
                            this.model = model;
                            this.fillPdData();
                        }),
                        map(() => true));
                }

                return of(false);
            }));
    }

    createIfNotExists(criteria: IPDRatingCritDto): boolean {
        if (!criteria.SelectedAnswerDto) {
            criteria.SelectedAnswerDto = new PDRSelectedAnswerDto();
        }
        return true;
    }

    onChangeFinData() {
        // * orientační rating - pro výpočet lze vybrat finanční výkazy nedokončené a dokončené
        // * standardní nebo monitorovací rating - pro výpočet lze vybrat pouze dokončené finanční výkazy
        const onlyFinished = [EPDRatingCategory.Standard, EPDRatingCategory.Monitoring, EPDRatingCategory.Comparison].indexOf(this.model.PDRatingCategoryEnum) >= 0;
        // *Pokud uživatel v rámci funkce Zadat nový výpočet vybral Porovnávací rating – zobrazí se při akci Vybrat Finanční data v seznamu pouze dokončené nekonsolidované finanční výkazy
        const onlyNonConsolidation = [EPDRatingCategory.Comparison].indexOf(this.model.PDRatingCategoryEnum) >= 0;
        FinancialStatementSelectDialogComponent
            .showDialog(this.injector, 'pd-rating', this.currentParty.Id, { onlyFinished: onlyFinished, pdRatingModelId: this.model.PDRatingModelId, onlyNonConsolidation: onlyNonConsolidation }, true)
            .then(res => {
                if (res) {
                    this.onSelectedStatements(res);
                    if (this.model.PDRatingResultTab) {
                        this.model.PDRatingResultTab = null;
                    }
                }
            });
    }
    onSelectedStatements(ids: number[]) {
        if (ids && ids.length > 0) {
            this.model.SelectedFinancialStatementId = ids[0];
            this.updateFinModel(true);
        }
    }
    onComplete() {
        this.selectedTabType = this.selectedTab.Type;
        this.updateUrl();

        const pdRatingEditDto = this.getPdRatingEditDto(this.model, this.currentParty);
        this.progress.runAsync(this.pdApi.postCompletePDRating(pdRatingEditDto))
            .then(() => {
                this.notification.success(this.translation.$$get('pd_rating_detail.data_saved_as_complete'));
                this.update(this.id);
                this.form.form.markAsPristine();
            });
    }
    onApprobate() {
        const pdRatingEditDto = this.getPdRatingEditDto(this.model, this.currentParty);
        this.progress.runProgress(this.pdApi.postApprobatePDRating(pdRatingEditDto))
            .subscribe(_ => {
                this.notification.clear();
                this.notification.success(this.translation.$$get('pd_rating_detail.data_was_saved'));
                this.update(this.id);
                this.form.form.markAsPristine();
            });
    }

    onAdditionalApprobate(id: string) {
        if (!this.pdRatingApproved) {
            this.pdRatingApproved = {
                PDRatingId: this.model.PDRatingId,
                PDRatinVersion: this.model.PDRatingVersion,
                ApprovedDto: {} as IPDRatingItemValueDto
            } as IPDRatingApprovedDto;
            const el = document.getElementById(id);
            setTimeout(() => {
                el.scrollIntoView({ behavior: 'smooth' });
            });
        } else {
            this.progress.runProgress(this.pdApi.postSaveApprovedPDRating(this.pdRatingApproved))
                .subscribe(_ => {
                    this.notification.clear();
                    this.notification.success(this.translation.$$get('pd_rating_detail.data_was_saved'));
                    this.update(this.id);
                    this.form.form.markAsPristine();
                    this.pdRatingApproved = null;
                });
        }
    }

    async onCalculate() {
        this.notification.clear();

        if (this.form && this.form.dirty || !this.model.PDRatingId || this.isFinDataChanged) {
            await this.saveAndRefresh().toPromise();
            this.notification.success(this.translation.$$get('pd_rating_detail.data_was_saved'));
            this.isFinDataChanged = false;
        }

        this.calculate();
    }

    calculate() {
        const pdRatingEditDto = this.getPdRatingEditDto(this.model, this.currentParty);
        this.progress.runAsync(this.pdApi.postCountPDRating(pdRatingEditDto))
            .then(() => {
                this.notification.success(this.translation.$$get('pd_rating_detail.new_pd_rating_calculated'));
                this.selectedTabType = TabType.Result;
                this.update(this.id);
            });
    }

    onOverviewClick() {
        this.router.navigate(['overview'], { relativeTo: this.route.parent });
    }

    onToMonitoringClick() {
        this.router.navigate(['../monitoring/overview'], { queryParams: this.monitoringQueryParams, relativeTo: this.route.parent });
    }

    private fillPdData() {
        this.tabs = [];
        this.selectedTab = null;
        if (this.model.FinDataNeeded &&
            (this.model.StateEnum === EStatePDRating.InProcess || this.model.SelectedFinancialStatementId)) {
            this.tabs.push({ Content: this.model.SelectedFinancialStatementId, Type: TabType.FinancialData, Label: this.translation.$$get('pd_rating_detail.financial_data') });
            this.updateFinModel(false);
        }

        for (const tab of this.model.Tabs) {
            if (tab.CriterionType === ECriterionType.Mandatory)
                this.tabs.push({ Content: tab, Type: TabType.MandatoryCriteria, Label: this.translation.$$get('pd_rating_detail.mandatory_criteria') });
            if (tab.CriterionType === ECriterionType.Soft)
                this.tabs.push({ Content: tab, Type: TabType.OtherCriteria, Label: this.translation.$$get('pd_rating_detail.soft_criteria') });
            if (tab.CriterionType === ECriterionType.NonFinancial)
                this.tabs.push({ Content: tab, Type: TabType.NonFinancialCriteria, Label: this.translation.$$get('pd_rating_detail.non_financial_criteria') });
            if (tab.CriterionType === ECriterionType.InflueceESS) {
                this.tabs.push({ Content: tab, Type: TabType.InfluenceESS, Label: this.translation.$$get('pd_rating_detail.influence_ess') });
                const selectedEssSection = tab.Sections.find(s => s.Criterions[0].SelectedAnswerDto && s.Criterions[0].SelectedAnswerDto.BoolChoice || false);
                this.selectedEssSection = selectedEssSection ? selectedEssSection.Id : 0;
            }
        }

        if (this.model.PDRatingResultTab) {
            this.tabs.push({ Content: this.model.PDRatingResultTab, Type: TabType.Result, Label: this.translation.$$get('pd_rating_detail.result_pd_rating') });
        }

        if (this.selectedTabType) {
            this.selectedTab = this.tabs.find(t => t.Type === this.selectedTabType);
        }

        if (!this.selectedTab) {
            this.selectedTab = this.tabs[0];
        }

        this.canChangeFinData = this.model.StateEnum == EStatePDRating.InProcess && this.tabs.map(t => t.Type).includes(TabType.FinancialData);
        this.canComplete = this.model.StateEnum === EStatePDRating.InProcess && this.model.PDRatingResultTab != null && !!this.model.PDRatingCategoryEnum;
        this.canCopy = this.model.StateEnum === EStatePDRating.InProcess &&
            this.model.Tabs.find(c => c.CriterionType == ECriterionType.NonFinancial) != null;
        this.stateFinished = this.model.StateEnum === EStatePDRating.Finished || this.model.StateEnum === EStatePDRating.Approved;
        this.canCalculate = !this.model.PDRatingResultTab || (this.model.Tabs && this.model.Tabs.length > 0);
        this.canExport = this.model.PdModel && this.model.PdModel.CanExportPDRating && this.model.PDRatingResultTab && Boolean(this.model.PDRatingResultTab.CalculationDate);

        if (this.model.IsLocked) {
            this.notification.messages = this.notification.messages.filter(m => m.message != this.lockedMessage && m.message != this.unlockedMessage);
            this.notification.error(this.lockedMessage);
        }

        this.lockingStateInterval = this.checkLockingState();
        this.setPdModelFromUrl();
    }

    private updateFinModel(markFormDirty?: boolean) {
        if (!this.model.SelectedFinancialStatementId)
            return;
        this.progress.runAsync(this.finApi.getDetail([this.model.SelectedFinancialStatementId], [], { pdRatingRatiosId: this.id }))
            .then(container => {
                const data = container.FinStatDataDto;
                if (!data.Tabs || data.Tabs.length == 0) {
                    this.notification.error(this.translation.$$get('pd_rating_detail.no_data_found'));
                    return;
                }

                this.finModel = data;
                this.finSelectedTab = this.finModel.Tabs[0];

                if (markFormDirty) {
                    this.isFinDataChanged = true;
                    this.form.form.markAsDirty();
                } else
                    this.form.form.markAsPristine();
            })
            .catch(() => {
                this.model.SelectedFinancialStatementId = null;
            });
    }
    private save(): Observable<boolean> {
        if (this.form.invalid)
            return of(false);

        return of(this.getPdRatingEditDto(this.model, this.currentParty)).pipe(
            mergeMap(rating => this.pdApi.postSavePDRatingDetail(rating)),
            tap(id => this.id = id),
            map(() => true),
            first()
        );
    }
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (!this.progress.running && this.form && this.form.dirty && !this.stateFinished && (this.hasRightTo && this.hasRightTo['PdRatingsave'])) {
            return MessageBoxDialogComponent.dirtyConfirmation(this.injector, () => this.save());
        }

        return of(true);
    }
    async onCopy() {
        const selectedPdRating = await PdRatingSelectDialogComponent.show(this.injector, { partyId: this.currentParty.Id, onlyCompleted: false, isCopy: true, currentPdRatingId: this.id });

        if (selectedPdRating) {
            const selectedTabType = this.selectedTab.Type;
            this.selectedTabType = selectedTabType;
            this.updateUrl();

            if (this.form && this.form.dirty || !this.id) {
                this.notification.clear();

                const result = await this.saveAndRefresh().toPromise();
                if (result) {
                    this.notification.success(this.translation.$$get('pd_rating_detail.data_was_saved'));
                }
            }

            this.copyFromAsync(selectedPdRating.Id).then((message) => {
                this.notification.success(message);
                this.form.form.markAsDirty();

                this.saveAndRefresh().subscribe(() => {
                    this.router.navigate(['detail', this.id], { relativeTo: this.route.parent, replaceUrl: true, queryParams: { selectedTabType: selectedTabType } });
                });
            });
        }
    }

    async onExport() {
        PdRatingExportDialogComponent.showDialog(this.injector, this.id);
    }

    private async copyFromAsync(sourceId: number) {
        const sourceData = await this.progress.runAsync(this.pdApi.getPDRatingDetail(sourceId));

        const nonFinancialCopied = this.copyTabsData(sourceData, ECriterionType.NonFinancial);
        const influenceEssCopied = this.copyTabsData(sourceData, ECriterionType.InflueceESS);

        this.model = Object.assign({}, this.model);
        this.fillPdData();

        let message: string;

        if (nonFinancialCopied && influenceEssCopied) {
            message = this.translation.$$get('pd_rating_detail.pd_rating_copied_non_financial_and_ess');
        } else if (nonFinancialCopied) {
            message = this.translation.$$get('pd_rating_detail.pd_rating_copied_non_financial_only');
        } else {
            message = this.translation.$$get('pd_rating_detail.pd_rating_copied_ess_only');
        }

        this.notification.success(message);
        this.form.form.markAsDirty();

        return message;
    }

    private copyTabsData(sourceData: IPDRatingDataDto, criterionType: ECriterionType): boolean {
        const sourceTab = sourceData.Tabs.find(tab => tab.CriterionType === criterionType);
        const destinationTab = this.model.Tabs.find(tab => tab.CriterionType === criterionType);

        const existsInBoth = Boolean(sourceTab && destinationTab);

        if (existsInBoth) {
            sourceTab.Sections.forEach(sourceSection => {
                const foundDestSection = destinationTab.Sections.find(destSection => destSection.Id == sourceSection.Id);
                if (foundDestSection && sourceSection.Criterions) {
                    sourceSection.Criterions.forEach(sourceCriterion => {
                        const foundDestCrit = foundDestSection.Criterions.find(x => x.CritTempId == sourceCriterion.CritTempId);
                        if (foundDestCrit) {
                            let id = null;
                            if (foundDestCrit.SelectedAnswerDto) {
                                id = foundDestCrit.SelectedAnswerDto.CriterionId;
                            }

                            foundDestCrit.SelectedAnswerDto = sourceCriterion.SelectedAnswerDto;

                            if (foundDestCrit.SelectedAnswerDto) {
                                foundDestCrit.SelectedAnswerDto.CriterionId = id ? id : 0;
                            }
                        }
                    });
                }
            });
        }

        return existsInBoth;
    }

    private getPdRatingEditDto(pdRatingData: IPDRatingDataDto, party: IPartyHeaderDto): IPDRatingEditDto {

        const pdRatingEditDto = {
            SelectedAnswers: new Array<IPDRSelectedAnswerSaveDto>(),
            SelectedFinancialStatementId: pdRatingData.SelectedFinancialStatementId,
            PDRatingModelId: party.PDModelId,
            CreditFileId: party.CreditFileId,
            PDRatingId: pdRatingData.PDRatingId,
            PDRatingVersion: pdRatingData.PDRatingVersion,
            PDRatingCategoryEnum: pdRatingData.PDRatingCategoryEnum,
            UseAsMonitoring: pdRatingData.UseAsMonitoring,
        } as IPDRatingEditDto;

        if (pdRatingData.PDRatingResultTab) {
            pdRatingEditDto.CalculationDate = pdRatingData.PDRatingResultTab.CalculationDate;
            pdRatingEditDto.PDDate = pdRatingData.PDRatingResultTab.PDDate;
            pdRatingEditDto.Consolidation = pdRatingData.PDRatingResultTab.Consolidation;
            pdRatingEditDto.CountedPdRatingId = pdRatingData.PDRatingResultTab.CountedPdRatingId;
            pdRatingEditDto.PercentageRating = pdRatingData.PDRatingResultTab.PercentageRating;
            pdRatingEditDto.ExternalRatingId = pdRatingData.PDRatingResultTab.ExternalRatingId;
            pdRatingEditDto.SuggestedPDRating = {
                RatingId: pdRatingData.PDRatingResultTab.SuggestedPDRating.RatingId,
                OverrulingReasonKey: pdRatingData.PDRatingResultTab.SuggestedPDRating.OverrulingReasonKey,
                Comment: pdRatingData.PDRatingResultTab.SuggestedPDRating.Comment,
            } as IPDRatingItemValueDto;
            pdRatingEditDto.SuggestedAdvisorPDRating = {
                RatingId: pdRatingData.PDRatingResultTab.SuggestedAdvisorPDRating.RatingId,
                OverrulingReasonKey: pdRatingData.PDRatingResultTab.SuggestedAdvisorPDRating.OverrulingReasonKey,
                Comment: pdRatingData.PDRatingResultTab.SuggestedAdvisorPDRating.Comment,
            } as IPDRatingItemValueDto;
            if (pdRatingData.PDRatingResultTab.ApprovedPDRatings != null) {
                pdRatingEditDto.ApprovedPDRatings = [];
                for (let index = 0; index < pdRatingData.PDRatingResultTab.ApprovedPDRatings.length; index++) {
                    pdRatingEditDto.ApprovedPDRatings = [...pdRatingEditDto.ApprovedPDRatings, {
                        RatingId: pdRatingData.PDRatingResultTab.ApprovedPDRatings[index].RatingId,
                        OverrulingReasonKey: pdRatingData.PDRatingResultTab.ApprovedPDRatings[index].OverrulingReasonKey,
                        Comment: pdRatingData.PDRatingResultTab.ApprovedPDRatings[index].Comment,
                        ApprovalDate: pdRatingData.PDRatingResultTab.ApprovedPDRatings[index].ApprovalDate,
                        ApprovalLevel: pdRatingData.PDRatingResultTab.ApprovedPDRatings[index].ApprovalLevel,
                    } as IPDRatingItemValueDto];
                }
            }
        }

        if (pdRatingData.Tabs)
            pdRatingData.Tabs.forEach(tab =>
                tab.Sections.forEach(section =>
                    section.Criterions.forEach(criterion => {
                        if (criterion.SelectedAnswerDto &&
                            (criterion.SelectedAnswerDto.BoolChoice != null || criterion.SelectedAnswerDto.NumberChoice || criterion.SelectedAnswerDto.AnswerChoice ||
                                (criterion.SelectedAnswerDto.InfluenceEss || criterion.SelectedAnswerDto.CountryChoice))) {
                            pdRatingEditDto.SelectedAnswers.push(this.getSelectedAnswer(tab, section, criterion));
                        }
                    })
                ));

        return pdRatingEditDto;
    }
    private getSelectedAnswer(tab: IPDRatingTabDto, section: IPDRatingSectionDto, criterion: IPDRatingCritDto): IPDRSelectedAnswerSaveDto {
        return {
            CritTempId: criterion.CritTempId,
            AnswerType: criterion.AnswerType,
            CriterionId: criterion.SelectedAnswerDto.CriterionId,
            BoolChoice: criterion.SelectedAnswerDto.BoolChoice,
            NumberChoice: criterion.SelectedAnswerDto.NumberChoice,
            AnswerChoice: criterion.SelectedAnswerDto.AnswerChoice,
            InfluenceEss: criterion.SelectedAnswerDto.InfluenceEss,
            CountryChoice: criterion.SelectedAnswerDto.CountryChoice,
            CriterionType: tab.CriterionType,
            Section: section.Id
        };
    }
    public categoryValueChange(category: EPDRatingCategory) {
        if (this.model.PDRatingCategoryEnum == category)
            return;
        this.model.PDRatingCategoryEnum = category;
        if (this.model.SelectedFinancialStatementId) {
            this.model.SelectedFinancialStatementId = null;
            this.finModel = null;
            this.finSelectedTab = null;
            // this.selectedTab = this.tabs.find(x => x.Type == TabType.FinancialData);
        }
    }

    private updateUrl() {
        const params = {
            selectedTabType: this.selectedTab.Type,
            pdRatingModel: this.model.PDRatingModelId
        } as any;

        this.urlHelper.saveToUrl(params, this.location);
    }

    private setSelectedTabFromUrl() {
        const selectedTabType = this.route.snapshot.queryParamMap.get('selectedTabType');
        if (selectedTabType) {
            this.selectedTabType = +selectedTabType;
        }
    }

    private setPdModelFromUrl() {
        const pdRatingModelId = this.route.snapshot.queryParamMap.get('pdRatingModel');
        if (pdRatingModelId) {
            this.model.PDRatingModelId = +pdRatingModelId;
        }
    }

    private checkLockingState(): any {
        return setInterval(async () => {
            this.progress.runProgress(this.pdApi.getIsPDRatingLocked(this.id))
                .subscribe(isLocked => {
                    this.notification.messages = this.notification.messages.filter(m => m.message != this.lockedMessage && m.message != this.unlockedMessage);

                    if (isLocked)
                        this.notification.error(this.lockedMessage);
                    else if (this.model.IsLocked)
                        this.notification.warning(this.unlockedMessage);

                    this.model.IsLocked = isLocked;
                });
        }, this.appConfig.checkLockingInterval);
    }

    isPDCategoryStandard() {
        return this.model.PDRatingCategoryEnum == EPDRatingCategory.Standard;
    }

    onValueChanged() {
        if (!this.isLoading && this.form && this.form.form) {
            this.form.form.markAsDirty();
        }
    }
    onShowColapsedClicked() {
        this.exportOptions.IsCollapsed = !this.exportOptions.IsCollapsed;
        if (this.form && this.form.controls['showCollapsed'])   //HACK!!!
            this.form.controls['showCollapsed'].markAsPristine();
    }

    private getUrlParams() {
        this.route.queryParams.pipe(
            untilDestroyed(this)
        ).subscribe(params => {
            this.isFromMonitoring = !!params['Granularity'];
            if (this.isFromMonitoring)
                this.monitoringQueryParams = params;
        });
    }
}
