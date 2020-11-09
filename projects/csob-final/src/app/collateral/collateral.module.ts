import { CommonModule } from "@angular/common";
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppCommonModule } from 'projects/app-common/src/lib/app-common.module';
import { CollateralOverviewComponent } from './collateral-overview/collateral-overview.component';
import { CollateralRoutingModule } from './collateral-routing.module';
import { ProductModule } from '../product/product.module';
import { CollateralDetailHeaderComponent } from './collateral-detail-header/collateral-detail-header.component';
import { LayoutModule } from '@progress/kendo-angular-layout';

@NgModule({
    imports: [
        ReactiveFormsModule,
        CommonModule,
        LayoutModule,
        AppCommonModule,
        CollateralRoutingModule,
        FormsModule,
        ProductModule,
    ],
    declarations: [
        CollateralOverviewComponent,
        CollateralDetailHeaderComponent,
    ]
})
export class CollateralModule {
}
