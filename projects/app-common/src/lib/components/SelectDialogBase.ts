import { EventEmitter } from "@angular/core";
import { AppDialog } from "../services/app-dialog-container.service";
import { GridDataResult, SelectionEvent, CellClickEvent } from "@progress/kendo-angular-grid";
import { State } from '@progress/kendo-data-query';

export abstract class SelectDialogBase<TResult> implements AppDialog {
    close: Function
    closed = new EventEmitter<TResult>()
    loading = false
    grid: State = {
        take: 10
    };
    data: GridDataResult;
    selected: TResult;

    abstract async onSearch();

    onGridUpdate(state) {
        this.grid = state;
        this.onSearch();
    }
    onGridSelectionChange(selection: SelectionEvent) {
        if (selection.selectedRows.length > 0) {
            this.selected = selection.selectedRows[0].dataItem;
        } else {
            this.selected = null;
        }
    }

    onDoubleClick(event: CellClickEvent) {
        this.onSelect();
    }
    onSelect() {
        if (this.selected)
            this.close(this.selected);
    }
}
