import { Location } from '@angular/common';
import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppDialogContainerService } from 'projects/app-common/src/public-api';
import { CanComponentDeactivate, EFormat, ENotificationType, EStateFinData, EUpdateRowsResult, FinancialApiService, FinConversionOptions, FinStatDataDto, IExportOptions, IFinConversionOptions, IFinStatDataDto, IFinStatHeaderDto, IFinStatItemDto, IFinStatRatiosDataDto, IFinStatRowDto, IFinStatTabDto, IPartyHeaderDto, SecurityService, SelectedPartyService, TranslationService, UrlHelperService, UserNotificationService, UserProgressService } from 'projects/services/src/public-api';
import { from, interval, Observable, of, Subscription } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { Arrays } from 'projects/app-common/src/public-api';
import { MessageBoxDialogComponent } from 'projects/app-common/src/public-api';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { ConvertCurrencyDialogComponent } from '../convert-currency-dialog/convert-currency-dialog.component';
import { FinancialCommentDialogComponent } from '../financial-comment-dialog/financial-comment-dialog.component';
import { FinancialExportDialogComponent } from '../financial-export-dialog/financial-export-dialog.component';
import { FinancialStatementSelectDialogComponent } from '../financial-select-dialog/financial-select-dialog.component';
import { FinancialViewComponent } from '../financial-view/financial-view.component';
import { FinancialDomainService } from '../services/financial-domain.service';
import { FinancialDetailUtils } from './financial-detail-utils';


function getIds(s: string): number[] {
    if (!s)
        return [];
    return s.split(',').map(Number);
}
function getBoolean(s: string, def: boolean): boolean {
    if (s && s.toLowerCase)
        return s.toLowerCase() == 'true';
    return def;
}
function getNum(s: string): number {
    if (!s)
        return null;
    return +s;
}
function getConversion(p: Params): FinConversionOptions {
    const opts = new FinConversionOptions();
    opts.CurrencyId = getNum(p['CurrencyId']);
    opts.OwnCurrencyRate = getNum(p['OwnCurrencyRate']);
    opts.UnitKey = getNum(p['UnitKey']);
    return opts;
}

@UntilDestroy()
@Component({
    selector: 'app-financial-detail',
    templateUrl: './financial-detail.component.html',
    styleUrls: ['./financial-detail.component.less'],
})
export class FinancialDetailComponent extends BasePermissionsComponent implements CanComponentDeactivate, OnInit, OnDestroy {
    @ViewChild('financialViewComponent') financialViewComponent: FinancialViewComponent;
    @ViewChild('editForm') editForm: NgForm;

    isUpdating = false;
    isCompleteRunning = false;
    isComputing = false;

    conversion = new FinConversionOptions();
    finModel: IFinStatDataDto = new FinStatDataDto();
    selectedTab: IFinStatTabDto = null;

    partyId: number;
    leftIds: number[];
    rightIds: number[];

    canSave = false;
    canConvert = false;
    canChangePeriod = false;
    canComplete = false;
    canExport = false;
    canRecalculate = false;
    canAddModel = false;
    canStressAnalysis = false;
    canImportFinData = false;
    isNew = false;
    showDefaults = false;
    withOutputTabs = false;
    exportOptions = {
        IsCollapsed: true,
        IsHeaderCollapsed: true,
    } as IExportOptions;
    partyHeader: IPartyHeaderDto;
    loadDataRequiredSubscription: Subscription;
    readonlyRequiredMonitoringSubscription: Subscription;
    isFromMonitoring = false;

    private completedRightId: number; // rightId, z ktereho byla zavolana operace dokončit
    private readonly lockedMessage = this.translation.$$get('financial_detail.finacial_data_locked');
    private readonly unlockedMessage = this.translation.$$get('financial_detail.finacial_data_unlocked');
    private allHeaders: IFinStatHeaderDto[];
    private monitoringQueryParams: Params = {};

