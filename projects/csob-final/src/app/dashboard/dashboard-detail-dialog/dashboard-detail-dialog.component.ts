import { TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Injector, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { EditorCodeBookComponent, GetStaticCodebookProvider, ICodebookProvider } from 'src/app/app-common/components/editor-codebook/editor-codebook.component';
import { MessageBoxDialogComponent } from 'src/app/app-common/components/message-box-dialog/message-box-dialog.component';
import { AppDialog, AppDialogContainerService } from 'src/app/app-common/services/app-dialog-container.service';
import { GridEnumService } from 'src/app/app-common/services/grid-enum.service';
import { ApiBaseService } from 'src/app/services/api-base.service';
import { SecurityService } from 'src/app/services/security.service';
import { TranslationService } from 'src/app/services/translation-service';
import { UserNotificationService } from 'src/app/services/user-notification.service';
import { UserProgressService } from 'src/app/services/user-progress.service';
import { DashboardApiService } from 'src/app/services/webapi/dashboard-api-service';
import { PartyApiService } from 'src/app/services/webapi/party-api-service';
import { EColor, EDashboardState, EDashboardTypeId, EKeyEnum, ICodebookItem, IDashboardEventDto, IDashMonIncidentDto, IMonitoringClientSemaphoreDto } from 'src/app/services/webapi/webapi-models';
import { CodebookItem } from 'src/app/services/webapi/webapi-models-classes';

@UntilDestroy()
@Component({
    selector: 'app-dashboard-detail-dialog',
    templateUrl: './dashboard-detail-dialog.component.html',
    styleUrls: ['./dashboard-detail-dialog.component.less'],
})
export class DashboardDetailDialogComponent implements OnInit, AppDialog {
    @ViewChild('form') private form: NgForm;
    @ViewChild('dashboardState') private dashboardState: EditorCodeBookComponent;
    close: Function = null;
    closed = new EventEmitter<boolean>();
    api: ApiBaseService;
    clientSemaphore: IMonitoringClientSemaphoreDto;
    dashboardEvent: IDashboardEventDto;
    dashboardStates: ICodebookProvider;
    EDashboardState = EDashboardState;
    EDashboardTypeId = EDashboardTypeId;
    existEvents = true;
    incidents: IDashMonIncidentDto[];
    isStateChanged = false;
    model: IDashboardEventDto;
    partyDashboards: ICodebookProvider;
    readonly = false;
    semaphoreId?: EColor = null;

    static show(injector: Injector, dashboardEvent: IDashboardEventDto = null): Promise<boolean> {
        const dlgSvc = injector.get(AppDialogContainerService);
        const dlg = dlgSvc.createDialog(injector, DashboardDetailDialogComponent, { width: 1000 }, { dashboardEvent: dashboardEvent });
        return dlgSvc.wait(dlg.closed);
    }

    constructor(
        private dashboardApi: DashboardApiService,
        private injector: Injector,
        private gridEnumService: GridEnumService,
        private notification: UserNotificationService,
        private partyApi: PartyApiService,
        public progress: UserProgressService,
        private securityService: SecurityService,
        private translation: TranslationService,
    ) {
        this.api = dashboardApi.api;
    }

    ngOnInit(): void {
        this.progress.runProgress(
            (_ => {
                if (!!this.dashboardEvent) {
                    this.api.setCurrentCreditFile(`${this.dashboardEvent.CreditFileId}`);
                    return this.dashboardApi.getEvent(this.dashboardEvent.Id).pipe(
                        tap(dashboardDetail => {
                            this.clientSemaphore = dashboardDetail.ClientSemaphore;
                            this.incidents = dashboardDetail.Incidents;
                            this.existEvents = dashboardDetail.ExistEvents;
                        }),
                        map(dashboardDetail => dashboardDetail.DashboardEventDto)
                    );
                }

                const currentUser = this.securityService.currentUser;
                return of({
                    Id: 0,
                    DashboardState: EDashboardState.New,
                    DashboardType: 'My event',
                    DashboardTypeId: EDashboardTypeId.User,
                    ClientName: `${currentUser.FirstName} ${currentUser.Surname}`,
                    FulfilmentRequiredOn: new Date()
                } as IDashboardEventDto);
            })().pipe(
                tap(dashboardEvent => this.model = dashboardEvent),
                mergeMap(_ => {
                    if (this.model.DashboardTypeId == EDashboardTypeId.User)
                        return this.partyApi.getPartyForDashboards();

                    return of([]);
                }),
                tap(partyDashboards => this.partyDashboards = GetStaticCodebookProvider(this.toCodebookItems(partyDashboards))),
                tap(partyDashboards => {
                    if (this.model.DashboardTypeId == EDashboardTypeId.User && this.model.DashboardState == EDashboardState.New
                        && partyDashboards.every(p => p.CreditFileId != this.model.CreditFileId))
                        this.model.CreditFileId = null;
                })
            )
        ).subscribe(() => {
            this.getDashboardStates();

            setTimeout(() => {
                this.dashboardState.valueChange.pipe(
                    untilDestroyed(this)
                ).subscribe(() => {
                    this.isStateChanged = true;
                });
            }, 0);
        });
    }

    getTitle = () => !!this.dashboardEvent
        ? this.translation.$$get('dashboard_detail_dialog.dialog_title')
        : this.translation.$$get('dashboard_detail_dialog.new_dialog_title')

    async onSave() {
        if (!this.existEvents && this.semaphoreId != EColor.Green) {
            const opts = MessageBoxDialogComponent.createYesNoOptions(this.injector);
            opts.message = this.translation.$$get('dashboard_detail_dialog.exist_events');
            const result = await MessageBoxDialogComponent.show(this.injector, opts).toPromise();
            if (result)
                this.saveAndClose();
        } else
            this.saveAndClose();
    }

    clientSemaphoreColorChange(color: string) {
        const titleCaseColor = new TitleCasePipe().transform(color);
        const semaphoreId = EColor[titleCaseColor];
        if (semaphoreId != this.clientSemaphore.SemaphoreId) {
            this.semaphoreId = semaphoreId;
            this.form.form.markAsDirty();
        } else
            this.semaphoreId = null;
    }

    private saveAndClose(): void {
        this.progress.runProgress(this.dashboardApi.postSave(this.model, { semaphoreId: this.semaphoreId })
        ).subscribe(_ => {
            this.notification.success(this.translation.$$get('dashboard_detail_dialog.data_saved'));
            this.close(true);
        });
    }

    private getDashboardStates() {
        switch (this.model.DashboardState) {
            case EDashboardState.New:
                const dashboardStates = !!this.model.Id && this.model.Id > 0
                    ? this.model.DashboardTypeId == EDashboardTypeId.User
                        ? [EDashboardState.New, EDashboardState.Fulfilled, EDashboardState.Canceled]
                        : [EDashboardState.New, EDashboardState.Fulfilled]
                    : [EDashboardState.New];
                this.dashboardStates = this.gridEnumService.GetEnumCodebookProviderFiltered(EKeyEnum.DashboardState, dashboardStates);
                break;
            case EDashboardState.Unfulfilled:
                this.dashboardStates = this.gridEnumService.GetEnumCodebookProviderFiltered(EKeyEnum.DashboardState, [EDashboardState.Unfulfilled, EDashboardState.Fulfilled]);
                break;
            default:
                this.readonly = true;
                this.dashboardStates = this.gridEnumService.GetEnumCodebookProvider(EKeyEnum.DashboardState);
                break;
        }
    }

    private toCodebookItems = (partyDashboards: any[]): ICodebookItem[] =>
        partyDashboards.map(p => ({ Text: p.ClientName, Value: p.CreditFileId } as CodebookItem))
}
