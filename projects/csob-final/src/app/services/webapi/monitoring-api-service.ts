import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base.service';
import * as WebApiModels from './webapi-models';
// class Csob.CreditsUniverse.WebApi.Controllers.MonitoringController, controllerPath=monitoring
@Injectable({ providedIn: 'root' })
export class MonitoringApiService {
    constructor(public api: ApiBaseService) {
    }
    /* GET monitoring/DefaultFilter DefaultFilter  */
    public getDefaultFilter(creditFileId: number): Observable<WebApiModels.IMonitoringFilterDto> {
        return this.api.get('monitoring/defaultfilter', { 'creditFileId': creditFileId });
    }
    /* POST monitoring/MonitoringDetails MonitoringDetails  */
    public postMonitoringDetails(filter: WebApiModels.IMonitoringFilterDto): Observable<WebApiModels.IMonitoringDetailsDto> {
        return this.api.post('monitoring/monitoringdetails', {}, filter/* DATA */);
    }
    /* POST monitoring/MonitoringCategoryDetails MonitoringCategoryDetails  */
    public postMonitoringCategoryDetails(filter: WebApiModels.IMonitoringFilterDto): Observable<WebApiModels.IMonitoringDetailsDto> {
        return this.api.post('monitoring/monitoringcategorydetails', {}, filter/* DATA */);
    }
    /* POST monitoring/MonitoringDetailRows MonitoringDetailRows  */
    public postMonitoringDetailRows(categoryId: number, filter: WebApiModels.IMonitoringFilterDto): Observable<WebApiModels.IMonitoringDetailRowDto[]> {
        return this.api.post('monitoring/monitoringdetailrows', { 'categoryId': categoryId }, filter/* DATA */);
    }
    /* GET monitoring/GetClientSemaphore GetClientSemaphore  */
    public getClientSemaphore(creditFileId: number): Observable<WebApiModels.IMonitoringClientSemaphoreDto> {
        return this.api.get('monitoring/getclientsemaphore', { 'creditFileId': creditFileId });
    }
    /* GET monitoring/GetClientSemaphoreHistory GetClientSemaphoreHistory  */
    public getClientSemaphoreHistory(creditFileId: number): Observable<WebApiModels.IMonitoringClientSemaphoreDto[]> {
        return this.api.get('monitoring/getclientsemaphorehistory', { 'creditFileId': creditFileId });
    }
    /* POST monitoring/CellData CellData  */
    public postCellData(clickDto: WebApiModels.IMonitoringCellClickDto): Observable<WebApiModels.IMonitoringCellEditDto> {
        return this.api.post('monitoring/celldata', {}, clickDto/* DATA */);
    }
    /* POST monitoring/Container Container  */
    public postContainer(clickDto: WebApiModels.IMonitoringCellClickDto): Observable<WebApiModels.IMonitoringContainerDto> {
        return this.api.post('monitoring/container', {}, clickDto/* DATA */);
    }
    /* POST monitoring/GroupContainer GroupContainer  */
    public postGroupContainer(clickDto: WebApiModels.IMonitoringCellClickDto, category: WebApiModels.EMonitoringCategory): Observable<WebApiModels.IMonitoringGroupContainerDto> {
        return this.api.post('monitoring/groupcontainer', { 'category': category }, clickDto/* DATA */);
    }
    /* POST monitoring/SaveCellData SaveCellData  */
    public postSaveCellData(dto: WebApiModels.IMonitoringCellEditDto): Observable<any> {
        return this.api.post('monitoring/savecelldata', {}, dto/* DATA */);
    }
    /* POST monitoring/Export Export  */
    public downloadExport(clickDto: WebApiModels.IMonitoringCellClickDto, culture: string): Observable<HttpResponse<Blob>> {
        return this.api.download('monitoring/export', { 'culture': culture }, clickDto/* DATA */);
    }
}