    constructor(
        private route: ActivatedRoute,
        private finApi: FinancialApiService,
        private finDomain: FinancialDomainService,
        private notification: UserNotificationService,
        public progress: UserProgressService,
        private router: Router,
        private titleService: Title,
        private translation: TranslationService,
        private injector: Injector,
        private dialogs: AppDialogContainerService,
        private location: Location,
        private urlHelper: UrlHelperService,
        private selectedParty: SelectedPartyService,
        protected securityService: SecurityService) {
        super(securityService);
    }

    ngOnInit() {
        this.unhookLoadDataRequired();
        this.unhookReadOnlyRequiredMonitoring();

        this.titleService.setTitle(this.translation.$$get('financial_detail.page_title'));

        this.getUrlParams();

        this.progress.runProgress(
            this.selectedParty.partyHeader.pipe(
                tap(party => {
                    super.fillRights(party);
                    this.partyHeader = party;
                }),
                mergeMap(_ => from(this.update()))
            ), true).subscribe(_ => {
                // soufl
                this.interShowFull();
            });
    }

    onTabSelect(selectEvent) {
        const tabIndex = selectEvent.index;
        this.selectedTab = this.finModel.Tabs[tabIndex];
        if (this.financialViewComponent && this.financialViewComponent.divToScroll)
            this.financialViewComponent.divToScroll.nativeElement.scrollTop = 0;
    }

    private interShowFull() {
        const isInternational = this.allHeaders && this.allHeaders.length > 0 && this.allHeaders[0].FormatEnum == EFormat.InternalCSOB;
        if (isInternational) {
            const isReadonly = !this.finModel.EditableHeaders || this.finModel.EditableHeaders.length == 0;
            this.exportOptions.IsCollapsed = isReadonly;
        }
    }

    private navigateOverview() {
        this.router.navigate(['overview'], { relativeTo: this.route.parent }).then();
    }

    private async update(showSelectDialog: boolean = false) {
        const options = { includeDefaults: this.showDefaults, conversion: this.conversion };

        const detailContainer = await this.progress.runAsync(this.finApi.getDetail(this.leftIds, this.rightIds, options));
        const data = detailContainer.FinStatDataDto;

        if (!data.Tabs || data.Tabs.length == 0) {
            this.notification.error(this.translation.$$get('financial_detail.no_data_found'));
            this.navigateOverview();
            return;
        }

        const recalc = this.shouldBeRecalculated(data);
        console.warn("RECA ", recalc);

        if (recalc) {
            this.loadData(data); //show data on gray background
            // if conversion is needed (it is not always, need to detect usecase), then show dialog
            // ok->load data again with conversion
            // cancel->redirect to overview
            const dlgResult = await this.showRecomputeDialog(this.translation.$$get('financial_detail.financial_data_needs_conversion_to_same_units_currency'));
            if (dlgResult) {
                this.conversion = dlgResult;
                this.finApi.postConvert(this.leftIds.concat(this.rightIds))
                await this.update();
                return;
            } else {
                this.navigateOverview();
            }
            if (showSelectDialog) {
                this.onSelectStatements();
            }
            return;
        }

        this.loadData(data);

        if (!this.getIsConverted(this.conversion)) {
            if (this.finDomain.canBeComputed(this.allHeaders)) {
                this.notification.show({ message: this.translation.$$get('financial_detail.ratios_being_calculated'), type: ENotificationType.Warning, delay: 0 });
                await this.calculateRatios().toPromise();
                this.notification.clear();
            }
        } else {
            if (detailContainer.FinStatRatiosDataDto) {
                this.addorReplaceTabs(detailContainer.FinStatRatiosDataDto);
            }
        }
    }
    private updateUrl() {
        //var params = { readonlyIds: this.leftIds.join(","), editableIds: this.rightIds.join(","), showDefaults: this.showDefaults } as any;
        let params = {
            readonlyIds: this.finModel.ReadonlyHeaders.map(x => x.Id).join(','),
            editableIds: this.finModel.EditableHeaders.map(x => x.Id).join(','),
            showDefaults: this.showDefaults
        } as any;

        if (this.conversion && this.getIsConverted(this.conversion)) {
            params = Object.assign(params, this.conversion);
        }
        this.urlHelper.saveToUrl(params, this.location);
    }
    async canDeactivate() {
        if (!this.isUpdating && this.editForm && this.editForm.dirty) {
            const retvalue = await MessageBoxDialogComponent.dirtyConfirmation(this.injector, () => this.onSave());
            return retvalue;
        }

        return true;
    }

