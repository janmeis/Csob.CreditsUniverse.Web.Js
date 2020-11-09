import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BaseFilterCellComponent, ColumnComponent, FilterService } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { interval, Subject } from 'rxjs';
import { debounce } from 'rxjs/operators';

@UntilDestroy()
@Component({
    // tslint:disable-next-line: component-selector
    selector: 'full-text-filter',
    templateUrl: './full-text-filter.component.html',
    styleUrls: ['./full-text-filter.component.less'],
})
export class FullTextFilterComponent extends BaseFilterCellComponent implements OnInit {
    @Input() filter: CompositeFilterDescriptor;
    @Input() column: ColumnComponent;
    @Input() operator = 'contains';
    @Input() filterDelay = 500;

    model: string;
    private modelChanged = new Subject<string>();

    constructor(filterService: FilterService) {
        super(filterService);
    }

    ngOnInit(): void {
        this.modelChanged.pipe(
            untilDestroyed(this),
            debounce(_ => interval(this.filterDelay))
        ).subscribe(searchText => {
            this.applyFilter(
                searchText === null  // value of the default item
                    ? this.removeFilter(this.column.field)  // remove the filter
                    : this.updateFilter({ // add a filter for the field with the value
                        field: this.column.field,
                        operator: this.operator,
                        value: searchText
                    })
            ); // update the root filter
        });
    }

    public onKeyUp(): void {
        this.modelChanged.next(this.model);
    }
}
