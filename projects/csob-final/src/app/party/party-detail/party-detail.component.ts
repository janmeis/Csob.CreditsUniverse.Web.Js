import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first, map, mergeMap, tap } from 'rxjs/operators';
import { AppConfig } from 'src/app/app-config';
import { MessageBoxDialogComponent } from '../../app-common/components/message-box-dialog/message-box-dialog.component';
import { fromDateOnlyString } from '../../app-common/dates';
import { EditorValidation } from '../../app-common/directives/editor-validator.directive';
import { PartyPermissionState } from '../../app-common/services/permission-service';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { ILogger, LogFactoryService } from '../../services/log-factory.service';
import { SecurityService } from '../../services/security.service';
import { SelectedPartyService } from '../../services/selected-party.service';
import { TranslationService } from '../../services/translation-service';
import { UserNotificationService } from '../../services/user-notification.service';
import { UserProgressService } from '../../services/user-progress.service';
import { PartyApiService } from '../../services/webapi/party-api-service';
import { EPartyType, EPermissionType, IPartyDetailDto } from '../../services/webapi/webapi-models';
import { getDateFromBirthNumber } from '../validation/birthNumberValidator';
import { CanComponentDeactivate } from './../../services/app-navigation-guard.service';
import { CodebookApiService } from './../../services/webapi/codebook-api-service';
import { isBirthNumberValid, isIdentificationNumberValid, matchBirthNumberAndDate } from './party-detail-validations';


@Component({
    selector: 'app-party-detail',
    templateUrl: './party-detail.component.html',
    styleUrls: ['./party-detail.component.less'],
})
export class PartyDetailComponent extends BasePermissionsComponent implements CanComponentDeactivate, OnInit {
    @ViewChild('form') private form: NgForm;
    partyDetail: IPartyDetailDto;
    id: number | 'new';
    isPo = false;
    isFo = false;
    minSearchChars: number;
    readonlyIdentificationNumber = false;
    readonlyZecho = false;
    readonlyBirthNumber = false;
    isReadOnly = false;
    private log: ILogger;
    private countriesCzSk = [];
    private isUpdating = false;
    private countryCzId: number;
    private readonly birthNumberValidationMessage = this.translation.$$get('party_detail.birth_number_format_is_invalid');
    private readonly identificationNumberValidationMessage = this.translation.$$get('party_detail.identification_number_format_is_invalid');
    private readonly birthDate_MIN_DATE = new Date(1900, 0, 1);
    private hasRightToAddClient: boolean;

