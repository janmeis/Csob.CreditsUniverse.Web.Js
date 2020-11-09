import { Component, Input, OnInit } from '@angular/core';
import { EMonitoringCategory, IMonitoringDetailRowDto } from 'projects/services/src/public-api';

@Component({
    selector: 'app-monitoring-overview-row',
    templateUrl: './monitoring-overview-row.component.html',
    styleUrls: ['./monitoring-overview-row.component.less']
})
export class MonitoringOverviewRowComponent implements OnInit {
    @Input() dataItem: IMonitoringDetailRowDto;
    @Input() c: number;
    @Input() canClick = true;
    EMonitoringCategory = EMonitoringCategory;

    private readonly czechDateTimeRegex = /^(\d{2})\.(\d{2}).(\d{4})\s(\d{2}):(\d{2})$/;

    constructor() { }

    ngOnInit(): void {
    }


    isDate = (dt: string) => this.czechDateTimeRegex.test(dt);
}
