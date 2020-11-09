import { Location } from '@angular/common';
import { AfterViewInit, Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectEvent, TabStripComponent } from '@progress/kendo-angular-layout';
import { Observable, of, Subscription, timer } from 'rxjs';
import { first, flatMap, map, mergeMap, tap } from 'rxjs/operators';

import { markControlsDirty } from 'src/app/app-common/common-functions';
import { MessageBoxDialogComponent, Options } from 'src/app/app-common/components/message-box-dialog/message-box-dialog.component';
import { EditorValidation } from 'src/app/app-common/directives/editor-validator.directive';
import { AppConfig } from 'src/app/app-config';
import { BasePermissionsComponent } from 'src/app/app-shell/basePermissionsComponent';
import { CanComponentDeactivate } from 'src/app/services/app-navigation-guard.service';
import { SecurityService } from 'src/app/services/security.service';
import { UrlHelperService } from 'src/app/services/url-helper.service';
import { SelectedPartyService } from '../../services/selected-party.service';
import { TranslationService } from '../../services/translation-service';
import { UserNotificationService } from '../../services/user-notification.service';
import { UserProgressService } from '../../services/user-progress.service';
import { RarocApiService } from '../../services/webapi/raroc-api-service';
import { EStateRaroc, IPartyHeaderDto, IRarocContainerDto, IRarocValidationDto } from '../../services/webapi/webapi-models';
import { RarocDetailGeneralComponent } from '../raroc-detail-general/raroc-detail-general.component';
import { EViewMode } from '../raroc-overview/raroc-overview.component';
import { IRarocDto } from './../../services/webapi/webapi-models';
import { RarocDetailService } from './raroc-detail.service';

@Component({
    selector: 'app-raroc-detail',
    templateUrl: './raroc-detail.component.html',
    styleUrls: ['./raroc-detail.component.less'],
    providers: [
        RarocDetailService
    ]
})
export class RarocDetailComponent extends BasePermissionsComponent implements CanComponentDeactivate, OnInit, AfterViewInit, OnDestroy {
    @ViewChild('kendoTabStripInstance') private tabstrip: TabStripComponent;
    @ViewChild('form') private form: NgForm;

    @ViewChild(RarocDetailGeneralComponent) private rarocDetailGeneral: RarocDetailGeneralComponent;

    mainRaroc: IRarocContainerDto;
    readonly: boolean = false;
    rarocId: number | 'new';
    party: IPartyHeaderDto;
    EViewMode = EViewMode;
    EStateRaroc = EStateRaroc;
    viewMode: EViewMode = EViewMode.DetailView;
    tabSubscription: Subscription;
    rarocValidation = { ValidProducts: true, ValidCollaterals: true } as IRarocValidationDto;

    private readonly lockedMessage = this.translation.$$get('raroc_detail.raroc_locked');
    private readonly unlockedMessage = this.translation.$$get('raroc_detail.raroc_unlocked');
    private lockingStateInterval: any;
    private opts: Options;

    get raroc(): IRarocDto {
        if (this.mainRaroc)
            return this.mainRaroc.RarocDto;

        return null;
    }
    set raroc(value: IRarocDto) {
        if (this.mainRaroc) {
            this.mainRaroc.RarocDto = value;
            this.rarocId = this.mainRaroc.RarocDto.Id;
        }
    }

    get rarocDetailGeneralForm(): NgForm {
        if (this.rarocDetailGeneral)
            return this.rarocDetailGeneral.form;

        return null;
    }

    public getHeaderText() {
        return this.rarocId == 'new' ? this.translation.$$get('raroc_detail.create_raroc') : this.translation.$$get('raroc_detail.raroc');
    }
    constructor(
        private appConfig: AppConfig,
        private injector: Injector,
        private location: Location,
        private notification: UserNotificationService,
        public progress: UserProgressService,
        private rarocApiService: RarocApiService,
        private rarocDetailService: RarocDetailService,
        private route: ActivatedRoute,
        private router: Router,
        private selectedParty: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        private urlHelper: UrlHelperService,
        protected securityService: SecurityService) {
        super(securityService);
    }

