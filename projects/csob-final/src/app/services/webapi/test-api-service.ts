import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base.service';
import * as WebApiModels from './webapi-models';
// class Csob.CreditsUniverse.WebApi.Controllers.TestController, controllerPath=test
@Injectable({ providedIn: 'root' })
export class TestApiService {
    constructor(public api: ApiBaseService) {
    }
    /* GET test/GetServerInfo GetServerInfo  */
    public getServerInfo(): Observable<any> {
        return this.api.get('test/getserverinfo', {});
    }
    /* GET test/GetData GetData  */
    public getData(): Observable<string[]> {
        return this.api.get('test/getdata', {});
    }
    /* POST test/TestPost TestPost  */
    public postTestPost(data: WebApiModels.ITestData, dateUri: string): Observable<WebApiModels.ITestData> {
        return this.api.post('test/testpost', { 'dateUri': dateUri }, data/* DATA */);
    }
    /* POST test/TestEvent TestEvent  */
    public postTestEvent(data: WebApiModels.ITestData): Observable<WebApiModels.ITestData> {
        return this.api.post('test/testevent', {}, data/* DATA */);
    }
}
