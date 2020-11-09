import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, CanDeactivateGuard, DialogGuard, EPermissionAreaType } from 'projects/services/src/public-api';
import { PDRatingDetailComponent } from './pd-rating-detail/pd-rating-detail.component';
import { PDRatingNewComponent } from './pd-rating-new/pd-rating-new.component';
import { PDRatingOverviewComponent } from './pd-rating-overview/pd-rating-overview.component';
import { CanAddPdRatingGuard } from './services/can-add-pd-rating-guard.service';
import { CanShowPdRatingGuardService } from './services/can-show-pd-rating-guard.service';

const routes: Routes = [
    {
        path: '',
        canActivateChild: [DialogGuard, AuthGuard], // added authguard
        children: [
            { path: '', redirectTo:  'overview' },
            { path: 'overview', component: PDRatingOverviewComponent },
            { path: 'new', component: PDRatingNewComponent, canActivate: [CanAddPdRatingGuard], canDeactivate: [CanDeactivateGuard] },
            { path: 'detail', component: PDRatingDetailComponent, canActivate: [CanAddPdRatingGuard], canDeactivate: [CanDeactivateGuard] }, //creating new computation
            { path: 'detail/:id', component: PDRatingDetailComponent, canActivate: [CanShowPdRatingGuardService], canDeactivate: [CanDeactivateGuard] },
        ],
        data: { ucType: [EPermissionAreaType.PdRating] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PdRatingRoutingModule { }
