import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap, tap } from 'rxjs/operators';
import { toDateOnlyString } from '../../app-common/dates';
import { SelectedPartyService } from 'projects/services/src/public-api';
import { TranslationService } from 'projects/services/src/public-api';
import { UserProgressService } from 'projects/services/src/public-api';
import { IDashboardItemDto } from 'projects/services/src/public-api';
import { DashboardEventsService, IDashboardType } from '../dashboard-events/dashboard-events.service';

@Component({
    selector: 'app-dashboard-branches',
    templateUrl: './dashboard-branches.component.html',
    styleUrls: ['./dashboard-branches.component.less'],
    providers: [
        DashboardEventsService
    ]
})
export class DashboardBranchesComponent implements OnInit {
    dashboardItems: IDashboardItemDto[];
    dashboardTypes: IDashboardType[];

    constructor(
        private dashboardEventsService: DashboardEventsService,
        public progress: UserProgressService,
        private route: ActivatedRoute,
        private router: Router,
        private selectedParty: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
    ) { }

    ngOnInit(): void {
        this.title.setTitle(this.translation.$$get('dashboard_branches.page_title'));
        this.selectedParty.clear();

        this.progress.runProgress(
            this.dashboardEventsService.getDashboardItems$().pipe(
                tap(dashboardItems => this.dashboardItems = dashboardItems),
                mergeMap(_ => this.dashboardEventsService.getDashboardTypes$(null, false)),
                tap(dashboardTypes => this.dashboardTypes = dashboardTypes))
        ).subscribe();
    }

    getBkgColor(item: IDashboardItemDto, dashboardTypes: IDashboardType[]) {
        if (!dashboardTypes)
            return '';

        const dashboardType = dashboardTypes.find(t => t.Value == item.DashboardTypeId);
        return !!dashboardType && !!dashboardType.Color ? dashboardType.Color : '';
    }

    checkDashboardItems = (): boolean =>
        !!this.dashboardItems && this.dashboardItems.length > 0 && this.dashboardItems.some(i => i.Count > 0)

    onEventClicked(item: IDashboardItemDto) {
        const queryParams = { FulfilmentRequiredOn: toDateOnlyString(item.Date) };
        if (!!item.DashboardTypeId)
            queryParams['DashboardTypeId'] = item.DashboardTypeId;
        this.router.navigate(['events'], { queryParams: queryParams, relativeTo: this.route.parent });
    }
}
