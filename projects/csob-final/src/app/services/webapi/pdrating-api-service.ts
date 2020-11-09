import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base.service';
import * as WebApiModels from './webapi-models';
// class Csob.CreditsUniverse.WebApi.Controllers.PdRatingController, controllerPath=pdrating
@Injectable({ providedIn: 'root' })
export class PdRatingApiService {
    constructor(public api: ApiBaseService) {
    }
    /* POST pdrating/PdRatingOverview PdRatingOverview  */
    public postPdRatingOverview(pdRatingOverviewReqDto: WebApiModels.IPDRatingOverviewReqDto): Observable<WebApiModels.IGridResult<WebApiModels.IPDRatingOverviewResDto>> {
        return this.api.postResult('pdrating/pdratingoverview', {}, pdRatingOverviewReqDto/* DATA */);
    }
    /* GET pdrating/PDRatingDetail PDRatingDetail  */
    public getPDRatingDetail(pdRatingId: number): Observable<WebApiModels.IPDRatingDataDto> {
        return this.api.get('pdrating/pdratingdetail', { 'pdRatingId': pdRatingId });
    }
    /* POST pdrating/SavePDRatingDetail SavePDRatingDetail  */
    public postSavePDRatingDetail(pdRatingEditDto: WebApiModels.IPDRatingEditDto): Observable<number> {
        return this.api.post('pdrating/savepdratingdetail', {}, pdRatingEditDto/* DATA */);
    }
    /* GET pdrating/NewCalculatePDRating NewCalculatePDRating  */
    public getNewCalculatePDRating(pdRatingModelId: number): Observable<WebApiModels.IPDRatingDataDto> {
        return this.api.get('pdrating/newcalculatepdrating', { 'pdRatingModelId': pdRatingModelId });
    }
    /* POST pdrating/AddNewPDRating AddNewPDRating  */
    public postAddNewPDRating(pdRatingNewDto: WebApiModels.IPDRatingNewDto): Observable<number> {
        return this.api.post('pdrating/addnewpdrating', {}, pdRatingNewDto/* DATA */);
    }
    /* POST pdrating/CompletePDRating CompletePDRating  */
    public postCompletePDRating(pdRatingEditDto: WebApiModels.IPDRatingEditDto): Observable<number> {
        return this.api.post('pdrating/completepdrating', {}, pdRatingEditDto/* DATA */);
    }
    /* POST pdrating/ApprobatePDRating ApprobatePDRating  */
    public postApprobatePDRating(pdRatingEditDto: WebApiModels.IPDRatingEditDto): Observable<number> {
        return this.api.post('pdrating/approbatepdrating', {}, pdRatingEditDto/* DATA */);
    }
    /* POST pdrating/CountPDRating CountPDRating  */
    public postCountPDRating(pdRatingEditDto: WebApiModels.IPDRatingEditDto): Observable<any> {
        return this.api.post('pdrating/countpdrating', {}, pdRatingEditDto/* DATA */);
    }
    /* GET pdrating/CanShowPdRating CanShowPdRating  */
    public getCanShowPdRating(partyId: number, pdRatingId: number): Observable<boolean> {
        return this.api.get('pdrating/canshowpdrating', { 'partyId': partyId, 'pdRatingId': pdRatingId });
    }
    /* GET pdrating/IsPDRatingLocked IsPDRatingLocked  */
    public getIsPDRatingLocked(pdRatingId: number): Observable<boolean> {
        return this.api.get('pdrating/ispdratinglocked', { 'pdRatingId': pdRatingId });
    }
    /* POST pdrating/Export Export  */
    public downloadExport(pdRatingId: number, options: WebApiModels.IExportOptions): Observable<HttpResponse<Blob>> {
        return this.api.download('pdrating/export', { 'pdRatingId': pdRatingId }, options/* DATA */);
    }
    /* POST pdrating/SaveApprovedPDRating SaveApprovedPDRating  */
    public postSaveApprovedPDRating(dto: WebApiModels.IPDRatingApprovedDto): Observable<number> {
        return this.api.post('pdrating/saveapprovedpdrating', {}, dto/* DATA */);
    }
}
