import { Injectable, Injector } from '@angular/core';
import { DataResult, process, State } from '@progress/kendo-data-query';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { ICodebookProvider } from '../../app-common/components/editor-codebook/editor-codebook.component';
import { CodebooksService } from 'projects/services/src/public-api';
import { TranslationService } from 'projects/services/src/public-api';
import { CodebookApiService } from 'projects/services/src/public-api';
import { RarocApiService } from 'projects/services/src/public-api';
import { ECodetable, EValidationType, ICodebookItem, IProductSubTypeCUDto, IProductTypeCUDto, IRarocProductDto, IRarocProductsDto, IRarocProductValueDto } from 'projects/services/src/public-api';
import { RarocProductCollateralService } from '../raroc-detail-product-dialog/raroc-product-collateral.service';
import { RarocDetailService } from '../raroc-detail/raroc-detail.service';

@Injectable()
export class RarocDetailProductService extends RarocProductCollateralService {
    loading = false;
    private _allProdTypes: IProductTypeCUDto[];
    private _allProdSubtypes: IProductSubTypeCUDto[];
    private _rarocProducts: IRarocProductsDto;

    get rarocVersion(): string {
        return this._rarocProducts.RarocVersion;
    }

    set rarocVersion(version: string) {
        this._rarocProducts.RarocVersion = version;
    }

    get hasProducts(): boolean {
        return this._rarocProducts.ProductSet.length > 0;
    }

    private get _products(): IRarocProductValueDto[] {
        if (this._rarocProducts)
            return this._rarocProducts.ProductSet;
    }
    private set _products(value: IRarocProductValueDto[]) {
        if (this._rarocProducts)
            this._rarocProducts.ProductSet = value || [];
    }

    private translation: TranslationService;

    constructor(
        private codebook: CodebooksService,
        private codebookApiService: CodebookApiService,
        protected rarocApiService: RarocApiService,
        private rarocDetailService: RarocDetailService,
        private injector: Injector,
    ) {
        super(rarocApiService);
        this.translation = new TranslationService(injector);
    }

    query = (rarocId: number, state: State): void => {
        this.fetch(rarocId, state)
            .subscribe(x => super.next(x));
    }

    private fetch = (rarocId: number, state: State): Observable<DataResult> => {
        this.loading = true;

        return (() => {
            if (!this._rarocProducts)
                return this.rarocApiService.getProductsDto(rarocId).pipe(
                    tap(m => this._rarocProducts = m),
                    map(m => m.ProductSet));

            return of(this._products);
        })().pipe(
            map(m => m.filter(p => !p.IsDeleted)),
            map(m => process(m, state)),
            tap(() => this.loading = false)
        );
    }

    deleteProducts(selection: number[]): void {
        if (this._rarocProducts)
            selection.forEach(id => {
                if (id > 0)
                    this._products.find(x => x.Id == id).IsDeleted = true;
                else {
                    const idx = this._products.findIndex(x => x.Id == id);
                    this._products.splice(idx, 1);
                }
            });
    }

    async addProduct(): Promise<IRarocProductValueDto> {
        if (this._rarocProducts) {
            const items = await this.rarocDetailService.frequencyUnits.getItems();
            const frequency = items.find(f => f.Text.toUpperCase() == this.translation.$$get('raroc_detail_product.year').toUpperCase()) || { Value: null };
            const codebook = await this.codebook.GetCodebook(ECodetable[ECodetable.CurrencyCz]).toPromise();
            const currencyCzId = codebook[0].Value;

            return {
                Id: 0,
                CurrencyId: currencyCzId,
                FeeFrequencyKey: frequency.Value,
                MarginUnused: 0, MarginUsed: 0, FeeFixed: 0, FeePeriodicalAmount: 0,
                UFN: true,
                UtilizationTo: true,
                ValiditionType: EValidationType.OK
            } as IRarocProductValueDto;
        }
        return {} as IRarocProductValueDto;
    }

    saveProducts$(): Observable<any> {
        return this.rarocApiService.postSaveRarocProducts(this._rarocProducts).pipe(
            tap(() => this._rarocProducts = null)
        );
    }

    saveProduct$(product: IRarocProductValueDto): Observable<IRarocProductValueDto> {
        const rarocProduct = this.getRarocProduct(product);
        return this.rarocApiService.postSaveRarocProduct(rarocProduct).pipe(
            tap(p => {
                this.rarocVersion = p.RarocVersion;
                this.updateProduct(p.RarocProduct);
            }),
            map(p => p.RarocProduct),
        );
    }

    allProdTypes$(lgdModelId: number): Observable<IProductTypeCUDto[]> {
        if (!lgdModelId)
            return of([]);

        if (!this._allProdTypes)
            return this.codebookApiService.getValidProductTypeCUByLGD(lgdModelId).pipe(
                tap(m => this._allProdTypes = m));

        return of(this._allProdTypes);
    }

    getProductTypes(lgdModelId: number): ICodebookProvider {
        const types$ = this.allProdTypes$(lgdModelId).pipe(
            map(m => m
                .map(s => ({ Order: s.Order, Value: s.Id, Text: s.Description } as ICodebookItem))));

        return {
            getItems: () => types$.toPromise(),
            getItem: id => types$.pipe(map(model => model.find(s => s.Value == id))).toPromise()
        } as ICodebookProvider;
    }

    allProdSubtypes$(lgdModelId: number): Observable<IProductSubTypeCUDto[]> {
        if (!lgdModelId)
            return of([]);

        if (!this._allProdSubtypes)
            return this.codebookApiService.getValidProductSubTypeCUByLGD(lgdModelId).pipe(
                tap(m => this._allProdSubtypes = m));

        return of(this._allProdSubtypes);
    }

    getFilteredProdSubtypes(lgdModelId: number, productTypeId: number): ICodebookProvider {
        if (!productTypeId)
            return {
                getItems: () => Promise.resolve([]),
                getItem: id => Promise.resolve(undefined)
            } as ICodebookProvider;

        const subtypes$ = this.allProdSubtypes$(lgdModelId).pipe(
            map(m => m
                .filter(s => s.ProductTypeCUId == productTypeId)
                .map(s => ({ Order: s.Order, Value: s.Id, Text: s.DescriptionL } as ICodebookItem))));

        return {
            getItems: () => subtypes$.toPromise(),
            getItem: id => subtypes$.pipe(map(model => model.find(s => s.Value == id))).toPromise()
        } as ICodebookProvider;
    }

    hasAnyCollateral$(rarocId: number): Observable<boolean> {
        if (!this._rarocProducts)
            return this.rarocApiService.getProductsDto(rarocId).pipe(
                tap(m => this._rarocProducts = m),
                map(m => m.HasAnyCollateral && m.ProductSet.length > 0));

        return of(this._rarocProducts.HasAnyCollateral && this._rarocProducts.ProductSet.length > 0);
    }

    isNew = (product: IRarocProductValueDto): boolean => product.Id <= 0;

    private getRarocProduct(product: IRarocProductValueDto) {
        return {
            RarocId: this._rarocProducts.RarocId,
            RarocVersion: this.rarocVersion,
            RarocProduct: product
        } as IRarocProductDto;
    }

    private updateProduct(product: IRarocProductValueDto): void {
        if (this._rarocProducts) {
            const idx = this._products.findIndex(p => p.Id == product.Id);
            if (idx >= 0)
                this._products.splice(idx, 1, product);
            else
                this._products.push(product);
        }
    }
}
