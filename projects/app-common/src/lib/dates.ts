import * as dates from '@progress/kendo-date-math';
import { padStartZeros } from './numbers';

export function getToday() {
    const today = new Date();
    return dates.getDate(today);
}

export function fromDateOnlyString(s: any): Date {
    if (!s)
        return undefined;
    if (s instanceof Date)
        return s;
    return parseDateOnlyString(s);
}

export function toDateOnlyString(d: any) {
    if (!d)
        return undefined;
    if (typeof d === 'string')
        return d;
    if (d instanceof Date) {
        const s = `${d.getFullYear().toString()}-${padStartZeros(d.getMonth() + 1, 2)}-${padStartZeros(d.getDate(), 2)}`;
        return s;
    }
    return undefined;
}

function parseDateOnlyString(s: string): Date {
    if (/^\d{4}-[01]\d-[0-3]\d$/.test(s)) {
        return new Date(s + 'T00:00:00'); // local time
    }
    return undefined;
}
