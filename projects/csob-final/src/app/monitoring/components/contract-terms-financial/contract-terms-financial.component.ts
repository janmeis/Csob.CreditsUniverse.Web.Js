import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RowClassArgs } from '@progress/kendo-angular-grid';
import { fixToNumber } from 'src/app/app-common/common-functions';
import { GetStaticCodebookProvider, ICodebookProvider } from 'src/app/app-common/components/editor-codebook/editor-codebook.component';
import { EditorValidation } from 'src/app/app-common/directives/editor-validator.directive';
import { TranslationService } from 'src/app/services/translation-service';
import { EMonitoringCategory, ICodebookItem, IMonitoringCellEditDto, IMonitoringCellEditRowDto } from 'src/app/services/webapi/webapi-models';
import { getLinkClicked } from '../../monitoring-overview/monitoring-overview-utils';

@Component({
    selector: 'app-contract-terms-financial',
    templateUrl: './contract-terms-financial.component.html',
    styleUrls: ['./contract-terms-financial.component.less'],
})
export class ContractTermsFinancialComponent implements OnChanges {
    @Input() model: IMonitoringCellEditDto;
    @Input() readonly = false;
    @Output() detailLinkHandler = new EventEmitter<string>();
    monthProvider: ICodebookProvider;
    inputIndex = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private translation: TranslationService,
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['model'] && !!this.model.InputRows && this.model.InputRows.length > 0) {
            const datePipe = new DatePipe('CS-cz');
            const monthItems = this.model.InputRows.map((r, index) => ({ Value: index, Text: datePipe.transform(r.EOM, 'MM/yyyy') } as ICodebookItem));
            this.monthProvider = GetStaticCodebookProvider(monthItems);
        }
    }

    getRowClass = (context: RowClassArgs): string => {
        if (context && context.dataItem as IMonitoringCellEditRowDto) {
            const row = context.dataItem as IMonitoringCellEditRowDto;
            const percentage = fixToNumber(row.FulfillmentPercentage);
            if (this.model.IsCustom)
                return (!row.Fulfilled && percentage < 0) ? 'not-fulfilled-spec' : '';
            else
                return (!row.Fulfilled && percentage < 0) ? 'not-fulfilled' : '';
        }

        return '';
    }

    onFinancialValueValidate(validation: EditorValidation) {
        if (!validation.value)
            return;

        if (Math.abs(validation.value) > 9999999999999.00)
            validation.errors.push(this.translation.$$get('contract_terms_financial.financial_value_too_big'));
        if (/^\d+[,\.]\d{6,}$/.test(`${validation.value}`))  // fraction more than 5 digits
            validation.errors.push(this.translation.$$get('contract_terms_financial.financial_value_fraction_error'));
    }

    onLinkClicked(link: string[]) {
        const url = getLinkClicked(link, EMonitoringCategory.ContractTermsFinancial, this.route, this.router);
        if (url.length > 0)
            this.detailLinkHandler.emit(url);
    }
}
