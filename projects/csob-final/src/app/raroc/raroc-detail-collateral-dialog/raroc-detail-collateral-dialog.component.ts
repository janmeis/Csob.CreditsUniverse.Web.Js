import { Component, EventEmitter, Injector, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppDialog, AppDialogContainerService } from 'projects/app-common/src/public-api';
import { ETimeUnit, EValidationType, ICodebookItem, IRarocCollateralValueDto, TranslationService, UserNotificationService, UserProgressService } from 'projects/services/src/public-api';
import { of, timer } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { markControlsDirty } from 'projects/app-common/src/public-api'
import { EditorCodeBookComponent, GetStaticCodebookProvider, ICodebookProvider } from 'projects/app-common/src/public-api';
import { MessageBoxDialogComponent } from 'projects/app-common/src/public-api';
import { getToday } from 'projects/app-common/src/public-api';
import { EditorValidation } from 'projects/app-common/src/public-api';
import { RarocDetailCollateralService } from '../raroc-detail-collateral/raroc-detail-collateral.service';
import { RarocDetailService } from '../raroc-detail/raroc-detail.service';
import { IsValid } from '../raroc-overview/raroc-overview.component';


@Component({
    selector: 'app-raroc-detail-collateral-dialog',
    templateUrl: './raroc-detail-collateral-dialog.component.html',
    styleUrls: ['./raroc-detail-collateral-dialog.component.less'],
    providers: [
        RarocDetailService,
        RarocDetailCollateralService
    ]
})
export class RarocDetailCollateralDialogComponent implements IsValid, OnInit, AppDialog {
    @ViewChild('form') private form: NgForm;

    close: (e: boolean) => boolean;
    closed = new EventEmitter<boolean>();
    title = this.translation.$$get('raroc_detail_collateral_dialog.title');
    collateral: IRarocCollateralValueDto;
    lgdModelId: number;
    readonly: boolean;

    monthYear = this.rarocDetailService.monthYear;
    collateralTypes: ICodebookProvider;
    collateralSubtypes: ICodebookProvider;
    validations: { [key: string]: EditorValidation; };
    collateralTypeNoValid = false;
    collateralSubtypeNoValid = false;

    private readonly dueDateValidationMessage = this.translation.$$get('raroc_detail_collateral_dialog.cannot_set_due_date_unit_and_due_date');

    constructor(
        private injector: Injector,
        private notification: UserNotificationService,
        private progress: UserProgressService,
        private rarocDetailService: RarocDetailService,
        private rarocDetailCollateralService: RarocDetailCollateralService,
        private translation: TranslationService
    ) { }

    static show(injector: Injector, collateral: IRarocCollateralValueDto, lgdModelId: number, readonly = false): Promise<boolean> {
        const dlgSvc = injector.get(AppDialogContainerService);
        const dlg = dlgSvc.createDialog(injector, RarocDetailCollateralDialogComponent, { width: window.innerWidth }, { collateral, lgdModelId, readonly });
        return dlgSvc.wait(dlg.closed);
    }

    ngOnInit() {
        this.collateralTypes = this.rarocDetailCollateralService.getCollateralTypes(this.lgdModelId);
        this.collateralSubtypes = this.rarocDetailCollateralService.getFilteredCollateralSubtypes(this.lgdModelId, this.collateral.CollateralTypeCUId);
        this.setCollateralType(this.collateral.CollateralTypeCUId);
        this.setCollateralSubtype(this.collateral.CollateralSubTypeCUId);
    }

    collateralTypeSelectionChange(collateralTypeItem: ICodebookItem, subType: EditorCodeBookComponent): void {
        if (!collateralTypeItem)
            return;

        if (this.collateralTypeNoValid) {
            this.collateralTypes = this.rarocDetailCollateralService.getCollateralTypes(this.lgdModelId);
            this.collateralTypeNoValid = false;
        }
        subType.value = null;
        this.collateral.TypeDescription = collateralTypeItem.Text;
        this.collateralSubtypes = this.rarocDetailCollateralService.getFilteredCollateralSubtypes(this.lgdModelId, collateralTypeItem.Value);
        this.setCollateralSubtype(this.collateral.CollateralSubTypeCUId);
    }

    collateralSubTypeSelectionChange(collateralSubtypeItem: ICodebookItem) {
        if (!collateralSubtypeItem)
            return;

        if (this.collateralSubtypeNoValid) {
            this.collateralSubtypes = this.rarocDetailCollateralService.getFilteredCollateralSubtypes(this.lgdModelId, this.collateral.CollateralTypeCUId);
            this.collateralSubtypeNoValid = false;
        }
        this.setCollateralSubtype(collateralSubtypeItem.Value);
    }

    pledgeValueChange(pledgeValue: number) {
        if (pledgeValue)
            this.calculateCollateralValue(pledgeValue);
    }

    ufnValueChange(value: boolean) {
        if (value)
            this.collateral.DueDate = this.collateral.DueDateQuantity = this.collateral.DueDateUnit = null;
    }

    dueDateValueChange(value: any) {
        if (value)
            this.collateral.DueDateQuantity = this.collateral.DueDateUnit = null;
    }

    dueDateValidate(validation: EditorValidation) {
        if (!validation.value || validation.value.length == 0)
            return;

        if (this.collateral.ExpirationByProduct || this.collateral.DueDateUnit || this.collateral.DueDateQuantity)
            validation.errors.push(this.dueDateValidationMessage);
    }
    dueDateUnitValidate(validation: EditorValidation) {
        if (!validation.value || validation.value.length == 0)
            return;

        if (this.collateral.ExpirationByProduct || this.collateral.DueDate)
            validation.errors.push(this.dueDateValidationMessage);
    }

