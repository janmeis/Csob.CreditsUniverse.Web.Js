import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { GetEmptyCodebookProvider, GetStaticCodebookProvider, ICodebookProvider } from 'projects/app-common/src/public-api';
import { uniqueId } from 'projects/app-common/src/public-api';
import { PartySearchDialogComponent } from '../../../party/party-search-dialog/party-search-dialog.component';
import { SharedCacheService } from 'projects/services/src/public-api';
import { TranslationService } from 'projects/services/src/public-api';
import { UserNotificationService } from 'projects/services/src/public-api';
import { CodebookApiService } from 'projects/services/src/public-api';
import { ICodebookItem, IPDRatingModelDto, IPDRSelectedAnswerDto } from 'projects/services/src/public-api';
import { InfluenceEss, PDRSelectedAnswerDto } from 'projects/services/src/public-api';
import { PDRatingDetailComponent } from '../../pd-rating-detail/pd-rating-detail.component';
import { PdRatingSelectDialogComponent } from '../pd-rating-select-dialog/pd-rating-select-dialog.component';

export type State = 'empty' | 'party' | 'pd' | 'readonly';

@Component({
    selector: 'question-ess',
    templateUrl: './question-ess.component.html',
    styleUrls: ['./question-ess.component.less'],
})
export class QuestionEssComponent implements OnInit {
    @Input() name = uniqueId('qess-');
    @Input() answer: IPDRSelectedAnswerDto = null;
    @Input() readonly = false;
    @Output() valueChange = new EventEmitter<{ PartyId: number, PDRatingId: number }>();
    state: State = 'empty';
    pdRatingModels: ICodebookProvider;
    allPdRatingModels: IPDRatingModelDto[];

    constructor(
        private cache: SharedCacheService,
        private codebookApiService: CodebookApiService,
        private injector: Injector,
        private notification: UserNotificationService,
        private translation: TranslationService,
    ) { }

    ngOnInit() {
        if (this.answer && this.answer.InfluenceEss) {
            if (this.answer.InfluenceEss.PartyId)
                this.state = 'party';
            if (this.answer.InfluenceEss.PDRatingId)
                this.state = 'pd';
        } else {
            this.answer = this.answer || new PDRSelectedAnswerDto();
            this.answer.InfluenceEss = new InfluenceEss();
        }
        if (this.readonly) {
            this.state = 'readonly';
        }

        this.cache.get('pdratingmodel-codebook', () => this.codebookApiService.getPdRatingModels()).subscribe(ratingModels => {
            this.allPdRatingModels = ratingModels;
            this.pdRatingModels = (() => {
                if (!this.allPdRatingModels)
                    return GetEmptyCodebookProvider();

                let order = 0;
                const ratingCodebookItems = this.allPdRatingModels.map(ratingModel => ({ Value: ratingModel.Id, Text: ratingModel.Description, Order: ++order } as ICodebookItem));

                return GetStaticCodebookProvider(ratingCodebookItems);
            })();
        });
    }

    async onSelectPartyClick() {
        const data = await PartySearchDialogComponent.show(this.injector, 'pdrating', { pdRatingId: this.answer.InfluenceEss.PDRatingId, pdRatingOnlyCompleted: true });
        if (data && data.Id) {
            const component = this.injector.get<PDRatingDetailComponent>(PDRatingDetailComponent);
            if (component && data.Id == component.currentParty.Id) {
                this.notification.error(this.translation.$$get('question_ess.cannot_use_the_same_client'));
                return;
            }
            this.state = 'pd';
            this.answer.InfluenceEss.PartyId = data.Id;
            this.answer.InfluenceEss.PartyName = data.ClientName || data.FullName;
            this.answer.InfluenceEss.CountedPdRating = null;
            this.answer.InfluenceEss.PDRatingModelName = null;
            this.valueChanged();
        }
    }
    async onSelectPdClick() {
        const selectedPdRating = await PdRatingSelectDialogComponent.show(this.injector, { partyId: this.answer.InfluenceEss.PartyId, onlyCompleted: true });
        if (selectedPdRating && selectedPdRating.Id) {
            this.state = 'pd';
            this.answer.InfluenceEss.PDRatingId = selectedPdRating.Id;
            this.answer.InfluenceEss.CountedPdRating = selectedPdRating.Rating;
            this.answer.InfluenceEss.PDRatingModelName = selectedPdRating.PDModel;
            this.valueChanged();
        }
    }
    private valueChanged() {
        this.valueChange.emit({ PartyId: this.answer.InfluenceEss.PartyId, PDRatingId: this.answer.InfluenceEss.PDRatingId });
    }
}
