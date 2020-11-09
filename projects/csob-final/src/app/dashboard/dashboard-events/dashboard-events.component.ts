import { Location } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SecurityService } from 'projects/services/src/public-api';
import { SelectedPartyService } from 'projects/services/src/public-api';
import { TranslationService } from 'projects/services/src/public-api';
import { UrlHelperService } from 'projects/services/src/public-api';
import { UserNotificationService } from 'projects/services/src/public-api';
import { DashboardEventsBase } from './dashboard-events-base';
import { DashboardEventsService } from './dashboard-events.service';

@Component({
    selector: 'app-dashboard-events',
    templateUrl: './dashboard-events.component.html',
    styleUrls: ['./dashboard-events.component.less'],
    providers: [
        DashboardEventsService
    ]
})
export class DashboardEventsComponent extends DashboardEventsBase implements OnInit {
    constructor(
        dashboardEventsService: DashboardEventsService,
        injector: Injector,
        location: Location,
        notification: UserNotificationService,
        route: ActivatedRoute,
        securityService: SecurityService,
        translation: TranslationService,
        urlHelper: UrlHelperService,
        private selectedParty: SelectedPartyService,
        private title: Title,
    ) {
        super(
            dashboardEventsService,
            injector,
            location,
            notification,
            route,
            securityService,
            translation,
            urlHelper,
            false
        );
    }

    ngOnInit(): void {
        this.title.setTitle(this.translation.$$get('dashboard_events.page_title'));
        this.selectedParty.clear();
        this.getUrlParams();

        this.update();
    }
}
