import { of, Observable } from 'rxjs';
import { Component, EventEmitter, Injector, OnInit, ViewChild } from '@angular/core';
import { CodebooksService } from 'src/app/services/codebooks.service';

import { AppDialog, AppDialogContainerService } from '../../app-common/services/app-dialog-container.service';
import { TranslationService } from '../../services/translation-service';
import { UrlHelperService } from '../../services/url-helper.service';
import { UserProgressService } from '../../services/user-progress.service';
import { FinancialApiService } from '../../services/webapi/financial-api-service';
import { EFormat, EUnit, IFinStatHeaderDto, ECodetable } from '../../services/webapi/webapi-models';
import { NgForm } from '@angular/forms';
import { SelectedPartyService } from '../../services/selected-party.service';
import { FinancialDomainService } from '../services/financial-domain.service';
import { MessageBoxDialogComponent } from 'src/app/app-common/components/message-box-dialog/message-box-dialog.component';

@Component({
    selector: 'app-financial-new-dialog',
    templateUrl: './financial-new-dialog.component.html',
    styleUrls: ['./financial-new-dialog.component.less'],
})
export class FinancialNewDialogComponent implements OnInit, AppDialog {
    close: Function;
    closed = new EventEmitter<number>();
    partyId: number;
    validFrom: Date;
    validTo: Date;
    model = { FormatEnum: EFormat.PoFull } as IFinStatHeaderDto;
    errors: string = null;
    EFormat = EFormat;
    allowedEnumValues: EFormat[] = [EFormat.PoFull, EFormat.InternalCSOB];
    @ViewChild('form') private form: NgForm;
    fiscalYearStartingMonth: number;
    get fiscalYearInvalid() {
        return this.domain.isValidFiscalYearStart(this.validFrom, this.fiscalYearStartingMonth) === false;
    }
    constructor(
        private injector: Injector,
        private codebook: CodebooksService,
        private finApi: FinancialApiService,
        private progress: UserProgressService,
        private translation: TranslationService,
        private selectedParty: SelectedPartyService,
        private domain: FinancialDomainService
    ) {
    }
    ngOnInit(): void {
        this.progress.runProgress(this.codebook.GetCodebook(ECodetable[ECodetable.CurrencyCz]))
            .subscribe(c => {
                this.model.CurrencyId = c[0].Value;
                this.model.UnitKey = EUnit.Thousands;
            });
        this.selectedParty.partyHeader.subscribe(header => {
            this.fiscalYearStartingMonth = header.FiscalYearStartingMonth;
        });
        this.form.form.markAsUntouched();
    }
    getTitle(): string {
        return this.translation.$$get('financial_new_dialog.new_financial_statement');
    }

    onSubmit(): Observable<boolean> {
        if (!this.canSave) return of(false);

        this.model.PartyId = this.partyId;
        this.model.ValidFrom = UrlHelperService.toServerDate(this.validFrom)
        this.model.ValidTo = UrlHelperService.toServerDate(this.validTo)
        this.progress.runAsync(this.finApi.postCreate(this.model))
            .then(r => this.close(r)).then(() => of(true));
    }

    async onClose() {
        if (await this.canSave()) {
            this.close(true);
        } else {
            this.close(false);
        }
    }

    private canSave(): Observable<boolean> | Promise<boolean> | boolean {
        if (!this.form.dirty) return false;

        if (!this.form.valid || !this.model.FormatEnum) return false;

        if (this.progress.running)
            return;
        this.errors = null;
        if (this.validFrom > this.validTo) {
            this.errors = this.translation.$$get('financial_new_dialog.valid_from_date_should_not_be_higher_than_valid_to_date');
            return false;
        }
        if (this.model.FormatEnum === null) {
            this.errors = this.translation.$$get('financial_new_dialog.please_select_format');
            return false;
        }

        return MessageBoxDialogComponent.dirtyConfirmation(this.injector, () => this.onSubmit());
    }


    public static showDialog(injector: Injector, partyId: number) {
        var dlgSvc = injector.get(AppDialogContainerService);
        var dialog = dlgSvc.createDialog(injector, FinancialNewDialogComponent,
            { width: 950 },
            { partyId });
        return dlgSvc.wait(dialog.closed);
    }

    onValidFromValueChanged() {
        // divnoHACK kvůli divnému chování validace v IE, kdy se při zadání hodnoty do validFrom ručně a přeskočení tabem na validTo pole validTo znevalidnilo
        for (const field in this.form.form.controls) {
            const control = this.form.form.get(field); // FormControl
            // této podmínce odpovídá v tomto případě jen a pouze pole validTo
            if (control.updateOn == "blur" && !control.valid && control.touched && control.value == undefined) {
                control.markAsUntouched();
            }
        }
    }
}
