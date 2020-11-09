import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base.service';
import * as WebApiModels from './webapi-models';
// class Csob.CreditsUniverse.WebApi.Controllers.CodebookController, controllerPath=codebook
@Injectable({ providedIn: 'root' })
export class CodebookApiService {
    constructor(public api: ApiBaseService) {
    }
    /* GET codebook/KeyEnums KeyEnums  */
    public getKeyEnums(keyEnum: WebApiModels.EKeyEnum): Observable<WebApiModels.ICodebookItem[]> {
        return this.api.get('codebook/keyenums', { 'keyEnum': keyEnum });
    }
    /* GET codebook/Codebook Codebook  */
    public getCodebook(table: WebApiModels.ECodetable): Observable<WebApiModels.ICodebookItem[]> {
        return this.api.get('codebook/codebook', { 'table': table });
    }
    /* GET codebook/Langtable Langtable  */
    public getLangtable(name: string): Observable<WebApiModels.ICodebookItem[]> {
        return this.api.get('codebook/langtable', { 'name': name });
    }
    /* GET codebook/CodebookCode CodebookCode  */
    public getCodebookCode(table: WebApiModels.ECodetable): Observable<WebApiModels.ICodebookItem[]> {
        return this.api.get('codebook/codebookcode', { 'table': table });
    }
    /* GET codebook/CodebookById CodebookById  */
    public getCodebookById(table: WebApiModels.ECodetable, id: number): Observable<WebApiModels.ICodebookItem> {
        return this.api.get('codebook/codebookbyid', { 'table': table, 'id': id });
    }
    /* GET codebook/CodebookCodeById CodebookCodeById  */
    public getCodebookCodeById(table: WebApiModels.ECodetable, id: number): Observable<WebApiModels.ICodebookItem> {
        return this.api.get('codebook/codebookcodebyid', { 'table': table, 'id': id });
    }
    /* GET codebook/CountriesCzSk CountriesCzSk  */
    public getCountriesCzSk(): Observable<number[]> {
        return this.api.get('codebook/countriesczsk', {});
    }
    /* GET codebook/CountryCz CountryCz  */
    public getCountryCz(): Observable<number> {
        return this.api.get('codebook/countrycz', {});
    }
    /* GET codebook/Operator2 Operator2  */
    public getOperator2(): Observable<WebApiModels.ICodebookItem[]> {
        return this.api.get('codebook/operator2', {});
    }
    /* GET codebook/MonitoringSemaphore MonitoringSemaphore  */
    public getMonitoringSemaphore(): Observable<WebApiModels.ICodebookItem[]> {
        return this.api.get('codebook/monitoringsemaphore', {});
    }
    /* GET codebook/MonitoringLightTreatment MonitoringLightTreatment  */
    public getMonitoringLightTreatment(): Observable<WebApiModels.ICodebookItem[]> {
        return this.api.get('codebook/monitoringlighttreatment', {});
    }
    /* GET codebook/CredacHierarchy CredacHierarchy  */
    public getCredacHierarchy(): Observable<WebApiModels.IHierarchyCodeBookItem[]> {
        return this.api.get('codebook/credachierarchy', {});
    }
    /* GET codebook/FeeUnitCurrency FeeUnitCurrency  */
    public getFeeUnitCurrency(): Observable<number> {
        return this.api.get('codebook/feeunitcurrency', {});
    }
    /* GET codebook/ExternalRating ExternalRating  */
    public getExternalRating(model: number): Observable<WebApiModels.IExternalCodebookItem[]> {
        return this.api.get('codebook/externalrating', { 'model': model });
    }
    /* GET codebook/Ratings Ratings  */
    public getRatings(): Observable<WebApiModels.IRatingCodebookItem[]> {
        return this.api.get('codebook/ratings', {});
    }
    /* GET codebook/IsCalculateInCu IsCalculateInCu  */
    public getIsCalculateInCu(id: number): Observable<WebApiModels.ICalculatePDRatingModelDto> {
        return this.api.get('codebook/iscalculateincu', { 'id': id });
    }
    /* GET codebook/LGDModel LGDModel  */
    public getLGDModel(): Observable<WebApiModels.ILGDModelCodebookItem[]> {
        return this.api.get('codebook/lgdmodel', {});
    }
    /* GET codebook/PdRatingModels PdRatingModels  */
    public getPdRatingModels(): Observable<WebApiModels.IPDRatingModelDto[]> {
        return this.api.get('codebook/pdratingmodels', {});
    }
    /* GET codebook/ValidProductTypeCUByLGD ValidProductTypeCUByLGD  */
    public getValidProductTypeCUByLGD(lgdModelId: number): Observable<WebApiModels.IProductTypeCUDto[]> {
        return this.api.get('codebook/validproducttypecubylgd', { 'lgdModelId': lgdModelId });
    }
    /* GET codebook/ValidProductSubTypeCUByLGD ValidProductSubTypeCUByLGD  */
    public getValidProductSubTypeCUByLGD(lgdModelId: number): Observable<WebApiModels.IProductSubTypeCUDto[]> {
        return this.api.get('codebook/validproductsubtypecubylgd', { 'lgdModelId': lgdModelId });
    }
    /* GET codebook/ValidCollateralTypeCUByLGD ValidCollateralTypeCUByLGD  */
    public getValidCollateralTypeCUByLGD(lgdModelId: number): Observable<WebApiModels.ICollateralTypeCUDto[]> {
        return this.api.get('codebook/validcollateraltypecubylgd', { 'lgdModelId': lgdModelId });
    }
    /* GET codebook/ValidCollateralSubTypeCUByLGD ValidCollateralSubTypeCUByLGD  */
    public getValidCollateralSubTypeCUByLGD(lgdModelId: number): Observable<WebApiModels.ICollateralSubTypeCUDto[]> {
        return this.api.get('codebook/validcollateralsubtypecubylgd', { 'lgdModelId': lgdModelId });
    }
    /* GET codebook/GetDashboardTypes GetDashboardTypes  */
    public getDashboardTypes(opt: { isForUser: boolean }  = <any>{}): Observable<WebApiModels.IDashboardTypeDto[]> {
        return this.api.get('codebook/getdashboardtypes', { 'isForUser': opt['isForUser'] });
    }
}
