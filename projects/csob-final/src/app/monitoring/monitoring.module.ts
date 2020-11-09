import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from './../app-common/app-common.module';
import { DropdownColorsComponent } from './components/dropdown-colors/dropdown-colors.component';
import { MonitoringDetailInfoDialogComponent } from './monitoring-detail-info-dialog/monitoring-detail-info-dialog.component';
import { MonitoringOverviewComponent } from './monitoring-overview/monitoring-overview.component';
import { MonitoringRoutingModule } from './monitoring-routing.module';
import { ContractTermsFinancialComponent } from './components/contract-terms-financial/contract-terms-financial.component';
import { NegativeInformationExecutionComponent } from './components/negative-information-execution/negative-information-execution.component';
import { ContractTermsNonfinancialComponent } from './components/contract-terms-nonfinancial/contract-terms-nonfinancial.component';
import { PdRatingComponent } from './components/pd-rating/pd-rating.component';
import { NegativeInformationBlacklistComponent } from './components/negative-information-blacklist/negative-information-blacklist.component';
import { NegativeInformationInsolvencyComponent } from './components/negative-information-insolvency/negative-information-insolvency.component';
import { NegativeInformationCruComponent } from './components/negative-information-cru/negative-information-cru.component';
import { NegativeInformationCribisComponent } from './components/negative-information-cribis/negative-information-cribis.component';
import { NegativeInformationPaymentFlowComponent } from './components/negative-information-paymentflow/negative-information-paymentflow.component';
import { NegativeInformationUnauthorizedOverdraftComponent } from './components/negative-information-unauthorized-overdraft/negative-information-unauthorized-overdraft.component';
import { MonitoringSemaphoreDetailComponent } from './monitoring-semaphore-detail/monitoring-semaphore-detail.component';
import { MonitoringSemaphoreHistoryDialogComponent } from './monitoring-semaphore-history-dialog/monitoring-semaphore-history-dialog.component';
import { AppShellModule } from '../app-shell/app-shell.module';
import { MonitoringSemaphoreGroupComponent } from './components/monitoring-semaphore-group/monitoring-semaphore-group.component';
import { MonitoringSemaphoreGroupDetailComponent } from './components/monitoring-semaphore-group-detail/monitoring-semaphore-group-detail.component';
import { NegativeInformationSpecificComponent } from './components/negative-information-specific/negative-information-specific.component';
import { CzechDateOnlyPipe } from './pipes/czech-date-only.pipe';
import { NegativeInformationEwsComponent } from './components/negative-information-ews/negative-information-ews.component';
import { MonitoringOverviewRowComponent } from './components/monitoring-overview-row/monitoring-overview-row.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        AppCommonModule,
        ReactiveFormsModule,
        MonitoringRoutingModule,
        AppShellModule
    ],
    declarations: [
        MonitoringOverviewComponent,
        MonitoringDetailInfoDialogComponent,
        DropdownColorsComponent,
        ContractTermsFinancialComponent,
        NegativeInformationExecutionComponent,
        ContractTermsNonfinancialComponent,
        PdRatingComponent,
        NegativeInformationBlacklistComponent,
        NegativeInformationInsolvencyComponent,
        NegativeInformationCruComponent,
        NegativeInformationCribisComponent,
        NegativeInformationPaymentFlowComponent,
        NegativeInformationUnauthorizedOverdraftComponent,
        MonitoringSemaphoreDetailComponent,
        MonitoringSemaphoreHistoryDialogComponent,
        MonitoringSemaphoreGroupComponent,
        MonitoringSemaphoreGroupDetailComponent,
        NegativeInformationSpecificComponent,
        CzechDateOnlyPipe,
        NegativeInformationEwsComponent,
        MonitoringOverviewRowComponent,
    ],
})
export class MonitoringModule { }
