import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ECalendarType } from '../../../services/webapi/webapi-models';
import { CalendarComponent } from '../calendar/calendar.component';

@Component({
    selector: 'app-dashboard-toobar',
    templateUrl: './dashboard-toobar.component.html',
    styleUrls: ['./dashboard-toobar.component.less']
})
export class DashboardToobarComponent implements OnInit {
    @Input() calendar: CalendarComponent;

    private _date = new Date();
    get date() {
        return this._date;
    }
    @Input() set date(value) {
        this._date = value;

        if (this.date instanceof Date  && this.date.getFullYear() > 1900)
            this.dateChange.emit(this.date);
    }
    @Output() dateChange = new EventEmitter<Date>();

    private _calendarType: ECalendarType = null;
    get calendarType(): ECalendarType {
        return this._calendarType;
    }
    @Input() set calendarType(value: ECalendarType) {
        this._calendarType = value;
        this.calendarTypeChange.emit(this.calendarType);
    }
    @Output() calendarTypeChange = new EventEmitter<ECalendarType>();

    ECalendarType = ECalendarType;

    constructor() { }

    ngOnInit() {
    }

}