    get headingText() {
        return this.isFo ? this.translation.$$get('party_detail.fop_identification') : this.translation.$$get('party_detail.po_identification');
    }
    constructor(
        private appConfig: AppConfig,
        private codebookApiService: CodebookApiService,
        private injector: Injector,
        private notification: UserNotificationService,
        private partyApiService: PartyApiService,
        public progress: UserProgressService,
        private route: ActivatedRoute,
        private router: Router,
        private selectedPartyService: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        protected securityService: SecurityService,
        logService: LogFactoryService
    ) {
        super(securityService);
        this.log = logService.get('party-detail');
    }
    ngOnInit() {
        this.update();
        this.minSearchChars = this.appConfig.minSearchChars;

        this.securityService.getOrLoadCurrentUser().then(user => {
            this.hasRightToAddClient = user.HasRightToAddParty;
        });
    }
    onSave() {
        this.isUpdating = true;
        this.progress.runProgress(
            this.save().pipe(
                mergeMap(saved => {
                    if (saved) {
                        this.form.reset();
                        return this.partyDetail$().pipe(map(() => true));
                    }
                    return of(false);
                })
            )).subscribe(result => {
                if (result) {
                    this.notification.clear();
                    this.notification.success(this.translation.$$get('party_detail.data_saved'));

                    this.replaceUrl();
                    this.selectedPartyService.setId(+this.id);
                    this.selectedPartyService.reload();
                }
                this.isUpdating = false;
            });
    }
    async onTakeCreditFile() {
        if (await MessageBoxDialogComponent.confirmYesNo(this.injector, this.translation.$$get('party_detail.do_you_really_want_to_take_credit_file')).toPromise())
            this.progress.runProgress(this.partyApiService.postTakeCreditFile(this.partyDetail.Id).pipe(
                tap(() => this.notification.success(this.translation.$$get('party_detail.credit_file_created'))),
                mergeMap(() => this.partyDetail$()),
                tap(_ => location.reload()))
            ).subscribe();
    }
    onIdentificationNumberValidate(validation: EditorValidation) {
        if (!validation.value || validation.value.length === 0)
            return;

        if (!isIdentificationNumberValid(validation.value, this.isCountryCzSk(this.partyDetail.AddressPo.CountryId)))
            validation.errors.push(this.identificationNumberValidationMessage);
    }
    onBirthNumberValidate(validation: EditorValidation) {
        if (!validation.value || validation.value.length === 0)
            return;

        if (!isBirthNumberValid(validation.value, this.isCountryCzSk(this.partyDetail.AddressFo.CountryId)))
            validation.errors.push(this.birthNumberValidationMessage);
    }
    clientNameValueChange(value: string) {
        if (this.form && this.form.dirty && (this.partyDetail.PersonType == undefined || this.partyDetail.PersonType == EPartyType.FO))
            this.isPo = value != null && value.length > 0;
    }
    firstNameValueChange(value: string) {
        if (this.form && this.form.dirty && (this.partyDetail.PersonType == undefined || this.partyDetail.PersonType == EPartyType.PO))
            this.isFo = value != null && value.length > 0;
    }
    surnameValueChange(value: string) {
        if (this.form && this.form.dirty && (this.partyDetail.PersonType == undefined || this.partyDetail.PersonType == EPartyType.PO))
            this.isFo = value != null && value.length > 0;
    }
    isCountryCzSk(country: number): boolean {
        return this.countriesCzSk.indexOf(country) >= 0;
    }
    birthDateValidate(validation: EditorValidation) {
        if (!validation.value || validation.value.length == 0)
            return;
        const date = fromDateOnlyString(validation.value);
        if (date < this.birthDate_MIN_DATE)
            validation.errors.push(this.translation.$$get('party_detail.cannot_set_past_date'));
    }
    birthNumberValueChange(value: string) {
        if (this.form && this.form.dirty && value && value.length > 0) {
            const isCountryCzSk = this.isCountryCzSk(this.partyDetail.AddressFo.CountryId || 0);

            if (isCountryCzSk && isBirthNumberValid(value, isCountryCzSk))
                // this.partyDetail.BirthDate = toDateOnlyString(getDateFromBirthNumber(value));
                this.partyDetail.BirthDate = getDateFromBirthNumber(value);
        }
    }
    private update(): void {
        this.getUrlParams();

        this.progress.runProgress(
            this.codebookApiService.getCountryCz().pipe(
                tap(id => this.countryCzId = id),
                mergeMap(() => this.partyDetail$()),
                tap(() => {
                    if (this.id != 'new') {	// pro klienty z cmdb
                        this.id = this.partyDetail.Id;
                        this.replaceUrl();
                    }
                }),
               mergeMap(() => this.codebookApiService.getCountriesCzSk()),
                tap(countries => this.countriesCzSk = countries),
            )).subscribe();
    }
    private getUrlParams(): void {
        const id = this.route.snapshot.paramMap.get('id');
        this.id = id == null ? 'new' : +id;
    }
    private save(): Observable<boolean> {
        if (!this.isFormValid())
            return of(false);

        return (() => {
            if (this.id != 'new')
                return this.partyApiService.postDetail(this.partyDetail);

            return this.partyApiService.postCreate(this.partyDetail);
        })().pipe(
            tap(id => this.id = id),
            map(() => true),
            first());
    }
    private isFormValid(): boolean {
        const errorMessages = [];

        // ICO validation
        const identificationNumber = this.partyDetail.IdentificationNumber && this.partyDetail.IdentificationNumber.length > 0 ? this.partyDetail.IdentificationNumber.trim() : null;
        if (identificationNumber && !(isIdentificationNumberValid(identificationNumber, this.isCountryCzSk(this.partyDetail.AddressPo.CountryId))))
            errorMessages.push(this.identificationNumberValidationMessage);

        // Birth number validation
        const isCountryCzSk = this.isCountryCzSk(this.partyDetail.AddressFo.CountryId || 0);
        const birthDate = fromDateOnlyString(this.partyDetail.BirthDate);
        if (!isBirthNumberValid(this.partyDetail.BirthNumber, isCountryCzSk))
            errorMessages.push(this.birthNumberValidationMessage);
        // if birthnumber is not valid no need to validate birth number vs birth date
        else
            // Birth number vs birth date validation
            if (isCountryCzSk && !matchBirthNumberAndDate(this.partyDetail.BirthNumber, birthDate))
                errorMessages.push(this.translation.$$get('party_detail.birth_number_is_not_same_birthdate'));

        // FO validation first + last name + birth date must be all filled
        if ((!this.partyDetail.FirstName || this.partyDetail.FirstName.length == 0 || !this.partyDetail.Surname || this.partyDetail.Surname.length == 0)
            && birthDate && birthDate.getFullYear() >= 1900)
            errorMessages.push(this.translation.$$get('party_detail.no_first_or_last_name'));

        // PO validation if ICO od ZECO are filled then client name must be filled
        if ((this.partyDetail.IdentificationNumber || this.partyDetail.Zecho) && !this.partyDetail.ClientName)
            errorMessages.push(this.translation.$$get('party_detail.no_client_name'));

        if (errorMessages.length == 0 && this.form.invalid)
            errorMessages.push(this.translation.$$get('party_detail.form_is_not_valid'));

        errorMessages.forEach(m => this.notification.error(m));

        if (!this.partyDetail.ClientName && !this.partyDetail.Surname)
            return false;

        return errorMessages.length === 0;
    }
    private replaceUrl(): void {
        this.router.navigate(['detail', this.id], {
            relativeTo: this.route.parent,
            replaceUrl: true
        });
    }
    private partyDetail$(): Observable<IPartyDetailDto> {
        return (() => {
            if (this.id != 'new') {
                this.title.setTitle(this.translation.$$get('party_detail.client_detail_title'));
                return this.partyApiService.getDetail(+this.id);
            }

            this.title.setTitle(this.translation.$$get('party_detail.new_client_title'));
            this.selectedPartyService.clear();
            return of({
                AddressFo: {
                    CountryId: this.countryCzId
                },
                AddressPo: {
                    CountryId: this.countryCzId
                }
            } as IPartyDetailDto);
        })().pipe(
            tap(partyDetail => {
                this.partyDetail = partyDetail;
                this.isFo = this.partyDetail.PersonType && (this.partyDetail.PersonType as EPartyType == EPartyType.FO || this.partyDetail.PersonType == EPartyType.FOP)
                this.isPo = this.partyDetail.PersonType && (this.partyDetail.PersonType == EPartyType.PO || this.partyDetail.PersonType == EPartyType.FOP)
                this.readonlyIdentificationNumber = this.partyDetail.IdentificationNumber && this.partyDetail.IdentificationNumber.length > 0;
                this.readonlyZecho = this.partyDetail.Zecho && this.partyDetail.Zecho.length > 0;
                this.readonlyBirthNumber = this.partyDetail.BirthNumber && this.partyDetail.BirthNumber.length > 0;

                if (this.id != 'new') {
                    this.log.debug('partyDetail changed, updating selected party data');
                    this.selectedPartyService.getData(this.route.snapshot.params).pipe(
                        tap(party => super.fillRights(party)),
                        tap(_ => {
                            this.isReadOnly = (this.id == 'new' && !this.hasRightToAddClient) || (this.id != 'new' && !this.permissionState.hasPermission[EPermissionType.Partyedit]);
                        })
                    ).subscribe();
                } else {
                    if (this.permissionState == null)
                        this.permissionState = new PartyPermissionState(null);
                    this.permissionState.IsPartyManaged = true;
                }
            })
        );
    }
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (!this.isUpdating && this.form && this.form.dirty) {
            return MessageBoxDialogComponent.dirtyConfirmation(this.injector, () => this.save());
        }

        return of(true);
    }
}
