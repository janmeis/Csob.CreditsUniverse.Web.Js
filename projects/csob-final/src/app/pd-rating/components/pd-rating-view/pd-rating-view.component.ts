import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgForm } from '@angular/forms';
import { of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { GetStaticCodebookProvider, ICodebookProvider } from '../../../app-common/components/editor-codebook/editor-codebook.component';
import { EnumValue } from '../../../app-common/components/editor-enum/editor-enum.component';
import { CodebooksService } from '../../../services/codebooks.service';
import { SecurityService } from '../../../services/security.service';
import { UserProgressService } from '../../../services/user-progress.service';
import { CodebookApiService } from '../../../services/webapi/codebook-api-service';
import { EPDRatingCategory, EStatePDRating, ICodebookItem, IExternalCodebookItem, IPDRatingResultTabDto, IRatingCodebookItem } from '../../../services/webapi/webapi-models';
import { PDRatingItemValueDto } from '../../../services/webapi/webapi-models-classes';


@Component({
    selector: 'app-pd-rating-view',
    templateUrl: './pd-rating-view.component.html',
    styleUrls: ['./pd-rating-view.component.less'],
})
export class PdRatingViewComponent implements OnInit, OnChanges {
    private _dataSource: IPDRatingResultTabDto;
    get dataSource(): IPDRatingResultTabDto {
        return this._dataSource;
    }
    @Input() set dataSource(x) {
        this._dataSource = x;
        this.dataSourceChanged.emit(this._dataSource);

        // console.log("this.datasource ", x);
    }
    @Output() dataSourceChanged = new EventEmitter<IPDRatingResultTabDto>();
    @Input() form: NgForm;
    @Input() resultOnly: boolean;
    @Input() mode: 'detail' | 'new';
    @Input() readonly = false;
    @Input() state: EStatePDRating;
    @Input() finDataNeeded = false;
    @Input() pdRatingCategory: EPDRatingCategory;
    @Input() pdRatingCategoryEnumValues: EnumValue[];
    @Output() ratingChanged = new EventEmitter<boolean>();
    externalCodebookItems: IExternalCodebookItem[] = [];
    externalRatingsProvider: ICodebookProvider;
    ratingCodebookItems: IRatingCodebookItem[] = [];
    isExternal = false;
    ratingCodeProvider: ICodebookProvider;
    ratingReadonly = false;
    EStatePDRating: typeof EStatePDRating = EStatePDRating;
    lastCountedPdRating: number;
    EPDRatingCategory = EPDRatingCategory;

    constructor(
        private codebooksApi: CodebookApiService,
        private codebooksService: CodebooksService,
        public progress: UserProgressService,
        protected securityService: SecurityService
    ) {
    }
    ngOnInit(): void {
        this.progress.runProgress(
            this.codebooksApi.getRatings().pipe(
                tap(items => this.ratingCodebookItems = items),
                mergeMap(() => {
                    if (this.dataSource.PDRatingModelId)
                        return this.codebooksApi.getExternalRating(this.dataSource.PDRatingModelId);

                    return of([] as IExternalCodebookItem[]);
                }),
                tap(items => this.externalCodebookItems = items),
                tap(items => this.externalRatingsProvider = GetStaticCodebookProvider(items
                    .map(i => ({ Value: i.Value, Text: i.Text } as ICodebookItem)))),
                mergeMap(() => this.codebooksService.GetCodebook('ratingcode')),
                map((items: ICodebookItem[]) => this.restrictOverruling(items)),
                tap((items: ICodebookItem[]) => this.ratingCodeProvider = GetStaticCodebookProvider(items)),
                tap(() => this.ratingReadonly = this.dataSource.SuggestedSystemOverrFlg == 4 && this.state == EStatePDRating.InProcess && !this.resultOnly),
                tap(() => this.isExternal = this.externalCodebookItems && this.externalCodebookItems.length > 0),
                tap(() => this.lastCountedPdRating = this.dataSource.CountedPdRatingId)
            )).subscribe(() => {
                this.initializePercentageRatings();
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['dataSource'] && !!this.dataSource)
            this.initializePDRating();
    }

    initializePercentageRatings() {
        if (this.isExternal) {
            if (!this.dataSource.PercentageRating) {
                const found = this.externalCodebookItems.find(d => d.Value == this.dataSource.ExternalRatingId);
                this.dataSource.PercentageRating = found ? found.PercentageRating : null;
            }
        } else if (!this.dataSource.PercentageRating)
            this.dataSource.PercentageRating = this.getInternalPercentageRating(this.dataSource.CountedPdRatingId);
        this.setSuggestedPdRating();
    }

    initializePDRating() {
        if (this.dataSource.SuggestedPDRating == null)
            this.dataSource.SuggestedPDRating = new PDRatingItemValueDto();

        if (this.dataSource.SuggestedAdvisorPDRating == null)
            this.dataSource.SuggestedAdvisorPDRating = new PDRatingItemValueDto();

        if (this.dataSource.ApprovedPDRatings == null || this.dataSource.ApprovedPDRatings.length == 0)
            this.dataSource.ApprovedPDRatings = [new PDRatingItemValueDto()];
    }

    countedPdRatingChanged(value: number) {
        if (!value || this.form.form.pristine)
            return;

        this.dataSource.SuggestedPDRating.OverrulingReasonKey
            = this.dataSource.SuggestedPDRating.Comment = null;
        this.dataSource.ValidationPDRating
            = this.dataSource.SuggestedPDRating.RatingId = value;

        // pouze pro interni
        if (!this.isExternal) {
            const lastFailureRate = this.getInternalPercentageRating(this.lastCountedPdRating);
            if (!this.dataSource.PercentageRating || this.dataSource.PercentageRating == lastFailureRate)
                this.dataSource.PercentageRating = this.getInternalPercentageRating(value);

            this.lastCountedPdRating = value;
        }
    }

    ratingValueChanged(value: number) {
        if (!value || this.form.form.pristine)
            return;

        const item = this.externalCodebookItems.find(i => i.Value == value);
        if (!(value && item))
            return;

        this.dataSource.CountedPdRatingId
            = this.dataSource.SuggestedPDRating.RatingId = item.RatingId;
        this.dataSource.SuggestedPDRating.OverrulingReasonKey
            = this.dataSource.SuggestedPDRating.Comment = null;
        this.dataSource.PercentageRating = item.PercentageRating;
        this.ratingChanged.emit(true);
    }
    getExternalRatingValue(externalRatingId: number): string {
        const item = this.externalCodebookItems.find(i => i.Value == externalRatingId);
        return item ? item.Text : '';
    }

    getFailureRate(CountedPdRatingId: number): number {
        const item = this.ratingCodebookItems.find(i => i.Value == CountedPdRatingId);
        return item ? item.FailureRate : null;
    }

    setSuggestedPdRating() {
        if (this.mode == 'new') {
            this.dataSource.SuggestedPDRating.RatingId = this.dataSource.ValidationPDRating;
        } else { // editace:
            if (!this.dataSource.SuggestedPDRating.RatingId) {
                this.dataSource.SuggestedPDRating.RatingId = this.dataSource.ValidationPDRating;
            }
        }
    }

    private getInternalPercentageRating(pdRatingId?: number) {
        const found = this.ratingCodebookItems.find(d => d.Value == pdRatingId);
        return found ? found.FailureRate : null;
    }

    private restrictOverruling(items: ICodebookItem[]): ICodebookItem[] {
        if (this.resultOnly || this.state != EStatePDRating.InProcess)
            return items;

        const index = items.findIndex(i => this.dataSource.MandatoryRatingId == i.Value)
        if (index < 0)
            return items;

        switch (this.dataSource.SuggestedSystemOverrFlg) {
            case 2:
                return items.slice(index);
            case 3:
                this.dataSource.SuggestedPDRating.RatingId = (index > 0 ? items[index - 1] : items[0]).Value;
                return items.slice(0, index);
            case 4:
                this.dataSource.SuggestedPDRating.RatingId = this.dataSource.MandatoryRatingId;
                return items;
            default:
                return items;
        }
    }

    isPDCategoryStandard() {
        return this.dataSource.PDRatingCategoryEnum == EPDRatingCategory.Standard;
    }
}

