import { ProductApiService } from 'src/app/services/webapi/product-api-service';
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AppCommonModule } from "../app-common/app-common.module";
import { ProductCollateralDialogComponent } from './product-collateral-dialog/product-collateral-dialog.component';
import { ProductDetailHeaderComponent } from "./product-detail-header/product-detail-header.component";
import { ProductOverviewComponent } from "./product-overview/product-overview.component";
import { ProductRoutingModule } from "./product-routing.module";
import { LayoutModule } from '@progress/kendo-angular-layout';

@NgModule({
    imports: [
        AppCommonModule,
        CommonModule,
        FormsModule,
        LayoutModule,
        ProductRoutingModule,
    ],
    declarations: [
        ProductCollateralDialogComponent,
        ProductDetailHeaderComponent,
        ProductOverviewComponent,
    ],
    exports: [
    ],
    providers: [
        ProductApiService
    ]
})
export class ProductModule { }
