import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { AppCommonModule } from 'projects/app-common/src/lib/app-common.module';
import { AppShellModule } from '../app-shell/app-shell.module';
import { SelectorKbcDialogComponent } from './components/selector-kbc-dialog/selector-kbc-dialog.component';
import { PartyCreditFileManageDialogComponent } from './party-credit-file-manage-dialog/party-credit-file-manage-dialog.component';
import { PartyCreditFileManagementDialogComponent } from './party-credit-file-management-dialog/party-credit-file-management-dialog.component';
import { PartyCreditFileManagementOverviewComponent } from './party-credit-file-management-overview/party-credit-file-management-overview.component';
import { PartyCreditInfoDetailNewComponent } from './party-credit-info-detail-new/party-credit-info-detail-new.component';
import { PartyDetailAddressComponent } from './party-detail-address/party-detail-address.component';
import { PartyDetailComponent } from './party-detail/party-detail.component';
import { PartyGeneralDetailComponent } from './party-general-detail/party-general-detail.component';
import { PartyLinksDetailComponent } from './party-links-detail/party-links-detail.component';
import { PartyLinksLoadDialogComponent } from './party-links-load-dialog/party-links-load-dialog.component';
import { PartyLinksOverviewComponent } from './party-links-overview/party-links-overview.component';
import { PartyRoutingModule } from './party-routing.module';
import { PartySearchCriteriaComponent } from './party-search-criteria/party-search-criteria.component';
import { PartySearchDialogComponent } from './party-search-dialog/party-search-dialog.component';
import { PartySearchDialogService } from './party-search-dialog/party-search-dialog.service';
import { PartySearchComponent } from './party-search/party-search.component';
import { TestPageComponent } from './test-page/test-page.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        LayoutModule,
        PartyRoutingModule,
        AppCommonModule,
        AppShellModule,
    ],
    providers: [PartySearchDialogService],
    declarations: [
        PartySearchComponent,
        PartyDetailComponent,
        TestPageComponent,
        PartySearchDialogComponent,
        PartyLinksOverviewComponent,
        PartyLinksDetailComponent,
        PartyCreditInfoDetailNewComponent,
        PartyGeneralDetailComponent,
        SelectorKbcDialogComponent,
        PartyLinksLoadDialogComponent,
        PartyDetailAddressComponent,
        PartySearchCriteriaComponent,
        PartyCreditFileManagementOverviewComponent,
        PartyCreditFileManagementDialogComponent,
        PartyCreditFileManageDialogComponent
    ]
})
export class PartyModule { }
