import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base.service';
import * as WebApiModels from './webapi-models';
// class Csob.CreditsUniverse.WebApi.Controllers.ContractConditionsController, controllerPath=contractconditions
@Injectable({ providedIn: 'root' })
export class ContractConditionsApiService {
    constructor(public api: ApiBaseService) {
    }
    /* GET contractconditions/AvailableProductsForClient AvailableProductsForClient  */
    public getAvailableProductsForClient(creditFileId: number): Observable<WebApiModels.IProductInfoDto[]> {
        return this.api.get('contractconditions/availableproductsforclient', { 'creditFileId': creditFileId });
    }
    /* POST contractconditions/ContractConditionOverview ContractConditionOverview  */
    public postContractConditionOverview(filter: WebApiModels.IContractConditionFilterDto): Observable<WebApiModels.IGridResult<WebApiModels.IContractConditionViewDto>> {
        return this.api.postResult('contractconditions/contractconditionoverview', {}, filter/* DATA */);
    }
    /* GET contractconditions/ContractCondition ContractCondition  */
    public getContractCondition(conditionId: number, versionNumber: number, readOnly: boolean): Observable<WebApiModels.IContractConditionEditDto> {
        return this.api.get('contractconditions/contractcondition', { 'conditionId': conditionId, 'versionNumber': versionNumber, 'readOnly': readOnly });
    }
    /* POST contractconditions/Save Save  */
    public postSave(dto: WebApiModels.IContractConditionEditDto): Observable<WebApiModels.IContractConditionDto> {
        return this.api.post('contractconditions/save', {}, dto/* DATA */);
    }
    /* POST contractconditions/Delete Delete  */
    public postDelete(conditionId: number): Observable<WebApiModels.IContractConditionDto> {
        return this.api.post('contractconditions/delete', { 'conditionId': conditionId });
    }
    /* GET contractconditions/InitialConditionTypesFinancial InitialConditionTypesFinancial  */
    public getInitialConditionTypesFinancial(creditFileId: number): Observable<WebApiModels.IFinancialCovenantDto[]> {
        return this.api.get('contractconditions/initialconditiontypesfinancial', { 'creditFileId': creditFileId });
    }
    /* POST contractconditions/AvailableConditionTypesFinancial AvailableConditionTypesFinancial  */
    public postAvailableConditionTypesFinancial(dto: WebApiModels.IContractConditionEditDto): Observable<WebApiModels.IFinancialCovenantDto[]> {
        return this.api.post('contractconditions/availableconditiontypesfinancial', {}, dto/* DATA */);
    }
    /* POST contractconditions/AvailableConditionTypesNonFinancial AvailableConditionTypesNonFinancial  */
    public postAvailableConditionTypesNonFinancial(dto: WebApiModels.IContractConditionEditDto): Observable<WebApiModels.INonFinancialCovenantDto[]> {
        return this.api.post('contractconditions/availableconditiontypesnonfinancial', {}, dto/* DATA */);
    }
    /* POST contractconditions/InitEvaluationRules InitEvaluationRules  */
    public postInitEvaluationRules(dto: WebApiModels.IContractConditionEditDto): Observable<WebApiModels.IContractConditionRuleEditDto[]> {
        return this.api.post('contractconditions/initevaluationrules', {}, dto/* DATA */);
    }
    /* POST contractconditions/ValidateModel ValidateModel  */
    public postValidateModel(dto: WebApiModels.IContractConditionEditDto): Observable<WebApiModels.IContractConditionEditDto> {
        return this.api.post('contractconditions/validatemodel', {}, dto/* DATA */);
    }
    /* GET contractconditions/FinancialCovenant FinancialCovenant  */
    public getFinancialCovenant(id: number): Observable<WebApiModels.IFinancialCovenantDto> {
        return this.api.get('contractconditions/financialcovenant', { 'id': id });
    }
    /* GET contractconditions/NonFinancialCovenant NonFinancialCovenant  */
    public getNonFinancialCovenant(id: number): Observable<WebApiModels.INonFinancialCovenantDto> {
        return this.api.get('contractconditions/nonfinancialcovenant', { 'id': id });
    }
}
