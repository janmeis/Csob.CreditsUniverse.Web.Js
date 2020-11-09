import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MessageBoxDialogComponent } from 'src/app/app-common/components/message-box-dialog/message-box-dialog.component';
import { SecurityService } from 'src/app/services/security.service';
import { TranslationService } from 'src/app/services/translation-service';
import { PdRatingApiService } from './../../services/webapi/pdrating-api-service';

@Injectable({
    providedIn: 'root'
})
export class CanShowPdRatingGuardService implements CanActivate {
    private translation: TranslationService
    constructor(
        private injector: Injector,
        private pdRatingApi: PdRatingApiService,
        private securityService: SecurityService,
    ) {
        this.translation = new TranslationService(injector);
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        const partyId = +route.params['partyId'];
        const pdRatingId = +route.params['id'];
        return this.pdRatingApi.getCanShowPdRating(partyId, pdRatingId).pipe(
            tap(canShow => {
                //console.log(`CanShowPdRatingGuardService - partyId: ${partyId}, pdRatingId: ${pdRatingId}, result: ${canShow}`);
                if (!canShow) {
                    const currentUser = this.securityService.currentUser;
                    const currentUserName = `${currentUser.FirstName} ${currentUser.Surname}`.trim();
                    MessageBoxDialogComponent.confirmAlert(this.injector, this.translation.$$get('can-show-pd-rating-guard.user_x_has_no_access_to', currentUserName, partyId, pdRatingId));
                }
            }));
    };
}