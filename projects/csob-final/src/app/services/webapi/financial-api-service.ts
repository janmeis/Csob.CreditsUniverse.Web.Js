import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base.service';
import * as WebApiModels from './webapi-models';
// class Csob.CreditsUniverse.WebApi.Controllers.FinancialController, controllerPath=financial
@Injectable({ providedIn: 'root' })
export class FinancialApiService {
    constructor(public api: ApiBaseService) {
    }
    /* GET financial/Detail Detail  */
    public getDetail(readonlyHeaders: number[], editableHeaders: number[], opt: { includeDefaults: boolean } |  { pdRatingRatiosId: number } |  { conversion: WebApiModels.IFinConversionOptions } |  { culture: string }  = <any>{}): Observable<WebApiModels.IFinStatDataContainerDto> {
        return this.api.getResult('financial/detail', { 'readonlyHeaders': readonlyHeaders, 'editableHeaders': editableHeaders, 'includeDefaults': opt['includeDefaults'], 'pdRatingRatiosId': opt['pdRatingRatiosId'], 'conversion': opt['conversion'], 'culture': opt['culture'] });
    }
    /* POST financial/Search Search  */
    public postSearch(criteria: WebApiModels.IFinStatOverviewReqDto): Observable<WebApiModels.IGridResult<WebApiModels.IFinStatOverviewResDto>> {
        return this.api.postResult('financial/search', {}, criteria/* DATA */);
    }
    /* POST financial/Delete Delete  */
    public postDelete(keys: number[]): Observable<any> {
        return this.api.post('financial/delete', {}, keys/* DATA */);
    }
    /* POST financial/Convert Convert  */
    public postConvert(keys: number[]): Observable<number[]> {
        return this.api.post('financial/convert', {}, keys/* DATA */);
    }
    /* POST financial/Copy Copy  */
    public postCopy(fvCopy: WebApiModels.IFVCopyDto): Observable<number[]> {
        return this.api.post('financial/copy', {}, fvCopy/* DATA */);
    }
    /* POST financial/Create Create  */
    public postCreate(finStatHeader: WebApiModels.IFinStatHeaderDto): Observable<number> {
        return this.api.postResult('financial/create', {}, finStatHeader/* DATA */);
    }
    /* POST financial/Save Save  */
    public postSave(finStat: WebApiModels.IFinStatDataDto): Observable<WebApiModels.IFinStatDataDto> {
        return this.api.postResult('financial/save', {}, finStat/* DATA */);
    }
    /* POST financial/CheckLockingState CheckLockingState  */
    public postCheckLockingState(finStat: WebApiModels.IFinStatDataDto): Observable<boolean> {
        return this.api.post('financial/checklockingstate', {}, finStat/* DATA */);
    }
    /* POST financial/SetComplete SetComplete  */
    public postSetComplete(finStat: WebApiModels.IFinStatDataDto): Observable<string[]> {
        return this.api.postResult('financial/setcomplete', {}, finStat/* DATA */);
    }
    /* POST financial/Export Export  */
    public downloadExport(options: WebApiModels.IExportOptions, readonlyHeaders: number[], editableHeaders: number[], includeDefaults: boolean, conversion: WebApiModels.IFinConversionOptions): Observable<HttpResponse<Blob>> {
        return this.api.download('financial/export', { 'options': options, 'readonlyHeaders': readonlyHeaders, 'editableHeaders': editableHeaders, 'includeDefaults': includeDefaults, 'conversion': conversion });
    }
    /* POST financial/CalculateRatios CalculateRatios  */
    public postCalculateRatios(templateId: number, headerIds: number[], opt: { conversion: WebApiModels.IFinConversionOptions }  = <any>{}): Observable<WebApiModels.IFinStatRatiosDataDto> {
        return this.api.post('financial/calculateratios', { 'templateId': templateId, 'headerIds': headerIds, 'conversion': opt['conversion'] });
    }
    /* POST financial/ImportFinancialStatement ImportFinancialStatement  */
    public urlImportFinancialStatement(headerId: number, fileName: string, tabs: WebApiModels.EFinDataTabOrder[], culture: string): string {
        return this.api.url('financial/importfinancialstatement', { 'headerId': headerId, 'fileName': fileName, 'tabs': tabs, 'culture': culture });
    }
    /* POST financial/JskDocument JskDocument  */
    public downloadJskDocument(importFileId: number): Observable<HttpResponse<Blob>> {
        return this.api.download('financial/jskdocument', { 'importFileId': importFileId });
    }
    /* GET financial/JskDocumentsList JskDocumentsList  */
    public getJskDocumentsList(partyId: number): Observable<WebApiModels.ICodebookItem[]> {
        return this.api.get('financial/jskdocumentslist', { 'partyId': partyId });
    }
    /* POST financial/ImportFinancialStatementFromJskFile ImportFinancialStatementFromJskFile  */
    public postImportFinancialStatementFromJskFile(importFileId: number, headerId: number, tabs: WebApiModels.EFinDataTabOrder[]): Observable<WebApiModels.IImportFinancialStatementResultDto> {
        return this.api.post('financial/importfinancialstatementfromjskfile', { 'importFileId': importFileId, 'headerId': headerId, 'tabs': tabs });
    }
    /* GET financial/AddModel AddModel  */
    public getAddModel(finStatId: number): Observable<WebApiModels.IFinStatDataDto> {
        return this.api.get('financial/addmodel', { 'finStatId': finStatId });
    }
    /* GET financial/StressAnalysisParams StressAnalysisParams  */
    public getStressAnalysisParams(finStatId: number): Observable<WebApiModels.IStressAnalysisDto> {
        return this.api.get('financial/stressanalysisparams', { 'finStatId': finStatId });
    }
    /* POST financial/SaveAndRunStressAnalysisParams SaveAndRunStressAnalysisParams  */
    public postSaveAndRunStressAnalysisParams(data: WebApiModels.IStressAnalysisDto): Observable<WebApiModels.IFinStatDataDto> {
        return this.api.post('financial/saveandrunstressanalysisparams', {}, data/* DATA */);
    }
    /* GET financial/BusinessTurnover BusinessTurnover  */
    public getBusinessTurnover(headerId: number): Observable<WebApiModels.IFinStatBusinessTurnoverDto> {
        return this.api.get('financial/businessturnover', { 'headerId': headerId });
    }
    /* GET financial/GetImportFileDef GetImportFileDef  */
    public getImportFileDef(headerId: number): Observable<WebApiModels.IImportFileRowDto[]> {
        return this.api.get('financial/getimportfiledef', { 'headerId': headerId });
    }
    /* GET financial/ExistsConsolidationFinishFV ExistsConsolidationFinishFV  */
    public getExistsConsolidationFinishFV(partyId: number): Observable<boolean> {
        return this.api.get('financial/existsconsolidationfinishfv', { 'partyId': partyId });
    }
}
