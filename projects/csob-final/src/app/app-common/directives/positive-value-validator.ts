import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS } from '@angular/forms';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[positiveValueValidator][ngModel]',
    providers: [{ provide: NG_VALIDATORS, useExisting: PositiveValueValidator, multi: true }]
})
// tslint:disable-next-line: directive-class-suffix
export class PositiveValueValidator {
    // tslint:disable-next-line: no-input-rename
    @Input('positiveValueValidator') enabled = true;

    validate(control: AbstractControl): { [key: string]: any } | null {
        if (this.enabled && control.value != null && control.value != undefined) {
            const value = +control.value;
            if (value < 0) {
                return { positiveValue: true };
            }
        }
        return null;
    }
}
