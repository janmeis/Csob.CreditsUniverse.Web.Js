import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './app-shell/components/page-not-found/page-not-found.component';
import { CanDeactivateGuard, DialogGuard } from './services/app-navigation-guard.service';

const routes: Routes = [
    {
        path: 'dashboard',
        loadChildren: () =>  import('./dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
        path: 'party',
        loadChildren: () =>  import('./party/party.module').then(m => m.PartyModule)
    },
    {
        path: 'selected/:partyId/financial',
        loadChildren: () =>  import('./financial/financial.module').then(m => m.FinancialModule)
    },
    {
        path: 'selected/:partyId/product',
        loadChildren: () => import('./product/product.module').then(m => m.ProductModule)
    },
    {
        path: 'selected/:partyId/collateral',
        loadChildren: () => import('./collateral/collateral.module').then(m => m.CollateralModule)
    },
    {
        path: 'selected/:partyId/pd-rating',
        loadChildren: () => import('./pd-rating/pd-rating.module').then(m => m.PdRatingModule)
    },
    {
        path: 'selected/:partyId/raroc',
        loadChildren: () => import('./raroc/raroc.module').then(m => m.RarocModule)
    },
    {
        path: 'selected/:partyId/contract-condition',
        loadChildren: () => import('./contract-conditions/contract-conditions.module').then(m => m.ContractConditionsModule)
    },
    {
        path: 'selected/:partyId/monitoring',
        loadChildren: () => import('./monitoring/monitoring.module').then(m => m.MonitoringModule)
    },
    {
        path: '',
        redirectTo: '/party/search',
        pathMatch: 'full',
    },
    {
        path: '**',
        component: PageNotFoundComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            routes,
            {
                preloadingStrategy: PreloadAllModules
            }
        )
    ],
    declarations: [],
    exports: [RouterModule],
    //DO not use this Guards directly:
    providers: [CanDeactivateGuard, DialogGuard]
})
export class AppRoutingModule {
}
