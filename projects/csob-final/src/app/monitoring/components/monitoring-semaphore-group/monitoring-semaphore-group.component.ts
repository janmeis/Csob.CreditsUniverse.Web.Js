import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { isColor } from 'src/app/app-common/common-functions';
import { MonitoringApiService } from 'src/app/services/webapi/monitoring-api-service';
import { EMonitoringCategory, IMonitoringCellClickDto, IMonitoringGroupDto, IMonitoringRowDto } from 'src/app/services/webapi/webapi-models';
import { getLinkClicked } from '../../monitoring-overview/monitoring-overview-utils';

@Component({
    selector: 'app-monitoring-semaphore-group',
    templateUrl: './monitoring-semaphore-group.component.html',
    styleUrls: ['./monitoring-semaphore-group.component.less'],
})
export class MonitoringSemaphoreGroupComponent implements OnInit {
    @Input() cellClick: IMonitoringCellClickDto;
    @Input() category: EMonitoringCategory;
    @Output() detailLinkHandler = new EventEmitter<string>();
    private _initialDisplay = true;

    get initialDisplay() {
        return this._initialDisplay;
    }

    @Input() set initialDisplay(value) {
        this._initialDisplay = value;
        if (!this.initialDisplay)
            Object.keys(this.isDisplayed).forEach(key => this.isDisplayed[key] = false);
    }

    groups$: Observable<IMonitoringGroupDto[]>;
    isDisplayed: { [key: number]: boolean } = {};

    constructor(
        private monitoringApi: MonitoringApiService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.groups$ = this.monitoringApi.postGroupContainer(this.cellClick, this.category).pipe(
            map(groupContainer => groupContainer.Groups),
            tap(groups => this.populateIsDisplayed(groups))
        );
    }

    getRows = (group: IMonitoringGroupDto): IMonitoringRowDto[] =>
        group.Rows.slice(1, group.Rows.length)

    hasDetails = (group: IMonitoringGroupDto): boolean =>
        group.Rows.slice(1, group.Rows.length).some(r => !!r.Details && r.Details.length > 0)

    getDetails = (row: IMonitoringRowDto): string[][] =>
        row.Details.map(d => d.Values)

    isNumber = (value: string): boolean => /^[+-]/.test(value);

    isColor = (value: string): boolean => isColor(value);

    getNumber = (value: string): string => value.replace('+', '');

    getColor = (value: string): string => value.substring(1);

    onLinkClicked(link: string[]) {
        const url = getLinkClicked(link, this.category, this.route, this.router);
        if (url.length > 0)
            this.detailLinkHandler.emit(url);
    }

    private populateIsDisplayed(groups: IMonitoringGroupDto[]) {
        groups.forEach((_, index) => this.isDisplayed[index] = this.category == EMonitoringCategory.NegativeInformations ? false : this.initialDisplay);
    }
}
