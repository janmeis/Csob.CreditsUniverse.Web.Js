import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Optional, Output, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { ControlContainer, NgForm, NgModel, NgModelGroup } from '@angular/forms';
import { DateInputComponent } from '@progress/kendo-angular-dateinputs';
import { CurrentLangService } from 'src/app/services/current-lang-service';
import { TranslationService } from '../../../services/translation-service';
import { fromDateOnlyString, getToday, toDateOnlyString } from '../../dates';
import { EditorValidate, EditorValidation, IValidableEditor } from '../../directives/editor-validator.directive';
import { CalendarService } from '../../services/calendar.service';
import { uniqueId } from '../../uniqueId';

declare var kendo: any;

@Component({
    // tslint:disable-next-line: component-selector
    selector:  'editor-date',
    templateUrl: './editor-date.component.html',
    styleUrls: ['./editor-date.component.less'],
    viewProviders: [{
        provide: ControlContainer,
        deps: [NgForm, [new Optional(), NgModelGroup]],
        useFactory: (ngForm: NgForm, ngModelGroup: NgModelGroup): ControlContainer => ngModelGroup || ngForm
    }],
})
export class EditorDateComponent implements OnInit, AfterViewInit, OnChanges, IValidableEditor {
    @ViewChild('dateInput') dateInput: DateInputComponent;
    @ViewChild('state') ngModel: NgModel;
    private _value: Date = new Date();
    get value(): Date {
        return this._value;
    }
    @Input() set value(value) {
        this._value = value;
        this.valueChange.emit(this.value);
        const stringValue = toDateOnlyString(this.value);
        this.stringValueChange.emit(stringValue);
    }
    @Output() valueChange = new EventEmitter<Date>();
    @Input() set stringValue(value: string) {
        if (!value || value.length == 0)
            return;

        const parsedDate = fromDateOnlyString(value);
        if (!!parsedDate)
            this._value = parsedDate;  //this will not emit valueChange, do not combine [stringValue]=... and (valueChange)=...
    }
    @Output() stringValueChange = new EventEmitter<string>();
    @Input() format: string;
    @Input() readonly = false;
    @Input() required = false;
    @Input() name = uniqueId('eddt-');
    @Input() label: string;
    @Input() noLabel = '';
    @Input() updateOnBlur = true;
    @Input() placeholder = '';
    @Output() validate = new EventEmitter<EditorValidation>(false/*isasync*/);
    @Input() set disableFuture(v: boolean) {
        this.max = v ? new Date() : this.DATE_MAX;
    }
    @Input() set disablePast(v: boolean) {
        this.min = v ? getToday() : this.DATE_MIN;
    }
    private DATE_MIN = new Date(1900, 0, 1);
    private DATE_MAX = new Date(9999, 11, 31, 23, 59, 59);
    @Input() min = this.DATE_MIN;
    @Input() max = this.DATE_MAX;
    onValidate = (c) => EditorValidate(c, this);

    private get start(): string {
        return this.format.indexOf('d') >= 0 ? 'month' : 'year';
    }

    private get depth(): string {
        return this.format.indexOf('d') >= 0 ? 'month' : 'year';
    }

    constructor(
        private translation: TranslationService,
        private currentLangService: CurrentLangService,
        private viewContainer: ViewContainerRef,
        private calendar: CalendarService
    ) {
    }

    ngOnInit(): void {
        if (!this.format)
            this.format = this.currentLangService.getDateFormat();
        this.calendar.setupKendoCulture();
    }
    ngAfterViewInit(): void {
        this.setKendoDatePicker();
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['readonly'] && !changes['readonly'].firstChange)
            setTimeout(() => this.setKendoDatePicker(), 0);
    }
    private setKendoDatePicker(): void {
        if (this.readonly || !this.dateInput)
            return;

        const nativeElement = kendo.jQuery(this.dateInput.dateInput.nativeElement);
        // https://demos.telerik.com/kendo-ui/datepicker/index
        nativeElement.kendoDatePicker({
            // defines the start view
            start: this.start,
            // defines when the calendar should return date
            depth: this.depth,
            // display month and year in the input
            format: this.format,

            close: e => {
                // HACK - JVah - oprava chyby na formuláři PD Rating, kdy se v určité situaci nevyvolala událost change při změně data null => current date (bug 5032)
                const currentValue = e.sender.value();
                if (!this.value) {
                    this.value = currentValue;
                }
            },

            change: e => {
                e.preventDefault();
                const currentValue = e.sender.value();

                if (currentValue && (!this.value || this.value.toLocaleDateString() != currentValue.toLocaleDateString())) {	// HACK!!! - hodnota zadana pres datepicker nedelala valueChange
                    this.value = currentValue;
                    (this.ngModel.formDirective as NgForm).form.markAsDirty();
                }
            }
        });
        const kendoDatePicker = nativeElement.data('kendoDatePicker');
        if (kendoDatePicker) {
            kendoDatePicker.readonly(false); // HACK!!! - Finanční data - detail - Začátek účetního období: po ulozeni byva readonly ???
            if (this.value)
                kendoDatePicker.value(this.value);
        }
    }
}
