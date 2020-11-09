import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base.service';
import * as WebApiModels from './webapi-models';
// class Csob.CreditsUniverse.WebApi.Controllers.PartyController, controllerPath=party
@Injectable({ providedIn: 'root' })
export class PartyApiService {
    constructor(public api: ApiBaseService) {
    }
    /* POST party/Search Search  */
    public postSearch(criteria: WebApiModels.ISearchClientReqDto): Observable<WebApiModels.IGridResult<WebApiModels.ISearchClientResDto>> {
        return this.api.postResult('party/search', {}, criteria/* DATA */);
    }
    /* POST party/SearchInCU SearchInCU  */
    public postSearchInCU(criteria: WebApiModels.ISearchClientInCuReqDto): Observable<WebApiModels.IGridResult<WebApiModels.ISearchClientResDto>> {
        return this.api.post('party/searchincu', {}, criteria/* DATA */);
    }
    /* GET party/Detail Detail  */
    public getDetail(id: number, opt: { cuid: number }  = <any>{}): Observable<WebApiModels.IPartyDetailDto> {
        return this.api.get('party/detail', { 'id': id, 'cuid': opt['cuid'] });
    }
    /* POST party/ResolveNegatives ResolveNegatives  */
    public postResolveNegatives(partyId: number): Observable<any> {
        return this.api.post('party/resolvenegatives', { 'partyId': partyId });
    }
    /* POST party/Detail Detail  */
    public postDetail(model: WebApiModels.IPartyDetailDto): Observable<number> {
        return this.api.post('party/detail', {}, model/* DATA */);
    }
    /* POST party/Create Create  */
    public postCreate(model: WebApiModels.IPartyDetailDto): Observable<number> {
        return this.api.post('party/create', {}, model/* DATA */);
    }
    /* POST party/TakeCreditFile TakeCreditFile  */
    public postTakeCreditFile(id: number): Observable<any> {
        return this.api.post('party/takecreditfile', { 'id': id });
    }
    /* GET party/CreditInfoOverview CreditInfoOverview  */
    public getCreditInfoOverview(creditFileId: number): Observable<WebApiModels.ICreditInfoOverviewDto[]> {
        return this.api.get('party/creditinfooverview', { 'creditFileId': creditFileId });
    }
    /* GET party/CreditInfoDetail CreditInfoDetail  */
    public getCreditInfoDetail(creditFileId: number, creditInfoType: WebApiModels.ECreditInfoType): Observable<WebApiModels.ICreditInfoEditDto> {
        return this.api.get('party/creditinfodetail', { 'creditFileId': creditFileId, 'creditInfoType': creditInfoType });
    }
    /* POST party/SaveCreditInfoDetail SaveCreditInfoDetail  */
    public postSaveCreditInfoDetail(data: WebApiModels.ICreditInfoEditDto): Observable<any> {
        return this.api.post('party/savecreditinfodetail', {}, data/* DATA */);
    }
    /* GET party/PartyHeader PartyHeader  */
    public getPartyHeader(partyId: number): Observable<WebApiModels.IPartyHeaderDto> {
        return this.api.get('party/partyheader', { 'partyId': partyId });
    }
    /* GET party/CreditInfoContainer CreditInfoContainer  */
    public getCreditInfoContainer(creditFileId: number): Observable<WebApiModels.ICreditInfoContainerDto> {
        return this.api.get('party/creditinfocontainer', { 'creditFileId': creditFileId });
    }
    /* POST party/SaveCreditInfoContainer SaveCreditInfoContainer  */
    public postSaveCreditInfoContainer(data: WebApiModels.ICreditInfoContainerDto): Observable<WebApiModels.ECreditInfoType[]> {
        return this.api.post('party/savecreditinfocontainer', {}, data/* DATA */);
    }
    /* POST party/ApplyCreditInfoChanges ApplyCreditInfoChanges  */
    public postApplyCreditInfoChanges(creditFileId: number, changes: WebApiModels.ECreditInfoType[]): Observable<any> {
        return this.api.post('party/applycreditinfochanges', { 'creditFileId': creditFileId }, changes/* DATA */);
    }
    /* GET party/PartyForDashboards PartyForDashboards  */
    public getPartyForDashboards(): Observable<WebApiModels.IPartyDashboardDto[]> {
        return this.api.get('party/partyfordashboards', {});
    }
}
