import { Location } from '@angular/common';
import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CellClickEvent, DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { SortDescriptor, State } from '@progress/kendo-data-query';
import { SecurityService } from 'src/app/services/security.service';
import { setCriteriaToGrid, setGridToCriteria } from '../../app-common/models/GridBaseDto';
import { SelectedPartyService } from '../../services/selected-party.service';
import { TranslationService } from '../../services/translation-service';
import { UrlHelperService } from '../../services/url-helper.service';
import { UserNotificationService } from '../../services/user-notification.service';
import { UserProgressService } from '../../services/user-progress.service';
import { PartyApiService } from '../../services/webapi/party-api-service';
import { IPartyDetailDto, ISearchClientReqDto, ISearchClientResDto } from '../../services/webapi/webapi-models';
import { SearchClientReqDto } from '../../services/webapi/webapi-models-classes';
import { normalizeIdentificationNumber } from '../party-search-criteria/identification-number-normalization';
import { PartySearchCriteriaComponent } from '../party-search-criteria/party-search-criteria.component';
import { ENotificationType, NotificationMessageOptions } from './../../services/user-notification.service';

@Component({
    selector: 'app-party-search',
    templateUrl: './party-search.component.html',
    styleUrls: ['./party-search.component.less'],
})
export class PartySearchComponent implements OnInit, AfterViewInit {
    @ViewChild('form') private form: NgForm;
    @ViewChild('partySearchCriteriaComponent') private partySearchCriteriaComponent: PartySearchCriteriaComponent;

    hasRightToAddClient = false;
    criteria = {} as ISearchClientReqDto;
    data: GridDataResult;
    searched = false;
    selection: number[] = [];
    get isAnyCriteria(): boolean {
        return this.partySearchCriteriaComponent && this.partySearchCriteriaComponent.isAnyCriteria;
    }
    get isAnythingEntered(): boolean {
        return this.partySearchCriteriaComponent
            && (this.partySearchCriteriaComponent.isFo || this.partySearchCriteriaComponent.isPo);
    }
    private _grid: State;
    get grid(): State {
        return this._grid;
    }
    set grid(value: State) {
        this._grid = value;
    }
    private readonly _grid_default = { skip: 0, take: 10 } as State;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private urlHelper: UrlHelperService,
        private partyApiService: PartyApiService,
        public progress: UserProgressService,
        private notifications: UserNotificationService,
        private selectedParty: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        protected securityService: SecurityService
    ) { }

    ngOnInit() {
        this.selectedParty.clear();
        this.grid = this._grid_default;
        this.title.setTitle(this.translation.$$get('party_search.search_party'));
        this.criteria = this.urlHelper.loadFromUrl(new SearchClientReqDto(), this.route.snapshot.queryParamMap);
        this.securityService.getOrLoadCurrentUser().then(user => {
            this.hasRightToAddClient = user.HasRightToAddParty;
        });
    }
    ngAfterViewInit(): void {
        if (this.isAnyCriteria) {
            setCriteriaToGrid(this.criteria, this.grid);
            this.update();
        }
    }
    onClear() {
        this.form.reset();
        this.criteria = {} as ISearchClientReqDto;
        this.searched = false;
        delete this.grid.sort;
        this.urlHelper.saveToUrl({}, this.location);
    }
    onSearch() {
        if (this.form.invalid || !this.isAnyCriteria) {
            this.notifications.show(
                {
                    type: ENotificationType.Error,
                    message: this.translation.$$get('party_search.invalid_search_criteria'),
                    delay: 5000
                } as NotificationMessageOptions);
            return;
        }

        if (!this.searched)
            this.grid = this.setInitialSort(this.criteria, this._grid_default);

        this.grid.skip = 0;
        this.update();
    }
    onGridDataStateChange(state: DataStateChangeEvent) {
        this.grid = state;
        this.update();
    }
    async onGridCellClicked(event: CellClickEvent) {
        const searchClient = event.dataItem as ISearchClientResDto;
        let partyDetail = { Id: searchClient.Id } as IPartyDetailDto;
        if (!searchClient.Id || searchClient.Id == 0)
            partyDetail = await this.progress.runAsync(
                this.partyApiService.getDetail(searchClient.Id, { cuid: searchClient.Cuid }));

        await this.router.navigate(['detail', partyDetail.Id], {
            relativeTo: this.route.parent
        });
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        this.showTooltipInternal(e, kendoTooltipInstance);


    private showTooltipInternal(e: MouseEvent, kendoTooltipInstance: TooltipDirective, htmlElements: string[] = ['TD', 'TH', 'A']): void {
        const element = e.target as HTMLElement;
        if (htmlElements.some(e => e == element.nodeName) && element.innerText) {
            kendoTooltipInstance.toggle(element);
        } else
            kendoTooltipInstance.hide();
    }

    private update() {
        // doplnění 0 před neúplné IČO, protože v PartySearchCriteria se nedoplní při stisku enter (nedojde k události blur)
        this.criteria.IdentificationNumber = normalizeIdentificationNumber(this.criteria.IdentificationNumber);

        setGridToCriteria(this.grid, this.criteria);
        this.urlHelper.saveToUrl(this.criteria, this.location);
        this.notifications.clear();
        this.progress.runAsync(this.partyApiService.postSearch(this.criteria))
            .then(data => {
                this.data = data;
                this.searched = true;
                setCriteriaToGrid(this.criteria, this.grid);
            });
    }
    private setInitialSort(criteria: ISearchClientReqDto, grid: State): State {
        const getSortField = (c: ISearchClientReqDto) => c.ClientName && c.ClientName.length > 0 ? 'ClientName' : 'FullName';

        if (!grid.sort || grid.sort.length === 0 || !grid.sort[0].field) {
            const sort: SortDescriptor = { field: getSortField(criteria), dir: 'asc' };
            grid.sort = [sort];
        }

        return grid;
    }
}
