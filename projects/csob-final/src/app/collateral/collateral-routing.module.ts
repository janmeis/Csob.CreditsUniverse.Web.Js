import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, CanDeactivateGuard, DialogGuard } from 'projects/services/src/public-api';
import { EPermissionAreaType } from 'projects/services/src/public-api';
import { CollateralDetailHeaderComponent } from './collateral-detail-header/collateral-detail-header.component';
import { CollateralOverviewComponent } from './collateral-overview/collateral-overview.component';

const routes: Routes = [
    {
        path: '',
        canActivateChild: [DialogGuard, AuthGuard],
        children: [
            { path: '', redirectTo: 'overview' },
            { path: 'overview', component: CollateralOverviewComponent },
            { path: 'detail/:id', component: CollateralDetailHeaderComponent, canDeactivate: [CanDeactivateGuard] },
        ],
        data: { ucType: [EPermissionAreaType.Collateral] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CollateralRoutingModule { }
