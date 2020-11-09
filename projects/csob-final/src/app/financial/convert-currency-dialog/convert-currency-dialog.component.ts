import { Component, EventEmitter, Injector, ViewChild, OnInit } from '@angular/core';
import { TranslationService } from 'projects/services/src/public-api';
import { IFinConversionOptions } from 'projects/services/src/public-api';
import { NgForm } from '@angular/forms';
import { AppDialog } from 'projects/app-common/src/public-api';

@Component({
    selector: 'convert-currency-dialog',
    templateUrl: './convert-currency-dialog.component.html',
    styleUrls: ['./convert-currency-dialog.component.less'],
})
export class ConvertCurrencyDialogComponent implements AppDialog, OnInit {
    model: IFinConversionOptions = { CurrencyId: null, UnitKey: null };
    ownRate: boolean = false;
    errMessage: string = null;
    close: Function;
    closed = new EventEmitter<IFinConversionOptions>();
    constructor(private translation: TranslationService) {
    }

    @ViewChild('form') form: NgForm;

    ngOnInit() {
        /* TODO: load this from server */
        if (!this.model.CurrencyId)
            this.model.CurrencyId = 39; //TODO:EUR
        if (!this.model.UnitKey)
            this.model.UnitKey = 3;
        this.ownRate = false;
        if (this.model.OwnCurrencyRate)
            this.ownRate = true;
    }

    public onSubmit() {
        this.errMessage = null;
        if (!this.ownRate) {
            this.model.OwnCurrencyRate = null;
        }
        this.close(this.model);
    }
}
