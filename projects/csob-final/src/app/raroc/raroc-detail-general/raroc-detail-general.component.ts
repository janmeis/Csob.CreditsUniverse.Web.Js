import { AfterViewInit, Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { flatMap, map, tap } from 'rxjs/operators';

import { EditorCodeBookComponent, ICodebookProvider, GetStaticCodebookProvider } from 'projects/app-common/src/public-api';
import { EditorValidation } from 'projects/app-common/src/public-api';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { PdRatingSelectDialogComponent } from '../../pd-rating/components/pd-rating-select-dialog/pd-rating-select-dialog.component';
import { SecurityService } from 'projects/services/src/public-api';
import { SelectedPartyService } from 'projects/services/src/public-api';
import { TranslationService } from 'projects/services/src/public-api';
import { UserNotificationService } from 'projects/services/src/public-api';
import { UserProgressService } from 'projects/services/src/public-api';
import { CodebookApiService } from 'projects/services/src/public-api';
import { RarocApiService } from 'projects/services/src/public-api';
import { ERarocMode, EStateRaroc, ICodebookItem, ILGDModelCodebookItem, IPartyHeaderDto, IPDRatingOverviewResDto, IRarocDto, IRarocValidationDto } from 'projects/services/src/public-api';
import { RarocDetailService } from '../raroc-detail/raroc-detail.service';
import { IsValid } from '../raroc-overview/raroc-overview.component';

@Component({
    selector: 'app-raroc-detail-general',
    templateUrl: './raroc-detail-general.component.html',
    styleUrls: ['./raroc-detail-general.component.less'],
    providers: [
        RarocDetailService
    ]
})
export class RarocDetailGeneralComponent extends BasePermissionsComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges, IsValid {
    @ViewChild('form') form: NgForm;

    private formSubscription: Subscription;

    private _raroc: IRarocDto;
    get raroc(): IRarocDto {
        return this._raroc;
    }
    @Input() set raroc(value: IRarocDto) {
        this._raroc = value;
        this.rarocChange.emit(this.raroc);

        if (this.raroc.PDRatingId) {
            this.selectedPdRating = { Id: this.raroc.PDRatingId, RatingForRaroc: this.raroc.PDRatingValue } as IPDRatingOverviewResDto
        }
    }
    @Input() readonly: boolean;
    @Output() rarocChange = new EventEmitter<IRarocDto>()
    @Output() formChanged = new EventEmitter<boolean>();
    @Output() rarocValidationChanged = new EventEmitter<IRarocValidationDto>()

    isExternal: boolean = false;
    lgdModels: ICodebookProvider;
    externalRatings: ICodebookProvider;
    projectTypes: ICodebookProvider;
    isSPVType = false;
    isProjectType = false;
    validations: { [key: string]: EditorValidation; };
    selectedPdRating: IPDRatingOverviewResDto;
    EStateRaroc = EStateRaroc;

    private party: IPartyHeaderDto;

    get totalIncome(): number {
        if (this.raroc) {
            this.raroc.TotalNCIncome = (+this.raroc.FXIncome + +this.raroc.DepositIncome + +this.raroc.PaymentIncome + +this.raroc.OtherIncome) || 0;
            return this.raroc.TotalNCIncome;
        }
        return 0;
    }

    constructor(
        private codebooksApi: CodebookApiService,
        private injector: Injector,
        private notification: UserNotificationService,
        private progress: UserProgressService,
        private rarocDetailService: RarocDetailService,
        private selectedParty: SelectedPartyService,
        private translation: TranslationService,
        private rarocApi: RarocApiService,
        protected securityService: SecurityService
    ) {
        super(securityService);
    }

    ngOnInit(): void {
        this.progress.runProgress(
            this.selectedParty.partyHeader.pipe(
                tap(party => {
                    this.party = party;
                    super.fillRights(party);
                }),
                flatMap(() => this.rarocDetailService.allLgdModels$),
                map(m => m.find(s => s.Value == this.raroc.LGDModelId))
            )).subscribe(codebookItem => {
                this.setSpvTypeProjType(codebookItem);
            });

        this.loadExternalRatings(this.raroc.PDRatingModelId);
        this.loadProjectTypes();

        if (this.raroc.LGDModelId) {
            this.getRarocValidation();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['raroc']) {
            if (changes['raroc'].firstChange) {
                this.lgdModels = this.rarocDetailService.getFilteredLgdModels(this.raroc.PDRatingModelId);
                if (!this.raroc.LGDModelId)
                    this.notification.error(this.translation.$$get('raroc_detail_general.lgdmodel_is_empty'));
            } else {
                this.getRarocValidation();
            }
        }
    }

    ngAfterViewInit(): void {
        if (this.form)
            this.formSubscription = this.form.valueChanges.subscribe(() => {
                this.formChanged.emit(this.form.dirty);
            })
    }

    ngOnDestroy(): void {
        if (this.formSubscription)
            this.formSubscription.unsubscribe();
    }

    pdRatingModelSelectionChange(pdRatingModelItem: ICodebookItem, lgdModel: EditorCodeBookComponent): void {
        lgdModel.value = null;

        if (pdRatingModelItem)
            this.lgdModels = this.rarocDetailService.getFilteredLgdModels(pdRatingModelItem.Value);

        this.setSpvTypeProjType({ SPVType: false, ProjectType: false } as ILGDModelCodebookItem);
        // 5962:FINAL-1692: P2 UAT_CAFE_ RAROC v modelu č. 20 nedává doplňující otázku nutnou pro výpočet#CHR1910_162
        if (this.isSPVType)
            this.raroc.Multiplicator = true;
        this.loadExternalRatings(pdRatingModelItem.Value);
        this.clearSelectedPdRating();
    }

    lgdModelSelectionChange(lgdModelItem: ICodebookItem) {
        if (lgdModelItem)
            this.progress.runProgress(
                this.rarocDetailService.allLgdModels$.pipe(
                    map(m => m.find(s => s.Value == lgdModelItem.Value))
                )).subscribe(codebookItem => {
                    const lgdModelCodebookItem = !lgdModelItem
                        ? { SPVType: false, ProjectType: false } as ILGDModelCodebookItem
                        : codebookItem;
                    this.setSpvTypeProjType(lgdModelCodebookItem);
                    // 5962:FINAL-1692: P2 UAT_CAFE_ RAROC v modelu č. 20 nedává doplňující otázku nutnou pro výpočet#CHR1910_162
                    if (this.isSPVType)
                        this.raroc.Multiplicator = true;

                    if (lgdModelItem.Value != this.raroc.LGDModelId) {
                        this.clearSelectedPdRating();
                    }
                });
    }

    async onSelectPdRatingClick() {
        const selectedPdRating = await PdRatingSelectDialogComponent.show(this.injector, { partyId: this.party.Id, isForRaroc: true, pdModelId: this.raroc.PDRatingModelId });
        if (selectedPdRating && selectedPdRating.Id) {
            this.selectedPdRating = selectedPdRating;
            this.raroc.PDRatingId = +selectedPdRating.Id;
        }
        else {
            this.raroc.ExternalRatingId = null;
            this.raroc.RatingId = null;
            this.raroc.PDRatingId = null;
        }

        this.form.form.markAsDirty();
        this.formChanged.emit(this.form.dirty);
    }

    onRemoveSelectedPdRatingClick() {
        this.raroc.ExternalRatingId = null;
        this.raroc.PDRatingId = null;

        this.form.form.markAsDirty();
    }

    isValid(): boolean {
        this.validations = {};
        if (!this.raroc.PDRatingModelId) {
            const validation = { value: this.raroc.PDRatingModelId, errors: [this.translation.$$get('field_x_is_required', this.translation.$$get('raroc_detail_general.pd_model'))] } as EditorValidation;
            this.validations['PDRatingModelId'] = validation;
        }
        if (!this.raroc.LGDModelId) {
            const validation = { value: this.raroc.LGDModelId, errors: [this.translation.$$get('field_x_is_required', this.translation.$$get('raroc_detail_general.lgd_model'))] } as EditorValidation;
            this.validations['LGDModelId'] = validation;
        }
        return Object.keys(this.validations).length == 0;
    }

    private loadProjectTypes() {
        this.rarocApi.getProjectTypes(ERarocMode.ProjectFinance).subscribe(projectTypes => {
            this.projectTypes = GetStaticCodebookProvider(projectTypes)
        });
    }

    private loadExternalRatings(pdRatingModelItemValue: number) {
        if (pdRatingModelItemValue)
            this.codebooksApi.getExternalRating(pdRatingModelItemValue).subscribe(externalItems => {
                this.isExternal = externalItems && externalItems.length > 0;
                this.externalRatings = GetStaticCodebookProvider(externalItems.map(i => ({ Value: i.Value, Text: i.Text } as ICodebookItem)));
            });
    }

    private setSpvTypeProjType(lgdModelCodebookItem: ILGDModelCodebookItem) {
        if (lgdModelCodebookItem) {
            this.isSPVType = lgdModelCodebookItem.SPVType;
            this.isProjectType = lgdModelCodebookItem.ProjectType;
        } else {
            this.isSPVType = this.isProjectType = false;
        }
    }

    private clearSelectedPdRating() {
        this.selectedPdRating = null;
        this.raroc.PDRatingId = null;
        this.raroc.PDRatingValue = null;
        this.raroc.RatingId = null;
        this.raroc.ExternalRatingId = null;
    }

    private getRarocValidation() {
        this.progress.runProgress(
            this.rarocDetailService.getValidationRaroc(this.raroc.Id).pipe(
            )).subscribe(rarocValidation => {
                this.notification.clear();
                const errMessage = [];
                if (!rarocValidation.ValidProducts)
                    errMessage.push(this.translation.$$get('raroc_detail_general.not_valid_products'));
                if (!rarocValidation.ValidCollaterals)
                    errMessage.push(this.translation.$$get('raroc_detail_general.not_valid_collaterals'));
                if (errMessage.length > 0)
                    this.notification.error(errMessage.join('<br />'));
                this.rarocValidationChanged.emit(rarocValidation);
            });
    }
}
