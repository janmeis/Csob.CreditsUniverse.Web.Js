import { EventEmitter, Input, Output, Directive } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CellClickEvent, DataStateChangeEvent, RowClassArgs } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { DataResult, FilterDescriptor, State } from '@progress/kendo-data-query';
import { showTooltip } from '../../../app-common/common-functions';
import { TranslationService } from '../../../services/translation-service';
import { UserProgressService } from '../../../services/user-progress.service';
import { EDashboardState, ICodebookItem, IDashboardEventDto } from '../../../services/webapi/webapi-models';
import { DashboardEventsService, IDashboardType } from '../../dashboard-events/dashboard-events.service';

@Directive()
export abstract class DashboardEventsGridBase {
    @Input() data: DataResult;
    @Input() grid: State;
    @Input() isForUser: boolean;

    @Output() gridUpdateHandler = new EventEmitter<DataStateChangeEvent>();
    @Output() gridCellClickHandler = new EventEmitter<CellClickEvent>();

    dashboardTypes: IDashboardType[];
    dashboardStates: ICodebookItem[];
    EDashboardState = EDashboardState;

    constructor(
        protected dashboardEventsService: DashboardEventsService,
        public progress: UserProgressService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected translation: TranslationService,
    ) { }

    getRowClass(context: RowClassArgs): string {
        if (context && context.dataItem as IDashboardEventDto) {
            const dashboardEvent = context.dataItem as IDashboardEventDto;
            const dashboardState = dashboardEvent.DashboardState;
            if (dashboardState == EDashboardState.Unfulfilled)
                return 'event-status-unfulfilled';
            if (dashboardState == EDashboardState.Fulfilled)
                return 'event-status-fulfilled';

            return 'event-status-new';
        }

        return '';
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        showTooltip(e, kendoTooltipInstance, ['TD', 'TH', 'A', 'SPAN'])

    getBkgColor(dataItem: IDashboardEventDto, dashboardTypes: IDashboardType[]) {
        if (!dashboardTypes)
            return '';

        const dashboardType = dashboardTypes.find(t => t.Value == dataItem.DashboardTypeId);
        return !!dashboardType && !!dashboardType.Color ? dashboardType.Color : '';
    }

    getDashboardStateCodebook(): ICodebookItem[] {
        const codebook = [({ Value: null, Text: this.translation.$$get('dashboard_events_grid.all') } as ICodebookItem)];
        const keys = Object.keys(EDashboardState);
        keys.slice(keys.length / 2).forEach(k => codebook.push({ Value: EDashboardState[k], Text: this.translation.$$get(`dashboard_events_grid.${k}`) }));
        return codebook;
    }

    update(isForUser: boolean) {
        this.progress.runProgress(
            this.dashboardEventsService.getDashboardTypes$(this.translation.$$get('dashboard_events_grid.all'), isForUser)
        ).subscribe(dashboardTypes => {
            this.dashboardTypes = dashboardTypes;
            this.dashboardStates = this.getDashboardStateCodebook();
        });
    }

    onGridCellClick(cellClickEvent: CellClickEvent) {
        const dashboardEvent = cellClickEvent.dataItem as IDashboardEventDto;
        if (!dashboardEvent.CanShowDetail)
            return;

        let srcId: string;
        if (!!(srcId = cellClickEvent.originalEvent.srcElement.id) && srcId.indexOf('clientName') >= 0) {
            const queryParams = {};
            let filter: FilterDescriptor;
            const gridFilter = cellClickEvent.sender.filter;
            if (!!gridFilter && gridFilter.filters.length > 0
                && !!(filter = (gridFilter.filters.find((f: FilterDescriptor) => f.field == 'DashboardTypeId') as FilterDescriptor)))
                queryParams['DashboardTypeId'] = filter.value;

            this.router.navigate(['../client', dashboardEvent.PartyId], { queryParams: queryParams, relativeTo: this.route.parent });
        } else
            this.gridCellClickHandler.emit(cellClickEvent);
    }
}
