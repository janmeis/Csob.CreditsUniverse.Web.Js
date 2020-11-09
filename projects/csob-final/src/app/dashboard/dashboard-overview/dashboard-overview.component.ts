import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap, tap } from 'rxjs/operators';
import { toDateOnlyString } from 'src/app/app-common/dates';
import { IPageRouterActivated } from 'src/app/app.component';
import { SecurityService } from 'src/app/services/security.service';
import { TranslationService } from 'src/app/services/translation-service';
import { UrlHelperService } from 'src/app/services/url-helper.service';
import { UserProgressService } from 'src/app/services/user-progress.service';
import { IDashboardItemDto } from 'src/app/services/webapi/webapi-models';
import { DashboardEventsService } from '../dashboard-events/dashboard-events.service';
import { DashboardOverviewBase } from './dashboard-overview-base';

@Component({
    selector: 'app-dashboard-overview',
    templateUrl: './dashboard-overview.component.html',
    styleUrls: ['./dashboard-overview.component.less'],
    providers: [
        DashboardEventsService
    ],
})
export class DashboardOverviewComponent extends DashboardOverviewBase implements OnInit, IPageRouterActivated {
    hidePartyInHeader = true;

    constructor(
        dashboardEventsService: DashboardEventsService,
        location: Location,
        progress: UserProgressService,
        route: ActivatedRoute,
        private router: Router,
        securityService: SecurityService,
        title: Title,
        translation: TranslationService,
        urlHelper: UrlHelperService,
    ) {
        super(
            dashboardEventsService,
            location,
            progress,
            route,
            securityService,
            title,
            translation,
            urlHelper,
            false
        );
    }

    ngOnInit() {
        this.title.setTitle(this.translation.$$get('dashboard_overview.page_title'));
        this.getUrlParams();

        this.progress.runProgress(
            this.getDashboardItemsbyDate$().pipe(
                mergeMap(_ => this.dashboardEventsService.getDashboardTypes$(this.translation.$$get('dashboard_overview.all'), true)),
                tap(dashboardTypes => this.dashboardTypes = dashboardTypes)
            )
        ).subscribe();
    }

    onEventClicked(item: IDashboardItemDto) {
        this.router.navigate(['../events'], { queryParams: { DashboardTypeId: item.DashboardTypeId, FulfilmentRequiredOn: toDateOnlyString(item.Date) }, relativeTo: this.route.parent });
    }
}
