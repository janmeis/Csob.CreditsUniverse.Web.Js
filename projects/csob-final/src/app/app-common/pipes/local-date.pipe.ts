import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform, LOCALE_ID, Inject } from '@angular/core';

export type modeType = 'date' | 'dateTime';

@Pipe({
    name: 'localDate'
})
export class LocalDatePipe implements PipeTransform {
    constructor(@Inject(LOCALE_ID) public locale: string) {
    }

    transform(value: Date, mode: modeType) {
        let datePipe: DatePipe;
        let isCz = false;

        if (this.locale == 'cs') {
            datePipe = new DatePipe('cs-CZ');
            isCz = true;
        } else {
            datePipe = new DatePipe('en-GB');
        }

        let format;

        if (mode == 'dateTime') {
            if (isCz) {
                format = 'dd.MM.yyyy\u00A0\u00A0HH:mm:ss';
            } else {
                format = 'ddMMMyy\u00A0\u00A0HH:mm:ss';
            }
        } else if (mode == 'date') {
            if (isCz) {
                format = 'dd.MM.yyyy';
            } else {
                format = 'ddMMMyy';
            }
        }

        return datePipe.transform(value, format);
    }
}
