import { Directive, Input } from '@angular/core';
import { FormGroup, NG_VALIDATORS } from '@angular/forms';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[formValidator]',
    providers: [{ provide: NG_VALIDATORS, useExisting: FormValidatorDirective, multi: true }]
})
export class FormValidatorDirective {
    @Input('formValidator') callback: any;

    validate(form: FormGroup): { [key: string]: any } | null {
        /*
        if (isFunction(this.callback)) {
          var result = this.callback(form);
          if (result) {
            return { formValidator: result };
          }
        }
        form.errors.
        */
        if (typeof this.callback === 'function') {
            setTimeout(() => {
                const result = this.callback(form);
                if (!result) {
                    if (form.errors) {
                        delete form.errors.formValidator;
                    }
                } else {
                    const errors = form.errors || {};
                    errors.formValidator = result;
                    form.setErrors(errors);
                }
            }, 0);
        }
        return null;
    }
}
