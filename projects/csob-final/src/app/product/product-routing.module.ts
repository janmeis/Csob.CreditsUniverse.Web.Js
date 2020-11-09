import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateGuard, DialogGuard, AuthGuard } from '../services/app-navigation-guard.service';
import { ProductDetailHeaderComponent } from './product-detail-header/product-detail-header.component';
import { ProductOverviewComponent } from './product-overview/product-overview.component';
import { EPermissionAreaType } from '../services/webapi/webapi-models';

const routes: Routes = [
    {
        path: '',
        canActivateChild: [DialogGuard, AuthGuard],
        children: [
            { path: '', redirectTo: 'overview' },
            { path: 'overview', component: ProductOverviewComponent },
            { path: 'detail/:id', component: ProductDetailHeaderComponent, canDeactivate: [CanDeactivateGuard] },
        ],
        data: { ucType: [EPermissionAreaType.Product] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProductRoutingModule { }
