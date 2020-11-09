import { AfterViewInit, Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectEvent, TabStripComponent } from '@progress/kendo-angular-layout';
import { Observable, of, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { CanComponentDeactivate } from '../../services/app-navigation-guard.service';
import { SecurityService } from '../../services/security.service';
import { SelectedPartyService } from '../../services/selected-party.service';
import { TranslationService } from '../../services/translation-service';
import { UserProgressService } from '../../services/user-progress.service';
import { PartyApiService } from '../../services/webapi/party-api-service';
import { PartyCreditInfoDetailNewComponent } from '../party-credit-info-detail-new/party-credit-info-detail-new.component';
import { PartyDetailComponent } from '../party-detail/party-detail.component';
import { EPermissionType } from '../../services/webapi/webapi-models';

@Component({
    selector: 'app-party-general-detail',
    templateUrl: './party-general-detail.component.html',
    styleUrls: ['./party-general-detail.component.less']
})
export class PartyGeneralDetailComponent extends BasePermissionsComponent implements CanComponentDeactivate, OnInit, OnDestroy, AfterViewInit {
    @ViewChild('kendoTabStripInstance', { static: false }) private tabstrip: TabStripComponent;
    @ViewChild(PartyDetailComponent) private partyDetailComponent: PartyDetailComponent;
    @ViewChild(PartyCreditInfoDetailNewComponent) private partyCreditInfoDetailNewComponent: PartyCreditInfoDetailNewComponent;
    overviewVisible = true;
    isCreditInfoFormValid = true;
    private id: number;
    private subscription: Subscription;
    private headerSubscription: Subscription;
    public EPermissionType = EPermissionType;
    constructor(
        private partyApi: PartyApiService,
        public progress: UserProgressService,
        private route: ActivatedRoute,
        private router: Router,
        protected securityService: SecurityService,
        private selectedParty: SelectedPartyService,
        private translation: TranslationService,
    ) {
        super(securityService);
    }
    ngOnInit(): void {
        this.id = +this.route.snapshot.paramMap.get('id');
    }
    ngOnDestroy(): void {
        if (this.subscription)
            this.subscription.unsubscribe();
        if (this.headerSubscription)
            this.headerSubscription.unsubscribe();
    }
    async ngAfterViewInit(): Promise<void> {
        await this.progress.runAsync(
            this.partyApi.getPartyHeader(this.id).pipe(
                tap(party => this.selectedParty.setData(party)),
                tap(party => super.fillRights(party))
            ));

        let tabIndex = 0;
        const url = this.route.snapshot.url;
        if (url.length > 2) {
            const tabTitle = url[2].path;
            tabIndex = this.tabstrip.tabs.toArray().findIndex(t => t.title == this.translation.$$get(`party_general_detail.${tabTitle}`));
        }
        if (url.length > 3 && url[3].path == 'edit')
            this.overviewVisible = false;

        setTimeout(() => {
            this.tabstrip.selectTab(tabIndex);

            this.subscription = this.tabstrip.tabSelect.subscribe((t: SelectEvent) => {
                this.id = +this.route.snapshot.paramMap.get('id');  // pro pripad ze bylo id puvodne 0 (klient z CMDB)

                const navigate = ['/party/detail', this.id];
                if (t.title == this.translation.$$get('party_general_detail.credit'))
                    navigate.push('credit');
                else if (t.title == this.translation.$$get('party_general_detail.links')) {
                    navigate.push('links');
                    this.overviewVisible = true;
                } else if (t.title == this.translation.$$get('party_general_detail.cfmanagement'))
                    navigate.push('cfmanagement');

                this.router.navigate(navigate, { replaceUrl: true });
            });
        })
    }
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        //TODO vah - opravit
        let url = this.route.snapshot.url;

        if (url.length > 2) {
            const tabTitle = url[2].path;
            if (tabTitle == 'credit' && this.partyCreditInfoDetailNewComponent) {
                return this.partyCreditInfoDetailNewComponent.canDeactivate();
            }

            return of(true);
        } else if (this.partyDetailComponent) {
            return this.partyDetailComponent.canDeactivate();
        } else
            return of(true);
    }

    onCreditInfoFormValidChanged($event) {
        this.isCreditInfoFormValid = $event;
    }
}
