import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base.service';
import * as WebApiModels from './webapi-models';
// class Csob.CreditsUniverse.WebApi.Controllers.RarocController, controllerPath=raroc
@Injectable({ providedIn: 'root' })
export class RarocApiService {
    constructor(public api: ApiBaseService) {
    }
    /* POST raroc/RarocOverview RarocOverview  */
    public postRarocOverview(rarocOverviewReqDto: WebApiModels.IRarocOverviewReqDto): Observable<WebApiModels.IGridResult<WebApiModels.IRarocOverviewResDto>> {
        return this.api.postResult('raroc/rarocoverview', {}, rarocOverviewReqDto/* DATA */);
    }
    /* POST raroc/CalculateRaroc CalculateRaroc  */
    public postCalculateRaroc(rarocId: number): Observable<number> {
        return this.api.postResult('raroc/calculateraroc', { 'rarocId': rarocId });
    }
    /* GET raroc/ValidationRarocSubProdColl ValidationRarocSubProdColl  */
    public getValidationRarocSubProdColl(rarocId: number): Observable<WebApiModels.IRarocValidationDto> {
        return this.api.get('raroc/validationrarocsubprodcoll', { 'rarocId': rarocId });
    }
    /* POST raroc/SaveRaroc SaveRaroc  */
    public postSaveRaroc(rarocContainer: WebApiModels.IRarocContainerDto): Observable<number> {
        return this.api.post('raroc/saveraroc', {}, rarocContainer/* DATA */);
    }
    /* GET raroc/ProductsDto ProductsDto  */
    public getProductsDto(rarocId: number): Observable<WebApiModels.IRarocProductsDto> {
        return this.api.get('raroc/productsdto', { 'rarocId': rarocId });
    }
    /* POST raroc/SaveRarocProducts SaveRarocProducts  */
    public postSaveRarocProducts(dto: WebApiModels.IRarocProductsDto): Observable<string> {
        return this.api.post('raroc/saverarocproducts', {}, dto/* DATA */);
    }
    /* POST raroc/SaveRarocProduct SaveRarocProduct  */
    public postSaveRarocProduct(dto: WebApiModels.IRarocProductDto): Observable<WebApiModels.IRarocProductDto> {
        return this.api.post('raroc/saverarocproduct', {}, dto/* DATA */);
    }
    /* GET raroc/CollateralDto CollateralDto  */
    public getCollateralDto(rarocId: number): Observable<WebApiModels.IRarocCollateralsDto> {
        return this.api.get('raroc/collateraldto', { 'rarocId': rarocId });
    }
    /* POST raroc/SaveRarocCollaterals SaveRarocCollaterals  */
    public postSaveRarocCollaterals(dto: WebApiModels.IRarocCollateralsDto): Observable<string> {
        return this.api.post('raroc/saveraroccollaterals', {}, dto/* DATA */);
    }
    /* POST raroc/SaveRarocCollateral SaveRarocCollateral  */
    public postSaveRarocCollateral(dto: WebApiModels.IRarocCollateralDto): Observable<WebApiModels.IRarocCollateralDto> {
        return this.api.post('raroc/saveraroccollateral', {}, dto/* DATA */);
    }
    /* POST raroc/CancelRarocs CancelRarocs  */
    public postCancelRarocs(values: number[]): Observable<any> {
        return this.api.post('raroc/cancelrarocs', {}, values/* DATA */);
    }
    /* POST raroc/FinishRaroc FinishRaroc  */
    public postFinishRaroc(raroc: WebApiModels.IRarocDto): Observable<any> {
        return this.api.post('raroc/finishraroc', {}, raroc/* DATA */);
    }
    /* GET raroc/PDRatingCandidates PDRatingCandidates  */
    public getPDRatingCandidates(creditFileId: number): Observable<WebApiModels.IPDRatingItem[]> {
        return this.api.get('raroc/pdratingcandidates', { 'creditFileId': creditFileId });
    }
    /* GET raroc/ProjectTypes ProjectTypes  */
    public getProjectTypes(mode: WebApiModels.ERarocMode): Observable<WebApiModels.ICodebookItem[]> {
        return this.api.get('raroc/projecttypes', { 'mode': mode });
    }
    /* POST raroc/Export Export  */
    public downloadExport(partyId: number, rarocId: number, rarocExportOptions: WebApiModels.IRarocExportOptions): Observable<HttpResponse<Blob>> {
        return this.api.download('raroc/export', { 'partyId': partyId, 'rarocId': rarocId }, rarocExportOptions/* DATA */);
    }
    /* GET raroc/MainRaroc MainRaroc  */
    public getMainRaroc(rarocId: number): Observable<WebApiModels.IRarocContainerDto> {
        return this.api.get('raroc/mainraroc', { 'rarocId': rarocId });
    }
    /* GET raroc/RarocOutput RarocOutput  */
    public getRarocOutput(rarocId: number): Observable<WebApiModels.IRarocOutputContainerDto> {
        return this.api.get('raroc/rarocoutput', { 'rarocId': rarocId });
    }
    /* GET raroc/NewRaroc NewRaroc  */
    public getNewRaroc(creditFileId: number): Observable<number> {
        return this.api.get('raroc/newraroc', { 'creditFileId': creditFileId });
    }
    /* GET raroc/MatrixDto MatrixDto  */
    public getMatrixDto(rarocId: number): Observable<WebApiModels.IMatrixDto> {
        return this.api.get('raroc/matrixdto', { 'rarocId': rarocId });
    }
    /* POST raroc/SaveMatrix SaveMatrix  */
    public postSaveMatrix(items: WebApiModels.IMatrixItemDto[][]): Observable<string> {
        return this.api.post('raroc/savematrix', {}, items/* DATA */);
    }
    /* GET raroc/CopyRaroc CopyRaroc  */
    public getCopyRaroc(rarocId: number): Observable<number> {
        return this.api.get('raroc/copyraroc', { 'rarocId': rarocId });
    }
    /* GET raroc/IsRarocLocked IsRarocLocked  */
    public getIsRarocLocked(rarocId: number): Observable<boolean> {
        return this.api.get('raroc/israroclocked', { 'rarocId': rarocId });
    }
}
