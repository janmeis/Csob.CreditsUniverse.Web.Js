import { Component, Injector, Input, OnInit } from '@angular/core';
import { CompositeFilterDescriptor, filterBy, FilterDescriptor } from '@progress/kendo-data-query';

import { TranslationService } from 'src/app/services/translation-service';
import { EColor, IMonitoringRowDto } from 'src/app/services/webapi/webapi-models';


interface IMonitoringInsolvencyRow {
    Validity: boolean;
    Status: string
    FileNumber: string;
    BankruptcyProceedings: string;
    JusticeProceedings: string;
    DateModified: Date;
    Source: string;
    ValidFrom: Date;
    ValidTo: Date;
}

@Component({
    selector: 'app-negative-information-insolvency',
    templateUrl: './negative-information-insolvency.component.html',
    styleUrls: ['./negative-information-insolvency.component.less'],
})
export class NegativeInformationInsolvencyComponent implements OnInit {
    @Input() data: IMonitoringRowDto[];
    @Input() filterable = true;

    gridData: IMonitoringInsolvencyRow[];
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

    getRow(negativeRows: IMonitoringRowDto[]): IMonitoringInsolvencyRow[] {
        return negativeRows.map((r: IMonitoringRowDto) => ({
            Validity: r.Validity,
            Status: r.Values[0],
            FileNumber: r.Values[1],
            BankruptcyProceedings: r.Values[2],
            JusticeProceedings: r.Values[3],
            DateModified: r.ModifiedOn,
            Source: r.Values[4],
            ValidFrom: r.ValidFrom,
            ValidTo: r.ValidTo,
       } as IMonitoringInsolvencyRow));
    }
}
