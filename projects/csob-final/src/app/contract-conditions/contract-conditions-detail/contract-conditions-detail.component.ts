import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, of } from 'rxjs';
import { first, map, mergeMap, tap } from 'rxjs/operators';
import { markControlsDirty } from 'projects/app-common/src/public-api'
import { GetStaticCodebookProvider, ICodebookProvider } from 'projects/app-common/src/public-api';
import { MessageBoxDialogComponent } from 'projects/app-common/src/public-api';
import { EditorValidation } from 'projects/app-common/src/public-api';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { CanComponentDeactivate } from 'projects/services/src/public-api';
import { CodebooksService } from 'projects/services/src/public-api';
import { SecurityService } from 'projects/services/src/public-api';
import { SelectedPartyService } from 'projects/services/src/public-api';
import { TranslationService } from 'projects/services/src/public-api';
import { UserNotificationService } from 'projects/services/src/public-api';
import { UserProgressService } from 'projects/services/src/public-api';
import { ContractConditionsApiService } from 'projects/services/src/public-api';
import { ECodetable, EFinancialConditionOperator, EFrequencyUnit, ERecurrenceType, ICodebookItem, IContractConditionDto, IContractConditionEditDto, IContractConditionRuleEditDto, IFinancialCovenantDto, IPartyHeaderDto } from 'projects/services/src/public-api';
import { ContractConditionsService } from '../services/contract-conditions.service';

@UntilDestroy()
@Component({
    selector: 'app-contract-conditions-detail',
    templateUrl: './contract-conditions-detail.component.html',
    styleUrls: ['./contract-conditions-detail.component.less'],
    providers: [
        ContractConditionsService
    ]
})
export class ContractConditionsDetailComponent extends BasePermissionsComponent implements CanComponentDeactivate, OnInit {
    @ViewChild('form') private form: NgForm;
    creditFileId: number;
    id: number | 'new';
    versionNumber: number;
    readonly: boolean;
    hasConditions: boolean;
    consolidated: boolean;
    model: IContractConditionEditDto;
    saveResult: IContractConditionDto;
    financialCovenants: IFinancialCovenantDto[];
    contractConditions: ICodebookProvider;
    ERecurrenceType = ERecurrenceType;
    isFromMonitoring = false;
    canShowValueDown = true;
    isCustom = false;
    isRecurrent = false;
    private monitoringQueryParams: Params = {};

    constructor(
        private codebooksService: CodebooksService,
        private contractConditionsApiService: ContractConditionsApiService,
        private contractConditionsService: ContractConditionsService,
        private injector: Injector,
        private notification: UserNotificationService,
        public progress: UserProgressService,
        private route: ActivatedRoute,
        private router: Router,
        private selectedPartyService: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        protected securityService: SecurityService,
    ) {
        super(securityService);
    }

    ngOnInit(): void {
        this.title.setTitle(this.translation.$$get('contract_conditions_detail.page_title'));

        this.getUrlParams();

        this.hasConditions = false;
        this.consolidated = false;

        this.progress.runProgress(
            this.selectedPartyService.partyHeader.pipe(
                tap((party: IPartyHeaderDto) => {
                    this.creditFileId = party.CreditFileId;
                    super.fillRights(party);
                }),
                mergeMap(() => this.contractConditionsApiService.getInitialConditionTypesFinancial(this.creditFileId)),
                tap(covenants => this.financialCovenants = covenants),
                mergeMap(covenants => {
                    this.hasConditions = covenants.length > 0;
                    if (this.id == 'new')
                        return of(covenants.map(c => ({ Value: c.Id, Order: c.Order, Text: c.Description } as ICodebookItem)));
                    return this.codebooksService.GetCodebook(ECodetable[ECodetable.FinancialCovenant]);
                }),
                tap(contractConditions => this.contractConditions = GetStaticCodebookProvider(contractConditions)),
                mergeMap(() => this.update$()))
        ).subscribe();
    }

    onEdit() {
        this.router.navigate(['detail', +this.id], { relativeTo: this.route.parent, replaceUrl: true });
        this.readonly = false;
        this.progress.runProgress(
            this.update$().pipe(
                mergeMap(_ => this.updateEvaluationRules$()))
        ).subscribe();
    }