    async onSave(loadData: boolean = true, performCompute = false, validate = true, dataSavedResourceName: string = 'data_saved'): Promise<boolean> {
        this.notification.clear();

        if ((validate && !this.isFormValid()) || this.isUpdating) {
            return false;
        }

        this.isUpdating = true;
        try {
            const data = await this.progress.runAsync(this.finApi.postSave(this.finModel));
            this.notification.success(this.translation.$$get(`financial_detail.${dataSavedResourceName}`));

            if (loadData) {
                //(fix left data load after fin data save)
                data.ReadonlyHeaders = this.finModel.ReadonlyHeaders;
                data.Tabs.forEach(tab => {
                    let foundTab = this.finModel.Tabs.find(x => x.TabOrder == tab.TabOrder);
                    tab.Rows.forEach(row => {
                        let foundRow = foundTab.Rows.find(x => x.TemplateRowId == row.TemplateRowId);
                        if (foundRow) {
                            row.ReadonlyItems = foundRow.ReadonlyItems;
                        }
                    });
                });
                this.loadData(data);

                if (performCompute) {
                    this.notification.show({ message: this.translation.$$get('financial_detail.ratios_being_calculated'), type: ENotificationType.Warning, delay: 0 });
                    await this.calculateRatios().toPromise();
                    this.notification.clear();
                }
            }
        } finally {
            this.isUpdating = false;
        }
        return true;
    }

    private isFormValid(): boolean {
        const allErrors = this.financialViewComponent.getAllErrors(this.editForm.form);

        if (allErrors) {
            this.notification.error(this.translation.$$get('financial_detail.form_is_not_valid'));
            return false;
        }

        return true;
    }

    private loadData(data: IFinStatDataDto, onlyTemp = false) {
        //when right items are returned in left, move it back
        this.moveItems(data, this.rightIds, 'left');

        this.finModel = data;
        this.finModel.Tabs = this.finModel.Tabs.sort((t1, t2) => t1.GUIOrder - t2.GUIOrder);

        if (!this.selectedTab
            || this.finModel.Tabs.filter(t => t.TabOrder == this.selectedTab.TabOrder).length == 0)
            this.selectedTab = this.finModel.Tabs[0];
        else
            this.selectedTab = this.finModel.Tabs.find(t => t.TabOrder == this.selectedTab.TabOrder);


        if (!onlyTemp) {
            this.setHeaders();
            this.updateUrl();

            if (this.financialViewComponent) {
                this.financialViewComponent.markFormPristine(this.editForm.form);
            }
        }

        if (this.finModel.EditableHeaders.length > 0 && this.finModel.IsLocked) {
            this.notification.messages = this.notification.messages.filter(m => m.message != this.lockedMessage && m.message != this.unlockedMessage);
            this.notification.error(this.lockedMessage);
        }
    }

