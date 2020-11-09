import { Component, OnInit, Input, Output, Injector, EventEmitter, Optional } from '@angular/core';
import { IPDRatingCritDto } from 'projects/services/src/public-api';
import { uniqueId } from 'projects/app-common/src/public-api';
import { ControlContainer, NgForm, NgModelGroup } from '@angular/forms';
import { TranslationService } from 'projects/services/src/public-api';

@Component({
    selector: 'question-bool',
    templateUrl: './question-bool.component.html',
    styleUrls: ['./question-bool.component.less'],
    viewProviders: [{
        provide: ControlContainer,
        deps: [NgForm, [new Optional(), NgModelGroup]],
        useFactory: (ngForm: NgForm, ngModelGroup: NgModelGroup): ControlContainer => ngModelGroup || ngForm
    }],
})

export class QuestionBoolComponent implements OnInit {
    private _value: boolean = null
    get value(): boolean {
        return this._value;
    }
    @Input() set value(x) {
        let shouldEmit = this._value != undefined && this._value != null && (x == true || x == false);
        this._value = x;

        if (!this.readonly && shouldEmit) {
            this.valueChange.emit(this.value);
        }
    }
    @Output() valueChange = new EventEmitter<boolean>()
    @Input() criteria: IPDRatingCritDto;
    @Input() readonly: boolean = false;
    @Input() name = uniqueId('qboo-');
    constructor() { }
    ngOnInit() { }

    updateValue(v: boolean) {
        this.value = v;
    }
}
