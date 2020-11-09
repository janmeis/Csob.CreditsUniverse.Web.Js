import { Directive, EventEmitter, Input } from '@angular/core';
import { AbstractControl, FormControl, NG_VALIDATORS, Validator } from '@angular/forms';

//do not use this validator, it is used internally by editor-xxx
@Directive({
    selector: '[editorValidator][ngModel]',
    providers: [{ provide: NG_VALIDATORS, useExisting: EditorValidatorDirective, multi: true }]
})
export class EditorValidatorDirective implements Validator {
    @Input("editorValidator")
    callback: any
    constructor() { }

    validate(control: AbstractControl): ngErrors | null {
        return this.callback(control);
    }
}
type ngErrors = { [key: string]: any };
type EditorValidationResult = ngErrors | null;
export interface IValidableEditor {
    label: string
    required?: boolean
    validate: EventEmitter<EditorValidation>
}
export interface EditorValidation {
    control: FormControl
    value: any
    errors: string[]
}

export function EditorValidate(c: FormControl, editor: IValidableEditor): EditorValidationResult {
    var args: EditorValidation = {
        value: c.value,
        control: c,
        errors: []
    };
    editor.validate.emit(args);
    var result = {};
    if (args.errors.length > 0)
        result['editorValidator'] = args.errors.map(x => x.replace('[label]', editor.label));
    if (editor.required) {
        if (isEmptyStr(args.value)) {
            result['required'] = true;
        }
    }
    return result;
}

function isEmptyStr(v: any) {
    if (typeof v === 'string' && v.trim() == '')
        return true;
    if (v == null || v == undefined)
        return true;
    return false;
}
