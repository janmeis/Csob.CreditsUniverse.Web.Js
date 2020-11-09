import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '@progress/kendo-angular-layout';

import { AppCommonModule } from '../app-common/app-common.module';
import { RarocDetailCollateralDialogComponent } from './raroc-detail-collateral-dialog/raroc-detail-collateral-dialog.component';
import { RarocDetailCollateralComponent } from './raroc-detail-collateral/raroc-detail-collateral.component';
import { RarocDetailGeneralComponent } from './raroc-detail-general/raroc-detail-general.component';
import { RarocDetailProductDialogComponent } from './raroc-detail-product-dialog/raroc-detail-product-dialog.component';
import { RarocDetailProductComponent } from './raroc-detail-product/raroc-detail-product.component';
import { RarocDetailResultComponent } from './raroc-detail-result/raroc-detail-result.component';
import { RarocDetailComponent } from './raroc-detail/raroc-detail.component';
import { RarocOverviewComponent } from './raroc-overview/raroc-overview.component';
import { RarocProductCollateralDialogComponent } from './raroc-product-collateral-dialog/raroc-product-collateral-dialog.component';
import { RarocRoutingModule } from './raroc-routing.module';
import { RarocExportDialogComponent } from './raroc-export-dialog/raroc-export-dialog.component';
import { RarocProductCollateralService } from './raroc-detail-product-dialog/raroc-product-collateral.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RarocRoutingModule,
        AppCommonModule,
        LayoutModule
    ],
    declarations: [
        RarocOverviewComponent,
        RarocDetailComponent,
        RarocDetailGeneralComponent,
        RarocDetailProductComponent,
        RarocDetailProductDialogComponent,
        RarocDetailCollateralComponent,
        RarocDetailCollateralDialogComponent,
        RarocProductCollateralDialogComponent,
        RarocDetailResultComponent,
        RarocExportDialogComponent
    ],
    providers: [
        RarocProductCollateralService
    ],
    exports: [
    ]
})
export class RarocModule { }