    async onDelete() {
        if (await MessageBoxDialogComponent.confirmYesNo(this.injector, this.translation.$$get('contract_conditions_detail.sure_delete_the_contract_condition')).toPromise())
            this.progress.runProgress(
                this.contractConditionsApiService.postDelete(+this.id).pipe(tap(x => this.saveResult = x))
            ).subscribe(() => {
                this.notification.success(this.translation.$$get('contract_conditions_detail.data_deleted'));

                this.router.navigate(['overview'], { relativeTo: this.route.parent });
            });
    }

    onSave() {
        this.progress.runProgress(
            this.save$()
        ).subscribe(result => {
            if (result && this.saveResult) {
                this.notification.success(this.translation.$$get('contract_conditions_detail.data_saved'));
                this.router.navigate(['overview'], { relativeTo: this.route.parent });
            }

            this.notification.error(this.translation.$$get('contract_conditions_detail.need_all_required_fields'));
        });
    }

    contractConditionsValueChange(event: number) {
        if (this.readonly || !this.financialCovenants)
            return;

        const covenant = this.financialCovenants.find(f => f.Id == event);
        if (!!covenant) {
            this.isCustom = covenant.IsCustom || false;
            const operatorKey = covenant.DefaultOperatorKey;
            if (!!operatorKey)
                this.model.EvaluationRules.filter(e => !e.Readonly).forEach(e => e.OperatorKey = operatorKey);
        }

        if (this.model.FinancialCovenantId && this.id == 'new') {
            this.progress.runProgress(
                this.contractConditionsApiService.postValidateModel(this.model)
            ).subscribe(result => {
                this.model.EvaluationDateFrom = result.EvaluationDateFrom;
                this.model.EvaluationDateFromMin = result.EvaluationDateFromMin;
                this.model.EvaluationRules = result.EvaluationRules;

                this.isRecurrent = this.getIsRecurrent();
            });
        }
    }

    recurrenceValueChange(event: ERecurrenceType) {
        if (this.id != 'new')
            return;
        if (!this.readonly && event) {
            switch (event) {
                case ERecurrenceType.OneOff:
                    if (!this.model.EvaluationRules || this.model.EvaluationRules.length != 1 || this.model.FrequencyUnit == EFrequencyUnit.Year)
                        this.model.EvaluationRules = [{ OperatorKey: EFinancialConditionOperator.Min } as IContractConditionRuleEditDto];
                    this.model.FrequencyUnit = null;
                    break;
                case ERecurrenceType.Repeatedly:
                    if (!this.model.FrequencyUnit)
                        this.model.EvaluationRules = [];
                    break;
            }

            this.isRecurrent = this.getIsRecurrent();
        }
    }

    frequencyValueChange(event: EFrequencyUnit) {
        if (this.progress.running)
            return;
        if (!this.readonly && event) {
            this.progress.runProgress(
                this.updateEvaluationRules$()
            ).subscribe();
        }
    }

    nextEvaluationDateChange(event: Date) {
        if (this.progress.running) return;
        if (!this.readonly && event) {

            this.progress.runProgress(
                this.contractConditionsApiService.postInitEvaluationRules(this.model)
            ).pipe(
                tap(rules => {
                    this.model.EvaluationRules = rules;
                    this.model.EvaluationDateFrom = rules[0].NextEvaluationDate;

                    let operatorKey: EFinancialConditionOperator;
                    const covenant = this.financialCovenants.find(f => f.Id == this.model.FinancialCovenantId);
                    if (covenant && (operatorKey = covenant.DefaultOperatorKey))
                        this.model.EvaluationRules.forEach(e => e.OperatorKey = operatorKey);

                    this.isRecurrent = this.getIsRecurrent();
                })
            ).subscribe();
        }
    }
    consolidatedChange(event: boolean) {
        if (this.model && this.model.Consolidated != this.consolidated && !this.model.ContractConditionId) {

            this.consolidated = this.model.Consolidated;
            this.progress.runProgress(
                this.contractConditionsApiService.postAvailableConditionTypesFinancial(this.model)
            ).pipe(
                tap(covenants => this.financialCovenants = covenants),
                mergeMap(covenants => {
                    this.hasConditions = covenants.length > 0;
                    return of(covenants.map(c => ({ Value: c.Id, Order: c.Order, Text: c.Description } as ICodebookItem)));
                }),
                tap(contractConditions => this.contractConditions = GetStaticCodebookProvider(contractConditions)),
            ).subscribe();

            if (this.model.FinancialCovenantId && this.id == 'new') {
                this.progress.runProgress(
                    this.contractConditionsApiService.postValidateModel(this.model)
                ).subscribe(result => {
                    this.model.EvaluationDateFrom = result.EvaluationDateFrom;
                    this.model.EvaluationDateFromMin = result.EvaluationDateFromMin;
                    this.model.EvaluationRules = result.EvaluationRules;

                    this.isRecurrent = this.getIsRecurrent();
                });
            }
        }
    }
    nextEvaluationDateValidate(validation: EditorValidation) {
        if (!validation.value || validation.value.length == 0)
            return;

        if ((validation.value as Date) < this.model.EvaluationDateFromMin)
            validation.errors.push(this.translation.$$get('contract_conditions_detail.cannot_set_past_date'));
    }

