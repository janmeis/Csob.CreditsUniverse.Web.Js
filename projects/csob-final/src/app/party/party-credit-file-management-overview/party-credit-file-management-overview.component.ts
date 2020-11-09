import { Component, Injector, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DataStateChangeEvent, RowArgs } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { SortDescriptor, State } from '@progress/kendo-data-query';
import { pipe } from 'rxjs';
import { tap } from 'rxjs/operators';
import { showTooltip } from '../../app-common/common-functions';
import { MessageBoxDialogComponent } from '../../app-common/components/message-box-dialog/message-box-dialog.component';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { SecurityService } from '../../services/security.service';
import { SelectedPartyService } from '../../services/selected-party.service';
import { TranslationService } from '../../services/translation-service';
import { UserNotificationService } from '../../services/user-notification.service';
import { UserProgressService } from '../../services/user-progress.service';
import { ICreditComponentManagerModel } from '../../services/webapi/webapi-models';
import { PartyCreditFileManageDialogComponent } from '../party-credit-file-manage-dialog/party-credit-file-manage-dialog.component';
import { PartyCreditFileManagementDialogComponent } from '../party-credit-file-management-dialog/party-credit-file-management-dialog.component';
import { PartyCreditFileManagementOverviewService } from './party-credit-file-management-overview.service';


@Component({
    selector: 'app-party-credit-file-management-overview',
    templateUrl: './party-credit-file-management-overview.component.html',
    styleUrls: ['./party-credit-file-management-overview.component.less'],
    providers: [
        PartyCreditFileManagementOverviewService
    ]
})
/// <see cref="https://www.telerik.com/kendo-angular-ui/components/grid/selection/" />
/// The following example demonstrates how to select all Grid items at once.
export class PartyCreditFileManagementOverviewComponent extends BasePermissionsComponent implements OnInit {
    creditFileId: number;
    selection: ICreditComponentManagerModel[] = [];
    canDelete = false;
    canAdd = true;
    view$: PartyCreditFileManagementOverviewService;
    state = {
        skip: 0, take: 10, sort: [] = [{
            field: 'BranchName', dir: 'asc'
        } as SortDescriptor]
    } as State;
    get hasNonStandardAccess(): boolean {
        return this.overviewService.hasNonStandardAccess;
    }
    set hasNonStandardAccess(value: boolean) {
        this.overviewService.hasNonStandardAccess = value;
    }
    get total(): number {
        return this.overviewService.total;
    }

    constructor(
        private injector: Injector,
        private notification: UserNotificationService,
        private overviewService: PartyCreditFileManagementOverviewService,
        public progress: UserProgressService,
        private selectedParty: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        protected securityService: SecurityService,
    ) {
        super(securityService);
        this.view$ = this.overviewService;
    }

    ngOnInit(): void {
        this.title.setTitle(this.translation.$$get('party_credit_file_management_overview.party_cfmanagement'));

        this.progress.runProgress(
            this.selectedParty.partyHeader.pipe(
                tap(party => {
                    this.creditFileId = party.CreditFileId;
                    super.fillRights(party);
                }))
        ).subscribe(() => {
            this.overviewService.query(this.creditFileId, this.state, true);
        });
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        showTooltip(e, kendoTooltipInstance);

    managementSelectionKey = (context: RowArgs): ICreditComponentManagerModel =>
        context.dataItem as ICreditComponentManagerModel;

    onGridSelectedKeysChange(selection: ICreditComponentManagerModel[]) {
        this.canDelete = selection.length > 0 && this.total > 1;
        this.canAdd = selection.length == 0;
    }

    onGridDataStateChange(state: DataStateChangeEvent) {
        this.state = state;
        this.selection = [];
        this.canDelete = false;
        this.canAdd = true;

        this.overviewService.query(this.creditFileId, this.state);
    }

    isNonStandardHandler() {
        this.progress.runProgress(
            this.overviewService.setCreditFileAccess(this.creditFileId).pipe(
                tap(_ => location.reload()))
        ).subscribe();
    }

    async onAddClicked() {
        const result = await PartyCreditFileManagementDialogComponent.show(this.injector);
        this.requeryIfSuccess(result);
    }

    async onDeleteClicked() {
        if (this.selection.length == this.total
            && await MessageBoxDialogComponent.confirmAlert(this.injector, this.translation.$$get('party_credit_file_management_overview.cannot_delete_all_credit_file_managers')).toPromise())
            return;

        if (!this.overviewService.isDeletionValid(this.selection)
            && await MessageBoxDialogComponent.confirmAlert(this.injector, this.translation.$$get('party_credit_file_management_overview.last_mainmanager_delete')).toPromise())
            return;

        const opts = MessageBoxDialogComponent.createDeleteAlertOption(this.injector);
        if (!await MessageBoxDialogComponent.show(this.injector, opts).toPromise())
            return;

        this.progress.runProgress(
            this.overviewService.deleteManagers(this.selection).pipe(
                tap(() => {
                    this.selection = [];
                    this.canDelete = false;
                    this.canAdd = true;
                })
            )).subscribe(_ => this.requeryIfSuccess(true, 'data_deleted'));
    }

    async onManageClick(branchId: number) {
        const result = await PartyCreditFileManageDialogComponent.show(this.injector, this.creditFileId, branchId);
        this.requeryIfSuccess(result);
    }

    private requeryIfSuccess(result: boolean, notification = 'data_saved') {
        this.notification.clear();
        if (!result)
            return;

        this.progress.start(true);
        this.overviewService.query(this.creditFileId, this.state, true);
        this.selection = [];
        this.notification.success(this.translation.$$get(`party_credit_file_management_overview.${notification}`));

        location.reload();
    }
}
