import { IFinConversionOptions, EFinDataTabOrder } from './../../services/webapi/webapi-models';
import { Component, EventEmitter, Injector, Input, Output, ViewEncapsulation, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { EditorValidation } from '../../app-common/directives/editor-validator.directive';
import { getDecimalPlaces, getPrecision, tryParseNumber } from '../../app-common/numbers';
import { TranslationService } from '../../services/translation-service';
import { FinancialApiService } from '../../services/webapi/financial-api-service';
import { EFont, EStateFinData, ETypeOfStatement, IFinStatDataDto, IFinStatHeaderDto, IFinStatItemDto, IFinStatRowDto, IFinStatTabDto } from '../../services/webapi/webapi-models';
import { UserNotificationService } from 'src/app/services/user-notification.service';
import { UserProgressService } from 'src/app/services/user-progress.service';
import { UserBlobService } from '../../app-common/services/user-blob-service';

function validateDecimal(
    value: number,
    label: string,
    translation: TranslationService,
    errors: string[],
    digitsBefore: number = 16, digitsAfter = 5) {
    if (getDecimalPlaces(value) > digitsBefore)
        errors.push(translation.$$get('financial_view.value_must_have_maximum_x_numbers_before_decimal_separator', label, digitsBefore));
    else if (getPrecision(value) > digitsAfter)
        errors.push(translation.$$get('financial_view.value_must_have_maximum_x_numbers_after_decimal_separator', label, digitsAfter));
}

@Component({
    selector: 'app-financial-view',
    templateUrl: './financial-view.component.html',
    styleUrls: ['./financial-view.component.less'],
    encapsulation: ViewEncapsulation.None
})

export class FinancialViewComponent {
    @ViewChild('divToScroll') divToScroll: ElementRef;
    private _dataSource: IFinStatDataDto;
    get dataSource(): IFinStatDataDto {
        return this._dataSource;
    }
    @Input() set dataSource(x) {
        this._dataSource = x;
        this.dataSourceChanged.emit(this.dataSource);
    }

    @Input() conversion: IFinConversionOptions;
    @Input() isLeasing = false; // determined by Cuid.HasValue on PartyHeader

    @Input() selectedTab: IFinStatTabDto;
    @Input() isLocalStorageLockIdMonitoringEnabled: boolean;

    @Output() dataSourceChanged = new EventEmitter<IFinStatDataDto>();
    @Output() dirtyChanged = new EventEmitter<IFinStatDataDto>();
    @Output() tabSelected = new EventEmitter<IFinStatTabDto>();
    @Output() formChanged = new EventEmitter<boolean>();
    @Output() specialHeaderChanged = new EventEmitter<{ header: IFinStatHeaderDto, name: string }>();
    @Output() formValid = new EventEmitter<boolean>();
    @Output() commentEdit = new EventEmitter<{ data: IFinStatItemDto, row: IFinStatRowDto, isEditable: boolean }>();

    EStateFinData: typeof EStateFinData = EStateFinData;

    private _isHeaderCollapsed: boolean;
    get isHeaderCollapsed(): boolean {
        return this._isHeaderCollapsed;
    }
    @Input() set isHeaderCollapsed(x: boolean) {
        this._isHeaderCollapsed = x;
        this.isHeaderCollapsedChange.emit(this.isHeaderCollapsed);
    }
    @Output() isHeaderCollapsedChange = new EventEmitter<boolean>();

    private _isCollapsed: boolean;
    get isCollapsed(): boolean {
        return this._isCollapsed;
    }
    @Input() set isCollapsed(x: boolean) {
        this._isCollapsed = x;
        this.isCollapsedChange.emit(this.isCollapsed);
    }
    @Output() isCollapsedChange = new EventEmitter<boolean>();

    isImporting = false;

    constructor(
        private finApi: FinancialApiService,
        private translation: TranslationService,
        private notification: UserNotificationService,
        private blob: UserBlobService,
        private progress: UserProgressService
    ) { }
    onTabSelect() {
        this.tabSelected.emit();
    }


	/**
	 * Určuje, zda se mají formátovat čísla, a to na základě vlastností IsOutput aktuální záložky.
	 * Příznak IsOutput mají záložky, jejichž obsah i formátování vrací S1.
	 */
    isFormattingEnabled() {
        return this.selectedTab && !this.selectedTab.IsOutput;
    }

    isRatiosTab() {
        return this.selectedTab && this.selectedTab.TabOrder == EFinDataTabOrder.Ratios;
    }

    hasIdent() {
        return this.selectedTab && this.selectedTab.Rows.some(r => r.RowIdent != undefined && r.RowIdent != null);
    }

    isReadonly() {
        return this.selectedTab && this.dataSource.EditableHeaders == null || this.dataSource.EditableHeaders.length === 0;
    }

    GetJskDoc(idImportFile: number, anchor: HTMLAnchorElement) {
        this.progress.isVisible = true;
        this.blob.processBlob(
            anchor,
            this.finApi.downloadJskDocument(idImportFile),
            () => this.progress.isVisible = false,
            () => this.progress.isVisible = false
        );
    }

    getRowClass(row: IFinStatRowDto) {
        let clsName = `color-${row.ColorKey} indent-${row.Indent} font-${EFont[row.Font]}`;
        //console.log("getRowClass class name", clsName);

        return clsName;
    }

    getIsReportTypeReadonly = (h: IFinStatHeaderDto) => {
        // #6606 FV - multieditace FV - některá pole jsou v hlavičce zobrazena jako read - only
        // if (h.ReportTypeKey == ETypeOfStatement.Model)
        //     return true;
        return false;
    }
    getIsDateReadonly = (h: IFinStatHeaderDto) => {
        // #6607 FV - multieditace - po uložení změn se zobrazuje pole Konce účetního období jako editovatelné
        // if (h.ReportTypeKey == ETypeOfStatement.Model)
        //     return false;
        return true;
    }
    getIsDataItemReadonly = (item: IFinStatItemDto) => {
        if (!item.Editable || this.dataSource.IsLocked)
            return true;
        var h = this.dataSource.ReadonlyHeaders.concat(this.dataSource.EditableHeaders).find(x => x.Id == item.HeaderId);
        if (h && [EStateFinData.OriginalCompleted, EStateFinData.ConvertedCompleted].indexOf(h.StateEnum) >= 0)
            return true;
        return false;
    }
    // normalni required mi nefungoval, kdyz je form pristine
    comboRequiredValidate(label: string, validation: EditorValidation) {
        const value = +validation.value;
        if (isNaN(value) || value <= 0)
            validation.errors.push(this.translation.$$get('financial_view.field_x_is_required', this.translation.$$get(`financial_view.${label}`)));
    }
    numberValidate(allowNegative: boolean, label: string, validation: EditorValidation) {
        if (!validation.value || validation.value.length == 0)
            return;

        const value = tryParseNumber(`${validation.value}`);
        if (!allowNegative && value < 0)
            validation.errors.push(this.translation.$$get('financial_view.value_must_be_a positive_number', label));
        else {
            validateDecimal(value, label, this.translation, validation.errors, 11, 4);
        }
    }
    markFormPristine(form: FormGroup) {
        form.markAsPristine();
        form.markAsUntouched();
    }
    getAllErrors(form: FormGroup | FormArray): { [key: string]: any; } | null {
        let hasError = false;
        const result = Object.keys(form.controls).reduce((acc, key) => {
            const control = form.get(key);
            const errors = (control instanceof FormGroup || control instanceof FormArray)
                ? this.getAllErrors(control)
                : control.errors;
            if (errors) {
                acc[key] = errors;
                hasError = true;
            }
            return acc;
        }, {} as { [key: string]: any; });
        return hasError ? result : null;
    }
    validFrom_changed(item: IFinStatHeaderDto, newValue: Date) {
        item.ValidFrom = newValue;
        this.specialHeaderChanged.emit({ header: item, name: 'validFrom' });
    }
    editCommentClicked(data: IFinStatItemDto, row: IFinStatRowDto, isEditable: boolean) {
        //console.log("editCommentClicked", { data, row });
        this.commentEdit.emit({ data, row, isEditable });
    }
    onToggleHeader(header: IFinStatHeaderDto) {
        header.Expanded = !(header.Expanded || false);
        event.preventDefault();
    }

    getHeaderColspan() {
        if (this.hasIdent()) {
            return 2;
        }

        return 1;
    }

    getColspan1(expanded: boolean, displayPercent: boolean, isHeader = false) {
        if (expanded) {
            return (displayPercent ? 1 : 2);
        } else { // collapsed
            if (this.selectedTab.IsOutput) {
                if (displayPercent) {
                    return expanded ? 3 : 2;
                }
                return expanded ? 3 : 4;
            }

            return (displayPercent ? 2 : 4);
        }
    }

    getRatioColspan(expanded: boolean) {
        if (this.selectedTab.IsOutput) {
            if (this.selectedTab.DisplayPercent) {
                return expanded ? 1 : 2;
            }

            return expanded ? 2 : 3;
        }

        let result = 1;

        if (this.selectedTab.DisplayPercent) {
            result = 2;
        }

        return result + (expanded ? -1 : 0);
    }

    anyConvertedExists() {
        return this.dataSource &&
            this.dataSource.ReadonlyHeaders.concat(this.dataSource.EditableHeaders)
                .some(h => h.StateEnum == EStateFinData.ConvertedCompleted || h.StateEnum == EStateFinData.ConvertedNew);
    }

    isEditableOutput(headerId: number) {
        return this.selectedTab.IsOutput && this.dataSource.EditableHeaders && this.dataSource.EditableHeaders.some(h => h.Id == headerId);
    }
}
