import { Location } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SecurityService } from 'src/app/services/security.service';
import { SelectedPartyService } from 'src/app/services/selected-party.service';
import { TranslationService } from 'src/app/services/translation-service';
import { UrlHelperService } from 'src/app/services/url-helper.service';
import { UserNotificationService } from 'src/app/services/user-notification.service';
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