    dueDateQuantityValidate(validation: EditorValidation) {
        if (!validation.value || validation.value.length == 0)
            return;

        if (this.collateral.ExpirationByProduct || this.collateral.DueDate)
            validation.errors.push(this.dueDateValidationMessage);
        if (+validation.value > 9999)
            validation.errors.push(this.translation.$$get('raroc_detail_collateral_dialog.too_big_number'));
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
        if (!this.collateral.CollateralTypeCUId) {
            const validation = { value: null, errors: [this.translation.$$get('field_x_is_required', this.translation.$$get('raroc_detail_collateral_dialog.type'))] } as EditorValidation;
            this.validations['CollateralTypeCUId'] = validation;
        }

        if (!this.collateral.CollateralSubTypeCUId) {
            const validation = { value: null, errors: [this.translation.$$get('field_x_is_required', this.translation.$$get('raroc_detail_collateral_dialog.subtype'))] } as EditorValidation;
            this.validations['CollateralSubTypeCUId'] = validation;
        }

        if (!this.isDueDateValid(this.collateral.ExpirationByProduct, this.collateral.DueDate, this.collateral.DueDateUnit, this.collateral.DueDateQuantity)) {
            const validation = { value: null, errors: [this.translation.$$get('raroc_detail_collateral_dialog.cannot_set_due_date_unit_and_due_date')] } as EditorValidation;
            this.validations['DueDate'] = validation;
        }

        if (this.isDueDateInPast(this.collateral.DueDate)) {
            const dueDatePastValidation = { value: null, errors: [this.translation.$$get('field_x_no_past_date', this.translation.$$get('raroc_detail_collateral_dialog.Date'))] } as EditorValidation;
            if (!this.validations['DueDate'])
                this.validations['DueDate'] = dueDatePastValidation;
            else
                this.validations['DueDate'].errors.push(dueDatePastValidation.errors[0]);
        }
        return Object.keys(this.validations).length == 0;
    }

    private isDueDateValid(expirationByProduct: boolean, due?: Date, unit?: ETimeUnit, quantity?: any): boolean {
        return (expirationByProduct && due == null && (unit == null || unit == 0) && (quantity == null || quantity == ''))
            || (!expirationByProduct && due != null && (unit == null || unit == 0) && (quantity == null || quantity == ''))
            || (!expirationByProduct && due == null && (unit != null && unit > 0) && !(quantity == null || quantity == '' || isNaN(quantity)));
    }

    private isDueDateInPast(due?: Date) {
        return due && due < getToday();
    }

    private setCollateralType(collateralTypeId?: number): void {
        if (!collateralTypeId) {
            if (!this.rarocDetailCollateralService.isNew(this.collateral) && this.form.form.controls['collateralType'])
                this.form.form.controls['collateralType'].markAsDirty();
            return;
        }

        this.progress.runProgress(
            this.rarocDetailCollateralService.allCollateralTypes$(this.lgdModelId).pipe(
                map(m => m.find(s => s.Id == collateralTypeId))
            )).subscribe(async type => {
                if (!type) {
                    if (this.collateral.ValiditionType == EValidationType.OKNoValid) {
                        const items = await this.collateralTypes.getItems();
                        const codebookItem = { Text: this.collateral.TypeDescription, Value: this.collateral.CollateralTypeCUId } as ICodebookItem;
                        if (!items.find(x => x.Value == codebookItem.Value)) {
                            items.splice(0, 0, codebookItem);
                            this.collateralTypes = GetStaticCodebookProvider(items);
                        }
                        this.collateralTypeNoValid = true;
                    } else
                        timer(0).pipe(first()).subscribe(() => {
                            this.collateral.CollateralTypeCUId = null;
                            if (this.form.form.controls['collateralType'])
                                this.form.form.controls['collateralType'].markAsDirty();
                        });
                }
            });
    }

    private setCollateralSubtype(collateralSubTypeId: number): void {
        this.collateralSubtypeNoValid = false;

        if (!collateralSubTypeId) {
            if (!this.rarocDetailCollateralService.isNew(this.collateral) && this.form.form.controls['collateralSubtype'])
                this.form.form.controls['collateralSubtype'].markAsDirty();
            return;
        }

        this.progress.runProgress(
            this.rarocDetailCollateralService.allCollateralSubtypes$(this.lgdModelId).pipe(
                map(m => m.find(x => x.Id == collateralSubTypeId))
            )).subscribe(async subType => {
                if (!this.readonly && subType) {
                    this.collateral.SubTypeDescription = subType.DescriptionL;

                    this.collateral.RecoveryRateStandard = subType.RecoveryRateStandard;
                    this.calculateCollateralValue(this.collateral.PledgeValue);
                } else if (!subType) {
                    if (this.collateral.ValiditionType == EValidationType.OKNoValid) {
                        const items = await this.collateralSubtypes.getItems();
                        const codebookItem = { Text: this.collateral.SubTypeDescriptionL, Value: this.collateral.CollateralSubTypeCUId } as ICodebookItem;
                        if (!items.find(x => x.Value == codebookItem.Value)) {
                            items.splice(0, 0, codebookItem);
                            this.collateralSubtypes = GetStaticCodebookProvider(items);
                        }
                        this.collateralSubtypeNoValid = true;
                    } else
                        timer(0).pipe(first()).subscribe(() => {
                            this.collateral.CollateralSubTypeCUId = null;
                            if (this.form.form.controls['collateralSubtype'])
                                this.form.form.controls['collateralSubtype'].markAsDirty();
                        });
                }
            });
    }

    private calculateCollateralValue(pledgeValue: number) {
        if (!isNaN(+this.collateral.RecoveryRateStandard)) {
            this.collateral.CollateralValue = pledgeValue * (this.collateral.RecoveryRateStandard / 100);
        }
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