    private moveItems(data: IFinStatDataDto, headerIds: number[], source: 'left' | 'right') {
        type itemGetter = (row: IFinStatRowDto) => IFinStatItemDto[];
        const s = source == 'left';
        const srcHeaders = s ? data.ReadonlyHeaders : data.EditableHeaders;
        const dstHeaders = s ? data.EditableHeaders : data.ReadonlyHeaders;
        const srcItems: itemGetter = s ? row => row.ReadonlyItems : row => row.EditableItems;
        const dstItems: itemGetter = s ? row => row.EditableItems : row => row.ReadonlyItems;
        srcHeaders.concat().forEach(h => {
            if (headerIds.indexOf(h.Id) >= 0) {
                dstHeaders.push(h);
                let i = srcHeaders.findIndex(x => x.Id == h.Id);
                srcHeaders.splice(i, 1);
                data.Tabs.concat().forEach(tab => {
                    tab.Rows.concat().forEach(row => {
                        const rowIndex = srcItems(row).findIndex(x => x.HeaderId == h.Id);
                        if (rowIndex >= 0) {
                            dstItems(row).push(srcItems(row)[rowIndex]);
                            srcItems(row).splice(rowIndex, 1);
                        }
                    });
                });
            }
        });

    }
    private reportErrorMessage(allErrors: { [key: string]: any }) {
        const messages: string[] = [];
        Object.keys(allErrors).forEach(k => {
            if (allErrors[k]['editorValidator'] && allErrors[k]['editorValidator'].length > 0)
                messages.push(allErrors[k]['editorValidator'][0]);
            else if (allErrors[k]['required']) {
                let field = this.translation.$$get(`financial_detail.${k}`);
                if (/^~/.test(field))
                    field = k;
                messages.push(this.translation.$$get('financial_detail.field_x_is_required', field));
            } else
                messages.push(`error: ${k}: ${allErrors[k]}`);
        });
        const errorMessage = messages.join('<br />');
        this.notification.error(errorMessage);
    }

    async onComplete() {
        this.completedRightId = null;
        this.notification.clear();
        this.isCompleteRunning = true;

        if (this.editForm.dirty) {
            try {
                await this.onSave(true, true);
            } catch (error) {
                this.isCompleteRunning = false;
                return;
            }
        }

        const allErrors = this.financialViewComponent.getAllErrors(this.editForm.form);
        if (allErrors) {
            this.reportErrorMessage(allErrors);
            return;
        }

        if (!await MessageBoxDialogComponent.confirmYesNo(this.injector, this.translation.$$get('financial_detail.do_you_want_to_complete_financial_statement')).toPromise()) {
            this.isCompleteRunning = false;
            return;
        }

        const result = await this.progress.runAsync(this.finApi.postSetComplete(this.finModel));
        if (result && result.length > 0) {
            this.notification.error(this.translation.$$get('financial_detail.error_saving_as_complete') + ' <br /> ' + result.join('<br />'));

            this.isCompleteRunning = false;
            return;
        }

        this.notification.success(this.translation.$$get('financial_detail.data_saved_as_complete'));

        // 5713:FINAL-1675: UAT_FV_Cash flow_prohozené sloupce#CH1910_161
        // 1.Mezinárodní výkazy > 1.Po Dokončení jde uživatel automaticky na Přehled FV.
        if (this.isInternalCSOB())
            this.navigateOverview();
        else {
            this.financialViewComponent.markFormPristine(this.editForm.form);

            this.completedRightId = this.rightIds[0];

            this.update().then(() => this.isCompleteRunning = false);
        }
    }

    async onConvert() {
        this.notification.clear();
        let toConvert = this.rightIds;
        if (toConvert.length == 0) {
            if (this.leftIds.length != 1)
                return;
            toConvert = this.leftIds;
        }

        this.progress.start();
        const r = await this.finApi.postConvert(toConvert).toPromise();

        // 5713:FINAL-1675: UAT_FV_Cash flow_prohozené sloupce#CH1910_161
        // 2. PO Plný - originál > 1. Po Zkonvertování jde uživatel automaticky na Přehled FV.
        if (this.isPoFull()) {
            this.progress.stop();
            this.router.navigate(['overview'], { relativeTo: this.route.parent });
        } else {
            this.financialViewComponent.markFormPristine(this.editForm.form);

            if (!this.showDefaults) {
                this.showDefaults = true;
            }
            this.leftIds = [];
            this.rightIds = r;

            await this.calculateRatios().toPromise();
            await this.update();

            this.progress.stop();
            this.notification.success(this.translation.$$get('financial_detail.data_converted'));
        }
    }

