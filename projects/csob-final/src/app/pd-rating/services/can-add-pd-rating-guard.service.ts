import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { MessageBoxDialogComponent } from '../../app-common/components/message-box-dialog/message-box-dialog.component';
import { SelectedPartyService } from '../../services/selected-party.service';
import { TranslationService } from '../../services/translation-service';
import { IPartyHeaderDto } from './../../services/webapi/webapi-models';

@Injectable({
    providedIn: 'root'
})
export class CanAddPdRatingGuard implements CanActivate {
    private translation: TranslationService;
    constructor(
        private injector: Injector,
        private selectedParty: SelectedPartyService,
    ) {
        this.translation = new TranslationService(injector);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.selectedParty
            .getData(route.params)
            .pipe(
                tap(x => {
                    //console.log("selectedPartyService.data consumed by CanAddPdRatingGuard", x);
                }),
                map((party: IPartyHeaderDto) => {
                    if (!(party.CreditFileId && party.PDModelId)) {
                        MessageBoxDialogComponent.confirmAlert(this.injector, this.translation.$$get('can_add_pd_rating_guard.selected_party_has_no_pdrating_model'));
                        return false;
                    }
                    return party.CreditFileId > 0 && party.PDModelId > 0;
                })
            );
    }
}
