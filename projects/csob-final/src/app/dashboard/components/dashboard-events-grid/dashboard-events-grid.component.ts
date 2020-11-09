import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { State } from '@progress/kendo-data-query';
import { TranslationService } from '../../../services/translation-service';
import { UserProgressService } from '../../../services/user-progress.service';
import { DashboardEventsService } from '../../dashboard-events/dashboard-events.service';
import { DashboardEventsGridBase } from './dashboard-events-grid-base';

@Component({
    selector: 'app-dashboard-events-grid',
    templateUrl: './dashboard-events-grid.component.html',
    styleUrls: ['./dashboard-events-grid.component.less'],
})
export class DashboardEventsGridComponent extends DashboardEventsGridBase implements OnInit {
    @Output() dashboardTypeHandler = new EventEmitter<State>();

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
