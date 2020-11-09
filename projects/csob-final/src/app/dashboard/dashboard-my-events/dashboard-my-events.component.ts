import { Location } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SecurityService } from '../../services/security.service';
import { SelectedPartyService } from '../../services/selected-party.service';
import { TranslationService } from '../../services/translation-service';
import { UrlHelperService } from '../../services/url-helper.service';
import { UserNotificationService } from '../../services/user-notification.service';
import { EDashboardState, IDashboardEventDto } from '../../services/webapi/webapi-models';
import { DashboardDetailDialogComponent } from '../dashboard-detail-dialog/dashboard-detail-dialog.component';
import { DashboardEventsBase } from '../dashboard-events/dashboard-events-base';
import { DashboardEventsService } from '../dashboard-events/dashboard-events.service';

@Component({
    selector: 'app-dashboard-my-events',
    templateUrl: './dashboard-my-events.component.html',
    styleUrls: ['./dashboard-my-events.component.less'],
    providers: [
        DashboardEventsService
    ]
})
export class DashboardMyEventsComponent extends DashboardEventsBase implements OnInit {
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
            true
        );
    }

    ngOnInit(): void {
        this.title.setTitle(this.translation.$$get('dashboard_my_events.page_title'));
        this.selectedParty.clear();
        this.getUrlParams();

        this.update();
    }

    async onAddMyEventClick() {
        if (await DashboardDetailDialogComponent.show(this.injector)) {
            this.notification.clear();
            this.dashboardEventsService.query(this.grid, this.creditFileId, this.isForUser);
        }
    }
}
