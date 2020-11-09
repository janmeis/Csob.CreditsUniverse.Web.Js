import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Event, NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs/operators';
import { hasPermission } from 'src/app/app-common/common-functions';
import { AppConfig } from 'src/app/app-config';
import { UserProgressService } from 'src/app/services/user-progress.service';
import { Arrays } from '../../../app-common/arrays';
import * as AppVersion from '../../../app-version';
import { ApiBaseService } from '../../../services/api-base.service';
import { ILogger, LogFactoryService } from '../../../services/log-factory.service';
import { SecurityService } from '../../../services/security.service';
import { SelectedPartyService } from '../../../services/selected-party.service';
import { TracerService } from '../../../services/tracer.service';
import { TranslationService } from '../../../services/translation-service';
import { EPermissionAreaType, IAppVersionInfo, IWebUserDto } from '../../../services/webapi/webapi-models';
import { IPartyHeaderDto } from './../../../services/webapi/webapi-models';

interface MenuItemContext {
    party: IPartyHeaderDto;
    user: IWebUserDto;
}

type MenuCondition = (data: MenuItemContext) => boolean;

enum navbarItemId {
    dashboard = 1,
    partySearch = 2,
    partyDetail = 3,
    financialStatements = 4,
    product = 5,
    collateral = 6,
    pdrating = 7,
    raroc = 8,
    contractConditions = 9,
    monitoring = 10,
    myDashboard = 11,
    clientDashboard = 12
}

interface NavigationTemplateModel {
    navBarItemId: number;
    text: string;
    css?: string;
    linkTemplate: string;
    conditions?: MenuCondition[]
}

interface NavigationModel {
    navBarItemId: number;
    id: string;
    text: string;
    css: string;
    link: string;
}

function hasCreditComponent(ctx: MenuItemContext): boolean {
    return ctx.party && ctx.party.CreditFileId > 0;
}

@UntilDestroy()
@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.less'],
})
export class NavigationComponent implements OnInit, OnDestroy, OnChanges {
    @Input() versionInfo: IAppVersionInfo;
    navigationTemplateItems: NavigationTemplateModel[] = [
        {
            navBarItemId: navbarItemId.dashboard,
            text: this.translation.$$get('navigation.dashboard'),
            linkTemplate: '/dashboard/branch',
            css: 'dashboard',
            conditions: [x => hasPermission(x, EPermissionAreaType.Dashboard)]
        },
        {
            navBarItemId: navbarItemId.myDashboard,
            text: this.translation.$$get('navigation.my_dashboard'),
            linkTemplate: '/dashboard/my-events',
            css: 'dashboard',
            conditions: [x => hasPermission(x, EPermissionAreaType.Dashboard)]
        },
        {
            navBarItemId: navbarItemId.partySearch,
            text: this.translation.$$get('navigation.party_search'),
            linkTemplate: '/party/search',
            css: 'search'
        },
        {
            navBarItemId: navbarItemId.clientDashboard,
            text: this.translation.$$get('navigation.client_dashboard'),
            linkTemplate: '/dashboard/client/:selected',
            css: 'dashboard',
            conditions: [x => hasPermission(x, EPermissionAreaType.Dashboard)]
        },
        {
            navBarItemId: navbarItemId.partyDetail,
            text: this.translation.$$get('navigation.general'),
            linkTemplate: '/party/detail/:selected',
            css: 'party-detail',
            conditions: [x => hasPermission(x, EPermissionAreaType.Party)]
        },
        {
            navBarItemId: navbarItemId.financialStatements,
            text: this.translation.$$get('navigation.financial_statements'),
            linkTemplate: '/selected/:selected/financial',
            css: 'financial-statements',
            conditions: [x => hasPermission(x, EPermissionAreaType.Statement)]
        },
        {
            navBarItemId: navbarItemId.product,
            text: this.translation.$$get('navigation.product'),
            linkTemplate: '/selected/:selected/product',
            css: 'product',
            conditions: [x => hasCreditComponent(x), x => hasPermission(x, EPermissionAreaType.Product)]
        },
        {
            navBarItemId: navbarItemId.collateral,
            text: this.translation.$$get('navigation.collateral'),
            linkTemplate: '/selected/:selected/collateral',
            css: 'collateral',
            conditions: [x => hasCreditComponent(x), x => hasPermission(x, EPermissionAreaType.Collateral)]
        },
        {
            navBarItemId: navbarItemId.pdrating,
            text: this.translation.$$get('navigation.pd_rating'),
            linkTemplate: '/selected/:selected/pd-rating',
            css: 'pdrating',
            conditions: [x => hasCreditComponent(x), x => hasPermission(x, EPermissionAreaType.PdRating)],
        },
        {
            navBarItemId: navbarItemId.raroc,
            text: this.translation.$$get('navigation.raroc'),
            linkTemplate: '/selected/:selected/raroc',
            css: 'raroc',
            conditions: [x => hasCreditComponent(x), x => hasPermission(x, EPermissionAreaType.Raroc)]
        },
        {
            navBarItemId: navbarItemId.contractConditions,
            text: this.translation.$$get('navigation.contract_terms'),
            linkTemplate: '/selected/:selected/contract-condition',
            css: 'contract-terms',
            conditions: [x => hasCreditComponent(x), x => hasPermission(x, EPermissionAreaType.Conditions)]
        },
        {
            navBarItemId: navbarItemId.monitoring,
            text: this.translation.$$get('navigation.monitoring'),
            linkTemplate: '/selected/:selected/monitoring',
            css: 'monitoring',
            conditions: [x => hasCreditComponent(x), x => hasPermission(x, EPermissionAreaType.Monitoring)]
        },
    ];
    navigation: NavigationModel[] = [];
    selectedNavigationId: number;
    previousSelectedNavigationId: number;
    version: string;
    versionTitle: string;
    adminUrl = '';
    EPermissionAreaType = EPermissionAreaType;
    private log: ILogger;
    private partyId: number;

