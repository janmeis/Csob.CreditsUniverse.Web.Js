import { AfterViewInit, Component, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, of, Subscription } from 'rxjs';
import { first, flatMap, mergeMap, tap } from 'rxjs/operators';
import { EditorCodeBookComponent, GetEmptyCodebookProvider, GetStaticCodebookProvider, ICodebookProvider } from 'src/app/app-common/components/editor-codebook/editor-codebook.component';
import { SelectFn } from 'src/app/app-common/components/editor-selector/editor-selector.component';
import { MessageBoxDialogComponent } from 'src/app/app-common/components/message-box-dialog/message-box-dialog.component';
import { PartyPermissionState } from 'src/app/app-common/services/permission-service';
import { CanComponentDeactivate } from 'src/app/services/app-navigation-guard.service';
import { SelectedPartyService } from 'src/app/services/selected-party.service';
import { TranslationService } from 'src/app/services/translation-service';
import { UserProgressService } from 'src/app/services/user-progress.service';
import { CodebookApiService } from 'src/app/services/webapi/codebook-api-service';
import { PartyApiService } from 'src/app/services/webapi/party-api-service';
import { ECreditInfoType, ICodebookItem, ICreditInfoContainerDto, ILGDModelCodebookItem, IPDRatingModelDto } from 'src/app/services/webapi/webapi-models';
import { CalendarService } from '../../app-common/services/calendar.service';
import { SharedCacheService } from '../../services/shared-cache.service';
import { SelectorKbcDialogComponent } from '../components/selector-kbc-dialog/selector-kbc-dialog.component';
import { EPermissionType } from './../../services/webapi/webapi-models';

@UntilDestroy()
@Component({
    selector: 'app-party-credit-info-detail-new',
    templateUrl: './party-credit-info-detail-new.component.html',
    styleUrls: ['./party-credit-info-detail-new.component.less']
})
export class PartyCreditInfoDetailNewComponent implements CanComponentDeactivate, OnInit, AfterViewInit {
    @ViewChild('form') private form: NgForm;
    @Output() formValidChange = new EventEmitter<boolean>();
    model: ICreditInfoContainerDto;
    originalFiscalYear: number;
    creditFileId: number;
    readonly = false;
    KBCText = '';
    allLgdModels: ILGDModelCodebookItem[];
    lgdModels: ICodebookProvider;
    isNACERequired: boolean;
    pdRatingModels: ICodebookProvider;
    fiscalYearBegins: ICodebookProvider;
    allPdRatingModels: IPDRatingModelDto[];
    changes: ECreditInfoType[];
    hasEditRights = false;

    constructor(
        private codebookApiService: CodebookApiService,
        private injector: Injector,
        private partyApi: PartyApiService,
        public progress: UserProgressService,
        private selectedParty: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        private cache: SharedCacheService,
        private calendar: CalendarService) {

    }

    ngOnInit(): void {
        this.title.setTitle(this.translation.$$get('party_credit_info_detail_new.title'));

        this.progress.runProgress(
                this.selectedParty.partyHeader.pipe(
                    tap(party => {
                        this.creditFileId = party.CreditFileId;

                        const permissionState = new PartyPermissionState(party);
                        this.hasEditRights = permissionState.hasPermission[EPermissionType.CreditInfoedit];
                        this.readonly = !this.hasEditRights;
                    }),
                    mergeMap(_ => this.cache.get('lgdmodel-codebook', () => this.codebookApiService.getLGDModel())),
                    tap((lgd: ILGDModelCodebookItem[]) => this.allLgdModels = lgd),
                    mergeMap(_ => this.cache.get('pdratingmodel-codebook', () => this.codebookApiService.getPdRatingModels())),
                    tap((ratingModels: IPDRatingModelDto[]) => {
                        this.allPdRatingModels = ratingModels;
                        this.pdRatingModels = this.getPdRatingModels();
                    }),
                    mergeMap(_ => this.update$()),
                    tap(_ => this.lgdModels = this.getFilteredLgdModels(this.model.CreditInfoData.PDModelId))
                )
            ).subscribe();

        this.fiscalYearBegins = GetStaticCodebookProvider(
            this.calendar.getMonthNames().map((x, i) => ({ Text: x, Value: i + 1 }))
        );
    }

