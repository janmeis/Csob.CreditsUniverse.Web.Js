import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslationService } from '../../../services/translation-service';
import { UserProgressService } from '../../../services/user-progress.service';
import { DashboardEventsService } from '../../dashboard-events/dashboard-events.service';
import { DashboardEventsGridBase } from '../dashboard-events-grid/dashboard-events-grid-base';

@Component({
    selector: 'app-dashboard-client-grid',
    templateUrl: './dashboard-client-grid.component.html',
    styleUrls: ['./dashboard-client-grid.component.less'],
})
export class DashboardClientGridComponent extends DashboardEventsGridBase implements OnInit {
        constructor(
        dashboardEventsService: DashboardEventsService,
        progress: UserProgressService,
        route: ActivatedRoute,
        router: Router,
        translation: TranslationService,
    ) {
        super(
            dashboardEventsService,
            progress,
            route,
            router,
            translation
        );
    }

    ngOnInit(): void {
        this.update(this.isForUser);
    }
}
