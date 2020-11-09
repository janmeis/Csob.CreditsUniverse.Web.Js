import { Component, Input, OnInit } from '@angular/core';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { CompositeFilterDescriptor, filterBy, FilterDescriptor } from '@progress/kendo-data-query';
import { fixToNumber, showTooltip } from 'src/app/app-common/common-functions';
import { EColor, IMonitoringRowDto } from 'src/app/services/webapi/webapi-models';

interface IUnauthorizedOverdraftRow {
  Validity: boolean;
  Product: string;
  ProductNumber: string;
  Amount: number;
  MaxAmount: number;
  DaysPastDue: number;
  Currency: string;
  StartedFrom: Date;
  ValidFrom: string;
  ModifiedOn: Date;
  ValidTo: Date;
}

@Component({
  selector: 'app-negative-information-unauthorized-overdraft',
  templateUrl: './negative-information-unauthorized-overdraft.component.html',
  styleUrls: ['./negative-information-unauthorized-overdraft.component.less'],
})
export class NegativeInformationUnauthorizedOverdraftComponent implements OnInit {
  @Input() data: IMonitoringRowDto[];
  @Input() filterable = true;

  gridData: IUnauthorizedOverdraftRow[];
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

  getRow(negativeRows: IMonitoringRowDto[]): IUnauthorizedOverdraftRow[] {
    return negativeRows.map((r: IMonitoringRowDto) => ({
      Validity: r.Validity,
      Product: r.Values[1],
      ProductNumber: r.Values[2],
      Amount: fixToNumber(r.Values[3]),
      MaxAmount: fixToNumber(r.Values[4]),
      StartedFrom: r.ValidFrom,
      Currency: r.Values[5],
      DaysPastDue: fixToNumber(r.Values[6]),
      ModifiedOn: r.ModifiedOn,
      ValidFrom: r.Values[7],
      ValidTo: r.ValidTo,
    } as IUnauthorizedOverdraftRow));
  }

  showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
    showTooltip(e, kendoTooltipInstance)
}
