import { Component, Injector } from '@angular/core';
import * as dates from '@progress/kendo-date-math';
import { DayView } from '../calendar-model';
import { CalendarViewBase } from '../calendar-view-base';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'dashboard-day-view',
    templateUrl: './day-view.component.html',
    styleUrls: ['./day-view.component.less'],
})
export class DayViewComponent extends CalendarViewBase  {
    public day: DayView;
    constructor(injector: Injector) {
        super(injector);
    }

    update() {
        const dt = this.date;
        const day = new DayView(dt, true);
        day.items = this.dashboardItemRes.DashboardItems.filter(x => dates.isEqualDate(x.Date,  dt));
        this.day = day;
    }
}
