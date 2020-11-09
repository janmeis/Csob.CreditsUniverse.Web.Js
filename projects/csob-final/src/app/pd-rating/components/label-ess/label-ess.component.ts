import { Component, Input } from '@angular/core';
import { IPDRSelectedAnswerDto } from 'projects/services/src/public-api';
import { State } from '../question-ess/question-ess.component';


@Component({
    selector: 'label-ess',
    templateUrl: './label-ess.component.html',
    styleUrls: ['./label-ess.component.less'],
})
export class LabelEssComponent {
    @Input() answer: IPDRSelectedAnswerDto = null;
    @Input() readonly = false;
    public get state(): State {
        if (this.answer && this.answer.InfluenceEss) {
            if (this.answer.InfluenceEss.PartyId)
                return 'party';
            if (this.answer.InfluenceEss.PDRatingId)
                return 'pd';
            return 'empty';
        } else if (this.readonly)
            return 'readonly';

        return 'empty';
    }
}
