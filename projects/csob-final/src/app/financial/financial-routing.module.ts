import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinancialOverviewComponent } from './financial-overview/financial-overview.component';
import { FinancialDetailComponent } from './financial-detail/financial-detail.component';
import { FinancialDataImportDialogComponent } from './financial-data-import-dialog/financial-data-import-dialog.component';
import { DialogGuard, CanDeactivateGuard, AuthGuard } from '../services/app-navigation-guard.service';
import { EPermissionAreaType } from '../services/webapi/webapi-models';

const routes: Routes = [
    {
        path: '',
        canActivateChild: [DialogGuard, AuthGuard],
        children: [
            { path: '', redirectTo: 'overview' },
            { path: 'overview', component: FinancialOverviewComponent },
            { path: 'detail', component: FinancialDetailComponent, canDeactivate: [CanDeactivateGuard] },
            { path: 'import', component: FinancialDataImportDialogComponent },
        ],
        data: { ucType: [EPermissionAreaType.Statement] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FinancialRoutingModule { }
