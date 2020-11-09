import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IPDRatingCritDto } from 'projects/services/src/public-api';
import { uniqueId } from 'projects/app-common/src/public-api';

@Component({
    selector: 'question-combo',
    templateUrl: './question-combo.component.html',
    styleUrls: ['./question-combo.component.less']
})

export class QuestionComboComponent {
    private _value: any = null
    get value(): any {
        return this._value;
    }
    @Input() set value(x) {
        this._value = x;
        if (this.readonly === false)
            this.valueChange.emit(this.value);
    }
    @Output() valueChange = new EventEmitter<any>()
    @Input() name = uniqueId('qlst-');
    @Input() criteria: IPDRatingCritDto;
    @Input() readonly: boolean = true;

    updateValue(v: any) {
        this.value = v;
    }
}
