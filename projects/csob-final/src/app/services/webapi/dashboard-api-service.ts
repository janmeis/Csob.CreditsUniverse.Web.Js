import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base.service';
import * as WebApiModels from './webapi-models';
// class Csob.CreditsUniverse.WebApi.Controllers.DashboardController, controllerPath=dashboard
@Injectable({ providedIn: 'root' })
export class DashboardApiService {
    constructor(public api: ApiBaseService) {
    }
    /* POST dashboard/Events Events  */
    public postEvents(dashboardSearchDto: WebApiModels.IDashboardSearchDto): Observable<WebApiModels.IDashboardEventDto[]> {
        return this.api.post('dashboard/events', {}, dashboardSearchDto/* DATA */);
    }
    /* GET dashboard/Event Event  */
    public getEvent(dashboardId: number): Observable<WebApiModels.IDashboardDetailDto> {
        return this.api.get('dashboard/event', { 'dashboardId': dashboardId });
    }
    /* GET dashboard/DashboardItems DashboardItems  */
    public getDashboardItems(): Observable<WebApiModels.IDashboardItemDto[]> {
        return this.api.get('dashboard/dashboarditems', {});
    }
    /* GET dashboard/DashboardItemsbyDate DashboardItemsbyDate  */
    public getDashboardItemsbyDate(date: Date, type: WebApiModels.ECalendarType, opt: { isForUser: boolean }  = <any>{}): Observable<WebApiModels.IDashboardItemResDto> {
        return this.api.get('dashboard/dashboarditemsbydate', { 'date': date, 'type': type, 'isForUser': opt['isForUser'] });
    }
    /* POST dashboard/Save Save  */
    public postSave(saveData: WebApiModels.IDashboardEventDto, opt: { semaphoreId: number }  = <any>{}): Observable<any> {
        return this.api.post('dashboard/save', { 'semaphoreId': opt['semaphoreId'] }, saveData/* DATA */);
    }
}
