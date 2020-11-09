import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { EMonitoringCategory, IMonitoringCellClickDto, IMonitoringContainerDto, IMonitoringGroupContainerDto, Language, Languages, MonitoringApiService, UserProgressService } from 'projects/services/src/public-api';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { getUrlAndQuery, showTooltip } from 'projects/app-common/src/public-api'
import { UserBlobService } from 'projects/app-common/src/public-api';

@Component({
    selector: 'app-monitoring-semaphore-detail',
    templateUrl: './monitoring-semaphore-detail.component.html',
    styleUrls: ['./monitoring-semaphore-detail.component.less']
})
export class MonitoringSemaphoreDetailComponent implements OnInit {
    cellClick: IMonitoringCellClickDto;
    container$: Observable<IMonitoringContainerDto>;
    EMonitoringCategory = EMonitoringCategory;
    isDisplayed: { [key: number]: boolean } = {};
    private initialDisplay = true;

    constructor(
        private blob: UserBlobService,
        private monitoringApi: MonitoringApiService,
        public progress: UserProgressService,
        public route: ActivatedRoute,
        private router: Router,
    ) {
        this.cellClick = this.getCellClick();
    }

    private _selectedLanguage: Language;
    get selectedLanguage(): Language {
        return this._selectedLanguage;
    }
    set selectedLanguage(value: Language) {
        this._selectedLanguage = value;
    }

    async ngOnInit() {
        if (!this.cellClick) {
            await this.router.navigate(['overview'], { relativeTo: this.route.parent });
            return;
        }

        this.container$ = this.monitoringApi.postContainer(this.cellClick).pipe(
            shareReplay(1),
            tap(container => this.populateIsDisplayed(container.GroupContainers))
        );

        this.selectedLanguage = Languages[0];
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        showTooltip(e, kendoTooltipInstance)

    onExport(anchor: HTMLAnchorElement) {
        this.progress.runProgress(
            this.monitoringApi.downloadExport(this.cellClick, this.selectedLanguage.cultureCode).pipe()
        )
        .subscribe(result => {
            this.blob.downloadFile(anchor, result);
        });
    }

    async onDetailLinkClicked(link: string) {
        const urlAndQuery: { url: string[], queryParams: Params } = getUrlAndQuery(link, this.route.snapshot.queryParams);
        await this.router.navigate(['../', ...urlAndQuery.url], { queryParams: urlAndQuery.queryParams, relativeTo: this.route.parent });
    }

    private getCellClick(): IMonitoringCellClickDto {
        try {
            const navigation = this.router.getCurrentNavigation();
            const state = navigation.extras.state as { cellClick: IMonitoringCellClickDto };
            return state.cellClick;
        } catch (error) {
            return null;
        }
    }

    private populateIsDisplayed(groupContainers: IMonitoringGroupContainerDto[]): void {
        groupContainers.forEach(g => this.isDisplayed[g.Category] = g.Category == EMonitoringCategory.NegativeInformations ? false : this.initialDisplay);
    }
}
