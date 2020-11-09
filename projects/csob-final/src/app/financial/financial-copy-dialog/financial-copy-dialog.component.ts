import { Component, EventEmitter, Injector, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppDialog, AppDialogContainerService } from 'projects/app-common/src/public-api';
import { FinancialApiService, IFVCopyDto, TranslationService, UserProgressService } from 'projects/services/src/public-api';
import { EditorValidation } from 'projects/app-common/src/public-api';

@Component({
    selector: 'app-financial-copy-dialog',
    templateUrl: './financial-copy-dialog.component.html',
    styleUrls: ['./financial-copy-dialog.component.less'],
})
export class FinancialCopyDialogComponent implements AppDialog {
    @ViewChild('form') private form: NgForm;
    close: Function;
    closed = new EventEmitter<number[]>();
    model = {
        FinStatementHeaderIds: [],
        Consolidation: false,
        ValidFrom: null,
        ValidTo: null
    } as IFVCopyDto;
    errors = '';

    static show(injector: Injector, fvCopy: IFVCopyDto) {
        const dlgSvc = injector.get(AppDialogContainerService);
        const dialog = dlgSvc.createDialog(injector, FinancialCopyDialogComponent,
            { width: 600, height: 350 },
            { model: fvCopy });
        return dlgSvc.wait(dialog.closed);
    }

    constructor(
        private progress: UserProgressService,
        private finApi: FinancialApiService,
        private translation: TranslationService) {
    }

    getTitle = () => this.translation.$$get('financial_copy_dialog.title');

    onSubmit(): void {
        this.progress.runProgress(this.finApi.postCopy(this.model)
        ).subscribe(
            copyIds => this.close(copyIds),
            err => this.close(null));
    }

    onDateValidate(validation: EditorValidation) {
        this.errors = this.model.FinStatementHeaderIds.length == 1
            && (!this.model.ValidFrom || !this.model.ValidTo || this.model.ValidFrom > this.model.ValidTo)
            ? this.translation.$$get('financial_copy_dialog.valid_from_date_should_not_be_higher_than_valid_to_date')
            : '';
    }
}
