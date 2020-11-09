import { Component, EventEmitter, Injector, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { of, timer } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { markControlsDirty } from 'src/app/app-common/common-functions';
import { EditorCodeBookComponent, GetStaticCodebookProvider, ICodebookProvider } from 'src/app/app-common/components/editor-codebook/editor-codebook.component';
import { MessageBoxDialogComponent } from 'src/app/app-common/components/message-box-dialog/message-box-dialog.component';
import { getToday } from 'src/app/app-common/dates';
import { EditorValidation } from 'src/app/app-common/directives/editor-validator.directive';
import { AppDialog, AppDialogContainerService } from 'src/app/app-common/services/app-dialog-container.service';
import { TranslationService } from 'src/app/services/translation-service';
import { UserNotificationService } from 'src/app/services/user-notification.service';
import { UserProgressService } from 'src/app/services/user-progress.service';
import { ELGDProdCommited, ETimeUnit, EValidationType, ICodebookItem, IRarocProductValueDto } from 'src/app/services/webapi/webapi-models';
import { RarocDetailProductService } from '../raroc-detail-product/raroc-detail-product.service';
import { RarocDetailService } from '../raroc-detail/raroc-detail.service';
import { IsValid } from '../raroc-overview/raroc-overview.component';


@Component({
    selector: 'app-raroc-detail-product-dialog',
    templateUrl: './raroc-detail-product-dialog.component.html',
    styleUrls: ['./raroc-detail-product-dialog.component.less'],
    providers: [
        RarocDetailService,
        RarocDetailProductService,
    ]
})
export class RarocDetailProductDialogComponent implements IsValid, OnInit, AppDialog {
    @ViewChild('form') private form: NgForm;

    close: (e: boolean) => boolean;
    closed = new EventEmitter<boolean>();
    title = this.translation.$$get('raroc_detail_product_dialog.title');
    product: IRarocProductValueDto;
    lgdModelId: number;
    readonly: boolean;

    frequencyUnits = this.rarocDetailService.frequencyUnits;
    monthYear = this.rarocDetailService.monthYear;
    productTypes: ICodebookProvider;
    productSubtypes: ICodebookProvider;
    ucReadOnly = false;
    validations: { [key: string]: EditorValidation; };
    commitedChanged = false;
    productTypeNoValid = false;
    productSubtypeNoValid = false;

    private readonly dueDateValidationMessage = this.translation.$$get('raroc_detail_product_dialog.cannot_set_due_date_unit_and_due_date');

    static show(injector: Injector, product: IRarocProductValueDto, lgdModelId: number, readonly = false): Promise<boolean> {
        const dlgSvc = injector.get(AppDialogContainerService);
        const dlg = dlgSvc.createDialog(injector, RarocDetailProductDialogComponent, { width: window.innerWidth - 200, height: window.innerHeight - 350 }, { product, lgdModelId, readonly });
        return dlgSvc.wait(dlg.closed);
    }

    constructor(
        private injector: Injector,
        private notification: UserNotificationService,
        private progress: UserProgressService,
        private rarocDetailService: RarocDetailService,
        private rarocDetailProductService: RarocDetailProductService,
        private translation: TranslationService
    ) { }

    ngOnInit() {
        this.productTypes = this.rarocDetailProductService.getProductTypes(this.lgdModelId);
        this.productSubtypes = this.rarocDetailProductService.getFilteredProdSubtypes(this.lgdModelId, this.product.ProductTypeCUId);
        this.setProductType(this.product.ProductTypeCUId);
        this.setProdSubtype(this.product.ProductSubTypeCUId);
    }

    productTypeSelectionChange(productTypeItem: ICodebookItem, subType: EditorCodeBookComponent): void {
        if (!productTypeItem)
            return;

        if (this.productTypeNoValid) {
            this.productTypes = this.rarocDetailProductService.getProductTypes(this.lgdModelId);
            this.productTypeNoValid = false;
        }
        subType.value = null;
        this.product.TypeDescription = productTypeItem.Text;
        this.productSubtypes = this.rarocDetailProductService.getFilteredProdSubtypes(this.lgdModelId, productTypeItem.Value);
        this.setProdSubtype(this.product.ProductSubTypeCUId);
    }

    productSubtypeSelectionChange(productSubtypeItem: ICodebookItem): void {
        if (!productSubtypeItem)
            return;

        if (this.productSubtypeNoValid) {
            this.productSubtypes = this.rarocDetailProductService.getFilteredProdSubtypes(this.lgdModelId, this.product.ProductTypeCUId);
            this.productSubtypeNoValid = false;
        }
        if (this.form.dirty)
            this.setProdSubtype(productSubtypeItem.Value);
    }

    ufnValueChange(value: boolean) {
        if (value)
            this.product.DueDate = this.product.DueDateQuantity = this.product.DueDateUnit = null;
    }

    dueDateValueChange(value?: Date) {
        if (value)
            this.product.DueDateQuantity = this.product.DueDateUnit = null;
    }

    expectedDrawdownValidate(validation: EditorValidation) {
        if (!validation.value)
            return;

        if (validation.value > 100.00 || validation.value < 0.00)
            validation.errors.push(this.translation.$$get('raroc_detail_product_dialog.expected_drawdown_less_one_hundred'));
    }

    dueDateValidate(validation: EditorValidation) {
        if (!validation.value || validation.value.length == 0)
            return;

        if (this.product.UFN || this.product.DueDateUnit || this.product.DueDateQuantity)
            validation.errors.push(this.dueDateValidationMessage);
    }

    dueDateUnitValidate(validation: EditorValidation) {
        if (!validation.value || validation.value.length == 0)
            return;

        if (this.product.UFN || this.product.DueDate)
            validation.errors.push(this.dueDateValidationMessage);
    }

    dueDateQuantityValidate(validation: EditorValidation) {
        if (!validation.value || validation.value.length == 0)
            return;

        if (this.product.UFN || this.product.DueDate)
            validation.errors.push(this.dueDateValidationMessage);
        if (+validation.value > 9999)
            validation.errors.push(this.translation.$$get('raroc_detail_product_dialog.too_big_number'));
    }

    async onClose(save: boolean) {
        if (save) {
            if (this.isFormValid()) this.close(true);
        } else {
            const shouldSave = await this.shouldSave();

            if (shouldSave === true && this.isFormValid()) this.close(true);
            if (shouldSave === false) this.close(false);
            // cancel = shouldSave 2 => NOP
        }
    }

    private shouldSave(): Promise<boolean> {
        if (!this.form.dirty) return of(false).toPromise();

        return MessageBoxDialogComponent.dirtyConfirmationWithoutSave(this.injector);
    }

    isFormValid(): boolean {

        this.notification.clear();
        if (this.readonly)
            return false;

        markControlsDirty(this.form.form);
        if (this.form.invalid)
            return false;

        if (!this.isValid()) {
            const validations = this.getValidations();
            this.notification.error(validations);
        }

        return Object.keys(this.validations).length == 0;
    }

    isValid(): boolean {
        this.validations = {};
        if (!this.product.ProductTypeCUId) {
            const validation = { value: null, errors: [this.translation.$$get('field_x_is_required', this.translation.$$get('raroc_detail_product_dialog.type'))] } as EditorValidation;
            this.validations['ProductTypeCUId'] = validation;
        }

        if (!this.product.ProductSubTypeCUId) {
            const validation = { value: null, errors: [this.translation.$$get('field_x_is_required', this.translation.$$get('raroc_detail_product_dialog.subtype'))] } as EditorValidation;
            this.validations['ProductSubTypeCUId'] = validation;
        }

        if (!this.isDueDateValid(this.product.UFN, this.product.DueDate, this.product.DueDateUnit, this.product.DueDateQuantity)) {
            const validation = { value: null, errors: [this.translation.$$get('raroc_detail_product_dialog.cannot_set_due_date_unit_and_due_date')] } as EditorValidation;
            this.validations['DueDate'] = validation;
        }

        if (this.isDueDateInPast(this.product.DueDate)) {
            const dueDatePastValidation = { value: null, errors: [this.translation.$$get('field_x_no_past_date', this.translation.$$get('raroc_detail_product_dialog.Date'))] } as EditorValidation;
            if (!this.validations['DueDate'])
                this.validations['DueDate'] = dueDatePastValidation;
            else
                this.validations['DueDate'].errors.push(dueDatePastValidation.errors[0]);
        }

        if (this.product.ExpectedDrawdown && this.product.ExpectedDrawdown > 100.00 || this.product.ExpectedDrawdown < 0.00) {
            const validation = { value: null, errors: [this.translation.$$get('raroc_detail_product_dialog.expected_drawdown_less_one_hundred')] } as EditorValidation;
            this.validations['ExpectedDrawdown'] = validation;
        }

        return Object.keys(this.validations).length == 0;
    }

    private isDueDateValid(ufn: boolean, due?: Date, unit?: ETimeUnit, quantity?: any): boolean {
        return (ufn && due == null && (unit == null || unit == 0) && (quantity == null || quantity == ''))
            || (!ufn && due != null && (unit == null || unit == 0) && (quantity == null || quantity == ''))
            || (!ufn && due == null && (unit != null && unit > 0) && !(quantity == null || quantity == '' || isNaN(quantity)));
    }

    private isDueDateInPast(due?: Date) {
        return due && due < getToday();
    }

    private setProductType(productTypeId?: number): void {
        if (!productTypeId) {
            if (!this.rarocDetailProductService.isNew(this.product) && this.form.form.controls['productType'])
                this.form.form.controls['productType'].markAsDirty();
            return;
        }

        this.progress.runProgress(
            this.rarocDetailProductService.allProdTypes$(this.lgdModelId).pipe(
                map(m => m.find(s => s.Id == productTypeId))
            )).subscribe(async type => {
                if (!type) {
                    if (this.product.ValiditionType == EValidationType.OKNoValid) {
                        const items = await this.productTypes.getItems();
                        const codebookItem = { Text: this.product.TypeDescription, Value: this.product.ProductTypeCUId } as ICodebookItem;
                        if (!items.find(x => x.Value == codebookItem.Value)) {
                            items.splice(0, 0, codebookItem);
                            this.productTypes = GetStaticCodebookProvider(items);
                        }
                        this.productTypeNoValid = true;
                    } else
                        timer(0).pipe(first()).subscribe(() => {
                            this.product.ProductTypeCUId = null;
                            if (this.form.form.controls['productType'])
                                this.form.form.controls['productType'].markAsDirty();
                        });
                }
            });
    }

    private setProdSubtype(productSubTypeId?: number): void {
        this.productSubtypeNoValid = false;

        if (!productSubTypeId) {
            if (!this.rarocDetailProductService.isNew(this.product) && this.form.form.controls['productSubtype'])
                this.form.form.controls['productSubtype'].markAsDirty();
            return;
        }

        this.progress.runProgress(
            this.rarocDetailProductService.allProdSubtypes$(this.lgdModelId).pipe(
                map(m => m.find(s => s.Id == productSubTypeId))
            )).subscribe(async subType => {
                if (!this.readonly && subType) {
                    this.product.SubTypeDescription = subType.DescriptionL;

                    this.ucReadOnly = subType.LGDProdCommited != ELGDProdCommited.UncommitedAndCommited;
                    if (subType.LGDProdCommited != ELGDProdCommited.UncommitedAndCommited) {
                        const commitedValue = subType.LGDProdCommited == ELGDProdCommited.OnlyCommited;
                        if (this.rarocDetailProductService.isNew(this.product))
                            this.product.Commited = commitedValue;
                        else {
                            this.commitedChanged = this.product.Commited != commitedValue;
                            if (this.commitedChanged)
                                this.product.Commited = commitedValue;
                        }
                    }
                } else if (!subType) {
                    if (this.product.ValiditionType == EValidationType.OKNoValid) {
                        const items = await this.productSubtypes.getItems();
                        const codebookItem = { Text: this.product.SubTypeDescriptionL, Value: this.product.ProductSubTypeCUId } as ICodebookItem;
                        if (!items.find(x => x.Value == codebookItem.Value)) {
                            items.splice(0, 0, codebookItem);
                            this.productSubtypes = GetStaticCodebookProvider(items);
                        }
                        this.productSubtypeNoValid = true;
                    } else
                        timer(0).pipe(first()).subscribe(() => {
                            this.product.ProductSubTypeCUId = null;
                            if (this.form.form.controls['productSubtype'])
                                this.form.form.controls['productSubtype'].markAsDirty();
                        });
                }
            });
    }

    private getValidations(): string {
        const result = [];
        Object.keys(this.validations).forEach(key =>
            result.push(this.validations[key].errors[0])
        );
        return result.length > 0
            ? `${result.join('</span><span class="px-1">')}`
            : null;
    }
}
