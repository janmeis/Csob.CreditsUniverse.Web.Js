import { Component, Injector } from '@angular/core';
import * as dates from '@progress/kendo-date-math';
import { DayView } from '../calendar-model';
import { CalendarViewBase } from '../calendar-view-base';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'dashboard-agenda-view',
    templateUrl: './agenda-view.component.html',
    styleUrls: ['./agenda-view.component.less'],
})
export class AgendaViewComponent extends CalendarViewBase {
    days: DayView[] = [];
    constructor(injector: Injector) {
        super(injector);
    }

    update() {
        const days: DayView[] = [];
        const dts: Date[] = [];
        this.dashboardItemRes.DashboardItems.map(item => item.Date).forEach(dt => {
            if (dts.every(x => !dates.isEqualDate(x, dt)))
                dts.push(dt);
        });
        dts.forEach(dt => {
            const day = new DayView(dt, true);
            day.items = this.dashboardItemRes.DashboardItems.filter(x => dates.isEqualDate(x.Date, dt));
            days.push(day);
        });

        this.days = days;
    }
}
