import { Injectable, Injector } from '@angular/core';
import { TranslationService } from '../../services/translation-service';

declare var kendo: any;

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
    private translation: TranslationService;

    constructor(injector: Injector) {
        this.translation = new TranslationService(injector);
    }

    public getMonthNames(): string[] {
        return this.translation.$$get('calendar.calendar_months_names').split(',')
    }
    public setupKendoCulture() {
        if (!kendo)
            return false;
        kendo.culture().calendar.firstDay = 1;
        kendo.culture().calendar.days = {
            // full day names
            names: this.translation.$$get('calendar.calendar_days_names').split(','),
            // abbreviated day names
            namesAbbr: this.translation.$$get('calendar.calendar_days_namesAbbr').split(','),
            // shortest day names
            namesShort: this.translation.$$get('calendar.calendar_days_namesShort').split(',')
        };
        kendo.culture().calendar.months = {
            // full month names
            names: this.getMonthNames(),
            // abbreviated month names
            namesAbbr: this.translation.$$get('calendar.calendar_months_namesAbbr').split(',')
        };
        kendo.culture().calendar.patterns.D = this.translation.$$get('calendar.calendar_patterns_D');
        return true;
    }
}
