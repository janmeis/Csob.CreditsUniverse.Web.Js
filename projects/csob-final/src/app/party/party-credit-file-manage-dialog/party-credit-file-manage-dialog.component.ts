import { Component, EventEmitter, Injector, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { tap, map, first } from 'rxjs/operators';
import { AppDialog, AppDialogContainerService } from '../../app-common/services/app-dialog-container.service';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { SecurityService } from '../../services/security.service';
import { TranslationService } from '../../services/translation-service';
import { UserProgressService } from '../../services/user-progress.service';
import { PartyCreditFileManagementApiService } from '../../services/webapi/partycreditfilemanagement-api-service';
import { ICreditComponentManagerModel, ICreditComponentManagerUserModel } from '../../services/webapi/webapi-models';
import { MessageBoxDialogComponent } from '../../app-common/components/message-box-dialog/message-box-dialog.component';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'app-party-credit-file-manage-dialog',
    templateUrl: './party-credit-file-manage-dialog.component.html',
    styleUrls: ['./party-credit-file-manage-dialog.component.less'],
})
export class PartyCreditFileManageDialogComponent extends BasePermissionsComponent implements AppDialog, OnInit {
    @ViewChild('form') private form: NgForm;
    creditFileId: number;
    branchId: number;
    close: Function;
    closed = new EventEmitter<boolean>();
    detail: ICreditComponentManagerModel;
    errors: { [key: string]: boolean } = {};

    constructor(
        private injector: Injector,
        public progress: UserProgressService,
        private partyCreditFileManagementApiService: PartyCreditFileManagementApiService,
        securityService: SecurityService,
        private translation: TranslationService,
    ) {
        super(securityService);
    }

    static show(injector: Injector, creditFileId: number, branchId: number): Promise<boolean> {
        const dlgSvc = injector.get(AppDialogContainerService);
        const dlg = dlgSvc.createDialog(injector, PartyCreditFileManageDialogComponent, { width: 650 }, { creditFileId, branchId });
        return dlgSvc.wait(dlg.closed);
    }

    ngOnInit() {
        this.progress.runProgress(
            this.partyCreditFileManagementApiService.getDetail(this.creditFileId, this.branchId).pipe(
                tap(detail => this.detail = detail))
        ).subscribe();
    }

    getTitle = () => this.translation.$$get('party_credit_file_manage_dialog.dialog_title');

    isManagerCheck(user: ICreditComponentManagerUserModel, check: boolean) {
        user.IsMainManager = check;
        if (check)
            user.IsManager = check;

        this.resetErrors();
    }

    isMainManagerCheck(user: ICreditComponentManagerUserModel, check: boolean) {
        user.IsManager = check;
        if (!check)
            user.IsMainManager = check;

        this.resetErrors();
    }

    hasMainManager = (user: ICreditComponentManagerUserModel): boolean =>
        !user.IsMainManager && this.detail.Users.some(u => u.IsMainManager)

    onSave() {
        this.progress.runProgress(this.save()).subscribe(result => {
            if (result)
                this.close(true);
        });
    }

    private isFormValid(): boolean {
        const hasMainManager = this.detail.Users.some(u => u.IsMainManager);
        this.errors['hasUniqueMainManager'] = !hasMainManager && this.detail.HasUniqueMainManager;
        this.errors['isMainManagerSet'] = !hasMainManager && !this.detail.IsMainManagerSet;
        if (Object.keys(this.errors).some(key => this.errors[key]))
            this.form.form.setErrors({ 'invalid': true });

        return this.form.form.valid;
    }

    private save(): Observable<boolean> {
        if (this.isFormValid()) {
            const users: ICreditComponentManagerUserModel[] = this.detail.Users.filter(u => u.IsManager);
            return this.partyCreditFileManagementApiService.postSaveUsers(this.creditFileId, this.branchId, users).pipe(
                map(_ => true),
                first());
        }

        return of(false);
    }

    async onCancelClick() {
        if (this.form.dirty) {
            if (!this.isFormValid()) {
                const opts = MessageBoxDialogComponent.createYesCancelOptions(this.injector);
                opts.title = this.translation.$$get('party_credit_file_manage_dialog.dirty_title');
                opts.messageHTML = this.translation.$$get('party_credit_file_manage_dialog.dirty_question');

                const yesCancelResult = await MessageBoxDialogComponent.show(this.injector, opts).toPromise();
                if (!yesCancelResult)
                    this.close(false);
            } else {
                const dirtyResult = await MessageBoxDialogComponent.dirtyConfirmation(this.injector, () => this.save());
                if (dirtyResult)
                    this.close(true);
            }
        } else
            this.close(false);
    }

    private resetErrors() {
        this.form.form.setErrors(null);
        this.errors = {};
        this.form.form.markAsDirty();
    }
}
