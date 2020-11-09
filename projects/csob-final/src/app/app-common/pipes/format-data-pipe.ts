import { Pipe, PipeTransform } from '@angular/core';

export function formatRC(s: string) {
    if (!s || typeof s !== 'string' || s.length < 9) {
        return s;
    }
    return s.substr(0, 6) + '/' + s.substr(6);
}

@Pipe({
    name: 'formatdata'
})
export class FormatDataPipe implements PipeTransform {
    constructor() { }

    transform(value: string, format: string) {
        if (value != null && value.length > 0
            && format == 'rc' && !value.includes(".")) {
            return formatRC(value);
        }
        return value;
    }
}