    ngAfterViewInit(): void {
        if (this.form)
            this.form.valueChanges.pipe(
                untilDestroyed(this)
            ).subscribe(() => {
                if (this.form.form.dirty) {
                    this.formValidChange.emit(this.form.valid);
                }
            });
    }
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (!this.progress.loading && this.form && this.form.dirty && this.hasEditRights) {
            return MessageBoxDialogComponent.dirtyConfirmation(this.injector, () => this.save({ update: false }));
        }

        return of(true);
    }

    onSave(): void {
        this.newMethod();
    }
    private newMethod() {
        this.save({ update: true });
    }

    private async save(opts: { update: boolean }): Promise<boolean> {
        if (this.form.invalid)
            return false;

        if (this.originalFiscalYear != this.model.CreditInfoData.FiscalYearStartingMonth) {
            const dlgOpts = MessageBoxDialogComponent.createYesNoOptions(this.injector);
            dlgOpts.messageHTML = this.translation.$$get('party_credit_info_detail_new.fiscalYearStartingMonth_changed');
            const dlgResult = await MessageBoxDialogComponent.show(this.injector, dlgOpts).toPromise();
            if (!dlgResult)
                return false;
        }
        this.changes = [];
        await this.progress.runAsync(this.partyApi.postSaveCreditInfoContainer(this.model).pipe(tap(x => this.changes = x)));
        this.partyApi.postApplyCreditInfoChanges(this.creditFileId, this.changes).pipe(first()).subscribe();
        if (opts.update) {
            this.form.reset();
            this.formValidChange.emit(true);
            await this.update$().toPromise();
            await this.selectedParty.reload().toPromise();
        }
        return true;
    }

    onSelectCredac: SelectFn = async () => {
        const dialog = await SelectorKbcDialogComponent.showModal(this.injector);
        if (!dialog)
            return undefined;

        return { text: dialog.text, value: dialog.id };
    }
    private update$(): Observable<ICreditInfoContainerDto> {
        return this.partyApi.getCreditInfoContainer(this.creditFileId).pipe(
            tap(container => {
                this.model = container;
                this.originalFiscalYear = this.model.CreditInfoData.FiscalYearStartingMonth;
            }));
    }
    pdRatingModelSelectionChange(pdRatingModelItem: ICodebookItem, lgdModel: EditorCodeBookComponent): void {
        lgdModel.value = null;

        if (pdRatingModelItem) {
            this.lgdModels = this.getFilteredLgdModels(pdRatingModelItem.Value);

            const matchingPdModel = this.allPdRatingModels.find(pd => pd.Id === pdRatingModelItem.Value);
            this.isNACERequired = matchingPdModel.RequiredNACE;

            if (this.isNACERequired) {
                this.form.controls['NACE'].markAsDirty();
            }
        }
    }
    private getFilteredLgdModels(pdRatingModelId: number): ICodebookProvider {
        if (!pdRatingModelId)
            return GetEmptyCodebookProvider();

        const codebookItems = this.allLgdModels
            .filter(s => s.PDRatingModelId == pdRatingModelId)
            .map(s => ({ Value: s.Value, Text: s.Text, Order: s.Order } as ICodebookItem));
        return GetStaticCodebookProvider(codebookItems);
    }

    getPdRatingModels(): ICodebookProvider {
        if (!this.allPdRatingModels)
            return GetEmptyCodebookProvider();

        let order = 0;
        const ratingCodebookItems = this.allPdRatingModels.map(ratingModel => ({ Value: ratingModel.Id, Text: ratingModel.Description, Order: ++order } as ICodebookItem));

        return GetStaticCodebookProvider(ratingCodebookItems);
    }
}
