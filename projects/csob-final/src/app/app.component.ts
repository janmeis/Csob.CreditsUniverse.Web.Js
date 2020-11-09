import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import '@progress/kendo-ui';
import { AppDialogContainerService } from 'projects/app-common/src/public-api';
import { ApiBaseService } from 'projects/services/src/lib/api-base.service';
import {
  BrowserInfoService,
  ConsoleListenerFactory,
  EnvironmentEnum,
  IAppVersionInfo,
  ILogger,
  IWebUserDto,
  LogFactoryService,
  SecurityService,
  TraceErrorLogListenerFactory,
  TracerService,
  TranslationCacheService,
  TranslationService,
  UserApiService,
  UserNotificationService,
  UserProgressService
} from 'projects/services/src/public-api';
import { tap } from 'rxjs/operators';
import * as AppVersion from './app-version';

//import popper from 'popper.js';

declare var Popper: any;
declare var kendo: any;

export interface IPageRouterActivated {
    hidePartyInHeader?: boolean;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
    @ViewChild('dialogContainer', { read: ViewContainerRef, static: true }) dialogContainer: ViewContainerRef;
    isIE = false;
    loading = true;
    loadingErr: string = null;
    leftMenuExpanded = true;
    hidePartyInHeader = false;
    leftPaneBackground = '';
    versionInfo: IAppVersionInfo;
    private log: ILogger;

    constructor(
        // private appNav: AppNavigationGuardService,
        private apiBase: ApiBaseService,
        private dialogService: AppDialogContainerService,
        private browserInfoService: BrowserInfoService,
        private changeDetector: ChangeDetectorRef,
        private injector: Injector,
        logFactory: LogFactoryService,
        private notification: UserNotificationService,
        public progress: UserProgressService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private tracer: TracerService,
        private securityService: SecurityService,
        private translation: TranslationService,
        private translationCacheService: TranslationCacheService,
        private userApi: UserApiService,
        traceErrorListener: TraceErrorLogListenerFactory,
        consoleListener: ConsoleListenerFactory
    ) {
        logFactory.addListener(consoleListener);
        //logFactory.addListener(traceErrorListener);
        this.log = logFactory.get("AppComponent");
        this.isIE = browserInfoService.isIE;
        //fix ugly rendering of drop-down
        Popper.Defaults.modifiers.computeStyle.gpuAcceleration = false;
        //Popper.Defaults.modifiers.computeStyle.enabled = false;

        //this.router.events
        //	.subscribe(ev => {
        //		this.log.debug("router event: "+ev);
        //	});
        //this.router.events
        //	.filter(event => event instanceof ActivationEnd)
        //	.subscribe((ev: ActivationEnd) => {
        //		this.log.debug("router ActivationEnd", ev.snapshot.component.toString());
        //	});
        if (window !== undefined) {
            (<any>window).$ = kendo.jQuery;
        }
    }
    onRouterActivate(ev: IPageRouterActivated) {
        this.log.debug("onRouterActivate");
        //this.smallHeader = true;//ev.PAGE_smallHeader || false;
        window.setTimeout(() => {
            this.hidePartyInHeader = ev.hidePartyInHeader || false;
        }, 0);
    }
    ngOnInit(): void {
        this.log.info("router", this.router);
        this.update();
        this.dialogService.containerInjector = this.injector;
        this.dialogService.container = this.dialogContainer;
        this.log.debug("set dialogservice container", this.dialogContainer);

        this.progress.runProgress(
            this.userApi.getAppVersionInfo().pipe(
                tap(versionInfo => {
                    this.versionInfo = versionInfo;
                    this.leftPaneBackground = this.getLeftPaneBackground(versionInfo);
                    const clientUtcOffset = -(new Date()).getTimezoneOffset() / 60;
                    if (versionInfo.ServerTimeZoneOffset != clientUtcOffset) {
                        this.log.error(`Client has another time zone than server: client offset ${clientUtcOffset}, server offset ${versionInfo.ServerTimeZoneOffset}, server time zone ${versionInfo.ServerTimeZone}`);
                        this.notification.warning(this.translation.$$get('navigation.err_different_timezone'));
                    }
                }))
        ).subscribe();
    }
    private update() {
        this.loading = true;
        this.securityService.loadCurrentUser()
            .then(r => {
                this.loadUser(this.securityService.currentUser);
                return this.translationCacheService.loadLocales();
            })
            .then(r => {
                this.loading = false;
                var info = this.browserInfoService.getInfo();
                this.tracer.sendEvent('UserAuthenticated', {
                    appVersion: AppVersion.version,
                    browser: info,
                    url: window.location + ''
                });
            })
            .catch(e => {
                if (e.status != undefined && e.status == 0) {
                    //DO NOT LOCALIZE
                    this.loadingErr = "Nelze se připojit k serveru, zkontrolujte připojení\n"
                                    + "Cannot connect to server, check your connection";
                    return;
                }
                //this.loading = false;
                if (e.error) {
                    try {
                        var parsed = JSON.parse(e.error);
                        this.loadingErr = parsed && parsed.Statuses && parsed.Statuses[0] && parsed.Statuses[0].Message;
                        return;
                    }
                    catch{ }
                }
                this.loadingErr = e.message || e;
            });
    }
    private loadUser(data: IWebUserDto) {
        this.log.info("loadUser", data);
        //this.currentUser = data;
    }
    private getLeftPaneBackground = (versionInfo: IAppVersionInfo): string =>
        `left-pane-background-${EnvironmentEnum[versionInfo.Environment]}`
    // @HostListener('window:beforeunload', ['$event'])
    // unloadNotification(e: BeforeUnloadEvent) {
    // 	this.appNav.BeforeUnload(e);
    // }
}
