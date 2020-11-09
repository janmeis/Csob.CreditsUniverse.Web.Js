import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppCommonModule } from 'projects/app-common/src/lib/app-common.module';
import { ProductMultiselectComponent } from './components/product-multiselect/product-multiselect.component';
import { ContractConditionsDetailComponent } from './contract-conditions-detail/contract-conditions-detail.component';
import { ContractConditionsOverviewComponent } from './contract-conditions-overview/contract-conditions-overview.component';
import { ContractConditionsRoutingModule } from './contract-conditions-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ContractConditionsRoutingModule,
        AppCommonModule,
    ],
    declarations: [
        ContractConditionsOverviewComponent,
        ProductMultiselectComponent,
        ContractConditionsDetailComponent,
    ],
})
export class ContractConditionsModule { }
