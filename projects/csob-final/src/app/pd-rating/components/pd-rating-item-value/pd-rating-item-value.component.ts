import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICodebookProvider } from '../../../app-common/components/editor-codebook/editor-codebook.component';
import { EStatePDRating, IPDRatingItemValueDto } from 'projects/services/src/public-api';

@Component({
    selector: 'app-pd-rating-item-value',
    templateUrl: './pd-rating-item-value.component.html',
    styleUrls: ['./pd-rating-item-value.component.less'],
})
export class PdRatingItemValueComponent {
    private _dataSource: IPDRatingItemValueDto;
    get dataSource(): IPDRatingItemValueDto {
        return this._dataSource;
    }
    @Input() set dataSource(x) {
        this._dataSource = x;
        this.dataSourceChanged.emit(this.dataSource);
    }
    @Output() dataSourceChanged = new EventEmitter<IPDRatingItemValueDto>();
    @Input() resultOnly = false;
    @Input() mode: 'suggested' | 'suggested_by_advisor' | 'approved';
    @Input() parentMode: 'detail' | 'new';
    @Input() readonly = false;
    @Input() state: EStatePDRating;
    @Input() label: string;
    @Input() validationValue: number;
    @Input() required = false;
    @Input() ratingcode: string | ICodebookProvider = 'ratingcode';
    @Input() ratingReadonly = false;
    @Input() isCommentRequired = false;
    EStatePDRating = EStatePDRating;

    ratingSelectionChange($event) {
        if (this.ratingcode) {
            this._dataSource.Comment =
                this._dataSource.OverrulingReasonKey =
                this._dataSource.ApprovalDate =
                this._dataSource.ApprovalLevel = null;
        }
    }
}
