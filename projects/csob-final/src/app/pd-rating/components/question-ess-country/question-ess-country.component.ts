import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IPDRatingCritDto } from 'projects/services/src/public-api';
import { uniqueId } from '../../../app-common/uniqueId';

@Component({
    selector: 'question-ess-country',
    templateUrl: './question-ess-country.component.html',
    styleUrls: ['./question-ess-country.component.less']
})

export class QuestionEssCountryComponent {
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
    @Input() name = uniqueId('qess-country-');
    @Input() criteria: IPDRatingCritDto;
    @Input() readonly: boolean = true;

    updateValue(v: any) {
        this.value = v;
    }
}
