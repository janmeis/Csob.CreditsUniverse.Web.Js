import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api-base.service';
import * as WebApiModels from './webapi-models';
// class Csob.CreditsUniverse.WebApi.Controllers.ProductController, controllerPath=product
@Injectable({ providedIn: 'root' })
export class ProductApiService {
    constructor(public api: ApiBaseService) {
    }
    /* GET product/ProductOverview ProductOverview  */
    public getProductOverview(creditFileId: number): Observable<WebApiModels.IProductViewDto[]> {
        return this.api.get('product/productoverview', { 'creditFileId': creditFileId });
    }
    /* GET product/ProductDetail ProductDetail  */
    public getProductDetail(id: number): Observable<WebApiModels.IProductViewDto> {
        return this.api.get('product/productdetail', { 'id': id });
    }
    /* GET product/AvailableProductTypes AvailableProductTypes  */
    public getAvailableProductTypes(sectionId: number): Observable<WebApiModels.IProductTypeCUDto[]> {
        return this.api.get('product/availableproducttypes', { 'sectionId': sectionId });
    }
    /* GET product/AllProductTypes AllProductTypes  */
    public getAllProductTypes(sectionId: number): Observable<WebApiModels.IProductTypeCUDto[]> {
        return this.api.get('product/allproducttypes', { 'sectionId': sectionId });
    }
    /* GET product/AllProductSubtypes AllProductSubtypes  */
    public getAllProductSubtypes(): Observable<WebApiModels.IProductSubTypeCUDto[]> {
        return this.api.get('product/allproductsubtypes', {});
    }
    /* GET product/AllValidProductSubtypes AllValidProductSubtypes  */
    public getAllValidProductSubtypes(): Observable<WebApiModels.IProductSubTypeCUDto[]> {
        return this.api.get('product/allvalidproductsubtypes', {});
    }
    /* GET product/CollateralProductMatrix CollateralProductMatrix  */
    public getCollateralProductMatrix(creditFileId: number, sectionId: number): Observable<WebApiModels.ICollateralProductMatrixDto> {
        return this.api.get('product/collateralproductmatrix', { 'creditFileId': creditFileId, 'sectionId': sectionId });
    }
    /* POST product/SaveCollateralProductMatrix SaveCollateralProductMatrix  */
    public postSaveCollateralProductMatrix(collateralProductMatrix: WebApiModels.ICollateralProductMatrixDto): Observable<any> {
        return this.api.post('product/savecollateralproductmatrix', {}, collateralProductMatrix/* DATA */);
    }
}
