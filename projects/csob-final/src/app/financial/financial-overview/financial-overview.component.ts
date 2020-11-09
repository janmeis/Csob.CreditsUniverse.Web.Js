import { Location } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStateChangeEvent, GridDataResult, PageChangeEvent, RowClassArgs, SelectionEvent } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { State } from '@progress/kendo-data-query';
import * as dates from '@progress/kendo-date-math';
import { Arrays, MessageBoxDialogComponent, setGridToCriteria, showTooltip, stateFromUrlParams, stateToUrlParams } from 'projects/app-common/src/public-api';
import { EFormat, EStateFinData, FinancialApiService, FinStatOverviewResDto, IExportOptions, IFinConversionOptions, IFinStatOverviewReqDto, IFinStatOverviewResDto, IFVCopyDto, SecurityService, SelectedPartyService, TranslationService, UrlHelperService, UserNotificationService, UserProgressService } from 'projects/services/src/public-api';
import { tap } from 'rxjs/operators';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { FinancialExportDialogComponent } from '../financial-export-dialog/financial-export-dialog.component';
import { FinancialNewDialogComponent } from '../financial-new-dialog/financial-new-dialog.component';
import { FinancialDomainService } from '../services/financial-domain.service';
import { FinancialCopyDialogComponent } from './../financial-copy-dialog/financial-copy-dialog.component';

interface FinRow extends IFinStatOverviewResDto {
    selectable: boolean;
    sameFormat: boolean;
}

export const hasDuplicateDates = (dateArray: Array<Date>): boolean => {
    if (!dateArray || dateArray.length == 0)
        return false;

    const tmpDates = [dateArray[0]];
    for (let i = 1; i < dateArray.length; i++) {
        if (tmpDates.find(r => dates.isEqualDate(r, dateArray[i])))
            return false; // nyní to můžeme zobrazit

        tmpDates.push(dateArray[i]);
    }
    return false;
};

export const isValidToSame = (rows: IFinStatOverviewResDto[]): boolean => {
    const result = rows.every(r => r.FormatEnum == EFormat.PoFull && [EStateFinData.OriginalNew, EStateFinData.OriginalCompleted].includes(r.StateEnum));
    if (result)
        return false;

    const dates = rows.map(r => r.ValidTo);
    return hasDuplicateDates(dates);
};

@Component({
    selector: 'app-financial-overview',
    templateUrl: './financial-overview.component.html',
    styleUrls: ['./financial-overview.component.less'],
})

