import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, CanDeactivateGuard, DialogGuard } from 'projects/services/src/public-api';
import { EPermissionAreaType } from 'projects/services/src/public-api';
import { RarocDetailComponent } from './raroc-detail/raroc-detail.component';
import { RarocOverviewComponent } from './raroc-overview/raroc-overview.component';

const routes: Routes = [
    {
        path: '',
        canActivateChild: [DialogGuard, AuthGuard],
        children: [
            { path: '', redirectTo: 'overview' },
            { path: 'overview', component: RarocOverviewComponent },
            { path: 'detail/new', component: RarocDetailComponent, canDeactivate: [CanDeactivateGuard] },
            { path: 'detail/:id', component: RarocDetailComponent, canDeactivate: [CanDeactivateGuard] },
        ],
        data: { ucType: [EPermissionAreaType.Raroc] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RarocRoutingModule { }