    constructor(
        private apiBase: ApiBaseService,
        public progress: UserProgressService,
        private security: SecurityService,
        private selectedParty: SelectedPartyService,
        private tracer: TracerService,
        private translation: TranslationService,
        public router: Router,
        appConfig: AppConfig,
        logFactory: LogFactoryService
    ) {
        this.adminUrl = appConfig.adminUrl;
        this.log = logFactory.get('Navigation');
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['versionInfo'] && !!this.versionInfo) {
            this.version = this.versionInfo.Version;
            this.versionTitle = `App: ${this.versionInfo.Version}\nWebApi: ${this.versionInfo.ApiVersion}\nClient: ${AppVersion.version}`;
        }
    }

    updateNavBarItems(party: IPartyHeaderDto) {
        this.navigation = [];

        this.navigationTemplateItems.forEach(templateItem => {
            const navItem: NavigationModel = {} as NavigationModel;
            navItem.text = templateItem.text;
            navItem.css = templateItem.css;
            navItem.navBarItemId = templateItem.navBarItemId;
            navItem.link = this.getNavItemLink(templateItem.linkTemplate, !!party && !!party.Id ? party.Id : null);
            if (!navItem.link)
                return;

            if (templateItem.conditions && !Arrays.all(templateItem.conditions, c => c({ party: party, user: this.security.currentUser })))
                return;

            if (this.router.url.startsWith(navItem.link))
                this.selectedNavigationId = navItem.navBarItemId;

            this.navigation.push(navItem);
        });
    }

    ngOnInit() {
        this.apiBase.setApiVersion(undefined, AppVersion.version);
        this.apiBase.setCurrentCreditFile(undefined);

        this.selectedParty.partyHeader.pipe(
                untilDestroyed(this),
                tap(party => {
                    if (party && party.Id) {
                        this.partyId = party.Id;
                        this.apiBase.setCurrentCreditFile(`${party.CreditFileId}`);
                    }
                })
        ).subscribe(party => {
            window.setTimeout(() => {this.updateNavBarItems(party)}, 0);
            if (!!this.versionInfo)
                this.apiBase.setApiVersion(this.versionInfo.ApiVersion, AppVersion.version);
        });

        this.router.events.pipe(
            untilDestroyed(this)
        ).subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                const url = (event as NavigationEnd).url;
                if (this.navigationTemplateItems.some(i => this.getItemSelected(url, i.linkTemplate, this.partyId)))
                    this.selectedNavigationId = this.navigationTemplateItems.find(i => this.getItemSelected(url, i.linkTemplate, this.partyId)).navBarItemId;
            } else if (event instanceof NavigationCancel)  // řeší situaci, kdy kliknu na položku menu, zobrazí se dialog o uložení a dám zrušit
                this.selectedNavigationId = this.previousSelectedNavigationId;

            if (event instanceof NavigationEnd)
                this.tracer.sendEvent('NavigationEnd', { url: event.url, urlRedirect: event.urlAfterRedirects && event.urlAfterRedirects != event.url ? event.urlAfterRedirects : undefined });
            else if (event instanceof NavigationStart)
                this.tracer.sendEvent('NavigationStart', { url: event.url, trigger: event.navigationTrigger });
            else if (event instanceof NavigationCancel)
                this.tracer.sendEvent('NavigationCancel', { url: event.url, reason: event.reason });
        });
    }

    ngOnDestroy() {
        this.apiBase.setApiVersion(undefined, AppVersion.version);
        this.apiBase.setCurrentCreditFile(undefined);
    }

    navBarItemClicked(selectedItemId: number) {
        this.previousSelectedNavigationId = this.selectedNavigationId;
        this.selectedNavigationId = selectedItemId;
    }

    hasPermission = (action: EPermissionAreaType): boolean =>
        hasPermission({ party: null, user: this.security.currentUser }, action);

    private getNavItemLink(linkTemplate: string, partyId: number): string {
        if (!!linkTemplate && linkTemplate.includes(':selected')) {
            if (!partyId) {
                return null;
            }
            return linkTemplate.replace(':selected', `${partyId}` || '');
        } else
            return linkTemplate;
    }

    private getItemSelected(url: string, linkTemplate: string, partyId: number): boolean {
        const navItemLink = this.getNavItemLink(linkTemplate, partyId);
        return !!navItemLink && url.startsWith(navItemLink);
    }
}
