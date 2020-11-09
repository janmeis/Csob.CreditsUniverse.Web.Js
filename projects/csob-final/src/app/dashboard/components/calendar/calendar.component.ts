import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as dates from '@progress/kendo-date-math';
import { CurrentLangService } from 'src/app/services/current-lang-service';
import { ECalendarType, IDashboardItemDto, IDashboardItemResDto } from 'src/app/services/webapi/webapi-models';
import { IDashboardType } from '../../dashboard-events/dashboard-events.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'dashboard-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.less'],
})
export class CalendarComponent {
    private _date = new Date();
    get date() {
        return this._date;
    }
    @Input() set date(v: Date) {
        if (dates.isEqualDate(this._date, v))
            return;
        this._date = v;
        this.dateChanged.emit(v);
    }

    @Input() dashboardItemRes: IDashboardItemResDto;

    private _calendarType: ECalendarType = ECalendarType.Week;
    get calendarType() {
        return this._calendarType;
    }
    @Input() set calendarType(calendarType: ECalendarType) {
        this._calendarType = calendarType;
        this.calendarTypeChanged.emit(calendarType);
    }

    @Input() dashboardTypes: IDashboardType[];

    @Output() calendarTypeChanged = new EventEmitter<ECalendarType>();
    @Output() dateChanged = new EventEmitter<Date>();
    @Output() eventClicked = new EventEmitter<IDashboardItemDto>();

    format: string;
    ECalendarType = ECalendarType;

    constructor(currentLangService: CurrentLangService) {
        this.format = currentLangService.getDateFormat();
    }

    onDayClicked(date: Date) {
        event.preventDefault();
        this.calendarType = ECalendarType.Day;
        this.date = date;
    }

    onChangeDate(offset: number) {
        if (offset == 0) {
            this.date = new Date();
            return;
        }

        switch (this.calendarType) {
            case ECalendarType.Month:
                this.date = dates.addMonths(this.date, offset);
                break;
            case ECalendarType.Week:
                this.date = dates.addDays(this.date, offset * 7);
                break;
            case ECalendarType.Day:
            case ECalendarType.Agenda:
                this.date = dates.addDays(this.date, offset);
                break;
            default:
                console.warn('unknown view type ' + this.calendarType);
                break;
        }
    }
}
