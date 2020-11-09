import { Component, Injector, OnInit } from '@angular/core';
import * as dates from '@progress/kendo-date-math';
import { DayView, Header, WeekView } from '../calendar-model';
import { CalendarViewBase } from '../calendar-view-base';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'dashboard-week-view',
    templateUrl: './week-view.component.html',
    styleUrls: ['./week-view.component.less'],
})
export class WeekViewComponent extends CalendarViewBase implements OnInit {
    public week = new WeekView();

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit() {
    }

    update() {
        const current = this.date;

        let start = current;
        // najdi pondeli
        while (start.getDay() != dates.Day.Monday) {
            start = dates.addDays(start, -1);
        }
        // vytvor hlavicky dnu v tydnu
        this.week.headers = [];
        let dt = start;
        while (this.week.headers.length < 7) {
            this.week.headers.push(new Header(dt));
            dt = dates.addDays(dt, 1);
        }

        dt = start;
        const days: DayView[] = [];
        while (days.length < 7) {
            const day = new DayView(dt, true);
            day.items = this.dashboardItemRes.DashboardItems.filter(x => dates.isEqualDate(x.Date, dt));
            days.push(day);
            dt = dates.addDays(dt, 1);
        }
        this.week.days = days;
    }
}
