import { Component, EventEmitter, Input, Output } from '@angular/core';
import { hexToRGB } from 'projects/app-common/src/public-api'
import { IDashboardItemDto } from 'projects/services/src/public-api';
import { IDashboardType } from '../../dashboard-events/dashboard-events.service';

@Component({
    selector: 'app-dashboard-item',
    templateUrl: './dashboard-item.component.html',
    styleUrls: ['./dashboard-item.component.less']
})
export class DashboardItemComponent {
    @Input() items: IDashboardItemDto[];
    @Input() dashboardTypes: IDashboardType[];
    @Output() eventClicked = new EventEmitter<IDashboardItemDto>();

    getBkgColor(item: IDashboardItemDto) {
        if (!this.dashboardTypes)
            return '';

        const dashboardType = this.dashboardTypes.find(t => t.Value == item.DashboardTypeId);
        return !!dashboardType && !!dashboardType.Color
            ? { 'background-color': hexToRGB(dashboardType.Color, 0.1), 'border-color': hexToRGB(dashboardType.Color, 0.5) }
            : '';
    }
}
