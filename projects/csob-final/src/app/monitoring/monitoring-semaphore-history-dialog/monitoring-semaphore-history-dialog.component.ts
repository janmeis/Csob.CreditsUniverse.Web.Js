import { Component, ComponentRef, EventEmitter, Injector, OnInit } from '@angular/core';
import { DialogComponent } from '@progress/kendo-angular-dialog';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { tap } from 'rxjs/operators';
import { showTooltip } from '../../app-common/common-functions';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { SecurityService } from 'projects/services/src/public-api';
import { TranslationService } from 'projects/services/src/public-api';
import { UserProgressService } from 'projects/services/src/public-api';
import { MonitoringApiService } from 'projects/services/src/public-api';
import { IMonitoringClientSemaphoreDto } from 'projects/services/src/public-api';
import { AppDialog, AppDialogContainerService } from 'projects/app-common/src/public-api';


@Component({
  selector: 'app-monitoring-semaphore-history-dialog',
  templateUrl: './monitoring-semaphore-history-dialog.component.html',
    styleUrls: ['./monitoring-semaphore-history-dialog.component.less'],
})
export class MonitoringSemaphoreHistoryDialogComponent extends BasePermissionsComponent implements AppDialog, OnInit {
    creditFileId: number;
    clientSemaphoreColor: string;
    close: Function;
    closed = new EventEmitter<boolean>();
    dlgRef: ComponentRef<DialogComponent>;
    semaphoreHistory: IMonitoringClientSemaphoreDto[];
    filter = {
        logic: 'and',
        filters: []
    } as CompositeFilterDescriptor;


    constructor(
        public progress: UserProgressService,
        private monitoringApiService: MonitoringApiService,
        private translation: TranslationService,
        securityService: SecurityService,
    ) {
        super(securityService);
    }

    static show(injector: Injector, creditFileId: number, clientSemaphoreColor: string): Promise<boolean> {
        const dlgSvc = injector.get(AppDialogContainerService);
        const dlg = dlgSvc.createDialog(injector, MonitoringSemaphoreHistoryDialogComponent, { width: 1000 }, { creditFileId, clientSemaphoreColor });
        return dlgSvc.wait(dlg.closed);
    }

    ngOnInit() {
        this.progress.runProgress(
            this.monitoringApiService.getClientSemaphoreHistory(this.creditFileId).pipe(
                tap(semaphoreHistory => this.semaphoreHistory = semaphoreHistory))
        ).subscribe();
    }

    getTitle = () => this.translation.$$get('monitoring_semaphore_history_dialog.dialog_title');

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        showTooltip(e, kendoTooltipInstance)
}
