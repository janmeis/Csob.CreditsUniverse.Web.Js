import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base.service';
import * as WebApiModels from './webapi-models';
// class Csob.CreditsUniverse.WebApi.Controllers.PartyLinksController, controllerPath=partylinks
@Injectable({ providedIn: 'root' })
export class PartyLinksApiService {
    constructor(public api: ApiBaseService) {
    }
    /* POST partylinks/Search Search  */
    public postSearch(searchDto: WebApiModels.ISearchPartyLinkReqDto): Observable<WebApiModels.IGridResult<WebApiModels.IPartyLinkDto>> {
        return this.api.post('partylinks/search', {}, searchDto/* DATA */);
    }
    /* GET partylinks/Load Load  */
    public getLoad(linkId: number): Observable<WebApiModels.IPartyLinkDto> {
        return this.api.get('partylinks/load', { 'linkId': linkId });
    }
    /* POST partylinks/Save Save  */
    public postSave(data: WebApiModels.IPartyLinkDto): Observable<number> {
        return this.api.post('partylinks/save', {}, data/* DATA */);
    }
    /* POST partylinks/Delete Delete  */
    public postDelete(data: WebApiModels.IPartyLinkDto[]): Observable<any> {
        return this.api.post('partylinks/delete', {}, data/* DATA */);
    }
    /* GET partylinks/GetCribisUrl GetCribisUrl  */
    public getCribisUrl(partyId: number): Observable<string> {
        return this.api.get('partylinks/getcribisurl', { 'partyId': partyId });
    }
}
