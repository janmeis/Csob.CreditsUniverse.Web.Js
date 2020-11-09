import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { DateInputComponent } from '@progress/kendo-angular-dateinputs';
import { BaseFilterCellComponent, ColumnComponent, FilterService } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { CalendarService } from '../../../app-common/services/calendar.service';
import { CurrentLangService } from '../../../services/current-lang-service';

declare var kendo: any;

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'date-filter',
    templateUrl: './date-filter.component.html',
    styleUrls: ['./date-filter.component.less']
})
export class DateFilterComponent extends BaseFilterCellComponent implements OnInit, AfterViewInit {
    @ViewChild('dateInput') dateInput: DateInputComponent;

    @Input() filter: CompositeFilterDescriptor;
    @Input() column: ColumnComponent;
    @Input() format: string;

    get selectedValue() {
        const filter = this.filterByField(this.column.field);
        return filter ? filter.value : null;
    }

    set selectedValue(value: any) {
        this.applyFilter(
            !(value instanceof Date)  // value of the default item
                ? this.removeFilter(this.column.field)  // remove the filter
                : this.updateFilter({ // add a filter for the field with the value
                    field: this.column.field,
                    operator: 'eq',
                    value: value
                })
        ); // update the root filter
    }

    hasDateFilterClass = true;

    constructor(filterService: FilterService,
        private currentLangService: CurrentLangService,
        private calendar: CalendarService
    ) {
        super(filterService);
    }

    ngOnInit(): void {
        if (!this.format)
            this.format = this.currentLangService.getDateFormat();
        this.calendar.setupKendoCulture();
    }

    ngAfterViewInit(): void {
        this.setKendoDatePicker();
    }

    openKendoDatePicker() {
        if (!this.dateInput)
            return;

        const nativeElement = kendo.jQuery(this.dateInput.dateInput.nativeElement);
        const kendoDatePicker = nativeElement.data('kendoDatePicker');
        kendoDatePicker.open();
    }

    isDate = (dt: any): boolean => dt instanceof Date;

    private setKendoDatePicker(): void {
        if (!this.dateInput)
            return;

        const nativeElement = kendo.jQuery(this.dateInput.dateInput.nativeElement);
        // https://demos.telerik.com/kendo-ui/datepicker/index
        nativeElement.kendoDatePicker({
            // display month and year in the input
            format: this.format,

            close: e => {
                // HACK - JVah - oprava chyby na formuláři PD Rating, kdy se v určité situaci nevyvolala událost change při změně data null => current date (bug 5032)
                const currentValue = e.sender.value();
                if (!this.selectedValue)
                    this.selectedValue = currentValue;
            },

            change: e => {
                e.preventDefault();
                const currentValue = e.sender.value();

                if (currentValue && (!this.selectedValue || this.selectedValue.toLocaleDateString() != currentValue.toLocaleDateString()))	// HACK!!! - hodnota zadana pres datepicker nedelala valueChange
                    this.selectedValue = currentValue;
            }
        });

        const kendoDatePicker = nativeElement.data('kendoDatePicker');
        if (kendoDatePicker) {
            kendoDatePicker.readonly(false); // HACK!!! - Finanční data - detail - Začátek účetního období: po ulozeni byva readonly ???
            if (this.selectedValue)
                kendoDatePicker.value(this.selectedValue);
        }
    }
}
