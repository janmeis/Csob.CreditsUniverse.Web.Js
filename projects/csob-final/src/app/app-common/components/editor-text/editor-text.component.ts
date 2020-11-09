import { AfterViewInit, Component, EventEmitter, Injector, Input, Optional, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { ControlContainer, NgForm, NgModelGroup } from '@angular/forms';
import { NumericTextBoxComponent } from '@progress/kendo-angular-inputs';
import { NumberFormatOptions } from '@progress/kendo-angular-intl';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { TranslationService } from 'projects/services/src/public-api';
import { hideTooltip, showTooltip } from '../../common-functions';
import { EditorValidate, EditorValidation, IValidableEditor } from '../../directives/editor-validator.directive';
import { uniqueId } from '../../uniqueId';

type modeType = 'text' | 'number' | 'currency' | 'multiline' | 'numberAsText';

declare var kendo: any;

@Component({
    // tslint:disable-next-line: component-selector
    selector:  'editor-text',
    templateUrl: './editor-text.component.html',
    styleUrls: ['./editor-text.component.less'],
    viewProviders: [{
        provide: ControlContainer,
        deps: [NgForm, [new Optional(), NgModelGroup]],
        useFactory: (ngForm: NgForm, ngModelGroup: NgModelGroup): ControlContainer => ngModelGroup || ngForm
    }],
})
export class EditorTextComponent implements IValidableEditor, AfterViewInit {
    private _value: any = null

    @ViewChild('numericInput') numericInput: NumericTextBoxComponent;

    get value(): any {
        return this._value;
    }
    @Input() set value(x) {
        this._value = x;
        this.valueChange.emit(x);
    }

    private _readonly: boolean = null
    get readonly(): boolean {
        return this._readonly;
    }
    @Input() set readonly(x: boolean) {
        this._readonly = x;
        this.readonlyChange.emit(x);
    }
    @Output() valueChange = new EventEmitter<any>()
    @Output() readonlyChange = new EventEmitter<boolean>()
    @Input() required: boolean = false
    @Input() minlength: number = 0
    @Input() maxlength: number = undefined
    @Input() numdecplaces: number = 28
    @Input() isTransparent: boolean = false;
    @Input() maxValue: number;
    @Input() tabIndex: number; // tab index pro focus na dalsi prvek pres klavesy Enter ci KeyDown
    @Input() autoCorrect: boolean = false; // pokud je nastaveno, nejde vložit např. hodnota větší než je maximální
    @Input() autofocus = false;

    get numfracplaces(): number {
        return this.formatOptions.maximumFractionDigits;
    }

    @Input('numfracplaces')
    set numfracplaces(value: number) {
        this.formatOptions.maximumFractionDigits = value;
    }

    @Input() name = uniqueId('edtx-');
    @Input() label: string;
    @Input() noLabel = ''
    @Input() placeholder = '';
    @Input() mode: modeType = 'text';
    @Output() validate = new EventEmitter<EditorValidation>(false/*isasync*/);
    @Output() blur = new EventEmitter<FocusEvent>();

    formatOptions: NumberFormatOptions = {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 8
    };
    sourceElement: null;

    onValidate = (c) => EditorValidate(c, this);

    pipeArg(): string {
        return `0.0-${this.formatOptions.maximumFractionDigits}`;
    }
    constructor(private viewContainer: ViewContainerRef) {
    }

    ngAfterViewInit() {
        if (this.tabIndex == undefined || this.tabIndex == null || !this.numericInput) {
            return;
        }

        const nativeElement = kendo.jQuery(this.numericInput.numericInput);

        if (nativeElement && nativeElement[0]) { // melo by vzdy platit, ale pro jistotu
            const inputElement = nativeElement[0].nativeElement;
            // musi byt pouzito keyup, v keypress nefunguji klavesy jako sipka dolu
            inputElement.addEventListener('keyup', this.onKeyUp.bind(this));
        }
    }

    getPreviousTabableElement(): HTMLElement {
        let htmlElement: HTMLElement;

        let previousTabIndex = this.tabIndex - 1;

        while (previousTabIndex > 0) {
            const previousInput = document.querySelectorAll('[tabIndex="' + previousTabIndex + '"]');

            if (previousInput[0] && previousInput[0].clientHeight != 0) { // timto odfiltruju hidden elementy
                htmlElement = (previousInput[0] as HTMLElement);
                break;
            }

            previousTabIndex--;
        }

        return htmlElement;
    }

    getNextTabableElement(): HTMLElement {
        let htmlElement: HTMLElement;

        let increment = 1;
        const maxIncrement = 30;

        while (!htmlElement) {
            const nextInput = document.querySelectorAll('[tabIndex="' + (this.tabIndex + increment) + '"]');

            if (nextInput[0] && nextInput[0].clientHeight != 0) { // timto odfiltruju hidden elementy
                htmlElement = (nextInput[0] as HTMLElement);
            }

            increment++;

            if (increment > maxIncrement) {
                break;
            }
        }

        return htmlElement;
    }

    onKeyUp($event) {
        if ($event.key == 'Enter' || $event.key == 'Down' || $event.key == 'ArrowDown') {
            const nextTabableElement = this.getNextTabableElement();
            if (nextTabableElement) {
                nextTabableElement.focus();
            } else {
                console.warn('Next tabable EditorText not found')
            }
        } else if ($event.key == 'Up' || $event.key == 'ArrowUp') {
            const prevTabableElement = this.getPreviousTabableElement();
            if (prevTabableElement) {
                prevTabableElement.focus();
            } else {
                console.warn('Previous tabable EditorText not found')
            }
        }
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void => showTooltip(e, kendoTooltipInstance, ['SPAN']);

    hideTooltip = (kendoTooltipInstance: TooltipDirective): void => hideTooltip(kendoTooltipInstance);
}
