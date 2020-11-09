import { Location } from '@angular/common';
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { CompositeFilterDescriptor, FilterDescriptor, process, State } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { getUrlAndQuery, showTooltip } from '../../app-common/common-functions';
import { GetStaticCodebookProvider, ICodebookProvider } from '../../app-common/components/editor-codebook/editor-codebook.component';
import { toDateOnlyString } from '../../app-common/dates';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { SecurityService } from '../../services/security.service';
import { UrlHelperService } from '../../services/url-helper.service';
import { SelectedPartyService } from '../../services/selected-party.service';
import { TranslationService } from '../../services/translation-service';
import { UserProgressService } from '../../services/user-progress.service';
import { MonitoringApiService } from '../../services/webapi/monitoring-api-service';
import { EFrequencyUnit, EMonitoringCategory, ICodebookItem, IMonitoringCellClickDto, IMonitoringClientSemaphoreDto, IMonitoringDetailCellDto, IMonitoringDetailColumnDto, IMonitoringDetailRowDto, IMonitoringDetailsDto, IMonitoringFilterDto } from '../../services/webapi/webapi-models';
import { MonitoringDetailInfoDialogComponent } from '../monitoring-detail-info-dialog/monitoring-detail-info-dialog.component';
import { MonitoringSemaphoreHistoryDialogComponent } from '../monitoring-semaphore-history-dialog/monitoring-semaphore-history-dialog.component';
import { getMonitoringParams, updateMonitoringParams } from './monitoring-overview-utils';

export interface IMonitoringQueryParams {
    Granularity: EFrequencyUnit;
    ByToDate: number;
    EOP: string;
    Delta: number;
}

@Component({
    selector: 'app-monitoring-overview',
    templateUrl: './monitoring-overview.component.html',
    styleUrls: ['./monitoring-overview.component.less'],
})
export class MonitoringOverviewComponent extends BasePermissionsComponent implements OnInit, OnDestroy {
    monitoringRows: IMonitoringDetailRowDto[] = [];
    monitoringColumns: IMonitoringDetailColumnDto[] = [];
    filter = {} as IMonitoringFilterDto;
    EMonitoringCategory = EMonitoringCategory;
    loading = false;
    clientSemaphore: IMonitoringClientSemaphoreDto;
    byToDateItems: ICodebookProvider;
    state = {
        filter: {
            logic: 'or',
            filters: [
                { field: 'IsSemaphore', operator: 'eq', value: true } as FilterDescriptor,
                {
                    logic: 'and',
                    filters: [
                        { field: 'CategoryId', operator: 'neq', value: EMonitoringCategory.NegativeInformations } as FilterDescriptor,
                    ]
                } as CompositeFilterDescriptor
            ]
        } as CompositeFilterDescriptor
    } as State;
    gridData = { data: [], total: 0 } as GridDataResult;
    sortDirectionClass: { [key: number]: string } = {};
    headerSortDirectionClass: string;

    private readonly _sortDown = 'fa-caret-down';
    private readonly _sortUp = 'fa-caret-right';

    constructor(
        private injector: Injector,
        private location: Location,
        private monitoringApiService: MonitoringApiService,
        public progress: UserProgressService,
        private route: ActivatedRoute,
        private router: Router,
        private selectedPartyService: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        private urlHelper: UrlHelperService,
        securityService: SecurityService) {
        super(securityService);
    }
    ngOnInit() {
        this.title.setTitle(this.translation.$$get('monitoring_overview.page_title'));
        this.byToDateItems = GetStaticCodebookProvider([{ Value: 0, Text: this.translation.$$get('monitoring_overview.by_date_of_evaluation') }, { Value: 1, Text: this.translation.$$get('monitoring_overview.by_date') }] as ICodebookItem[]);
        this.headerSortDirectionClass = this._sortDown;

        this.progress.runProgress(
            this.selectedPartyService.partyHeader.pipe(
                tap(party => {
                    this.filter.PartyId = party.Id;
                    this.filter.CreditFileId = party.CreditFileId;
                    super.fillRights(party);
                }),
                mergeMap(_ => this.monitoringApiService.getClientSemaphore(this.filter.CreditFileId)),
                tap(semaphore => this.clientSemaphore = semaphore),
                mergeMap(_ => this.getUrlParams$()),
                mergeMap(_ => this.monitoringApiService.postMonitoringDetails(this.filter)),
                tap(monitoringDetails => {
                    this.filter = monitoringDetails.CurrentFilter;
                    this.monitoringColumns = monitoringDetails.Columns;
                    this.monitoringRows = monitoringDetails.Rows;
                    this.gridData = { data: this.monitoringRows, total: this.monitoringRows.length } as GridDataResult;

                    this.updateUrl();
                }),
                tap(_ => this.gridData = process(this.monitoringRows, this.state)),
                tap(_ => {
                    const categoryIds = this.monitoringRows.map(r => r.CategoryId);
                    const categories = [...new Set(categoryIds)];
                    this.populateSortDirectionClass(categories);
                }))
        ).subscribe();
    }

