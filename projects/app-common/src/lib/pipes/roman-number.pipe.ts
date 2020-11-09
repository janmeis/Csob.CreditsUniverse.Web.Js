import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'romanNumber'
})
export class RomanNumberPipe implements PipeTransform {
    transform(value: any): any {
        if (!value || !+value || +value < 1 || +value > 4)
            return value;

        return +value <= 3
            ? 'I'.repeat(+value)
            : 'IV';
    }
}