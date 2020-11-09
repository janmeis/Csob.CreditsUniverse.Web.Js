import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base.service';
import * as WebApiModels from './webapi-models';
// class Csob.CreditsUniverse.WebApi.Controllers.CollateralController, controllerPath=collateral
@Injectable({ providedIn: 'root' })
export class CollateralApiService {
    constructor(public api: ApiBaseService) {
    }
    /* GET collateral/CollateralGroups CollateralGroups  */
    public getCollateralGroups(creditFileId: number): Observable<WebApiModels.ICollateralGroupsDto> {
        return this.api.get('collateral/collateralgroups', { 'creditFileId': creditFileId });
    }
    /* GET collateral/Collaterals Collaterals  */
    public getCollaterals(creditFileId: number, sectionId: number): Observable<WebApiModels.ICollateralViewDto[]> {
        return this.api.get('collateral/collaterals', { 'creditFileId': creditFileId, 'sectionId': sectionId });
    }
    /* POST collateral/CreateCollateral CreateCollateral  */
    public postCreateCollateral(creditFileId: number, sectionId: number): Observable<WebApiModels.ICollateralDetailDto> {
        return this.api.post('collateral/createcollateral', { 'creditFileId': creditFileId, 'sectionId': sectionId });
    }
    /* POST collateral/SaveCollateral SaveCollateral  */
    public postSaveCollateral(collateralDetail: WebApiModels.ICollateralDetailDto): Observable<number> {
        return this.api.post('collateral/savecollateral', {}, collateralDetail/* DATA */);
    }
    /* POST collateral/CancelCollaterals CancelCollaterals  */
    public postCancelCollaterals(collateralIds: number[]): Observable<any> {
        return this.api.post('collateral/cancelcollaterals', { 'collateralIds': collateralIds });
    }
    /* POST collateral/CopyCollateral CopyCollateral  */
    public postCopyCollateral(collateralId: number): Observable<any> {
        return this.api.post('collateral/copycollateral', { 'collateralId': collateralId });
    }
    /* GET collateral/AllCollateralTypes AllCollateralTypes  */
    public getAllCollateralTypes(): Observable<WebApiModels.ICollateralTypeCUDto[]> {
        return this.api.get('collateral/allcollateraltypes', {});
    }
    /* GET collateral/AllCollateralSubtypes AllCollateralSubtypes  */
    public getAllCollateralSubtypes(): Observable<WebApiModels.ICollateralSubTypeCUDto[]> {
        return this.api.get('collateral/allcollateralsubtypes', {});
    }
    /* GET collateral/CollateralDetail CollateralDetail  */
    public getCollateralDetail(collateralId: number): Observable<WebApiModels.ICollateralDetailDto> {
        return this.api.get('collateral/collateraldetail', { 'collateralId': collateralId });
    }
    /* GET collateral/CollateralGroupings CollateralGroupings  */
    public getCollateralGroupings(creditFileId: number): Observable<WebApiModels.ICollateralDetailDto[]> {
        return this.api.get('collateral/collateralgroupings', { 'creditFileId': creditFileId });
    }
    /* GET collateral/CollateralOverview CollateralOverview  */
    public getCollateralOverview(creditFileId: number): Observable<WebApiModels.ICollateralViewDto[]> {
        return this.api.get('collateral/collateraloverview', { 'creditFileId': creditFileId });
    }
    /* GET collateral/CollateralDetailView CollateralDetailView  */
    public getCollateralDetailView(collateralId: number): Observable<WebApiModels.ICollateralViewDto> {
        return this.api.get('collateral/collateraldetailview', { 'collateralId': collateralId });
    }
    /* GET collateral/PdRating PdRating  */
    public getPdRating(partyId: number): Observable<WebApiModels.IPDRatingOverviewResDto> {
        return this.api.get('collateral/pdrating', { 'partyId': partyId });
    }
}
