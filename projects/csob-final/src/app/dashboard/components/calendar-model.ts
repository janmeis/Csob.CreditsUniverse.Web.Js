import { IDashboardItemDto } from "src/app/services/webapi/webapi-models";

export class DayView {
    public events: CalendarEvent[] = [];
    public dayOfMonth: number;
    items: IDashboardItemDto[] = [];
    constructor(
        public date: Date,
        public selectedMonth: boolean) {
        this.dayOfMonth = date.getDate();
    }
}
export class Header {
    constructor(public date: Date) { }
}
export class MonthWeek {
    public days: DayView[] = [];
}
export class MonthView {
    public headers: Header[] = [];
    public weeks: MonthWeek[] = [];
}

export class WeekView {
    public headers: Header[] = [];
    public days: DayView[] = [];
}

export type CalendarEventState = 'active' | 'cancelled' | 'doneOk' | 'doneNOK' // lze rozšířit, ale je nutné přidat css
export interface CalendarEvent {
    date: Date
    title: string
    subtitle: string
    dueDate?: Date
    status?: CalendarEventState
}