    ngOnDestroy(): void {
    }

    changePeriod(param: string) {
        if (!(this.hasRightTo && this.hasRightTo['Monitoringchangeperiod']) || this.monitoringRows.length == 0)    // monitoringDetails not yet called
            return;

        if (param == 'bytodate')
            this.filter.Granularity = this.filter.ByToDate == 0 ? EFrequencyUnit.Month : EFrequencyUnit.Quarter;

        this.progress.runProgress(this.update$().pipe(
            tap(_ => this.filterMonitoringRows(EMonitoringCategory.NegativeInformations))
        ), true).subscribe();
    }

    changePeriodeShift(direction: 'back' | 'forward') {
        this.filter.PeriodeShift = direction == 'back' ? -1 : 1;
        this.changePeriod('period');
    }

    async cellClickHandler({ columnIndex, dataItem }) {
        if (!(this.hasRightTo && this.hasRightTo['Monitoringdetail']))
            return;

        if (columnIndex > 0) {
            const columnValue = dataItem.ColumnValues[columnIndex - 1] as IMonitoringDetailCellDto;
            if (columnValue.ClickEnabled) {
                const cellClick = this.getMonitoringCellClick(columnIndex, dataItem, columnValue);
                if (columnValue.SemaphoreId != null) {
                    this.router.navigate(['semaphore-detail'], {
                        queryParams: this.getQueryParams(),
                        relativeTo: this.route.parent,
                        state: { cellClick: cellClick }
                    });
                } else {
                    this.loading = true;
                    const result = await MonitoringDetailInfoDialogComponent.show(this.injector, cellClick);
                    this.loading = false;

                    if (!!result && !!(result as any).link) {
                        const link: string = (result as any).link;
                        const urlAndQuery: { url: string[], queryParams: Params } = getUrlAndQuery(link, this.getQueryParams());
                        await this.router.navigate(['../', ...urlAndQuery.url], { queryParams: urlAndQuery.queryParams, relativeTo: this.route.parent });
                    } else if (result) {
                        this.gridData = { data: [], total: 0 } as GridDataResult;
                        await this.progress.runAsync(this.update$());
                    }
                }
            }
        } else if (dataItem.IsSemaphore) {
            this.setGridState(dataItem);
            if (dataItem.CategoryId == EMonitoringCategory.NegativeInformations && !this.hasCategoryRows(EMonitoringCategory.NegativeInformations)) {
                await this.getNegativeRows();
                this.gridData = process(this.monitoringRows, this.state);
            } else {
                this.gridData = process(this.monitoringRows, this.state);
            }
        }
    }