    calculateRatios(): Observable<IFinStatRatiosDataDto> {
        const ids = this.leftIds.concat(this.rightIds);
        if (ids.length == 0) {
            return of({} as IFinStatRatiosDataDto);
        }

        this.isComputing = true;

        // pro formát PO plný, který není zkonvertovaný, záložky ratios a cashflow negenerujeme
        const readonlyHeader = this.finModel.ReadonlyHeaders[0];

        if (readonlyHeader &&
            readonlyHeader.FormatEnum == EFormat.PoFull &&
            readonlyHeader.StateEnum != EStateFinData.ConvertedCompleted &&
            readonlyHeader.StateEnum != EStateFinData.ConvertedNew) {
            this.isComputing = false;
            return of({} as IFinStatRatiosDataDto);
        }

        const templateId = this.finModel.ReadonlyHeaders.concat(this.finModel.EditableHeaders)[0].TemplateId;
        return this.finApi.postCalculateRatios(templateId, ids, { conversion: this.conversion }).pipe(
            tap(data => {
                //nove taby - nahradit nebo pridat, viz taborder, dale nahrazeni jejich obsahu
                this.addorReplaceTabs(data);
                this.isComputing = false;
            }));
    }

    private addorReplaceTabs(ratiosData: IFinStatRatiosDataDto) {
        FinancialDetailUtils.addorReplaceTabs(this.leftIds, this.rightIds, this.finModel, ratiosData);
    }

    addStatements(data: IFinStatDataDto) {
        function addHeaders(source: IFinStatHeaderDto[], destination: IFinStatHeaderDto[]) {
            source.forEach(srcHeader => {
                let i = destination.findIndex(x => x.Id == srcHeader.Id);
                if (i >= 0) {
                    Object.assign(destination[i], srcHeader);
                } else {
                    destination.push(srcHeader);
                    i = destination.length;
                }
            });
        }
        function addItems(srcTabs: IFinStatTabDto[], dstTabs: IFinStatTabDto[], selector: (row: IFinStatRowDto) => IFinStatItemDto[]) {
            srcTabs.forEach(srcTab => {
                let i = dstTabs.findIndex(x => x.TabOrder == srcTab.TabOrder);
                if (i < 0) {
                    //TODO: reorder?
                    dstTabs.push(srcTab);
                    i = dstTabs.length;
                }
                let dstTab = dstTabs[i];
                srcTab.Rows.forEach(srcRow => {
                    let di = dstTab.Rows.findIndex(x => x.TemplateRowId == srcRow.TemplateRowId);
                    if (di < 0) {
                        //new row!
                    } else {
                        const dstRow = dstTab.Rows[di];
                        const srcItems = selector(srcRow);
                        const dstItems = selector(dstRow);
                        srcItems.forEach(srcItem => {
                            dstItems.push(srcItem);
                        });
                    }
                });
            });
        }
        addHeaders(data.ReadonlyHeaders, this.finModel.ReadonlyHeaders);
        addHeaders(data.EditableHeaders, this.finModel.EditableHeaders);
        addItems(data.Tabs, this.finModel.Tabs, x => x.ReadonlyItems);
        addItems(data.Tabs, this.finModel.Tabs, x => x.EditableItems);
        this.finModel = Object.assign({}, this.finModel); //mutate data
    }


    async onRecalculate() {
        this.notification.clear();
        // prepocitat (meny a jednotky)
        // uzivatel muze rucne zadat prepocet
        // pozor, dialog se vola jeste jednou pri zobrazeni, pokud je prepocet potreba
        const dialogResult = await this.showRecomputeDialog(null);
        if (dialogResult) {
            this.conversion = dialogResult;
            await this.update();
        }
    }

