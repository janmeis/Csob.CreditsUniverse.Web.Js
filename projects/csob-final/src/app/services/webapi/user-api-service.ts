import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base.service';
import * as WebApiModels from './webapi-models';
// class Csob.CreditsUniverse.WebApi.Controllers.UserController, controllerPath=user
@Injectable({ providedIn: 'root' })
export class UserApiService {
    constructor(public api: ApiBaseService) {
    }
    /* GET user/AppVersionInfo AppVersionInfo  */
    public getAppVersionInfo(): Observable<WebApiModels.IAppVersionInfo> {
        return this.api.get('user/appversioninfo', {});
    }
    /* GET user/CurrentUser CurrentUser  */
    public getCurrentUser(): Observable<WebApiModels.IWebUserDto> {
        return this.api.get('user/currentuser', {});
    }
    /* GET user/OperationModelGraph OperationModelGraph  */
    public getOperationModelGraph(cultureCode: string): Observable<WebApiModels.IOperationModelDto[]> {
        return this.api.get('user/operationmodelgraph', { 'cultureCode': cultureCode });
    }
    /* GET user/Translations Translations  */
    public getTranslations(): Observable<WebApiModels.ITranslationModel[]> {
        return this.api.get('user/translations', {});
    }
    /* POST user/SaveTraces SaveTraces  */
    public postSaveTraces(traces: WebApiModels.ITraceDto[]): Observable<any> {
        return this.api.post('user/savetraces', {}, traces/* DATA */);
    }
}
