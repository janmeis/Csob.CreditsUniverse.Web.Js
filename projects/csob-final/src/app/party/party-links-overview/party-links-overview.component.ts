import { Component, OnInit, Injector } from '@angular/core';
import { SelectionEvent, RowClassArgs } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { PartyLinksApiService } from '../../services/webapi/partylinks-api-service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProgressService } from '../../services/user-progress.service';
import { IGridResult, IPartyLinkDto, ISearchPartyLinkReqDto } from '../../services/webapi/webapi-models';
import { Arrays } from '../../app-common/arrays';
import { MessageBoxDialogComponent } from '../../app-common/components/message-box-dialog/message-box-dialog.component';
import { TranslationService } from '../../services/translation-service';
import { SearchPartyLinkReqDto } from '../../services/webapi/webapi-models-classes';
import { setGridToCriteria } from '../../app-common/models/GridBaseDto';
import { uniqueId } from '../../app-common/uniqueId';
import { Title } from '@angular/platform-browser';
import { SelectedPartyService } from '../../services/selected-party.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-party-links-overview',
    templateUrl: './party-links-overview.component.html',
    styleUrls: ['./party-links-overview.component.less'],
})
export class PartyLinksOverviewComponent implements OnInit {
    data: IGridResult<IPartyLinkDto>;
    grid: State = {
        take: 50
    };
    selection: number[] = [];
    _selectAll = false;
    get selectAll() {
        return this._selectAll;
    }
    set selectAll(value: boolean) {
        if (value) {
            var selectAll = this.data.data.map(x => x.Id);
            this.selection = Arrays.distinct(this.selection.concat(selectAll));
            this._selectAll = true;
        } else {
            this.selection = [];
            this._selectAll = false;
        }
        this.updateVisibility();
    }
    partyId: number;
    canEdit = false
    canDelete = false
    canCribis = false
    constructor(
        private partyLinksService: PartyLinksApiService,
        private route: ActivatedRoute,
        private router: Router,
        public progress: UserProgressService,
        private injector: Injector,
        private translation: TranslationService,
        private selectedPartyService: SelectedPartyService,
        private title: Title
    ) {
    }

    ngOnInit() {
        this.title.setTitle(this.translation.$$get('party_links_overview.party_links'));
        this.partyId = +this.route.snapshot.paramMap.get('id');
        this.progress.runProgress(this.selectedPartyService.partyHeader.pipe(
            map(party => {
                if (party.IdentificationNumber)
                    return true;
                return false;
            })
        )).subscribe(x => {
            this.canCribis = x;
        });
        this.update();
    }
    onSelectAll() {
        this.selectAll = !this.selectAll;
    }
    onGridSelectionChange(selection: SelectionEvent) {
        this._selectAll = false;
        window.setTimeout(() => this.updateVisibility(), 0);
    }
    getRowClass = (context: RowClassArgs) => {
        var row = context.dataItem as IPartyLinkDto;
        if (row.SourcePartyId == this.partyId)
            return 'is-source-party'
        else if (row.TargetPartyId == this.partyId)
            return 'is-target-party';
        return null;
    }
    private updateVisibility() {
        this.canEdit = this.selection.length == 1;
        this.canDelete = this.selection.length > 0;
    }
    async update() {
        var criteria = new SearchPartyLinkReqDto();
        criteria.PartyId = this.partyId;
        setGridToCriteria(this.grid, criteria);
        var result = await this.progress.runAsync(this.partyLinksService.postSearch(criteria));
        this.data = result;
    }
    async onLoadMore(count: number) {
        //console.log('load more', count);
        if (count == 0) {
            this.grid.take = this.grid.take * 2;
            this.update();
            return;
        }
        if (count == 1) {
            //load one more level
            var uniqueIds = this.getUniqueIdsToLoad(this.data.data);
            //console.log("will load " + uniqueId.length);
            var promises = uniqueIds.map(x => {
                var c = new SearchPartyLinkReqDto();
                c.PageSize = 99999;
                c.PartyId = x;
                return this.partyLinksService.postSearch(c)
                    .toPromise()
                    .then(result => {
                        for (var i = 0; i < result.data.length; i++) {
                            var item = result.data[i];
                            if (!this.data.data.find(x => x.Id == item.Id)) {
                                this.data.data.push(item);
                            }
                        }
                        //console.log("loaded... " + x);
                    })
            });
            this.progress.run(Promise.all(promises));
            return;
        }
    }
    private getUniqueIdsToLoad(data: IPartyLinkDto[]): number[] {
        var all = {};
        var result: number[] = [];
        function add(x: number) {
            if (all[x]) return;
            all[x] = true;
            result.push(x);
        }
        for (var i = 0; i < data.length; i++) {
            //TODO: only if should be loaded...
            var item = data[i];
            add(item.SourcePartyId);
            add(item.TargetPartyId);
        }
        return result;
    }
    onGridCellClicked(item: IPartyLinkDto, column: number) {
        if (column == 0)
            return;
        this.router.navigate(['/party', 'detail', this.partyId, 'links', 'edit'], { queryParams: { id: item.Id } });
    }
    onAddClicked() {
        this.router.navigate(['/party', 'detail', this.partyId, 'links', 'edit']);
    }
    onEditClicked() {
        this.router.navigate(['/party', 'detail', this.partyId, 'links', 'edit'], { queryParams: { id: this.selection[0] } });
    }

    onCribisClicked() {
        if (this.canCribis) {
            this.partyLinksService.getCribisUrl(this.partyId).toPromise().then(x => {
                window.open(x, "_blank");
            });
        }
    }

    async onDeleteClicked() {
        var selectedRows = this.selection.map(id => this.data.data.find(r => r.Id == id));
        var opts = MessageBoxDialogComponent.createYesNoOptions(this.injector);
        //TODO: change Key to codebook lookup
        opts.messageHTML = this.translation.$$get('party_links_overview.i_confirm_that_i_want_to_delete_this_links') +
            '<ul>' +
            selectedRows
                .map(x => `<li>${x.SourcePartyName} - ${x.TargetPartyName} - ${x.EssRelationTypeId}</li>`)
                .join('') +
            '</ul>';
        var result = await MessageBoxDialogComponent.show(this.injector, opts).toPromise();
        if (!result)
            return;
        await this.progress.run(this.partyLinksService.postDelete(selectedRows).toPromise());
        this.selection = [];
        await this.update();
    }
    onGridDataStateChange(event) {
    }
}
