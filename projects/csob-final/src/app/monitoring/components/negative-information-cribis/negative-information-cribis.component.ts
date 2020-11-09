import { Component, Input, OnInit } from '@angular/core';
import { CompositeFilterDescriptor, filterBy, FilterDescriptor } from '@progress/kendo-data-query';
import { EColor, IMonitoringRowDto } from '../../../services/webapi/webapi-models';


interface IMonitoringCribisRow {
    Validity: boolean;
    RiskEvent: string;
    StartedFrom: Date;
    ValidFrom: Date;
    ValidTo: Date;
}

@Component({
    selector: 'app-negative-information-cribis',
    templateUrl: './negative-information-cribis.component.html',
    styleUrls: ['./negative-information-cribis.component.less'],
})
export class NegativeInformationCribisComponent implements OnInit {
    @Input() data: IMonitoringRowDto[];
    @Input() filterable = true;

    gridData: IMonitoringCribisRow[];
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
        this.gridData = filterBy(this.getCribisRow(this.data), this.filter);
    }

    showInactiveHandler(value: boolean) {
        this.setFilter(value);
        this.gridData = filterBy(this.getCribisRow(this.data), this.filter);
    }

    setFilter(value: boolean): void {
        this.filter.filters = value ? [] : [this._filter];
    }

    getCribisRow(negativeRows: IMonitoringRowDto[]): IMonitoringCribisRow[] {
        return negativeRows.map((r: IMonitoringRowDto) => ({
            StartedFrom: r.ValidFrom,
            ValidFrom: r.ValidFrom,
            Validity: r.Validity,
            RiskEvent: r.Values[1],
            ValidTo: r.ValidTo,
       } as IMonitoringCribisRow));
    }
}
