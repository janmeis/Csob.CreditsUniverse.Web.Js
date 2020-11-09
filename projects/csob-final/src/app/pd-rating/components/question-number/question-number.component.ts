import { Component, OnInit, Input, Output, EventEmitter, Optional } from '@angular/core';
import { IPDRatingCritDto } from '../../../services/webapi/webapi-models';
import { uniqueId } from '../../../app-common/uniqueId';
import { ControlContainer, NgModelGroup, NgForm } from '@angular/forms';

@Component({
    selector: 'question-number',
    templateUrl: './question-number.component.html',
    styleUrls: ['./question-number.component.less'],
    viewProviders: [{
        provide: ControlContainer,
        deps: [NgForm, [new Optional(), NgModelGroup]],
        useFactory: (ngForm: NgForm, ngModelGroup: NgModelGroup): ControlContainer => ngModelGroup || ngForm
    }],
})
export class QuestionNumberComponent implements OnInit {
    @Input() criteria: IPDRatingCritDto;
    @Input() readonly: boolean = false;
    @Input() name = uniqueId('qnum-');
    constructor() { }
    ngOnInit() { }
}