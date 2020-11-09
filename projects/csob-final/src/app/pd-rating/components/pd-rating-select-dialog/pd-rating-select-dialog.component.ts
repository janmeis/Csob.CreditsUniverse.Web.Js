import { AppDialogContainerService } from '../../../app-common/services/app-dialog-container.service';
import { Component, Injector, Input } from '@angular/core';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { Subscription } from 'rxjs';

import { SelectDialogBase } from '../../../app-common/components/SelectDialogBase';
import { setGridToCriteria } from '../../../app-common/models/GridBaseDto';
import { TranslationService } from '../../../services/translation-service';
import { IPDRatingOverviewReqDto, IPDRatingOverviewResDto } from '../../../services/webapi/webapi-models';
import { PdRatingSelectDialogService } from './pd-rating-select-dialog.service';
import { PartyApiService } from 'src/app/services/webapi/party-api-service';

@Component({
    selector: 'pd-rating-select-dialog',
    templateUrl: './pd-rating-select-dialog.component.html',
    styleUrls: ['./pd-rating-select-dialog.component.less'],
})
export class PdRatingSelectDialogComponent extends SelectDialogBase<IPDRatingOverviewResDto> {
    @Input() title: string;
    @Input() partyId: number;
    @Input() onlyCompleted: boolean;
    @Input() isCopy = false;
    @Input() currentPdRatingId: number;
    partySubscription: Subscription;
    view: PdRatingSelectDialogService;
    private criteria: IPDRatingOverviewReqDto;
    isForRaroc: boolean = false;
    pdModelId: number;

    constructor(
        private partyApi: PartyApiService,
        private pdRatingSelectDialogService: PdRatingSelectDialogService,
        private translation: TranslationService,
    ) {
        super();
        this.view = this.pdRatingSelectDialogService;
    }
    getTitle() {
        return this.title || this.translation.$$get('pd_rating_select_dialog.page_title');
    }
    ngOnInit() {
        this.partySubscription = this.partyApi.getPartyHeader(this.partyId)
            .subscribe(data => {
                this.criteria = {
                    OnlyCompleted: this.onlyCompleted,
                    CreditFileId: data.CreditFileId
                } as IPDRatingOverviewReqDto;

                if (this.isCopy && data.PDModelId && +data.PDModelId > 0)
                    this.criteria.PDRatingModelId = data.PDModelId

                this.criteria.PDRatingToHideId = this.currentPdRatingId;
                this.criteria.ForRaroc = this.isForRaroc;
                if (this.isForRaroc) {
                    this.criteria.PDRatingModelId = this.pdModelId;
                }

                setGridToCriteria(this.grid, this.criteria);

                this.pdRatingSelectDialogService.query(this.criteria);
            });
    }
    ngOnDestroy() {
        if (this.partySubscription)
            this.partySubscription.unsubscribe();
    }
    onGridUpdate(state: DataStateChangeEvent) {
        this.selected = null;
        this.grid = state;
        setGridToCriteria(this.grid, this.criteria);

        this.pdRatingSelectDialogService.query(this.criteria);
    }
    onSearch() {
        throw new Error("Method not implemented.");
    }
    onClose() {
        this.close(null);
    }
    public static show(injector: Injector, opts: {
        title?: string,
        partyId?: number,
        onlyCompleted?: boolean,
        isCopy?: boolean,
        currentPdRatingId?: number,
        isForRaroc?: boolean,
        pdModelId?: number
    } = {}): Promise<IPDRatingOverviewResDto> {
        var dialogSvc = injector.get(AppDialogContainerService);
        var dlg = dialogSvc.createDialog(injector, PdRatingSelectDialogComponent,
            { width: 1600 },
            { title: opts.title, partyId: opts.partyId, onlyCompleted: opts.onlyCompleted, isCopy: opts.isCopy, currentPdRatingId: opts.currentPdRatingId, isForRaroc: opts.isForRaroc, pdModelId: opts.pdModelId });
        return dialogSvc.wait(dlg.closed);
    }
}
