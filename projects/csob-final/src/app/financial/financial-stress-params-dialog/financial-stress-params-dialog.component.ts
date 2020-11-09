import { Component, EventEmitter, Injector, OnInit } from '@angular/core';
import { AppDialog, AppDialogContainerService } from 'projects/app-common/src/public-api';
import { EStressAnalysisVariant, FinancialApiService, IFinStatDataDto, IStressAnalysisDto, StressAnalysisDto, TranslationService, UserProgressService } from 'projects/services/src/public-api';
import { EditorValidation } from '../../app-common/directives/editor-validator.directive';

function ensureArrayLength<T>(data: T[], count: number, newItemFactory: (index: number) => T): T[] {
    if (!data) {
        data = [];
    };
    if (data.length == count)
        return data;
    data = [].concat(data);
    if (data.length > count) {
        data.splice(count);
        return data;
    }
    while (data.length < count) {
        data.push(newItemFactory(data.length));
    }
    return data;
}

@Component({
    selector: 'app-financial-stress-params-dialog',
    templateUrl: './financial-stress-params-dialog.component.html',
    styleUrls: ['./financial-stress-params-dialog.component.less'],
})
export class FinancialStressParamsDialogComponent implements OnInit, AppDialog {
    close: Function
    closed = new EventEmitter<IFinStatDataDto>()
    title = ''
    id: number; //idFinStatement
    validTo: Date;
    model: IStressAnalysisDto = new StressAnalysisDto()
    periods: string[] = [];
    errors: string = null;
    get periodCount() {
        return this.model.Values.length;
    }
    set periodCount(value) {
        var cnt = +value;
        if (isNaN(cnt)) {
            cnt = 0;
        }
        this.periods = ensureArrayLength(this.periods, cnt,
            (i) => this.getPeriodName(i));
        this.model.Values = ensureArrayLength(this.model.Values, cnt,
            () => this.model.Values[0] || 0);
        this.model.PeriodNumber = cnt;
    }
    get goalValue() {
        return this.model.Values[0];
    }
    set goalValue(value) {
        for (var i = 0; i < this.model.Values.length; i++) {
            this.model.Values[i] = +value;
        }
    }
    private getPeriodName(i: number) {
        var year = this.validTo.getFullYear() + i + 1;
        var month = this.validTo.getMonth() + 1;
        return `${year}/${month}`;
    }
    EStressAnalysisVariant = EStressAnalysisVariant
    constructor(
        public progress: UserProgressService,
        private finApi: FinancialApiService,
        private translation: TranslationService
    ) {
        this.title = translation.$$get('financial_stress_params_dialog.stress_analysis_parameters');
    }

    ngOnInit() {
        this.model.FinStatHeaderId = this.id;
        this.model.Variant = EStressAnalysisVariant.Basic;
        this.periodCount = 1;
        this.progress.runAsync(this.finApi.getStressAnalysisParams(this.id))
            .then(x => {
                if (x) {
                    this.model = x;
                    this.periodCount = x.Values.length;
                }
            });
    }
    onSubmit() {
        //if variant=basic only first item in array is used/send
        var data = Object.assign({}, this.model);
        if (this.model.Variant == EStressAnalysisVariant.Basic) {
            data.Values = ensureArrayLength(data.Values, 1, null);
        }
        this.progress.runAsync(this.finApi.postSaveAndRunStressAnalysisParams(data))
            .then(x => {
                this.close(x);
            });
    }
    onClose() {
        this.close(null);
    }
    validatePeriods(validation: EditorValidation) {
        var num = +validation.value;
        if (num >= 1 && num <= 10)
            return;
        validation.errors.push(this.translation.$$get('financial_stress_params_dialog.please_enter_number_between_1_and_10'));
    }
    public static showDialog(injector: Injector, id: number, validTo: Date) {
        var dlgsvc = injector.get(AppDialogContainerService);
        var dlg = dlgsvc.createDialog(injector, FinancialStressParamsDialogComponent, { width: 800 }, { id, validTo });
        return dlgsvc.wait(dlg.closed);
    }
}
