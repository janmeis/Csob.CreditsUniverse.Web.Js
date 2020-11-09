import { Component, EventEmitter, Injector, Input, Output, OnInit } from '@angular/core';

import { EditorValidation } from '../../app-common/directives/editor-validator.directive';
import { TranslationService } from '../../services/translation-service';
import { ENotificationType, UserNotificationService } from '../../services/user-notification.service';
import { ISearchClientReqDto } from '../../services/webapi/webapi-models';
import { AppConfig } from 'src/app/app-config';
import { normalizeIdentificationNumber } from './identification-number-normalization';
import { getCurrentComponetPath } from 'src/app/app-common/common-functions';

@Component({
    selector: 'app-party-search-criteria',
    templateUrl: './party-search-criteria.component.html',
    styleUrls: ['./party-search-criteria.component.less'],
})
export class PartySearchCriteriaComponent implements OnInit {
    private _criteria: ISearchClientReqDto;
    minSearchChars: number;
    get criteria(): ISearchClientReqDto {
        return this._criteria;
    }
    @Input() set criteria(x) {
        this._criteria = x;
        this.criteriaChange.emit(this._criteria);
    }
    @Output() criteriaChange = new EventEmitter<ISearchClientReqDto>();

    private _searched: boolean;
    get searched(): boolean {
        return this._searched;
    }
    @Input() set searched(x) {
        this._searched = x;
        this.searchedChange.emit(this._searched);
    }
    @Output() searchedChange = new EventEmitter<boolean>();

    get isFo(): boolean {
        return (this.criteria.Surname && this.criteria.Surname.length > 0)
            || (this.criteria.FirstName && this.criteria.FirstName.length > 0)
            || (this.criteria.BirthNumber && this.criteria.BirthNumber.length > 0)
            || this.criteria.BirthDate != null;
    }
    get isPo(): boolean {
        return (this.criteria.ClientName && this.criteria.ClientName.length > 0)
            || (this.criteria.IdentificationNumber && this.criteria.IdentificationNumber.length > 0);
    }
    get isAnyCriteria(): boolean {
        const firstAndSurname = this.criteria.Surname && this.criteria.Surname.length >= 3 && this.criteria.FirstName && this.criteria.FirstName.length >= 3;
        const noFirstAndSurname = (this.criteria.Surname == null || this.criteria.Surname.length == 0) && (this.criteria.FirstName == null || this.criteria.FirstName.length == 0);
        const birthNumber = this.criteria.BirthNumber && this.birthNumberRegex.test(this.criteria.BirthNumber);
        const birthDate = this.criteria.BirthDate && this.criteria.BirthDate.getFullYear() >= 1900;
        const clientName = this.criteria.ClientName && this.criteria.ClientName.length >= 3;
        const identificationNumber = this.criteria.IdentificationNumber && this.identificationNumberRegex.test(this.criteria.IdentificationNumber);
        return firstAndSurname
            || birthNumber && noFirstAndSurname
            || birthDate && firstAndSurname
            || clientName
            || identificationNumber;
    }
    private readonly birthNumberValidationMessage = this.translation.$$get('party_search_criteria.birth_number_format_is_invalid');
    private readonly birthDateValidationMessage = this.translation.$$get('party_search_criteria.both_first_name_and_surname_must_be_filled');
    private readonly identificationNumberValidationMessage = this.translation.$$get('party_search_criteria.identification_number_format_is_invalid');
    private readonly surnameValidationMessage = this.translation.$$get('party_search_criteria.both_first_name_and_surname_must_be_filled');
    private readonly birthNumberRegex = /^(?:(?:\d{1,10})|(?:\d{6}\/\d{0,4}))\s*$/;
    private readonly identificationNumberRegex = /^(?:\d*)\s*$/;
    private readonly identificationNumberLength = 8;

    constructor(
        private appConfig: AppConfig,
        private notifications: UserNotificationService,
        private translation: TranslationService
    ) { }

    ngOnInit() {
        this.minSearchChars = this.appConfig.minSearchChars;
    }

    onSurnameValidate(validation: EditorValidation) {
        this.searched = false;
        if ((!validation.value || validation.value.length === 0) && this.criteria.FirstName && this.criteria.FirstName.length > 0 ||
            validation.value && validation.value.length > 0 && (!this.criteria.FirstName || this.criteria.FirstName.length == 0)) {
            if (this.notifications.messages.filter(m => m.type == ENotificationType.Warning).length == 0)
                this.notificationMessage(this.surnameValidationMessage);
        } else
            this.notifications.messages = this.notifications.messages.filter(m => m.message != this.surnameValidationMessage);
    }
    onFirstNameValidate(validation: EditorValidation) {
        this.searched = false;
        if ((!validation.value || validation.value.length === 0) && this.criteria.Surname && this.criteria.Surname.length > 0 ||
            validation.value && validation.value.length > 0 && (!this.criteria.Surname || this.criteria.Surname.length == 0)) {
            if (this.notifications.messages.filter(m => m.type == ENotificationType.Warning).length == 0)
                this.notificationMessage(this.surnameValidationMessage);
        } else
            this.notifications.messages = this.notifications.messages.filter(m => m.message != this.surnameValidationMessage);
    }
    onBirthNumberValidate(validation: EditorValidation) {
        this.searched = false;
        if (!validation.value || validation.value.length === 0)
            return;

        if (!this.birthNumberRegex.test(validation.value))
            validation.errors.push(this.birthNumberValidationMessage);
    }
    onBirthDateValidate(validation: EditorValidation) {
        this.searched = false;
        if (!validation.value || validation.value.length === 0) {
            if ((!this.criteria.FirstName || this.criteria.FirstName.length == 0) || (!this.criteria.Surname || this.criteria.Surname.length == 0))
                this.notifications.messages = this.notifications.messages.filter(m => m.message != this.birthDateValidationMessage);
            return;
        }

        if ((!this.criteria.FirstName || this.criteria.FirstName.length == 0) || (!this.criteria.Surname || this.criteria.Surname.length == 0)) {
            if (this.notifications.messages.filter(m => m.type == ENotificationType.Warning).length == 0)
                this.notificationMessage(this.birthDateValidationMessage);
        } else
            this.notifications.messages = this.notifications.messages.filter(m => m.message != this.birthDateValidationMessage);
    }
    onIdentificationNumberValidate(validation: EditorValidation) {
        this.searched = false;
        if (!validation.value || validation.value.length === 0)
            return;

        if (!this.identificationNumberRegex.test(validation.value))
            validation.errors.push(this.identificationNumberValidationMessage);
    }

    onIdentificationNumberChange(event: FocusEvent) {
        const identificationNumber = `${event.target['value']}`.trim();
        if (!identificationNumber || identificationNumber.length === 0 || !this.identificationNumberRegex.test(identificationNumber))
            return;

        if (identificationNumber.length < this.identificationNumberLength)
            this.criteria.IdentificationNumber = normalizeIdentificationNumber(identificationNumber);
    }

    private notificationMessage(message: string) {
        this.notifications.show({ message, type: ENotificationType.Warning, pinned: true, delay: 0 });
    }
}
