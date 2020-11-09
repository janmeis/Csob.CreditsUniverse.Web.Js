import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DialogGuard } from 'projects/services/src/public-api';
import { EPermissionAreaType } from 'projects/services/src/public-api';
import { DashboardBranchesComponent } from './dashboard-branches/dashboard-branches.component';
import { DashboardClientComponent } from './dashboard-client/dashboard-client.component';
import { DashboardEventsComponent } from './dashboard-events/dashboard-events.component';
import { DashboardMyEventsComponent } from './dashboard-my-events/dashboard-my-events.component';
import { DashboardMyOverviewComponent } from './dashboard-my-overview/dashboard-my-overview.component';
import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview.component';
const routes: Routes = [
    {
        path: '',
        canActivateChild: [DialogGuard],
        children: [
            { path: '', redirectTo: 'branch' },
            { path: 'branch',
            children: [
                    { path: '', redirectTo: 'overview' },
                    { path: 'overview', component: DashboardBranchesComponent },
                    { path: 'events', component: DashboardEventsComponent },
                    { path: 'calendar', component: DashboardOverviewComponent },
                ],
             },
            { path: 'client/:id', component: DashboardClientComponent },
            { path: 'my-events',
                children: [
                    { path: '', redirectTo: 'events' },
                    { path: 'events', component: DashboardMyEventsComponent },
                    { path: 'calendar', component: DashboardMyOverviewComponent },
                ],
            },
        ],
        data: { ucType: [EPermissionAreaType.Dashboard] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
