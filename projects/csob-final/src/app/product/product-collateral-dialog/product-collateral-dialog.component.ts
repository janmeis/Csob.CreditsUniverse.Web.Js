import { Component, ComponentRef, EventEmitter, Injector, Input, OnInit } from '@angular/core';
import { DialogComponent } from '@progress/kendo-angular-dialog';
import { AppDialog, AppDialogContainerService } from 'projects/app-common/src/public-api';
import { ICollateralDto, ICollateralProductMatrixDto, ICollateralProductMatrixRowDto, ProductApiService, TranslationService, UserProgressService } from 'projects/services/src/public-api';
import { Observable } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { MessageBoxDialogComponent } from 'projects/app-common/src/public-api';


@Component({
    selector: 'app-product-collateral-dialog',
    templateUrl: './product-collateral-dialog.component.html',
    styleUrls: ['./product-collateral-dialog.component.less'],
})
export class ProductCollateralDialogComponent implements AppDialog, OnInit {
    @Input() creditFileId: number;
    @Input() sectionId: number;
    @Input() readonly: boolean;
    matrix = {
        CollateralColumns: [] as ICollateralDto[],
        CollateralProductRows: [] as ICollateralProductMatrixRowDto[],
    } as ICollateralProductMatrixDto;
    close: Function;
    closed = new EventEmitter<boolean>();
    changed = false;
    errMessage = '';
    dlgRef: ComponentRef<DialogComponent>;

    private readonly firstFixedColumntWidth = 330;
    gridWidth: string = ""; // musí být nastaveno včetně jednotky px

    getTitle(): string {
        return this.translation.$$get('product_collateral_dialog.collateral_for_product');
    }

    constructor(
        private injector: Injector,
        private productApiService: ProductApiService,
        public progress: UserProgressService,
        private translation: TranslationService
    ) { }
    ngOnInit(): void {
        this.update();
    }

    switchValueChange(event: MouseEvent, r: number, c: number): boolean {
        const rootCell = this.matrix.CollateralProductRows[r].CollateralProductColumns[c];
        const value = (event.currentTarget as any).checked;
        if (rootCell.SuperiorProductId) {
            const parentValue = r > 0 && this.getCheckedProposal(r - 1, c);
            if (!value && parentValue)
                return false;
        }

        this.changed = true;
        rootCell.Proposal = value;
        const level0ProductId = rootCell.ProductId;

        for (let i = r + 1; i < this.matrix.CollateralProductRows.length; i++) {
            let cell = this.matrix.CollateralProductRows[i].CollateralProductColumns[c];
            if (cell.SuperiorProductId == level0ProductId) {
                cell.Proposal = value;
                const level1ProductId = cell.ProductId;
                for (let j = i + 1; j < this.matrix.CollateralProductRows.length; j++) {
                    let cell = this.matrix.CollateralProductRows[j].CollateralProductColumns[c];
                    if (cell.SuperiorProductId == level1ProductId) {
                        cell.Proposal = value;
                        const level2ProductId = cell.ProductId;
                        for (let k = j + 1; k < this.matrix.CollateralProductRows.length; k++) {
                            let cell = this.matrix.CollateralProductRows[k].CollateralProductColumns[c];
                            if (cell.SuperiorProductId == level2ProductId)
                                cell.Proposal = value;
                        }
                    }
                }
            }
        }

        return true;
    }

    getCheckedProposal(row: number, column: number) {
        let cell = this.matrix.CollateralProductRows[row].CollateralProductColumns[column];

        return cell.Proposal;
    }

    getCheckedCurrent(row: number, column: number) {
        let cell = this.matrix.CollateralProductRows[row].CollateralProductColumns[column];

        return cell.Current;
    }

    onSave() {
        this.progress.runProgress(
            this.save()
        ).subscribe(() => this.close(true));
    }
    async onClose() {
        if (!this.progress.running && this.changed) {
            const closed = await MessageBoxDialogComponent.dirtyConfirmation(this.injector, () => this.save());
            if (closed)
                this.close(!this.changed);
        } else
            this.close(false);
    }
    private update(): void {
        this.progress.runProgress(
            this.productApiService.getCollateralProductMatrix(this.creditFileId, this.sectionId).pipe(
                tap(matrix => {
                    if (matrix.CollateralColumns.length == 0 || matrix.CollateralProductRows.length == 0)
                        this.errMessage = this.translation.$$get('product_collateral_dialog.client_has_no_products_or_no_collaterals');
                    else {
                        this.matrix = matrix;
                    }
                })
            )).subscribe(() => {
                this.setDlgSize();
            });
    }

    private save(): Observable<boolean> {
        return this.productApiService.postSaveCollateralProductMatrix(this.matrix).pipe(
            tap(() => this.changed = false),
            map(() => true),
            first());
    }

    public static show(injector: Injector, creditFileId: number, sectionId: number, readonly: boolean = false) {
        var dlgSvc = injector.get(AppDialogContainerService);
        var dlg = dlgSvc.createDialog(injector, ProductCollateralDialogComponent, {}, { creditFileId, sectionId, readonly });
        return dlgSvc.wait(dlg.closed);
    }

    private setDlgSize() {
        let cells = this.matrix.CollateralColumns.length;

        this.gridWidth = this.firstFixedColumntWidth + (cells * 210) + 10 + "px";

        let margin = 0;

        let cellsForDialogCount = cells;
        if (cellsForDialogCount == 1) {
            margin = 10;
        }
        else if (cellsForDialogCount > 4) {
            cellsForDialogCount = 4;
            margin = 30;
        }

        // do sirky dialogu je zahrnut i padding sloupcu
        this.dlgRef.instance.width = this.firstFixedColumntWidth + (cellsForDialogCount * 220) + margin;
    }
}
