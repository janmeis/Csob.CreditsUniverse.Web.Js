import { Component, OnInit, Input, EventEmitter, Injector } from '@angular/core';
import { IFinStatDataDto, IFinStatItemDto, IFinStatRowDto } from '../../services/webapi/webapi-models';
import { AppDialog, AppDialogContainerService } from '../../app-common/services/app-dialog-container.service';
import { TranslationService } from '../../services/translation-service';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-financial-comment-dialog',
    templateUrl: './financial-comment-dialog.component.html',
    styleUrls: ['./financial-comment-dialog.component.less'],
})
export class FinancialCommentDialogComponent implements OnInit, AppDialog {
    close: Function
    closed = new EventEmitter<string>();
    getTitle(): string {
        return this.editable ?
            this.translation.$$get('enter_comment_for_x', this.row.Label)
            : this.translation.$$get('comment_for_x', this.row.Label);
    }
    @Input() row: IFinStatRowDto;
    @Input() data: IFinStatItemDto;
    @Input() editable: boolean = null;

    text: string = '';
    constructor(private translation: TranslationService) { }

    ngOnInit() {
        this.text = this.data.Comment || '';
    }

    onValueChange(text: string) {
        this.text = text;
    }
    onSubmit() {
        this.close(this.text);
    }
    onCancel() {
        this.close(undefined);
    }
    static show(injector: Injector, data: IFinStatItemDto, row: IFinStatRowDto, editable: boolean) {
        var dlgSvc = injector.get(AppDialogContainerService);
        var dlg = dlgSvc.createDialog(injector, FinancialCommentDialogComponent, {}, { data: data, row: row, editable: editable });
        return dlgSvc.wait(dlg.closed);
    }
}
