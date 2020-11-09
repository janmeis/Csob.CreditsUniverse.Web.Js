import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { CurrentLangService, SecurityService } from 'projects/services/src/public-api';
import { SelectedPartyService } from 'projects/services/src/public-api';
import { UserProgressService } from 'projects/services/src/public-api';
import { UserApiService } from 'projects/services/src/public-api';
import { BasePermissionsComponent } from '../../basePermissionsComponent';
import { OperationModelDialogComponent } from '../operation-model-dialog/operation-model-dialog.component';
import { IPartyHeaderDto, IWebUserDto } from 'projects/services/src/public-api';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.less'],
})

export class HeaderComponent extends BasePermissionsComponent implements OnInit, OnDestroy {
    @Input()
    hideParty = false;
    currentUser: IWebUserDto = null;
    currentParty: IPartyHeaderDto = null;
    partySubscription: Subscription;
    userApiSubscription: Subscription;
    selectedRole: any;

    constructor(
        protected securityService: SecurityService,
        private selectedParty: SelectedPartyService,
        private userApi: UserApiService,
        private router: Router,
        private injector: Injector,
        private currentLangService: CurrentLangService,
        private progress: UserProgressService

    ) {
        super(securityService);
        this.currentUser = securityService.currentUser;
    }

    ngOnInit() {
        this.partySubscription = this.selectedParty.partyHeader.subscribe(data => {
                this.currentParty = data;
                super.fillRights(data);
            });
    }

    ngOnDestroy() {
        if (this.partySubscription) {
            this.partySubscription.unsubscribe();
        }
    }

    onOrganizationUnitClicked() {
        const culture = this.currentLangService.getCurrentLangCultureCode();

        this.progress.runProgress(this.securityService.getOMGraph(culture).pipe(first()))
        .subscribe(result => {
          OperationModelDialogComponent.showDialog(this.injector, result);
        });



    }

}
