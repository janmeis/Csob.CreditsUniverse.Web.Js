import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from 'projects/app-common/src/lib/app-common.module';
import { AgendaViewComponent } from './components/agenda-view/agenda-view.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { DayViewComponent } from './components/day-view/day-view.component';
import { DropDownListFilterComponent } from './components/drop-down-list-filter/drop-down-list-filter.component';
import { MonthViewComponent } from './components/month-view/month-view.component';
import { WeekViewComponent } from './components/week-view/week-view.component';
import { DashboardBranchesComponent } from './dashboard-branches/dashboard-branches.component';
import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview.component';
import { DashboardClientComponent } from './dashboard-client/dashboard-client.component';
import { DashboardDetailDialogComponent } from './dashboard-detail-dialog/dashboard-detail-dialog.component';
import { DashboardEventsComponent } from './dashboard-events/dashboard-events.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardEventsGridComponent } from './components/dashboard-events-grid/dashboard-events-grid.component';
import { DashboardClientGridComponent } from './components/dashboard-client-grid/dashboard-client-grid.component';
import { DashboardMyEventsComponent } from './dashboard-my-events/dashboard-my-events.component';
import { DashboardMyOverviewComponent } from './dashboard-my-overview/dashboard-my-overview.component';
import { DashboardToobarComponent } from './components/dashboard-toobar/dashboard-toobar.component';
import { FullTextFilterComponent } from './components/full-text-filter/full-text-filter.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { DashboardDetailSemaphoresComponent } from './components/dashboard-detail-semaphores/dashboard-detail-semaphores.component';
import { DashboardItemComponent } from './components/dashboard-item/dashboard-item.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        AppCommonModule,
        ReactiveFormsModule,
        DashboardRoutingModule,
    ],
    declarations: [
        DashboardOverviewComponent,
        WeekViewComponent,
        CalendarComponent,
        MonthViewComponent,
        AgendaViewComponent,
        DashboardDetailDialogComponent,
        DayViewComponent,
        DashboardBranchesComponent,
        DashboardEventsComponent,
        DropDownListFilterComponent,
        DashboardClientComponent,
        DashboardEventsGridComponent,
        DashboardClientGridComponent,
        DashboardMyEventsComponent,
        DashboardMyOverviewComponent,
        DashboardToobarComponent,
        FullTextFilterComponent,
        DateFilterComponent,
        DashboardDetailSemaphoresComponent,
        DashboardItemComponent
    ],
    exports: [
        DashboardOverviewComponent
    ]
})
export class DashboardModule { }
