import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { fromDateOnlyString, toDateOnlyString } from 'projects/app-common/src/public-api';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { SecurityService } from 'projects/services/src/public-api';
import { TranslationService } from 'projects/services/src/public-api';
import { UrlHelperService } from 'projects/services/src/public-api';
import { UserProgressService } from 'projects/services/src/public-api';
import { ECalendarType, EDashboardTypeId, IDashboardItemResDto } from 'projects/services/src/public-api';
import { DashboardEventsService, IDashboardType } from '../dashboard-events/dashboard-events.service';

export abstract class DashboardOverviewBase extends BasePermissionsComponent {
    date = new Date();
    calendarType: ECalendarType = ECalendarType.Month;
    dashboardItemRes: IDashboardItemResDto;
    dashboardTypes: IDashboardType[];
    dashboardTypeId: EDashboardTypeId;
    ECalendarType = ECalendarType;

    constructor(
        protected dashboardEventsService: DashboardEventsService,
        protected location: Location,
        public progress: UserProgressService,
        protected route: ActivatedRoute,
        protected securityService: SecurityService,
        protected title: Title,
        protected translation: TranslationService,
        protected urlHelper: UrlHelperService,
        protected isForUser: boolean
    ) {
        super(securityService);
    }

    onCalendarTypeChanged(calendarType: ECalendarType) {
        this.calendarType = calendarType;
        this.updateUrl();

        this.progress.runProgress(this.getDashboardItemsbyDate$()).subscribe();
    }

    onDateChanged(dt: Date) {
        this.date = dt;
        this.updateUrl();

        this.progress.runProgress(this.getDashboardItemsbyDate$()).subscribe();
    }

    protected getDashboardItemsbyDate$ = (): Observable<IDashboardItemResDto> =>
        this.dashboardEventsService.getDashboardItemsbyDate$(this.date, this.calendarType, this.isForUser).pipe(
            tap(dashboardItemRes => this.dashboardItemRes = dashboardItemRes)
        )

    protected updateUrl() {
        this.urlHelper.saveToUrl({ DashboardTypeId: this.dashboardTypeId, calendarType: ECalendarType[this.calendarType], dt: toDateOnlyString(this.date) }, this.location);
    }

    protected getUrlParams() {
        const calendarType = this.route.snapshot.queryParamMap.get('calendarType');
        if (calendarType)
            this.calendarType = ECalendarType[calendarType];
        else
            this.calendarType = ECalendarType.Month;

        const dt = this.route.snapshot.queryParamMap.get('dt');
        this.date = !!dt ? fromDateOnlyString(dt) : new Date();

        this.dashboardTypeId = +this.route.snapshot.queryParamMap.get('DashboardTypeId') || null;
    }
}
