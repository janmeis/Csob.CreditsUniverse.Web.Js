import { Location } from '@angular/common';
import { Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CellClickEvent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, FilterDescriptor, State } from '@progress/kendo-data-query';
import { fromDateOnlyString, toDateOnlyString } from 'projects/app-common/src/public-api';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { SecurityService } from 'projects/services/src/public-api';
import { TranslationService } from 'projects/services/src/public-api';
import { UrlHelperService } from 'projects/services/src/public-api';
import { UserNotificationService } from 'projects/services/src/public-api';
import { EDashboardState, IDashboardEventDto } from 'projects/services/src/public-api';
import { DashboardDetailDialogComponent } from '../dashboard-detail-dialog/dashboard-detail-dialog.component';
import { DashboardEventsService } from './dashboard-events.service';

export abstract class DashboardEventsBase extends BasePermissionsComponent {
    view$: DashboardEventsService;
    grid = {
        skip: 0, take: 100,
        sort: [],
        filter: {
            logic: 'and',
            filters: []
        } as CompositeFilterDescriptor
    } as State;
    EDashboardState = EDashboardState;
    protected creditFileId: number = null;

    constructor(
        protected dashboardEventsService: DashboardEventsService,
        protected injector: Injector,
        protected location: Location,
        protected notification: UserNotificationService,
        protected route: ActivatedRoute,
        protected securityService: SecurityService,
        protected translation: TranslationService,
        protected urlHelper: UrlHelperService,
        protected isForUser: boolean
    ) {
        super(securityService);
        this.view$ = this.dashboardEventsService;
    }

    onGridUpdate(state: DataStateChangeEvent): void {
        this.grid = state;
        const saveToUrl: { [key: string]: string } = {};
        let dashboardTypeId: string;
        if (!!(dashboardTypeId = this.getDashboardTypeId(this.grid)))
            saveToUrl['DashboardTypeId'] = dashboardTypeId;
        let fulfilment: string;
        if (!!(fulfilment = this.getFulfilment(this.grid)))
            saveToUrl['FulfilmentRequiredOn'] = fulfilment;
        this.urlHelper.saveToUrl(saveToUrl, this.location);
        this.dashboardEventsService.query(this.grid, this.creditFileId, this.isForUser);
    }

    async onGridCellClicked(event: CellClickEvent): Promise<void> {
        const dashboardEvent = Object.assign({}, event.dataItem as IDashboardEventDto);
        if (await DashboardDetailDialogComponent.show(this.injector, dashboardEvent)) {
            this.notification.clear();
            this.dashboardEventsService.query(this.grid, this.creditFileId, this.isForUser);
        }
    }

    getDashboardTypeId(state: State): string {
        let dashboardType: string = null;
        let filter: FilterDescriptor;
        if (!!state.filter && state.filter.filters.length > 0
            && !!(filter = (state.filter.filters.find((f: FilterDescriptor) => f.field == 'DashboardTypeId') as FilterDescriptor)))
            dashboardType = `${filter.value}`;
        return dashboardType;
    }

    protected getUrlParams(): void {
        this.grid.filter.filters = [];
        const filter = {} as any;
        Object.assign(filter, this.route.snapshot.queryParams);
        if (!!filter)
            Object.keys(filter).forEach(key => {
                const value = key == 'FulfilmentRequiredOn' ? fromDateOnlyString(filter[key]) : filter[key];
                this.grid.filter.filters.push({ field: key, operator: 'eq', value: value });
            });
    }

    protected update(): void {
        this.dashboardEventsService.query(this.grid, this.creditFileId, this.isForUser);
    }

    private getFulfilment(state: State): string {
        let filter: FilterDescriptor;
        if (!!state.filter && state.filter.filters.length > 0 && !!(filter = (state.filter.filters.find((f: FilterDescriptor) => f.field == 'FulfilmentRequiredOn') as FilterDescriptor)))
            return toDateOnlyString(filter.value);

        return null;
    }
}
