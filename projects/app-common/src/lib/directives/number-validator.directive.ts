import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS } from '@angular/forms';
import { tryParseNumber } from '../numbers';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[numberValidator][ngModel]',
    providers: [{ provide: NG_VALIDATORS, useExisting: NumberValidator, multi: true }]
})
// tslint:disable-next-line: directive-class-suffix
export class NumberValidator {
    // tslint:disable-next-line: no-input-rename
    @Input('numberValidator') enabled = true;
    @Input() numdecplaces = 28;
    @Input() numfracplaces = 8;

    validate(control: AbstractControl): { [key: string]: any } | null {
        if (this.enabled && control.value != null && control.value != undefined && control.value.length > 0) {
            if (typeof control.value !== 'number') {
                const num = tryParseNumber(control.value);
                if (num == undefined) {
                    return { number: true };
                }
                const r = { numberInt: null, numberFrac: null };
                if (this.numdecplaces) {
                    // const dec = getDecimalPlaces(num);
                    const dec = this.getDecimalPlaces(control.value);
                    if (dec > this.numdecplaces)
                        r.numberInt = this.numdecplaces;
                }
                if (this.numfracplaces) {
                    // const frac = getPrecision(num);
                    const frac = this.getPrecision(control.value);
                    if (frac > this.numfracplaces || (this.numfracplaces == 0 && /[\.,]/.test(control.value)))
                        r.numberFrac = this.numfracplaces;
                }
                if (r.numberInt || r.numberFrac)
                    return { numberDec: r };
            }
        }
        return null;
    }
    getDecimalPlaces(value: string): number {
        const numRegex = /^[+-]?0*(\d*)(?:[\.,]\d*)?$/;
        return this.getNumPlaces(value, numRegex);
    }
    getPrecision(value: string): number {
        const numRegex = /^[+-]?\d*(?:[\.,](\d*[1-9])0*)?$/;
        return this.getNumPlaces(value, numRegex);
    }
    getNumPlaces(value: string, numRegex: RegExp): number {
        const found = value.match(numRegex);

        if (found && found.length > 1 && found[1] != undefined)
            return found[1].length;

        return 0;
    }
}