    private showRecomputeDialog(title: string) {
        let data = { title: title || undefined };
        if (this.conversion) {
            data = Object.assign(data, {
                model: Object.assign({}, this.conversion)
            });
        }
        const dlg = this.dialogs.createDialog(this.injector, ConvertCurrencyDialogComponent, {}, data);
        return this.dialogs.wait(dlg.closed);
    }
    getIsConverted(c: IFinConversionOptions) {
        return c && (c.CurrencyId || c.UnitKey || c.OwnCurrencyRate);
    }
    private shouldBeRecalculated(data: IFinStatDataDto) {
        if (this.isNew)
            return false;

        let headers = data.ReadonlyHeaders;
        if (data.EditableHeaders) {
            headers = headers.concat(data.EditableHeaders);
        }

        //TODO:
        // units on left side are different and there are any left headers
        if (this.getIsConverted(this.conversion))
            return false;
        if (headers.length == 0)
            return false;
        if (!Arrays.allSame(headers.map(x => x.CurrencyId)))
            return true;
        if (!Arrays.allSame(headers.map(x => x.UnitKey)))
            return true;
        return false;
    }

    getClassName(color: any, indent: any) {
        return `color-${color} indent-${indent}`;
    }
    private setHeaders() {
        this.leftIds = this.finModel.ReadonlyHeaders.map(x => x.Id);
        this.rightIds = this.finModel.EditableHeaders.map(x => x.Id);
        this.allHeaders = this.finModel.ReadonlyHeaders.concat(this.finModel.EditableHeaders);
        this.canSave = this.finModel.EditableHeaders.length > 0;
		/*Uživatel může změnit zobrazení finančních výkazů
		·	0 až N finančních výkazů v případe UC0105: Přidat Finanční výkaz
		·	1 až N finančních výkazů v případě UC0124: Zobrazit Finanční výkaz
		*/
        //this.canChangePeriod = this.rightIds.length > 0;
        this.canChangePeriod = this.finModel.EditableHeaders && this.finModel.EditableHeaders.length <= 1 && Arrays.all(this.finModel.EditableHeaders, x => this.finDomain.canChangePeriod(x));
        this.canComplete = this.finModel.EditableHeaders.length > 0 && Arrays.all(this.finModel.EditableHeaders, x => this.finDomain.canBeCompleted(x));
        this.canConvert = this.finDomain.canConvert(this.finModel.EditableHeaders);
        this.canRecalculate = this.leftIds.length > 0 && this.rightIds.length == 0;
        this.canExport = this.finDomain.canBeExported(this.allHeaders);
        this.canAddModel = this.finDomain.canAddModel(this.allHeaders);
        this.canStressAnalysis = this.finDomain.canStressAnalysis(this.allHeaders);
        this.canImportFinData = this.finDomain.canImportFinData(this.finModel.EditableHeaders);
    }

    async onSelectStatements() {
        if (this.editForm.dirty) {
            await this.onSave(false);
            this.update(true);
        }

        this.conversion = null;


        const originalLeftIds: number[] = [];

        if (this.leftIds) {
            this.leftIds.forEach(id => originalLeftIds.push(id));
        }

        const selection: number[] = [].concat(this.leftIds);
        if (this.completedRightId) {
            selection.push(this.completedRightId);
        }

        let selectedHeader = this.finModel.EditableHeaders[0];
        if (!selectedHeader) {
            selectedHeader = this.finModel.ReadonlyHeaders[0];
        }

        const selectedIds = await FinancialStatementSelectDialogComponent.showDialog(this.injector, 'compare', this.partyId, { selection: selection, excludeIds: this.rightIds, selectedHeader: selectedHeader }, true);

        if (selectedIds) { // dialog => OK
            this.leftIds = selectedIds;
            this.update(true);
        } else { // dialog => storno, vrátím do původního stavu
            this.leftIds = originalLeftIds;
        }

    }
    onFormChanged() {
        this.editForm.form.markAsDirty();
    }
    onSpecialHeaderChanged(data: { header: IFinStatHeaderDto, name: string }) {
        if (data.name == 'validFrom' && this.finModel.EditableHeaders && this.finModel.EditableHeaders.length > 0 && this.finModel.EditableHeaders[0].ValidFrom)
            if (!this.finDomain.isValidFiscalYearStart(data.header.ValidFrom, this.partyHeader.FiscalYearStartingMonth)) {
                this.notification.warning(this.translation.$$get('financial_detail.start_date_invalid_fiscal_year_start'));
            } else {
                this.notification.clear();
            }
    }

