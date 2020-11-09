import { Component, EventEmitter, Injector, Input, OnInit } from '@angular/core';
import { DataStateChangeEvent, GridDataResult, SelectableSettings } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { State } from '@progress/kendo-data-query';
import { AppDialog, AppDialogContainerService } from 'projects/app-common/src/public-api';
import { EFormat, EStateFinData, FinancialApiService, FinStatAdditionalSearchParams, IFinStatHeaderDto, IFinStatOverviewReqDto, IFinStatOverviewResDto, TranslationService, UserNotificationService, UserProgressService } from 'projects/services/src/public-api';
import { showTooltip } from '../../app-common/common-functions';
import { MessageBoxDialogComponent } from '../../app-common/components/message-box-dialog/message-box-dialog.component';
import { setGridToCriteria } from '../../app-common/models/GridBaseDto';
import { isValidToSame } from '../financial-overview/financial-overview.component';


type ModeType = 'pd-rating' | 'compare' | 'raroc';

interface DialogOptions {
    selection?: number[];
    excludeIds?: number[];
    onlyFinished?: boolean;
    onlyNonConsolidation?: boolean;
    pdRatingModelId?: number;
    selectedHeader?: IFinStatHeaderDto;
}
interface RowSelect extends IFinStatOverviewResDto {
    selectable: boolean;
    sameFormat: boolean;
}

@Component({
    selector: 'financial-select-dialog',
    templateUrl: './financial-select-dialog.component.html',
    styleUrls: ['./financial-select-dialog.component.less']
})
export class FinancialStatementSelectDialogComponent implements OnInit, AppDialog {
    close: Function;
    title = this.translation.$$get('financial_select_dialog.select_statement');
    @Input() mode: ModeType;
    @Input() onlyFinished = false;
    @Input() onlyNonConsolidation = false;
    @Input() partyId: number;
    @Input() selection: number[] = [];
    @Input() excludeIds: number[] = [];
    @Input() pdRatingModelId: number = null;
    @Input() showFull: boolean;
    @Input() selectedHeader: IFinStatHeaderDto;
    criteria = {} as IFinStatOverviewReqDto;
    grid: State = {
        take: 10
    };
    canSelect: boolean;
    canMore: boolean;
    data: GridDataResult;
    selectable: SelectableSettings | boolean = { checkboxOnly: true };
    closed = new EventEmitter<any>();
    gridScrollable = 'none';
    gridHeight = window.innerHeight - 350;

    private convertedStates = [EStateFinData.ConvertedNew, EStateFinData.ConvertedCompleted];
    private originalStates = [EStateFinData.OriginalNew, EStateFinData.OriginalCompleted];

    constructor(
        private injector: Injector,
        public progress: UserProgressService,
        private finApi: FinancialApiService,
        private notification: UserNotificationService,
        private translation: TranslationService) {
    }

    static showDialog(injector: Injector, mode: ModeType, partyId: number, options: DialogOptions, showFull = false) {
        const args = Object.assign({ mode, partyId, showFull }, options);
        const dlgService = injector.get(AppDialogContainerService);
        const dlg = dlgService.createDialog(injector, FinancialStatementSelectDialogComponent, { width: 1600 }, args);
        return dlgService.wait(dlg.closed);
    }

    ngOnInit() {
        this.selection = [...this.selection, ...this.excludeIds];

        if (this.mode == 'pd-rating')
            this.selectable = true;

        this.criteria.PartyId = this.partyId;
        this.update(true);
    }

    // Od Jakuba
    // Lze zobrazit: Originální Nový a Originální dokončený
    // Nebo: Konvertovaný nový a Konvertovaný dokončený
    // Nelze zobrazit Originální a Konvertovaný
    isStatementSelectable(first: IFinStatOverviewResDto, second: IFinStatOverviewResDto): boolean {
        const sameFormatType = first.FormatEnum == second.FormatEnum;
        const sameConsolidation = first.Consolidated == second.Consolidated;
        const sameTemplate = first.TemplateId == second.TemplateId;
        const sameOriginalStates = [first.StateEnum, second.StateEnum].every(s => this.originalStates.includes(s));
        const sameConvertedStates = [first.StateEnum, second.StateEnum].every(s => this.convertedStates.includes(s));

        // vah: change 22.04.2020 - nove jdou volit i mezinarodni (Internal CSOB) a PO plne konvertovane
        const allowedMix = first.FormatEnum == EFormat.InternalCSOB &&  (second.FormatEnum == EFormat.PoFull && this.convertedStates.includes(second.StateEnum));
        const allowedMixReverse = second.FormatEnum == EFormat.InternalCSOB &&  (first.FormatEnum == EFormat.PoFull && this.convertedStates.includes(first.StateEnum));

        if (allowedMix || allowedMixReverse) return true;

        return sameFormatType && (
            first.FormatEnum == EFormat.InternalCSOB   // mezinarodni
            || (sameTemplate && sameConsolidation && sameOriginalStates || sameConvertedStates));  // po plny
    }

