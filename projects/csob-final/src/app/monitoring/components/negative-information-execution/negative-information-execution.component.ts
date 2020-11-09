import { Component, Input, OnInit } from '@angular/core';
import { CompositeFilterDescriptor, filterBy, FilterDescriptor } from '@progress/kendo-data-query';
import { fixToNumber } from 'src/app/app-common/common-functions';
import { EColor, IMonitoringRowDto } from 'src/app/services/webapi/webapi-models';

interface IMonitoringExecutionRow {
    Validity: boolean;
    Status: string;
    Currency: string;
    AmountTotal: number;
    AmountPaid: number;
    Role: string;
    Source: string;
    DateModified: Date;
    ValidFrom: Date;
    ValidTo: Date;
}

@Component({
    selector: 'app-negative-information-execution',
    templateUrl: './negative-information-execution.component.html',
    styleUrls: ['./negative-information-execution.component.less'],
})
export class NegativeInformationExecutionComponent implements OnInit {
    @Input() data: IMonitoringRowDto[];
    @Input() filterable = true;

    gridData: IMonitoringExecutionRow[];
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

    getRow(negativeRows: IMonitoringRowDto[]): IMonitoringExecutionRow[] {
        return negativeRows.map((r: IMonitoringRowDto) => ({
            Validity: r.Validity,
            Status: r.Values[0],
            Currency: r.Values[1],
            AmountTotal: fixToNumber(r.Values[2]),
            AmountPaid: fixToNumber(r.Values[3]),
            Role: r.Values[4],
            Source: r.Values[5],
            DateModified: r.ModifiedOn,
            ValidFrom: r.ValidFrom,
            ValidTo: r.ValidTo,
       } as IMonitoringExecutionRow));
    }
}