    ngOnInit() {
        this.title.setTitle(this.translation.$$get(`raroc_detail.${this.rarocId == 'new' ? 'create_raroc' : 'raroc'}`));
        this.getUrlParams();

        this.progress.runProgress(
            this.selectedParty.partyHeader.pipe(
                tap(party => {
                    this.party = party;
                    super.fillRights(party);
                }),
                flatMap(() => this.rarocDetailService.getRaroc$(this.rarocId, this.party.CreditFileId)),
                tap(result => this.mainRaroc = result)
            )).subscribe(() => {
                const isNew = this.rarocId == 'new';
                this.rarocId = this.mainRaroc.RarocDto.Id;
                if (isNew)
                    this.navigateRaroc();

                this.readonly = this.raroc.State != EStateRaroc.InProcess || this.mainRaroc.IsLocked;

                if (!this.hasRightTo['Rarocsave']) {
                    this.readonly = true;
                }

                this.lockingStateInterval = this.checkLockingState();
                this.opts = MessageBoxDialogComponent.createYesCancelOptions(this.injector);
                this.opts.title = this.translation.$$get('raroc_detail.dirty_title');
                this.opts.messageHTML = this.translation.$$get('raroc_detail.dirty_question');

                this.switchView();

                timer(0).pipe(first())
                    .subscribe(() => {
                        if (this.rarocDetailGeneralForm) {
                            markControlsDirty(this.rarocDetailGeneralForm.form);
                            if (this.rarocDetailGeneralForm.valid)
                                this.rarocDetailGeneralForm.form.markAsPristine();
                        }
                    });
            });
    }

    ngAfterViewInit(): void {
        this.tabSubscription = this.tabstrip.tabSelect.subscribe(async (event: SelectEvent) => {
            if (this.form && this.form.dirty && event.index > 0) {
                event.preventDefault();
                const result = await MessageBoxDialogComponent.show(this.injector, this.opts).toPromise();
                if (result) {
                    this.progress.runProgress(
                        this.onSave$()
                    ).subscribe(result => {
                        if (result) {
                            this.notification.success(this.translation.$$get('raroc_detail.data_saved'));
                            this.form.form.markAsPristine();

                            this.tabstrip.selectTab(event.index)
                            this.saveViewModeToUrl(event);
                        }
                    });
                }
            } else {
                this.saveViewModeToUrl(event);
            }
        });
    }

    private saveViewModeToUrl(event: SelectEvent) {
        this.viewMode = event.index;
        const params = { readonly: this.readonly, viewMode: this.viewMode };
        this.urlHelper.saveToUrl(params, this.location);
        this.notification.clear();
    }

    ngOnDestroy(): void {
        if (this.tabSubscription)
            this.tabSubscription.unsubscribe();
        if (this.lockingStateInterval)
            clearInterval(this.lockingStateInterval);
    }

    async onCalculate(): Promise<void> {
        if (this.rarocId != 'new') {
            if (!await this.progress.runAsync(this.rarocApiService.getValidationRarocSubProdColl(this.rarocId)))
                if (!await MessageBoxDialogComponent.confirmYesNo(this.injector, this.translation.$$get('raroc_detail.want_calcute_even_with_errors')).toPromise())
                    return;

            this.raroc.CreditFileId = this.party.CreditFileId;
            this.progress.runProgress(this.rarocApiService.postCalculateRaroc(this.raroc.Id).pipe(
                flatMap(() => this.rarocDetailService.getRaroc$(this.rarocId, this.party.CreditFileId)),
                tap(result => this.mainRaroc = result),
            )).subscribe(() => {
                this.switchView(EViewMode.ResultSet);
                this.notification.success(this.translation.$$get('raroc_detail.raroc_was_calculated'));
                this.lockingStateInterval = this.checkLockingState();
            });
        }
    }
    async onFinish(): Promise<void> {
        if (this.rarocId != 'new') {
            if (await MessageBoxDialogComponent.confirmYesNo(this.injector, this.translation.$$get('raroc_detail.sure_finish_raroc')).toPromise()) {
                this.raroc.CreditFileId = this.party.CreditFileId;
                this.progress.runProgress(this.rarocApiService.postFinishRaroc(this.raroc).pipe(
                    flatMap(() => this.rarocDetailService.getRaroc$(this.rarocId, this.party.CreditFileId)),
                    tap(result => this.mainRaroc = result)
                )).subscribe(() => {
                    this.notification.success(this.translation.$$get('raroc_detail.raroc_was_finished'));
                    this.lockingStateInterval = this.checkLockingState();
                    this.readonly = true;
                    this.form.form.markAsPristine();
                    if (this.rarocDetailGeneralForm)
                        this.rarocDetailGeneralForm.form.markAsPristine();
                    this.navigateRaroc();
                });
            }
        }
    }