    financialValueDownClick() {
        this.model.EvaluationRules.filter(e => !e.Readonly).forEach(e => {
            e.OperatorKey = this.model.EvaluationRules[0].OperatorKey;
            e.RequiredFinancialValue = this.model.EvaluationRules[0].RequiredFinancialValue;
        });
    }

    onToMonitoringClick() {
        this.router.navigate(['../monitoring/overview'], { queryParams: this.monitoringQueryParams, relativeTo: this.route.parent });
    }

    private getUrlParams() {
        this.route.queryParams.pipe(
            untilDestroyed(this)
        ).subscribe(params => {
            this.isFromMonitoring = !!params['Granularity'];
            if (this.isFromMonitoring)
                this.monitoringQueryParams = params;

            this.versionNumber = +params['versionNumber'] || 0;
            this.readonly = params['readonly'] == 'true';

            this.id = +this.route.snapshot.paramMap.get('id') || 'new';
        });
    }

    onRequiredFinancialValueValidate(validation: EditorValidation) {
        this.canShowValueDown = true;

        if (!validation.value)
            return;

        if (Math.abs(validation.value) > 9999999999999.00) {
            validation.errors.push(this.translation.$$get('contract_conditions_detail.required_financial_value_too_big'));
            this.canShowValueDown = false;
        } if (/^\d+[,\.]\d{6,}$/.test(`${validation.value}`)) { // fraction more than 5 digits
            validation.errors.push(this.translation.$$get('contract_conditions_detail.required_financial_value_fraction_error'));
            this.canShowValueDown = false;
        }
    }

    private save$(): Observable<boolean> {
        if (this.isFormValid()) {
            return this.contractConditionsApiService.postSave(this.model).pipe(
                tap(x => this.saveResult = x),
                map(() => true),
                first());
        }

        return of(false);
    }

    private isFormValid(): boolean {
        markControlsDirty(this.form.form);

        //
        return this.form.valid;
    }

    private update$(): Observable<IContractConditionEditDto> {
        return (() => {
            if (this.id == 'new')
                return this.contractConditionsService.getProducts(this.creditFileId).pipe(
                    map(products => ({ CreditFileId: this.creditFileId, Recurrence: ERecurrenceType.Repeatedly, ProductIds: products.map(p => p.Id), EvaluationRules: [], Active: true } as IContractConditionEditDto))
                );

            return this.contractConditionsApiService.getContractCondition(this.id, this.versionNumber, this.readonly);
        })().pipe(
            tap(condition => {
                this.model = condition;

                this.isCustom = !!this.model && !!this.financialCovenants && this.financialCovenants.some(f => f.Id == this.model.FinancialCovenantId && f.IsCustom);
                this.isRecurrent = this.getIsRecurrent();
            })
        );
    }

    private updateEvaluationRules$(): Observable<IContractConditionRuleEditDto[]> {
        return this.contractConditionsApiService.postInitEvaluationRules(this.model).pipe(
            tap(rules => {
                this.model.EvaluationRules = rules;
                this.model.EvaluationDateFrom = rules[0].NextEvaluationDate;

                let operatorKey: EFinancialConditionOperator;
                const covenant = this.financialCovenants.find(f => f.Id == this.model.FinancialCovenantId);
                if (covenant && (operatorKey = covenant.DefaultOperatorKey))
                    this.model.EvaluationRules.forEach(e => e.OperatorKey = operatorKey);

                this.isRecurrent = this.getIsRecurrent();
            }));
    }

    private getIsRecurrent(): boolean {
        return !!this.model && this.model.Recurrence == ERecurrenceType.Repeatedly && !!this.model.EvaluationRules && this.model.EvaluationRules.length > 0;
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (!this.progress.running && this.form && this.form.dirty && (this.hasRightTo && this.hasRightTo['Conditionssave']))
            return MessageBoxDialogComponent.dirtyConfirmation(this.injector, () => this.save$());

        return of(true);
    }
}