export class FinancialOverviewComponent extends BasePermissionsComponent implements OnInit {
    private readonly take = 25;
    grid = { take: this.take } as State;
    data: GridDataResult;
    selection: number[] = [];
    selectedRows: IFinStatOverviewResDto[] = [];
    partyId: number;
    canShow = false;
    canEdit = false;
    canCopy = false;
    canConvert = false;
    canExport = false;
    canDelete = false;
    EFormat = EFormat;
    newFormOpened = false;
    canMore = false;
    criteria = { ShowFull: false } as IFinStatOverviewReqDto;
    gridScrollable = 'none';
    gridHeight = window.innerHeight - 350;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private urlHelper: UrlHelperService,
        private finApi: FinancialApiService,
        public progress: UserProgressService,
        private notification: UserNotificationService,
        private title: Title,
        private finDomain: FinancialDomainService,
        private translation: TranslationService,
        private injector: Injector,
        protected securityService: SecurityService,
        private selectedParty: SelectedPartyService,
    ) {
        super(securityService);
    }

    ngOnInit() {
        this.title.setTitle(this.translation.$$get('financial_overview.financial_overview'));
        stateFromUrlParams(this.grid, this.route.snapshot.queryParamMap);
        const selection = this.route.snapshot.queryParamMap.get('selection');
        if (selection) {
            this.selection = selection.split(',').map(x => Number(x));
        }
        this.partyId = Number(this.route.snapshot.paramMap.get('partyId'));
        this.criteria.PartyId = this.partyId;

        this.progress.runProgress(
            this.selectedParty.partyHeader.pipe(
                tap(party => {
                    super.fillRights(party);
                }),
            ), true).subscribe(_ => {
                this.update(true);
            });
    }
    // TODO: refactor!!
    private update(clearPaging: boolean) {
        setGridToCriteria(this.grid, this.criteria);

        this.progress.runAsync(this.finApi.postSearch(this.criteria))
            .then(response => {
                if (this.data && this.grid.skip && !clearPaging) {
                    const newData = {
                        data: this.data.data.concat(response.data),
                        total: response.total
                    };
                    this.data = newData;
                } else {
                    this.selection = [];
                    this.data = response;
                }
                this.canMore = this.data.total > this.data.data.length;
                this.selectedRows = this.data.data.filter(x => this.selection.indexOf(x.Id) >= 0);
                this.syncSelectedRows([], []);
            });
    }
    onLoadMore() {
        this.grid.skip = (this.grid.skip || 0) + this.take;
        this.gridScrollable = 'scrollable';
        this.update(false);
    }
    onLoadAll() {
        this.grid.skip = 0;
        this.grid.take = this.data.total;
        this.gridScrollable = 'scrollable';
        this.update(true);
    }
    private syncSelectedRows(selectedRows: IFinStatOverviewResDto[], deselectedRows: IFinStatOverviewResDto[]) {
        // sync of selected rows
        // select newly selected
        selectedRows.forEach(row => {
            if (!(this.selectedRows.find(x => x.Id == row.Id))) {
                this.selectedRows.push(row);
            }
        });
        // unselect newly unselected
        deselectedRows.forEach(row => {
            const i = this.selectedRows.findIndex(x => x.Id == row.Id);
            if (i >= 0) {
                this.selectedRows.splice(i, 1);
            }
        });
        // sync to url
        // remark: cannot use router here, because it will scroll to top
        let params = { selection: this.selectedRows.map(x => x.Id).join(',') };
        params = Object.assign({}, this.route.snapshot.queryParams, params);
        params = stateToUrlParams(this.grid, params);
        this.urlHelper.saveToUrl(params, this.location);
        this.updateVisibility();
    }
    private updateVisibility() {
        // check enabled status of buttons
        this.canShow = this.finDomain.canShow(this.selectedRows);
        this.canEdit = this.finDomain.canEdit(this.selectedRows);

        this.canCopy = this.finDomain.canCopy(this.selectedRows);
        this.canConvert = this.finDomain.canConvert(this.selectedRows);
        this.canExport = this.finDomain.canBeExported(this.selectedRows);
        this.canDelete = this.selectedRows.length > 0 && Arrays.all(this.selectedRows, this.finDomain.canBeDeleted);

        //it is possilbe to only select multiple rows with same template and format
        var firstSelectedRow = this.selectedRows.length > 0 ? this.selectedRows[0] : null;
        for (var i = 0; i < this.data.data.length; i++) {
            var item = this.data.data[i] as FinRow;
            item.selectable = false;
            if (firstSelectedRow == null ||
                (firstSelectedRow.TemplateId == item.TemplateId && firstSelectedRow.FormatEnum == item.FormatEnum)) {
                item.selectable = true;
            }
        }
    }
    onGridUpdate(state: DataStateChangeEvent) {
        if (!state.take) { state.take = this.grid.take; }
        this.grid = state;
        this.update(true);
    }
    onGridPageChange(event: PageChangeEvent) {
        this.grid.skip = event.skip;
        this.update(true);
    }
    onGridSelectionChange(selection: SelectionEvent) {
        this.syncSelectedRows(selection.selectedRows.map(x => x.dataItem), selection.deselectedRows.map(x => x.dataItem));
    }
    onGridCellClicked(data: IFinStatOverviewResDto) {
        //console.log('onGridCellClicked', data);
        if (!this.selection.includes(data.Id)) {
            this.selection.push(data.Id);
            this.syncSelectedRows([data], []);
        }
    }
    private showDetail(readonly: number[], editable: number[], showDefaults = false, isNew = false) {
        if ((readonly == null || readonly.length == 0)
            && (editable == null && editable.length == 0))
            return;
        var params: any = {};
        if (readonly && readonly.length > 0) {
            params.readonlyIds = readonly.join(',');
        }
        if (editable && editable.length > 0) {
            params.editableIds = editable.join(',');
        }
        if (showDefaults) {
            params.showDefaults = true;
        }
        if (isNew) {
            params.new = true;
        }
        this.router.navigate(['detail'], { queryParams: params, relativeTo: this.route.parent });
    }
    onNewClicked() {
        FinancialNewDialogComponent
            .showDialog(this.injector, this.partyId)
            .then(r => {
                if (r != null && r != 0)
                    this.showDetail(null, [r], true);
            });
    }
    onShow() {
        // neni pripustna kombinace konsolidovane a nekonsolidovane
        // vyjimkou	jsou konvertovane a format mezinárodní (InternalCSOB), u kterych je mozny mix konsodilovanych a nekonsolidovanych
        const allConverted = this.selectedRows.every(r => r.StateEnum == EStateFinData.ConvertedNew || r.StateEnum == EStateFinData.ConvertedCompleted);
        const allInternational = this.selectedRows.every(r => r.FormatEnum == EFormat.InternalCSOB);

        if (this.isConsolidationSame() || allConverted || allInternational) {
            // 5713:FINAL-1675: UAT_FV_Cash flow_prohozené sloupce#CH1910_161
            // 4. Přehled FV > 1. Když si uživatel zaškrtá výkazy, tak provést kontrolu.Nepovolit zobrazení/editaci Konvertovaných či Mezinárodních FV za stejné období vedle sebe (kontroluje se dle shody data Konce účetního období).
            // Chybová hláška: "Nelze vybrat FV se stejným účetním obdobím".
            // U Originálních výkazů s formátem PO Plný toto povolíme(nevolá se S1).Platí i na Multieditaci.
            if (!isValidToSame(this.selectedRows))
                this.showDetail(this.selection, null);
            else
                this.notification.error(this.translation.$$get('financial_overview.cannot_have_same_validTo'));
        }
    }

    onEdit() {
        // neni pripustna kombinace konsolidovane a nekonsolidovane
        if (this.isConsolidationSame()) {
            // 5713:FINAL-1675: UAT_FV_Cash flow_prohozené sloupce#CH1910_161
            // 4. Přehled FV > 1. Když si uživatel zaškrtá výkazy, tak provést kontrolu.Nepovolit zobrazení/editaci Konvertovaných či Mezinárodních FV za stejné období vedle sebe (kontroluje se dle shody data Konce účetního období).
            // Chybová hláška: "Nelze vybrat FV se stejným účetním obdobím".
            // U Originálních výkazů s formátem PO Plný toto povolíme(nevolá se S1).Platí i na Multieditaci.
            if (!isValidToSame(this.selectedRows))
                this.showDetail(null, this.selection, null);
            else
                this.notification.error(this.translation.$$get('financial_overview.cannot_have_same_validTo'));

        }
    }

    async onCopy() {
        if (!this.selectedRows || this.selectedRows.length == 0)
            return;

        let isConsolidatedDefault = false;
        isConsolidatedDefault = this.selectedRows.every(r => r.Consolidated);

        const copyIds = await FinancialCopyDialogComponent.show(this.injector, {
            FinStatementHeaderIds: this.selection,
            Consolidation: isConsolidatedDefault,
            ValidFrom: this.selectedRows.length == 1 ? this.selectedRows[0].ValidFrom : null,
            ValidTo: this.selectedRows.length == 1 ?  this.selectedRows[0].ValidTo : null
        } as IFVCopyDto);
        if (copyIds) {
            this.notification.success(this.translation.$$get('financial_overview.data_copied'));
            if (!isValidToSame(this.selectedRows)) { // po akci kopírování mohu zobrazit detail jen pokud nemajíi FV stejný konec účetního období
                this.showDetail(null, copyIds);
            } else {
                this.notification.error(this.translation.$$get('financial_overview.cannot_have_same_validTo'));
                this.update(false);
            }
        }
    }

    onConvert() {
        this.progress.runAsync(this.finApi.postConvert(this.selection))
            .then(r => {
                this.notification.success(this.translation.$$get('financial_overview.data_converted'));
                //TODO: Convert will return some error/flag that result cannot be displayed, because templates differs
                if (isValidToSame(this.selectedRows)) {
                    this.showDetail(null, r, true/*showdefaults*/, false);
                } else {
                    this.update(false);
                }
            });
    }

    async onExport() {
        this.selectedRows = this.data.data.filter(x => this.selection.indexOf(x.Id) >= 0);
        const ids = this.selectedRows.map(r => r.Id);

        await FinancialExportDialogComponent.show(this.injector, { IsCollapsed: true, IsHeaderCollapsed: true } as IExportOptions, null, ids, [], false, {} as IFinConversionOptions);
    }

    onDeleteClicked() {
        this.notification.clear();

        const opts = MessageBoxDialogComponent.createDeleteAlertOption(this.injector);
        opts.messageHTML = '<p>' + this.translation.$$get('financial_overview.i_confirm_that_i_want_to_delete_x_rows') + '</p>'
            + '<ul style="list-style: none;padding-left: 0;">'
            + this.selectedRows.map(row => `<li>${this.finDomain.getFinStatDisplayNameForDeletion(row)}</li>`).join('')
            + '</ul>';
        MessageBoxDialogComponent.show(this.injector, opts)
            .subscribe(yes => {
                if (yes) {
                    this.progress.runAsync(this.finApi.postDelete(this.selection))
                        .then(r => {
                            this.notification.success(this.translation.$$get('financial_overview.data_was_deleted'));
                            this.selection = [];
                            this.update(true);
                        });
                }
            });
    }

    // barvy pozadi radku FV, ktere jsou nactene z DB
    private internationalBackColor: string;
    private convertedBackColor: string;

    getRowClass = (context: RowClassArgs) => {
        const finStatRow: FinStatOverviewResDto = context.dataItem;

        // podbarveni kovnertovanych FV:
        if (this.finDomain.isConverted(context.dataItem)) {

            if (!this.convertedBackColor) {
                this.convertedBackColor = finStatRow.HighlightColor;
                this.applyHighlightColors();
            }

            return 'fin-data-converted';
        }

        // podbarveni mezinarodnich FV
        if (this.finDomain.isInternalCsob(context.dataItem)) {

            if (!this.internationalBackColor) {
                this.internationalBackColor = finStatRow.HighlightColor;
                this.applyHighlightColors();
            }

            return 'fin-data-internal-csob';
        }

        return '';
    }

    private applyHighlightColors() {
        document.querySelector('body').style.cssText = `--international-backcolor: ${this.internationalBackColor}; --converted-backcolor: ${this.convertedBackColor}`;
    }

    showFullHandler() {
        this.grid.take = this.take;
        this.grid.skip = 0;
        this.gridScrollable = 'none';
        this.update(true);
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        showTooltip(e, kendoTooltipInstance);

    private isConsolidationSame(): boolean {

        const convertedStates = [EStateFinData.ConvertedNew, EStateFinData.ConvertedCompleted];


        const result = this.selectedRows.every(r => r.Consolidated) ||
            this.selectedRows.every(r => !r.Consolidated)
            || this.selectedRows.every(r => r.Consolidated || r.FormatEnum == EFormat.InternalCSOB)
            || this.selectedRows.every(r => convertedStates.includes(r.StateEnum) || r.FormatEnum == EFormat.InternalCSOB);

        if (!result) {
            this.notification.error(this.translation.$$get('financial_overview.cannot_mix_consolidated'));
        }

        return result;
    }
}
