import { AfterViewInit, Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataStateChangeEvent, SelectionEvent } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { SortDescriptor, State } from '@progress/kendo-data-query';
import { AppDialogContainerService } from 'projects/app-common/src/public-api';
import { ENotificationType, IPartyHeaderDto, IPDRatingOverviewReqDto, ISearchClientReqDto, ISearchClientResDto, NotificationMessageOptions, PartyApiService, PdRatingApiService, TranslationService, UserNotificationService } from 'projects/services/src/public-api';
import { first, flatMap, map, tap } from 'rxjs/operators';
import { SelectDialogBase } from '../../app-common/components/SelectDialogBase';
import { setGridToCriteria } from '../../app-common/models/GridBaseDto';
import { PartySearchCriteriaComponent } from './../party-search-criteria/party-search-criteria.component';
import { PartySearchDialogService } from './party-search-dialog.service';

type DialogMode = 'pdrating' | 'partylink';

@Component({
    selector: 'party-search-dialog',
    templateUrl: './party-search-dialog.component.html',
    styleUrls: ['./party-search-dialog.component.less'],
})
export class PartySearchDialogComponent extends SelectDialogBase<ISearchClientResDto> implements OnInit, AfterViewInit {
    @ViewChild('form') private form: NgForm;
    @ViewChild('partySearchCriteriaComponent') private partySearchCriteriaComponent: PartySearchCriteriaComponent;

    @Input() title: string = this.translation.$$get('party_search_dialog.search_clients');
    @Input() mode: DialogMode
    //pdrating
    pdRatingId: number;
    pdRatingOnlyCompleted = false;
    //partylink
    currentId: number; //do not show this id

    criteria = {} as ISearchClientReqDto;
    searched = false;

    view$: PartySearchDialogService;
    get isAnyCriteria(): boolean {
        return this.partySearchCriteriaComponent && this.partySearchCriteriaComponent.isAnyCriteria;
    }

    private readonly pdRatingDoesntExistMessage = this.translation.$$get('party_search_dialog.pd_rating_doesnt_exist');

    constructor(
        private notifications: UserNotificationService,
        private partyApiService: PartyApiService,
        private partySearchDialogService: PartySearchDialogService,
        private pdRatingApi: PdRatingApiService,
        private translation: TranslationService,
    ) {
        super();
        this.view$ = this.partySearchDialogService;
    }
    ngOnInit() {
        this.selected = null;
    }
    ngAfterViewInit() {
        this.form.valueChanges.subscribe(() => {
            if (this.searched)
                this.searched = false;
        });
    }
    onClear() {
        this.form.reset();
        delete this.grid.sort;
        this.searched = false;
    }
    onSearch() {
        this.selected = null;
        this.setInitialSort(this.criteria, this.grid);
        setGridToCriteria(this.grid, this.criteria)
        this.searched = true;

        this.partySearchDialogService.query(this.criteria);
    }
    onGridUpdate(state: DataStateChangeEvent) {
        this.selected = null;
        this.grid = this.patchSortDir(state);
        setGridToCriteria(this.grid, this.criteria);

        this.partySearchDialogService.query(this.criteria)
    }
    onGridSelectionChange(selection: SelectionEvent) {
        super.onGridSelectionChange(selection);
    }
    onSelect() {
        if (this.mode == 'partylink') {
            this.onSelectPartyLink();
        } else if (this.mode == 'pdrating') {
            this.onSelectPdRating();
        } else {
            throw "Unsupported select mode:" + this.mode;
        }
    }
    private onSelectPartyLink() {
        if (this.selected.Id == this.currentId) {
            this.showError(this.translation.$$get('party_search_dialog.cannot_select_same_party'));
            return;
        }
        super.onSelect();
    }
    private onSelectPdRating() {
        if (this.selected.Id === 0) {
            this.showError(this.pdRatingDoesntExistMessage);
            return;
        }
        this.partyApiService.getPartyHeader(this.selected.Id)
            .pipe(
                //tap((partyHeader: IPartyHeaderDto) => this.selected.PDRatingModelId = partyHeader.PDModelId),
                map((partyHeader: IPartyHeaderDto) => ({
                    OnlyCompleted: this.pdRatingOnlyCompleted,
                    CreditFileId: partyHeader.CreditFileId
                } as IPDRatingOverviewReqDto)),
                flatMap(pdOverview => this.pdRatingApi.postPdRatingOverview(pdOverview)),
                tap(result => {
                    if (result.total > 0)
                        this.close(this.selected);
                    else
                        this.showError(this.pdRatingDoesntExistMessage);
                }),
                first()
            ).subscribe();
    }
    onClose() {
        this.close(null);
    }
    private setInitialSort(criteria: ISearchClientReqDto, grid: State): State {
        const getSortField = (c: ISearchClientReqDto) => c.ClientName && c.ClientName.length > 0 ? 'ClientName' : 'FullName';

        if (!grid.sort || grid.sort.length === 0 || !grid.sort[0].field) {
            const sort: SortDescriptor = { field: getSortField(criteria), dir: 'asc' };
            grid.sort = [sort];
        }

        return grid;
    }
    private patchSortDir(state: DataStateChangeEvent): State {
        let grid: State = state;
        if (grid.sort && grid.sort.length > 0 && !grid.sort[0].dir)
            grid.sort[0].dir = 'asc';

        return grid;
    }
    private showError(errMsg: string) {
        this.notifications.show(
            {
                type: ENotificationType.Error,
                message: errMsg,
                delay: 5000
            } as NotificationMessageOptions);
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        this.showTooltipInternal(e, kendoTooltipInstance);


    showTooltipInternal(e: MouseEvent, kendoTooltipInstance: TooltipDirective, htmlElements: string[] = ['TD', 'TH', 'A']): void {
            const element = e.target as HTMLElement;
            if (htmlElements.some(e => e == element.nodeName) && element.innerText) {
                kendoTooltipInstance.toggle(element);
            } else
                kendoTooltipInstance.hide();
    }



    public static show(injector: Injector, mode: DialogMode, opts: {
        currentId?: number,
        title?: string,
        pdRatingId?: number,
        pdRatingOnlyCompleted?: boolean
    } = {}): Promise<ISearchClientResDto> {
        var dialogSvc = injector.get(AppDialogContainerService);
        var dlg = dialogSvc.createDialog(injector, PartySearchDialogComponent,
            { css: 'dialog-with-table', width: 960 },
            { mode, title: opts.title, currentId: opts.currentId, pdRatingId: opts.pdRatingId, onlyCompleted: opts.pdRatingOnlyCompleted });
        return dialogSvc.wait(dlg.closed);
    }
}
