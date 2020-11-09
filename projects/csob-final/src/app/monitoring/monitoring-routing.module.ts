import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonitoringOverviewComponent } from './monitoring-overview/monitoring-overview.component';
import { DialogGuard, AuthGuard, CanDeactivateGuard } from 'projects/services/src/public-api';
import { EPermissionAreaType } from 'projects/services/src/public-api';
import { MonitoringSemaphoreDetailComponent } from './monitoring-semaphore-detail/monitoring-semaphore-detail.component';

const routes: Routes = [
    {
        path: '',
        canActivateChild: [DialogGuard, AuthGuard],
        children: [
            { path: '', redirectTo: 'overview' },
            { path: 'overview', component: MonitoringOverviewComponent },
            { path: 'semaphore-detail', component: MonitoringSemaphoreDetailComponent, canDeactivate: [CanDeactivateGuard] },
        ],
        data: { ucType: [EPermissionAreaType.Monitoring] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MonitoringRoutingModule { }
