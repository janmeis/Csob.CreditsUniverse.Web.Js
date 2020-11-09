import { QuestionEssCountryComponent } from './components/question-ess-country/question-ess-country.component';
import { PdRatingExportDialogComponent } from './components/pd-rating-export-dialog/pd-rating-export-dialog.component';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCommonModule } from 'projects/app-common/src/lib/app-common.module';
import { PdRatingSelectDialogComponent } from './components/pd-rating-select-dialog/pd-rating-select-dialog.component';
import { PdRatingSelectDialogService } from './components/pd-rating-select-dialog/pd-rating-select-dialog.service';
import { PdRatingViewComponent } from './components/pd-rating-view/pd-rating-view.component';
import { QuestionBoolComponent } from './components/question-bool/question-bool.component';
import { QuestionEssComponent } from './components/question-ess/question-ess.component';
import { QuestionListEnumComponent } from './components/question-list-enum/question-list-enum.component';
import { QuestionNumberComponent } from './components/question-number/question-number.component';
import { PDRatingDetailComponent } from './pd-rating-detail/pd-rating-detail.component';
import { PDRatingOverviewComponent } from './pd-rating-overview/pd-rating-overview.component';
import { PDRatingNewComponent } from './pd-rating-new/pd-rating-new.component';
import { PdRatingRoutingModule } from './pd-rating-routing.module';
import { FinancialModule } from '../financial/financial.module';
import { PdRatingItemValueComponent } from './components/pd-rating-item-value/pd-rating-item-value.component';
import { QuestionComboComponent } from './components/question-combo/question-combo.component';
import { LabelEssComponent } from './components/label-ess/label-ess.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        AppCommonModule,
        PdRatingRoutingModule,
        FinancialModule,
        LayoutModule,
    ],
    declarations: [
        PDRatingOverviewComponent,
        PDRatingNewComponent,
        PDRatingDetailComponent,
        QuestionBoolComponent,
        QuestionListEnumComponent,
        QuestionNumberComponent,
        QuestionEssComponent,
        QuestionComboComponent,
        QuestionEssCountryComponent,
        PdRatingViewComponent,
        PdRatingItemValueComponent,
        PdRatingSelectDialogComponent,
        PdRatingExportDialogComponent,
        LabelEssComponent,
    ],
    providers: [
        PdRatingSelectDialogService,
    ]
})
export class PdRatingModule {
}