    async onCommentEdit(args: { data: IFinStatItemDto, row: IFinStatRowDto, isEditable: boolean }) {
        const result = await FinancialCommentDialogComponent.show(this.injector, args.data, args.row, args.isEditable);
        if (result != undefined) {
            args.data.Comment = result;
            this.finModel = Object.assign({}, this.finModel);
            this.onFormChanged();
        }
    }

    async onExport() {
        this.notification.clear();

        const showDialogAction = () => FinancialExportDialogComponent.show(this.injector, this.exportOptions, this.finModel, this.leftIds, this.rightIds, this.showDefaults, this.conversion);
        let anyForExport = this.finModel.ReadonlyHeaders.find(x => !x.Exported);
        if (anyForExport == null)
            anyForExport = this.finModel.EditableHeaders.find(x => !x.Exported);

        let exportDialogConfirmed: Boolean;

        if (this.editForm.dirty) {
            const result = await MessageBoxDialogComponent.confirmYesNo(this.injector, this.translation.$$get('financial_detail.do_you_want_to_save_and_export')).toPromise();
            if (result) {
                await this.onSave(true, true);
            }

            exportDialogConfirmed = await showDialogAction();
            this.update();
        }
        else {
            exportDialogConfirmed = await showDialogAction();
            if (anyForExport != null)
                this.update();
        }
    }

    async onAddModel() {
        if (this.editForm.dirty) {
            const ask = await MessageBoxDialogComponent.dirtyConfirmation(this.injector, () => this.onSave());
            if (ask == null)
                return;
        }
        let id = this.rightIds.concat(this.leftIds)[0];
        const data = await this.progress.runAsync(this.finApi.getAddModel(id));
        this.moveItems(this.finModel, [id], 'right');
        //data are not saved yet
        this.addStatements(data);
        this.setHeaders();
        this.updateUrl();
        this.financialViewComponent.markFormPristine(this.editForm.form);
    }
    // async onStressAnalysis() {
    // 	var headers = this.finModel.ReadonlyHeaders.concat(this.finModel.EditableHeaders);
    // 	headers = headers.filter(x => !this.finDomain.isStress(x));

    // 	var header = Arrays.last(headers);
    // 	var result = await FinancialStressParamsDialogComponent.showDialog(this.injector, header.Id, header.ValidTo);
    // 	if (result == null)
    // 		return;
    // 	await this.update();
    // 	//this.removeStatements(x => this.finDomain.isStress(x))
    // 	this.addStatements(result);
    // 	this.setHeaders();
    // }
    // importFinDataHandler() {
    // 	this.notification.clear();
    // 	FinancialDataImportDialogComponent.showDialog(this.injector, this.rightIds[0], this.finModel.Tabs.map(x => x.TabOrder));
    // }

    onToMonitoringClick() {
        this.router.navigate(['../monitoring/overview'], { queryParams: this.monitoringQueryParams, relativeTo: this.route.parent });
    }

