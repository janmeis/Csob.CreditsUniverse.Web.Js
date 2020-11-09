import { Component, ComponentRef, EventEmitter, Injector, OnInit, ViewChild } from '@angular/core';
import { DialogComponent } from '@progress/kendo-angular-dialog';

import { AppDialog, AppDialogContainerService } from 'src/app/app-common/services/app-dialog-container.service';
import { TranslationService } from 'src/app/services/translation-service';
import { UserProgressService } from 'src/app/services/user-progress.service';
import { IMatrixDto } from 'src/app/services/webapi/webapi-models';
import { RarocProductCollateralService } from '../raroc-detail-product-dialog/raroc-product-collateral.service';
import { MessageBoxDialogComponent } from 'src/app/app-common/components/message-box-dialog/message-box-dialog.component';
import { NgForm } from '@angular/forms';
import { of } from 'core-js/fn/array';

@Component({
    selector: 'app-raroc-product-collateral-dialog',
    templateUrl: './raroc-product-collateral-dialog.component.html',
    styleUrls: ['./raroc-product-collateral-dialog.component.less'],
})
export class RarocProductCollateralDialogComponent implements AppDialog, OnInit {
    close: Function;
    closed = new EventEmitter<IMatrixDto>();
    dlgRef: ComponentRef<DialogComponent>;
    getTitle = (): string => this.translation.$$get('raroc_product_collateral_dialog.dialog_title');
    rarocId: number;
    lgdModelId: number;
    readonly = false;
    matrix: IMatrixDto;
    gridWidth: string = ""; // musí být nastaveno včetně jednotky px
    private readonly firstFixedColumntWidth = 310;
    @ViewChild('form') private form: NgForm;

    constructor(
        private injector: Injector,
        public progress: UserProgressService,
        private rarocProductCollateralService: RarocProductCollateralService,
        private translation: TranslationService
    ) { }

    ngOnInit(): void {
        this.progress.runProgress(
            this.rarocProductCollateralService.getMatrix$(this.rarocId)
        ).subscribe(matrix => {
            this.matrix = matrix;
            this.setDlgSize();
        });
    }

    static show(injector: Injector, rarocId: number, readonly: boolean = false): Promise<IMatrixDto> {
        const dlgSvc = injector.get(AppDialogContainerService);
        const dlg = dlgSvc.createDialog(injector, RarocProductCollateralDialogComponent, {}, { rarocId, readonly });
        return dlgSvc.wait(dlg.closed);
    }
    private setDlgSize() {
        const cells = this.matrix.Cells.length;

        this.gridWidth = this.firstFixedColumntWidth + (cells * 210) + 30 + "px";

        let margin = 0;

        const  cellsForDialogCount = cells;
        if (cellsForDialogCount == 1) {
            margin = 10;
        }

        // do sirky dialogu je zahrnut i padding sloupcu
        this.dlgRef.instance.width = this.firstFixedColumntWidth + (cellsForDialogCount * 220) + margin + 40;
    }

    async onClose(save: boolean) {
        if (save) {
            this.close(this.matrix);
        } else {
            if (this.form.form.dirty) {
                const shouldSave = await this.shouldSave();

                if (shouldSave === true) this.close(this.matrix);
                if (shouldSave === false) this.close(null);
            // cancel = shouldSave 2 => NOP
            } else {
                this.close(null);
            }
        }
    }

    onCheckChange(row: number, col: number) {
        this.matrix.Items[row][col].Proposal = !this.matrix.Items[row][col].Proposal;
        this.form.form.markAsDirty();
    }

    private shouldSave(): Promise<boolean> {

        return MessageBoxDialogComponent.dirtyConfirmationWithoutSave(this.injector);
    }

}
