import { Component, Input, OnInit } from '@angular/core';
import { CompositeFilterDescriptor, filterBy, FilterDescriptor } from '@progress/kendo-data-query';
import { fixToNumber } from '../../../app-common/common-functions';
import { EColor, IMonitoringRowDto } from 'projects/services/src/public-api';


interface IMonitoringCruRow {
    Validity: boolean;
    ValidFrom: Date;
    DaysAfterFulfillment: number;
    AmountAfterFulfillment: number;
    InterestAndFeesAfterFulfillment: number;
    TypeOfClaim: string;
}

@Component({
    selector: 'app-negative-information-cru',
    templateUrl: './negative-information-cru.component.html',
    styleUrls: ['./negative-information-cru.component.less'],
})
export class NegativeInformationCruComponent implements OnInit {
    @Input() data: IMonitoringRowDto[];
    @Input() filterable = true;

    gridData: IMonitoringCruRow[];
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
        this.gridData = filterBy(this.getRow(this.data), this.filter);
    }

    showInactiveHandler(value: boolean) {
        this.setFilter(value);
        this.gridData = filterBy(this.getRow(this.data), this.filter);
    }

    setFilter(value: boolean): void {
        this.filter.filters = value ? [] : [this._filter];
    }

    getRow(negativeRows: IMonitoringRowDto[]): IMonitoringCruRow[] {
        return negativeRows.map((r: IMonitoringRowDto) => ({
            Validity: r.Validity,
            ValidFrom: r.ValidFrom,
            DaysAfterFulfillment: fixToNumber(r.Values[1]),
            AmountAfterFulfillment: fixToNumber(r.Values[2]),
            InterestAndFeesAfterFulfillment: fixToNumber(r.Values[3]),
            TypeOfClaim: r.Values[4]
       } as IMonitoringCruRow));
    }
}
