import { Component, Injector, OnInit } from '@angular/core';
import * as dates from '@progress/kendo-date-math';
import { Arrays } from 'projects/app-common/src/public-api';
import { DayView, Header, MonthView, MonthWeek } from '../calendar-model';
import { CalendarViewBase } from '../calendar-view-base';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'dashboard-month-view',
    templateUrl: './month-view.component.html',
    styleUrls: ['./month-view.component.less'],
})
export class MonthViewComponent extends CalendarViewBase implements OnInit {
    public month = new MonthView();
    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit() {
    }

    update() {
        const current = this.date;
        // dalsi mesic (i pres novy rok)
        let start = dates.getDate(dates.firstDayOfMonth(current));
        const end = dates.getDate(dates.lastDayOfMonth(current));
        // najdi pondeli
        while (start.getDay() != dates.Day.Monday) {
            start = dates.addDays(start, -1);
        }
        // vytvor hlavicky dnu v tydnu
        this.month.headers = [];
        let dt = start;
        while (this.month.headers.length < 7) {
            this.month.headers.push(new Header(dt));
            dt = dates.addDays(dt, 1);
        }
        // vytvor tydny - pozor na prazdne dny z minuleho a pristiho mesice
        const weeks = [new MonthWeek()];
        dt = start;
        while (dt.valueOf() <= end.valueOf()
            || Arrays.last(weeks).days.length < 7) {
            let lastWeek = Arrays.last(weeks);
            if (lastWeek.days.length >= 7) {
                weeks.push(lastWeek = new MonthWeek());
            }
            const day = new DayView(dt, dt.getMonth() == current.getMonth());
            day.items = this.dashboardItemRes.DashboardItems.filter(x => dates.getDate(x.Date).valueOf() == dates.getDate(dt).valueOf());
            lastWeek.days.push(day);
            dt = dates.addDays(dt, 1);
        }
        this.month.weeks = weeks;
    }
}
