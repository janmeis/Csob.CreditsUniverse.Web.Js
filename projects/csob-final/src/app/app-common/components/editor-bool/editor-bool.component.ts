import { Component, EventEmitter, Injector, Input, Optional, Output, ViewContainerRef } from '@angular/core';
import { ControlContainer, NgForm, NgModelGroup } from '@angular/forms';
import { TranslationService } from '../../../services/translation-service';
import { uniqueId } from '../../uniqueId';


@Component({
    // tslint:disable-next-line: component-selector
    selector:  'editor-bool',
    templateUrl: './editor-bool.component.html',
    styleUrls: ['./editor-bool.component.less'],
    viewProviders: [{
        provide: ControlContainer,
        deps: [NgForm, [new Optional(), NgModelGroup]],
        useFactory: (ngForm: NgForm, ngModelGroup: NgModelGroup): ControlContainer =>
            ngModelGroup || ngForm
    }],
})
export class EditorBoolComponent {
    private _value: boolean = false

    get value(): boolean {
        return this._value;
    }
    @Input() set value(x) {
        this._value = x;
        this.valueChange.emit(this.value);
    }
    @Output() valueChange = new EventEmitter<boolean>()
    @Input() name: string = uniqueId('edbool-');
    @Input() label: string;
    @Input() labelOn: string = this.translation.$$get('editor_bool.yes');
    @Input() labelOff: string = this.translation.$$get('editor_bool.no');
    @Input() readonly = false;
    constructor(
        private translation: TranslationService,
        private viewContainer: ViewContainerRef) {
    }
}
