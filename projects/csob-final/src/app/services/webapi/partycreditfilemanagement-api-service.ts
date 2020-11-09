import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base.service';
import * as WebApiModels from './webapi-models';
// class Csob.CreditsUniverse.WebApi.Controllers.PartyCreditFileManagementController, controllerPath=partycreditfilemanagement
@Injectable({ providedIn: 'root' })
export class PartyCreditFileManagementApiService {
    constructor(public api: ApiBaseService) {
    }
    /* GET partycreditfilemanagement/ClearPermissionCachedData ClearPermissionCachedData  */
    public getClearPermissionCachedData(creditId: number): Observable<boolean> {
        return this.api.get('partycreditfilemanagement/clearpermissioncacheddata', { 'creditId': creditId });
    }
    /* POST partycreditfilemanagement/SetCreditFileAccess SetCreditFileAccess  */
    public postSetCreditFileAccess(hasNonStandardAccess: boolean, creditFileId: number): Observable<boolean> {
        return this.api.post('partycreditfilemanagement/setcreditfileaccess', { 'hasNonStandardAccess': hasNonStandardAccess, 'creditFileId': creditFileId });
    }
    /* POST partycreditfilemanagement/Save Save  */
    public postSave(data: WebApiModels.ICreditComponentManagerModel): Observable<number> {
        return this.api.post('partycreditfilemanagement/save', {}, data/* DATA */);
    }
    /* POST partycreditfilemanagement/Delete Delete  */
    public postDelete(data: WebApiModels.ICreditComponentManagerModel[]): Observable<any> {
        return this.api.post('partycreditfilemanagement/delete', {}, data/* DATA */);
    }
    /* POST partycreditfilemanagement/SaveUsers SaveUsers  */
    public postSaveUsers(creditFileId: number, branchId: number, users: WebApiModels.ICreditComponentManagerUserModel[]): Observable<any> {
        return this.api.post('partycreditfilemanagement/saveusers', { 'creditFileId': creditFileId, 'branchId': branchId }, users/* DATA */);
    }
    /* GET partycreditfilemanagement/Detail Detail  */
    public getDetail(creditId: number, branchId: number): Observable<WebApiModels.ICreditComponentManagerModel> {
        return this.api.get('partycreditfilemanagement/detail', { 'creditId': creditId, 'branchId': branchId });
    }
    /* GET partycreditfilemanagement/List List  */
    public getList(creditId: number): Observable<WebApiModels.ICreditComponentManagerListModel> {
        return this.api.get('partycreditfilemanagement/list', { 'creditId': creditId });
    }
}
