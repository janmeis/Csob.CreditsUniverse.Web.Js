import { Component, Input } from '@angular/core';
import { BaseFilterCellComponent, ColumnComponent, FilterService } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';


@Component({
    // tslint:disable-next-line: component-selector
    selector: 'drop-down-list-filter',
    templateUrl: './drop-down-list-filter.component.html',
    styleUrls: ['./drop-down-list-filter.component.less']
})
export class DropDownListFilterComponent extends BaseFilterCellComponent {
    @Input() filter: CompositeFilterDescriptor;
    @Input() data: any[];
    @Input() column: ColumnComponent;
    @Input() textField: string;
    @Input() valueField: number;

    get selectedValue(): number {
        const filter = this.filterByField(this.column.field);
        return filter ? +filter.value : null;
    }

    constructor(filterService: FilterService) {
        super(filterService);
    }

    public onChange(value: any): void {
        this.applyFilter(
            value === null  // value of the default item
                ? this.removeFilter(this.column.field)  // remove the filter
                : this.updateFilter({ // add a filter for the field with the value
                    field: this.column.field,
                    operator: 'eq',
                    value: value
                })
        ); // update the root filter
    }
}
