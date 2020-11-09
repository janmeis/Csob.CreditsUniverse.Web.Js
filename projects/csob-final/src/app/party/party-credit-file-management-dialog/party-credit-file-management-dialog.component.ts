import { Component, EventEmitter, Injector, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppDialog, AppDialogContainerService } from 'projects/app-common/src/public-api';
import { ECodetable, ICreditComponentManagerModel, PartyCreditFileManagementApiService, SelectedPartyService, TranslationService, UserProgressService } from 'projects/services/src/public-api';
import { tap } from 'rxjs/operators';

@UntilDestroy()
@Component({
    selector: 'app-party-credit-file-management-dialog',
    templateUrl: './party-credit-file-management-dialog.component.html',
    styleUrls: ['./party-credit-file-management-dialog.component.less'],
})
export class PartyCreditFileManagementDialogComponent implements OnInit, AppDialog {
    @ViewChild('form') private form: NgForm;
    close: Function;
    closed = new EventEmitter<boolean>();
    title = this.translation.$$get('party_credit_file_management_dialog.title');
    model = { BranchId: null } as ICreditComponentManagerModel;
    codebook_name: string;
    showAll = false;
    isRequired = false;

    constructor(
        private apiService: PartyCreditFileManagementApiService,
        public progress: UserProgressService,
        private translation: TranslationService,
        private selectedParty: SelectedPartyService) { }

    static show(injector: Injector): Promise<boolean> {
        const dlgSvc = injector.get(AppDialogContainerService);
        const dlg = dlgSvc.createDialog(injector, PartyCreditFileManagementDialogComponent);
        return dlgSvc.wait(dlg.closed);
    }

    ngOnInit() {
        this.showAllChanged();

        this.selectedParty.partyHeader.pipe(
            untilDestroyed(this),
            tap(party => {
                this.model = { CreditFileId: party.CreditFileId, BranchId: null } as ICreditComponentManagerModel;
            })
        ).subscribe();
    }

    onSave() {
        this.progress.runProgress(this.apiService.postSave(this.model))
            .subscribe(() => this.close(true));
    }

    showAllChanged() {
        if (!!this.form) {
            this.model.BranchId = null;
            this.form.form.markAsUntouched();
            this.form.form.markAsPristine();
            this.form.form.clearValidators();
        }
        this.codebook_name = this.showAll ? ECodetable[ECodetable.OrganizationalUnitAllLevel] : ECodetable[ECodetable.OrganizationalUnitLevel7];
    }
}