	/**
	 * Spustí nekonečný cyklus, který v intervalu 2 sekundy hledá v localStorage klíč pro indikaci nutnosti přenačíst data
     * (ukládá se při dokončení importu).
	 */
    private hookLoadDataRequired() {
        this.unhookLoadDataRequired();

        this.loadDataRequiredSubscription = interval(500).subscribe(r => {

            const importResult = FinancialDetailUtils.getImportResultFromStorage();

            if (importResult) {

                this.permissionState.IsPartyManaged = true;
                this.checkImportResult();

                this.unhookLoadDataRequired();

                if (importResult == EUpdateRowsResult.Successful) {
                    this.notification.clear();
                    FinancialDetailUtils.removeImportResultFromStorage();
                    this.update().then(() => this.onSave(false, false, false, 'data_imported_and_saved').then(() => this.update()));
                }
            }

        });
    }

    private checkImportResult() {
        const importResult = FinancialDetailUtils.getImportResultFromStorage();
        if (importResult && Number(importResult) == EUpdateRowsResult.WaitingForKofax) {
            this.notification.success(this.translation.$$get('financial_detail.data_imported_waiting_for_kofax'));
        }
    }

    private hookReadOnlyRequired() {
        this.unhookReadOnlyRequiredMonitoring();

        this.readonlyRequiredMonitoringSubscription = interval(100).subscribe(r => {

            const isReadonlyRequired = FinancialDetailUtils.getReadonlyRequiredStorageFlag();
            if (isReadonlyRequired) {
                this.notification.clear();
                this.permissionState.IsPartyManaged = !isReadonlyRequired;
                this.checkImportResult();
                //		this.notification.warning(this.lockedDuringImportMessage);
            }


        });
    }

    private unhookReadOnlyRequiredMonitoring() {
        FinancialDetailUtils.removeReadonlyRequiredStorageFlag();

        if (this.readonlyRequiredMonitoringSubscription) {
            this.readonlyRequiredMonitoringSubscription.unsubscribe();
        }

    }

    onImportClicked() {
        if (this.editForm.dirty) {
            this.onSave(false).then(() => this.showImportTab());
        } else {
            this.showImportTab();
        }
    }

    private showImportTab() {
        const url = location.href.substr(0, location.href.lastIndexOf('/detail'));
        const targetUrl = url + '/import?id=' + this.rightIds[0];

        window.open(targetUrl, '_blank');

        this.hookLoadDataRequired();
        this.hookReadOnlyRequired();
    }

    private unhookLoadDataRequired() {

        FinancialDetailUtils.removeImportResultFromStorage();

        if (this.loadDataRequiredSubscription) {
            this.loadDataRequiredSubscription.unsubscribe();
        }
    }

    ngOnDestroy() {
        this.unhookLoadDataRequired();
        this.unhookReadOnlyRequiredMonitoring();
    }

    onShowColapsedClicked() {
        this.exportOptions.IsCollapsed = !this.exportOptions.IsCollapsed;
        if (this.editForm && this.editForm.controls['showCollapsed'])   // HACK!!!
            this.editForm.controls['showCollapsed'].markAsPristine();
    }

    private isInternalCSOB = (): boolean =>
        this.isFormatEnum(EFormat.InternalCSOB)

    private isPoFull = (): boolean =>
        this.isFormatEnum(EFormat.PoFull)

    private isFormatEnum(formatEnum: EFormat): boolean {
        return this.allHeaders && this.allHeaders.length > 0 && this.allHeaders[0].FormatEnum == formatEnum;
    }

    private getUrlParams() {
        this.route.queryParams.pipe(
            untilDestroyed(this)
        ).subscribe(params => {
            this.isFromMonitoring = !!params['Granularity'];
            if (this.isFromMonitoring)
                this.monitoringQueryParams = params;

            this.leftIds = getIds(params['readonlyIds']);
            this.rightIds = getIds(params['editableIds']);
            this.isNew = getBoolean(params['new'], false);
            this.showDefaults = getBoolean(params['showDefaults'], false);
            this.conversion = getConversion(params);
        });
        this.partyId = +this.route.snapshot.paramMap.get('partyId');
    }
}
