import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateGuard, DialogGuard } from '../services/app-navigation-guard.service';
import { EPermissionAreaType } from '../services/webapi/webapi-models';
import { PartyDetailComponent } from './party-detail/party-detail.component';
import { PartyGeneralDetailComponent } from './party-general-detail/party-general-detail.component';
import { PartySearchComponent } from './party-search/party-search.component';

const routes: Routes = [
    {
        path: '',
        canActivateChild: [DialogGuard],
        children: [
            { path: '', redirectTo: 'search' },
            { path: 'search', component: PartySearchComponent },
            { path: 'detail/new', component: PartyDetailComponent, canDeactivate: [CanDeactivateGuard]},
            { path: 'detail/:id', component: PartyGeneralDetailComponent, canDeactivate: [CanDeactivateGuard] },
            { path: 'detail/:id/links', component: PartyGeneralDetailComponent, canDeactivate: [CanDeactivateGuard] },
            { path: 'detail/:id/links/edit', component: PartyGeneralDetailComponent, canDeactivate: [CanDeactivateGuard] },
            { path: 'detail/:id/credit', component: PartyGeneralDetailComponent, canDeactivate: [CanDeactivateGuard] },
            { path: 'detail/:id/cfmanagement', component: PartyGeneralDetailComponent, canDeactivate: [CanDeactivateGuard] },
            { path: 'detail/:id/cfmanagement/edit', component: PartyGeneralDetailComponent, canDeactivate: [CanDeactivateGuard] },
        ],
        data: { ucType: [EPermissionAreaType.Party] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PartyRoutingModule { }
