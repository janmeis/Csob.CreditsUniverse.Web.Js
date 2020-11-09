import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { fromDateOnlyString, toDateOnlyString } from 'src/app/app-common/dates';
import { BasePermissionsComponent } from 'src/app/app-shell/basePermissionsComponent';
import { SecurityService } from 'src/app/services/security.service';
import { TranslationService } from 'src/app/services/translation-service';
import { UrlHelperService } from 'src/app/services/url-helper.service';
import { UserProgressService } from 'src/app/services/user-progress.service';
import { ECalendarType, EDashboardTypeId, IDashboardItemResDto } from 'src/app/services/webapi/webapi-models';
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
