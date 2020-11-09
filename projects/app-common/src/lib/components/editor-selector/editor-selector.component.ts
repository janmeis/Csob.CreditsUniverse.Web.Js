import { Component, EventEmitter, Input, OnChanges, Optional, Output, SimpleChanges } from '@angular/core';
import { ControlContainer, NgForm, NgModelGroup } from '@angular/forms';
import { TranslationService } from 'projects/services/src/public-api';
import { isPromise } from 'rxjs/internal-compatibility';
import { EditorValidate, EditorValidation } from '../../directives/editor-validator.directive';
import { uniqueId } from '../../uniqueId';

// janmeis: @angular/compiler/src/util zrejme zpusobuje chybu
// WARNING in ./node_modules/@angular/compiler/src/util.js
// 10:24-31 Critical dependency: require function is used in a way in which dependencies cannot be statically extracted

interface Item {
    text: string
    value: any
}
export type SelectFn = (value: any, text: string) => Item | PromiseLike<Item>;

@Component({
    selector:  'editor-selector',
    templateUrl: './editor-selector.component.html',
    styleUrls: ['./editor-selector.component.less'],
    viewProviders: [{
        provide: ControlContainer,
        deps: [NgForm, [new Optional(), NgModelGroup]],
        useFactory: (ngForm: NgForm, ngModelGroup: NgModelGroup): ControlContainer =>
            ngModelGroup || ngForm
    }],
})
export class EditorSelectorComponent implements OnChanges {
    //ControlContainer
    private _value: any = null;

    get value(): any {
        return this._value;
    }
    @Input() set value(x) {
        this._value = x;
        this.valueChange.emit(this.value);
    }
    private _text: string = null;
    get text(): string {
        return this._text;
    }
    @Input() set text(x) {
        this._text = x;
        this.textChange.emit(this.text);
    }
    @Input() label: string;
    @Input() noLabel = ''
    @Input() name = uniqueId('edse-');
    @Input() placeholder = '';
    @Input() readonly = false;
    @Input() editable = false;
    @Input() required = false;
    @Input() buttonTitle = this.translation.$$get('editor_selector.please_select');

    @Output() validate = new EventEmitter<EditorValidation>(false/*isasync*/);
    @Output() valueChange = new EventEmitter<any>();
    @Output() textChange = new EventEmitter<string>();
    @Input() select: SelectFn = null;

    onValidate = (c) => EditorValidate(c, this);

    constructor(
        private form: NgForm,
        private translation: TranslationService
    ) { }
    ngOnChanges(changes: SimpleChanges) {
    }
    onClick() {
        console.log('readonly', this.readonly);
        if (this.select) {
            var r = this.select(this.value, this.text);
            if (isPromise(r)) {
                r.then(x => this.loadData(x));
            } else {
                this.loadData(r as Item);
            }
        }
    }
    private loadData(r: Item) {
        if (r) {
            this.value = r.value;
            this.text = r.text;
        }
        this.form.controls[this.name].markAsDirty();
        //if promise returns nothing (void), lets assume, that it is already set
        if (r !== undefined) {
            this.valueChange.emit(this.value);
        }
    }
}