    onSave(): void {
        this.progress.runProgress(
            this.onSave$()
        ).subscribe(result => {
            if (result) {
                this.notification.success(this.translation.$$get('raroc_detail.data_saved'));
                this.form.form.markAsPristine();

                this.navigateRaroc();
            }
        });
    }

    private onSave$(): Observable<boolean> {
        return this.save().pipe(
            mergeMap(saved => {
                if (saved) {
                    this.rarocDetailGeneralForm.reset();
                    return this.rarocDetailService.getRaroc$(this.rarocId, this.party.CreditFileId).pipe(
                        tap(result => this.mainRaroc = result),
                        map(() => true));
                }

                return of(false);
            }));
    }

    onRarocValidationChanged(rarocValidation: IRarocValidationDto) {
        this.rarocValidation = rarocValidation;
    }

    onRarocDetailGeneralFormChanged(dirty: boolean) {
        if (dirty)
            this.form.form.markAsDirty();
    }

    onProductChanged(event: { rarocVersion: string, hasProducts: boolean }) {
        this.raroc.Version = event.rarocVersion;
        this.mainRaroc.HasProducts = event.hasProducts;
        this.mainRaroc.HasResult = false;
        //console.log("on product changed ", this.mainRaroc.HasResult);
    }

    onCollateralChanged(rarocVersion: string) {
        this.raroc.Version = rarocVersion;
        this.mainRaroc.HasResult = false;
    }

    private isFormValid(): boolean {
        if (this.readonly || !this.rarocDetailGeneral)
            return false;

        markControlsDirty(this.rarocDetailGeneralForm.form);
        if (this.rarocDetailGeneralForm.invalid)
            return false;

        if (!this.rarocDetailGeneral.isValid()) {
            const validations = this.getValidations(this.rarocDetailGeneral.validations);
            this.notification.error(validations);
        }

        return Object.keys(this.rarocDetailGeneral.validations).length == 0;
    }

    private getUrlParams(): void {
        const rarocId = this.route.snapshot.paramMap.get('id');
        this.rarocId = rarocId == null ? 'new' : +rarocId;
        this.readonly = this.route.snapshot.queryParamMap.get('readonly') == 'true';
        this.viewMode = +(this.route.snapshot.queryParamMap.get('viewMode') || '0');
    }

    private navigateRaroc() {
        this.router.navigate(['detail', this.rarocId], {
            relativeTo: this.route.parent,
            replaceUrl: true,
            queryParams: { readonly: this.readonly, viewMode: this.viewMode, multiplicator: true }
        });
    }

    private checkLockingState(): any {
        return setInterval(() => {
            this.progress.runProgress(
                this.rarocApiService.getIsRarocLocked(+this.rarocId)).subscribe(
                    isLocked => {
                        this.notification.messages = this.notification.messages.filter(m => m.message != this.lockedMessage && m.message != this.unlockedMessage);

                        if (isLocked)
                            this.notification.error(this.lockedMessage);
                        else if (this.mainRaroc.IsLocked)
                            this.notification.warning(this.unlockedMessage);

                        this.mainRaroc.IsLocked = isLocked;
                        this.readonly = this.raroc.State != EStateRaroc.InProcess || this.mainRaroc.IsLocked;
                    });
        }, this.appConfig.checkLockingInterval);
    }

    private switchView(viewMode?: EViewMode) {
        if (viewMode && this.mainRaroc)
            this.viewMode = viewMode;
        timer(0).pipe(first()).subscribe(() => this.tabstrip.selectTab(this.viewMode));
    }

    private getValidations(validations: { [key: string]: EditorValidation; }): string {
        const result = [];
        Object.keys(validations).forEach(key =>
            result.push(validations[key].errors[0])
        );
        return result.length > 0
            ? `${result.join('</span><span class="px-1">')}`
            : null;
    }

    private save(): Observable<boolean> {
        if (!this.isFormValid())
            return of(false);

        this.raroc.CreditFileId = this.party.CreditFileId;
        return this.rarocDetailService.saveRaroc$(this.mainRaroc).pipe(
            tap(id => this.rarocId = id),
            map(() => true),
            first());
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (!this.progress.running && this.form && this.form.dirty && (this.hasRightTo && this.hasRightTo['Rarocsave']))
            return MessageBoxDialogComponent.dirtyConfirmation(this.injector, () => this.save());

        return of(true);
    }
}
