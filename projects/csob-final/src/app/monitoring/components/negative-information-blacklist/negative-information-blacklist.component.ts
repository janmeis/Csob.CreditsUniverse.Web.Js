import { Component, Injector, Input, OnInit } from '@angular/core';
import { CompositeFilterDescriptor, filterBy, FilterDescriptor } from '@progress/kendo-data-query';
import { TranslationService } from 'src/app/services/translation-service';
import { EColor, IMonitoringRowDto } from 'src/app/services/webapi/webapi-models';


@Component({
    selector: 'app-negative-information-blacklist',
    templateUrl: './negative-information-blacklist.component.html',
    styleUrls: ['./negative-information-blacklist.component.less'],
})
export class NegativeInformationBlacklistComponent implements OnInit {
    @Input() data: IMonitoringRowDto[];
    @Input() filterable = true;

    gridData: IMonitoringRowDto[];
    showInactive = false;
    EColor = EColor;
    filter = {
        logic: 'and',
        filters: []
    } as CompositeFilterDescriptor;
    private readonly filteredField = 'Validity';
    private readonly _filter = { field: this.filteredField, operator: 'eq', value: true } as FilterDescriptor;

    ngOnInit() {
        this.setFilter(this.showInactive);
        this.gridData = filterBy(this.data, this.filter);
    }

    showInactiveHandler(value: boolean) {
        this.setFilter(value);
        this.gridData = filterBy(this.data, this.filter);
    }

    private setFilter(value: boolean): void {
        this.filter.filters = value ? [] : [this._filter];
    }
}
