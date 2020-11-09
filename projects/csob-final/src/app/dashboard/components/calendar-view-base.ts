import { EventEmitter, Injector, Input, Output, Directive } from '@angular/core';
import * as dates from '@progress/kendo-date-math';
import { CurrentLangService } from 'src/app/services/current-lang-service';
import { IDashboardItemDto, IDashboardItemResDto } from 'src/app/services/webapi/webapi-models';
import { IDashboardType } from '../dashboard-events/dashboard-events.service';

@Directive()
// tslint:disable-next-line: directive-class-suffix
export abstract class CalendarViewBase {
    public format: string;
    private _date: Date;
    get date() {
        return this._date;
    }
    @Input() set date(v: Date) {
        if (dates.isEqualDate(this._date, v))
            return;
        this._date = v;
        if (!!this.dashboardItemRes)
            this.update();
    }
    private _dashboardItemRes: IDashboardItemResDto;
    get dashboardItemRes() {
        return this._dashboardItemRes;
    }
    @Input() set dashboardItemRes(v: IDashboardItemResDto) {
        this._dashboardItemRes = v;
        if (!!this.dashboardItemRes)
            this.update();
    }

    private _dashboardTypes: IDashboardType[];
    get dashboardTypes(): IDashboardType[] {
        return this._dashboardTypes;
    }
    @Input() set dashboardTypes(value: IDashboardType[]) {
        this._dashboardTypes = value;
    }

    @Output() dayClicked = new EventEmitter<Date>();
    @Output() eventClicked = new EventEmitter<IDashboardItemDto>();

    constructor(injector: Injector) {
        this.format = injector.get(CurrentLangService).getDateFormat();
    }

    onDayClicked(date: Date) {
        event.preventDefault();
        this.dayClicked.emit(date);
    }

    abstract update(): void;

    getHolidayClass(date?: Date) {
        if (!date)
            return;

        const dayOfWeek = date.getDay();
        if (dayOfWeek == 0 || dayOfWeek == 6)
            return 'holiday';

        if (this.dashboardItemRes.Holidays.some(d => dates.isEqualDate(d, date)))
            return 'holiday';

        return '';
    }
}
