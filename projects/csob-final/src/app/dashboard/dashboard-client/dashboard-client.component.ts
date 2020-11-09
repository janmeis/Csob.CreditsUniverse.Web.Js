import { Location } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { SecurityService } from '../../services/security.service';
import { SelectedPartyService } from '../../services/selected-party.service';
import { TranslationService } from '../../services/translation-service';
import { UrlHelperService } from '../../services/url-helper.service';
import { UserNotificationService } from '../../services/user-notification.service';
import { UserProgressService } from '../../services/user-progress.service';
import { PartyApiService } from '../../services/webapi/party-api-service';
import { DashboardEventsBase } from '../dashboard-events/dashboard-events-base';
import { DashboardEventsService } from '../dashboard-events/dashboard-events.service';
import { DashboardDetailDialogComponent } from '../dashboard-detail-dialog/dashboard-detail-dialog.component';
import { EDashboardState, IDashboardEventDto } from '../../services/webapi/webapi-models';

@Component({
    selector: 'app-dashboard-client',
    templateUrl: './dashboard-client.component.html',
    styleUrls: ['./dashboard-client.component.less'],
    providers: [
        DashboardEventsService
    ]
})
export class DashboardClientComponent extends DashboardEventsBase implements OnInit {
    constructor(
        dashboardEventsService: DashboardEventsService,
        injector: Injector,
        location: Location,
        notification: UserNotificationService,
        route: ActivatedRoute,
        securityService: SecurityService,
        translation: TranslationService,
        urlHelper: UrlHelperService,
        private partyApi: PartyApiService,
        private progress: UserProgressService,
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
        this.title.setTitle(this.translation.$$get('dashboard_client.page_title'));
        this.getUrlParams();

        const partyId = +this.route.snapshot.paramMap.get('id');
        if (partyId == 0)
            return;

        this.progress.runProgress(
            this.partyApi.getPartyHeader(partyId).pipe(
                tap(party => this.selectedParty.setData(party)),
                tap(party => {
                    this.creditFileId = party.CreditFileId;
                    super.fillRights(party);
                })
            )).subscribe(_ => this.update());
    }

    async onAddMyEventClick() {
        if (await DashboardDetailDialogComponent.show(this.injector)) {
            this.notification.clear();
            this.dashboardEventsService.query(this.grid, this.creditFileId, this.isForUser);
        }
    }
}
