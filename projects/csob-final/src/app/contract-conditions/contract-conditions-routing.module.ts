import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, CanDeactivateGuard, DialogGuard } from 'projects/services/src/public-api';
import { EPermissionAreaType } from 'projects/services/src/public-api';
import { ContractConditionsDetailComponent } from './contract-conditions-detail/contract-conditions-detail.component';
import { ContractConditionsOverviewComponent } from './contract-conditions-overview/contract-conditions-overview.component';


const routes: Routes = [
    {
        path: '',
        canActivateChild: [DialogGuard, AuthGuard],
        children: [
            { path: '', redirectTo: 'overview' },
            { path: 'overview', component: ContractConditionsOverviewComponent },
            { path: 'detail/new', component: ContractConditionsDetailComponent, canDeactivate: [CanDeactivateGuard] },
            { path: 'detail/:id', component: ContractConditionsDetailComponent, canDeactivate: [CanDeactivateGuard] }
        ],
        data: { ucType: [EPermissionAreaType.Conditions] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ContractConditionsRoutingModule { }