    onGridSelectedKeysChange(selectedRows: number[]) {
        this.canSelect = selectedRows.length > 0;

        switch (this.mode) {
            case 'raroc':
                this.makeSelectable(selectedRows, (f1: IFinStatOverviewResDto, f2: IFinStatOverviewResDto): boolean => f1.TemplateId == f2.TemplateId);
                break;
            case 'compare':
                this.makeSelectable(selectedRows, (f1: IFinStatOverviewResDto, f2: IFinStatOverviewResDto): boolean => this.isStatementSelectable(f1, f2));
                break;
        }
    }

    private makeSelectable(selectedRows: number[], condition: (f1: IFinStatOverviewResDto, f2: IFinStatOverviewResDto) => boolean) {
        const firstSelectedRow: IFinStatOverviewResDto = selectedRows.length > 0 ? this.data.data.find(r => r.Id == selectedRows[0]) : null;
        if (!firstSelectedRow)
            this.data.data.forEach((f: RowSelect) => f.selectable = true);
        else
            this.data.data.forEach((f: RowSelect) => f.selectable = condition(firstSelectedRow, f));
    }

    onGridUpdate(state: DataStateChangeEvent) {
        if (!state.take) { state.take = this.grid.take; }
        this.grid = state;
        this.update(true);
    }

    async onChooseSelectedStatements() {
        if ((this.mode === 'pd-rating' || this.mode === 'raroc') && this.selection.length != 1) {
            await MessageBoxDialogComponent.confirmAlert(this.injector, this.translation.$$get('financial_select_dialog.please_select_one_statement')).toPromise();
            return;
        }

        // 5713:FINAL-1675: UAT_FV_Cash flow_prohozené sloupce#CH1910_161
        // 5. Změnit období
        // 1. Stejná funkcionalita.Nepovolit zobrazení / editaci Konvertovaných či Mezinárodních FV za stejné období vedle sebe.U Originálních výkazů s formátem PO Plný toto povolíme(nevolá se S1).Platí i na Multieditaci.
        const selectedRows = this.data.data.filter(r => this.selection.includes(r.Id));
        if (!isValidToSame(selectedRows)) {
            const selection = this.selection.filter(id => !this.excludeIds.includes(id));
            this.close(selection);
        } else
            this.notification.error(this.translation.$$get('financial_select_dialog.cannot_have_same_validTo'));
    }

    onClose() {
        this.notification.clear();
        this.close(null);
    }

    private update(clearPaging: boolean) {
        this.criteria.OnlyFinished = this.onlyFinished;
        this.criteria.OnlyNonConsolidation = this.onlyNonConsolidation;
        this.criteria.PDRatingModelId = this.pdRatingModelId;
        this.criteria.ShowFull = this.showFull;

        if (clearPaging) {
            this.grid.skip = 0;
        }
        setGridToCriteria(this.grid, this.criteria);

        this.criteria.SelectedIds = this.selection;

        if (this.selectedHeader) {
            this.criteria.AdditionalSearchParams = new FinStatAdditionalSearchParams();
            this.criteria.AdditionalSearchParams.Format = this.selectedHeader.FormatEnum;
            this.criteria.AdditionalSearchParams.State = this.selectedHeader.StateEnum;
            this.criteria.AdditionalSearchParams.TemplateId = this.selectedHeader.TemplateId;
            this.criteria.AdditionalSearchParams.IsConsolidated = this.selectedHeader.Consolidated;
        }

        this.progress.runProgress(this.finApi.postSearch(this.criteria))
            .subscribe(response => {
                if (this.data && this.grid.skip) {
                    var newData = {
                        data: this.data.data.concat(response.data),
                        total: response.total
                    };
                    this.data = newData;
                }
                else {
                    this.data = response;
                }
                this.canMore = this.data.total > this.data.data.length;

                this.selection.forEach(selectedId => {
                    let newRow: IFinStatOverviewResDto;
                    if (!this.selection.some(s => s === selectedId) && (newRow = response.data.find(r => r.Id == selectedId)))
                        this.selection.push(newRow.Id);
                });

                this.onGridSelectedKeysChange(this.data.data.map(s => s.Id));
            });
    }

    onLoadMore() {
        this.grid.skip = (this.grid.skip || 0) + this.grid.take;
        this.gridScrollable = 'scrollable';
        this.update(false);
    }

    onLoadAll() {
        this.grid.skip = 0;
        this.grid.take = this.data.total;
        this.gridScrollable = 'scrollable';
        this.update(true);
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        showTooltip(e, kendoTooltipInstance);

    showFullHandler() {
        this.grid = { take: 10, skip: 0 };
        this.gridScrollable = 'none';
        this.update(true);
    }

    isCheckBoxReadOnly(id: number) {
        return this.excludeIds && this.excludeIds.includes(id);
    }
}