    headerSortDirectionHandler() {
        const keys = Object.keys(this.sortDirectionClass);
        if (keys.some(k => this.sortDirectionClass[k] == this._sortUp)) {
            (this.state.filter.filters[1] as CompositeFilterDescriptor).filters = [];
            this.sortUpDown('down');
        } else {
            (this.state.filter.filters[1] as CompositeFilterDescriptor).filters
                = [...keys.map(k => ({ field: 'CategoryId', operator: 'neq', value: k } as FilterDescriptor))];
            this.sortUpDown('up');
        }

        this.gridData = process(this.monitoringRows, this.state);
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        showTooltip(e, kendoTooltipInstance)

    async onSemaphoreClick() {
        if (!(this.hasRightTo && this.hasRightTo['Monitoringchangeperiod']))
            return;

        await MonitoringSemaphoreHistoryDialogComponent.show(this.injector, this.filter.CreditFileId, this.clientSemaphore.Color);
    }

    private getMonitoringCellClick = (columnIndex: number, dataItem: IMonitoringDetailRowDto, columnValue: IMonitoringDetailCellDto): IMonitoringCellClickDto =>
        ({
            CreditFileId: this.filter.CreditFileId,
            ByEvaluationDate: this.filter.ByToDate == 0,
            Granularity: this.filter.Granularity,
            EOP: this.monitoringColumns[columnIndex - 1].EOP,
            MonitoringClientInfoId: this.monitoringColumns[columnIndex - 1].MonitoringClientInfoId,
            FinancialCovenantId: dataItem.FinancialCovenantId,
            NonFinancialCovenantId: dataItem.NonFinancialCovenantId,
            Consolidated: columnValue.Consolidated,
            CustomCode: dataItem.CustomCode,
            PDRatingId: columnValue.PDRatingId,
            MonitoringClientResultId: columnValue.MonitoringClientResultId,
            ContractConditionId: columnValue.ContractConditionId,
            Category: dataItem.CategoryId,
            Subcategory: dataItem.SubcategoryId,
            EwsId: columnValue.EwsId,
            PartyId: this.filter.PartyId
        } as IMonitoringCellClickDto)


    private setGridState(dataItem: IMonitoringDetailRowDto): void {
        let filters = (this.state.filter.filters[1] as CompositeFilterDescriptor).filters;
        if (filters.some((f: FilterDescriptor) => f.field == 'CategoryId' && f.value == dataItem.CategoryId)) {
            filters = filters.filter((f: FilterDescriptor) => f.value != dataItem.CategoryId);
            this.sortDirectionClass[dataItem.CategoryId] = this._sortDown;
        } else {
            filters = [...filters,
            { field: 'CategoryId', operator: 'neq', value: dataItem.CategoryId } as FilterDescriptor];
            this.sortDirectionClass[dataItem.CategoryId] = this._sortUp;
        }
        (this.state.filter.filters[1] as CompositeFilterDescriptor).filters = filters;
    }


    private hasCategoryRows = (category: EMonitoringCategory) =>
        this.monitoringRows.filter(r => r.CategoryId == category && !r.IsSemaphore).length > 0

    private async getNegativeRows() {
        const negativeRows = await this.progress.runAsync(
            this.monitoringApiService.postMonitoringDetailRows(EMonitoringCategory.NegativeInformations, this.filter)
        );
        const index = this.monitoringRows.map(r => r.CategoryId).indexOf(EMonitoringCategory.NegativeInformations);
        this.monitoringRows.splice(index + 1, 0, ...negativeRows);
    }

    private update$(): Observable<IMonitoringDetailsDto> {
        return this.monitoringApiService.postMonitoringDetails(this.filter).pipe(
            tap(monitoringDetails => {
                this.filter = monitoringDetails.CurrentFilter;
                this.monitoringColumns = monitoringDetails.Columns;
                this.monitoringRows = monitoringDetails.Rows;
                this.gridData = { data: this.monitoringRows, total: this.monitoringRows.length } as GridDataResult;

                this.updateUrl();
            }));
    }

    private updateUrl() {
        const params = this.getQueryParams();
        this.urlHelper.saveToUrl(params, this.location);
        updateMonitoringParams(this.filter.PartyId, params);
    }

    private getQueryParams(): IMonitoringQueryParams {
        return { Granularity: this.filter.Granularity, ByToDate: this.filter.ByToDate, EOP: toDateOnlyString(this.filter.EOP), Delta: this.filter.Delta } as IMonitoringQueryParams;
    }

    private getUrlParams$ = (): Observable<Params> =>
        this.route.queryParams.pipe(
            tap(params => this.filter = getMonitoringParams(params, this.filter)))

    private filterMonitoringRows(categoryId: EMonitoringCategory) {
        this.monitoringRows = this.monitoringRows.filter(r => r.IsSemaphore || r.CategoryId != categoryId);
    }

    private populateSortDirectionClass(categoryIds: EMonitoringCategory[]) {
        categoryIds.forEach(c => this.sortDirectionClass[c] = (c == EMonitoringCategory.NegativeInformations ? this._sortUp : this._sortDown));
    }

    private sortUpDown(sort: 'up' | 'down') {
        const upDown = sort == 'up' ? this._sortUp : this._sortDown;
        Object.keys(this.sortDirectionClass).forEach(k => this.sortDirectionClass[k] = upDown);
        this.headerSortDirectionClass = upDown;
    }
}
