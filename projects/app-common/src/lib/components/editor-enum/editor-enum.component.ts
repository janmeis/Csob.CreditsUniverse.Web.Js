import { Component, EventEmitter, Input, OnChanges, Optional, Output, SimpleChanges, ViewContainerRef } from '@angular/core';
import { ControlContainer, NgForm, NgModelGroup } from '@angular/forms';
import { CodebooksService } from 'projects/services/src/public-api';
import { EditorValidate, EditorValidation } from '../../directives/editor-validator.directive';
import { uniqueId } from '../../uniqueId';

export interface EnumValue {
    value: any;
    text: string;
}
@Component({
    // tslint:disable-next-line: component-selector
    selector:  'editor-enum',
    templateUrl: './editor-enum.component.html',
    styleUrls: ['./editor-enum.component.less'],
    viewProviders: [{
        provide: ControlContainer,
        deps: [NgForm, [new Optional(), NgModelGroup]],
        useFactory: (ngForm: NgForm, ngModelGroup: NgModelGroup): ControlContainer => ngModelGroup || ngForm
    }],
})
export class EditorEnumComponent implements OnChanges {
    private _value: any = null;

    get value(): any {
        return this._value;
    }
    @Input() set value(x) {
        //console.log('setting value', x, this.value);
        this._value = x;
        this.valueChange.emit(this.value);
    }
    @Output() valueChange = new EventEmitter<any>()
    @Input() readonly = false;
    @Input() required = false;
    @Input() name = uniqueId('eden-');
    @Input() label: string;
    @Input() noLabel = '';
    @Input() enumValues: string | EnumValue[] | { [key: string]: string }
    @Input() hiddenEnumValues: EnumValue[];
    @Input() allowedEnumValues: EnumValue[];
    @Input() layout: 'combo' | 'radio' = 'combo';
    @Output() validate = new EventEmitter<EditorValidation>(false/*isasync*/);

    onValidate = (c) => EditorValidate(c, this);

    constructor(
        private codebooksService: CodebooksService,
        private viewContainer: ViewContainerRef) {
    }

    getFilteredEnumValues(): string | EnumValue[] | { [key: string]: string } {
        if (!this.hiddenEnumValues && !this.allowedEnumValues) { // žádná filtrace hodnot, vracím tak, jak jsou
            return this.enumValues;
        }
        if (this.enumValues instanceof String) {
            // todo vah implementovat
        } else {
            if (this.hiddenEnumValues)
                return (this.enumValues as EnumValue[]).filter(item => !this.hiddenEnumValues.includes(item.value));
            else // povolene
                return (this.enumValues as EnumValue[]).filter(item => this.allowedEnumValues.includes(item.value));
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.enumValues) {
            if (Array.isArray(this.enumValues)) {
                //ok, use array
            } else if (typeof this.enumValues === 'string') {
                //use name of enum/codebook
                let codeBookName = this.enumValues as string;
                this.enumValues = [];
                //console.log('loading enumvalues ' + codeBookName, this.value);
                this.codebooksService.GetCodebook(codeBookName)
                    .toPromise()
                    .then(data => {
                        //console.log('loaded enumvalues ' + codeBookName, this.value,data);
                        this.enumValues = data.map(x => ({ value: x.Value, text: x.Text }));
                    });
            } else {
                //it is not array, so convert typescript enum to array
                let keys = [];
                for (var enumMember in <any>this.enumValues) {
                    var isValueProperty = parseInt(enumMember, 10) >= 0
                    if (isValueProperty) {
                        keys.push({ value: enumMember, text: this.enumValues[enumMember] });
                    }
                }
                this.enumValues = keys;
            }
        }
    }
    updateValue(v: any) {
        //console.log("updating value", v, this.value);
        this.value = v;
    }
    getText(value: any): string {
        const found = (this.enumValues as EnumValue[]).find(v => v.value == value);
        return found && found.text;
    }
}
