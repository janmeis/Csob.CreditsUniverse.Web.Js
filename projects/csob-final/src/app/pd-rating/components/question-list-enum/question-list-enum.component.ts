import { Component, OnInit, Input, Output, EventEmitter, Optional } from '@angular/core';
import { IPDRatingCritDto } from 'projects/services/src/public-api';
import { uniqueId } from 'projects/app-common/src/public-api';

@Component({
    selector: 'question-list-enum',
    templateUrl: './question-list-enum.component.html',
    styleUrls: ['./question-list-enum.component.less']
})

export class QuestionListEnumComponent implements OnInit {
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

    constructor() { }
    ngOnInit() { }

    updateValue(v: any) {
        this.value = v;
    }
}
