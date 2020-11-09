import { Location } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap, tap } from 'rxjs/operators';
import { toDateOnlyString } from '../../app-common/dates';
import { IPageRouterActivated } from '../../app.component';
import { SecurityService } from '../../services/security.service';
import { TranslationService } from '../../services/translation-service';
import { UrlHelperService } from '../../services/url-helper.service';
import { UserNotificationService } from '../../services/user-notification.service';
import { UserProgressService } from '../../services/user-progress.service';
import { EDashboardState, IDashboardEventDto, IDashboardItemDto } from '../../services/webapi/webapi-models';
import { DashboardDetailDialogComponent } from '../dashboard-detail-dialog/dashboard-detail-dialog.component';
import { DashboardEventsService } from '../dashboard-events/dashboard-events.service';
import { DashboardOverviewBase } from '../dashboard-overview/dashboard-overview-base';

@Component({
  selector: 'app-dashboard-my-overview',
  templateUrl: './dashboard-my-overview.component.html',
  styleUrls: ['./dashboard-my-overview.component.less'],
    providers: [
        DashboardEventsService
    ],
})
export class DashboardMyOverviewComponent extends DashboardOverviewBase implements OnInit, IPageRouterActivated {
    hidePartyInHeader = true;

    constructor(
        dashboardEventsService: DashboardEventsService,
        location: Location,
        progress: UserProgressService,
        route: ActivatedRoute,
        securityService: SecurityService,
        title: Title,
        translation: TranslationService,
        urlHelper: UrlHelperService,
        private injector: Injector,
        private notification: UserNotificationService,
        private router: Router,
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
            true
        );
    }

    ngOnInit() {
        this.title.setTitle(this.translation.$$get('dashboard_my_overview.page_title'));
        this.getUrlParams();

        this.progress.runProgress(
            this.getDashboardItems$()
        ).subscribe();
    }
    onEventClicked(item: IDashboardItemDto) {
        console.log(item);
        this.router.navigate(['../my-events'], { queryParams: { DashboardTypeId: item.DashboardTypeId, FulfilmentRequiredOn: toDateOnlyString(item.Date) }, relativeTo: this.route.parent });
    }

    async onAddMyEventClick() {
        if (await DashboardDetailDialogComponent.show(this.injector)) {
            this.notification.clear();
            this.progress.runProgress(
                this.getDashboardItems$()
            ).subscribe();
        }
    }

    private getDashboardItems$() {
        return this.getDashboardItemsbyDate$().pipe(
            mergeMap(_ => this.dashboardEventsService.getDashboardTypes$(null, true)),
            tap(dashboardTypes => this.dashboardTypes = dashboardTypes)
        );
    }
}
