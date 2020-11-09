import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CodebookItem } from 'projects/services/src/public-api';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'dropdown-colors',
    templateUrl: './dropdown-colors.component.html',
    styleUrls: ['./dropdown-colors.component.less'],
})
export class DropdownColorsComponent {
    private _value: number;
    get value(): number {
        return this._value;
    }
    @Input() set value(x) {
        this._value = x;
        this.valueChange.emit(this.value);
    }
    @Input() label = '';
    @Input() readonly = false;
    @Input() source: CodebookItem[] = [];
    @Output() valueChange = new EventEmitter<number>();

    get selectedValue() {
        return this.source.find(s => s.Value == this.value).Text;
    }
}
