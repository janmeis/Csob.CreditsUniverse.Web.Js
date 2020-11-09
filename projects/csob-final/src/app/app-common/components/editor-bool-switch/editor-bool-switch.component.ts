import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { uniqueId } from '../../../app-common/uniqueId';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'editor-bool-switch',
    templateUrl: './editor-bool-switch.component.html',
    styleUrls: ['./editor-bool-switch.component.less']
})
export class EditorBoolSwitchComponent implements  OnChanges {
    private _value = false;
    get value(): boolean {
        return this._value;
    }
    @Input() set value(x) {
        this._value = x;
        this.valueChange.emit(this.value);
    }
    @Output() valueChange = new EventEmitter<boolean>()
    @Output() switchClicked = new EventEmitter<boolean>()
    @Input() name: string = uniqueId('edbool-');
    @Input() labelOn = ' ';
    @Input() labelOff = ' ';
    @Input() title = '';
    @Input() readonly = false;
    hasTitle = false;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['title'])
            this.hasTitle = !!this.title && this.title.length > 0;
    }

    clickHandler(value: boolean) {
        this.value = value;
        this.switchClicked.emit(this.value);
    }
}
