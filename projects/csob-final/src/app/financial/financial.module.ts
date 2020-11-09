import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@progress/kendo-angular-layout';
// Components
import { AppCommonModule } from '../app-common/app-common.module';
import { ConvertCurrencyDialogComponent } from './convert-currency-dialog/convert-currency-dialog.component';
import { FinancialCommentDialogComponent } from './financial-comment-dialog/financial-comment-dialog.component';
import { FinancialCopyDialogComponent } from './financial-copy-dialog/financial-copy-dialog.component';
import { FinancialDataImportDialogComponent } from './financial-data-import-dialog/financial-data-import-dialog.component';
import { FinancialDetailComponent } from './financial-detail/financial-detail.component';
import { FinancialExportDialogComponent } from './financial-export-dialog/financial-export-dialog.component';
import { FinancialNewDialogComponent } from './financial-new-dialog/financial-new-dialog.component';
import { FinancialOverviewComponent } from './financial-overview/financial-overview.component';
import { FinancialRoutingModule } from './financial-routing.module';
import { FinancialStatementSelectDialogComponent } from './financial-select-dialog/financial-select-dialog.component';
import { FinancialStressParamsDialogComponent } from './financial-stress-params-dialog/financial-stress-params-dialog.component';
import { FinancialViewHeaderComponent } from './financial-view-header/financial-view-header.component';
import { FinancialViewComponent } from './financial-view/financial-view.component';
import { FinancialDomainService } from './services/financial-domain.service';

@NgModule({
    imports: [
        CommonModule,
        FinancialRoutingModule,
        FormsModule,
        AppCommonModule,
        ReactiveFormsModule,
        LayoutModule,
    ],
    declarations: [
        FinancialOverviewComponent,
        FinancialDetailComponent,
        FinancialNewDialogComponent,
        FinancialCopyDialogComponent,
        FinancialExportDialogComponent,
        ConvertCurrencyDialogComponent,
        FinancialStatementSelectDialogComponent,
        FinancialViewComponent,
        FinancialCommentDialogComponent,
        FinancialStressParamsDialogComponent,
        FinancialViewHeaderComponent,
        FinancialDataImportDialogComponent,
    ],
    providers: [
        FinancialDomainService
    ],
    exports: [
        FinancialViewComponent,
    ]
})
export class FinancialModule { }
