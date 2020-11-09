import { Injectable } from '@angular/core';
import { DataResult, process, State } from '@progress/kendo-data-query';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { ICodebookProvider } from 'src/app/app-common/components/editor-codebook/editor-codebook.component';
import { CodebooksService } from 'src/app/services/codebooks.service';
import { CodebookApiService } from 'src/app/services/webapi/codebook-api-service';
import { RarocApiService } from 'src/app/services/webapi/raroc-api-service';
import { ECodetable, ICodebookItem, ICollateralSubTypeCUDto, ICollateralTypeCUDto, IRarocCollateralDto, IRarocCollateralsDto, IRarocCollateralValueDto } from 'src/app/services/webapi/webapi-models';
import { RarocProductCollateralService } from '../raroc-detail-product-dialog/raroc-product-collateral.service';

@Injectable()
export class RarocDetailCollateralService extends RarocProductCollateralService {
    loading = false;
    private _allCollateralTypes: ICollateralTypeCUDto[];
    private _allCollateralSubtypes: ICollateralSubTypeCUDto[];
    private _rarocCollaterals: IRarocCollateralsDto;

    get rarocVersion(): string {
        return this._rarocCollaterals.RarocVersion;
    }

    set rarocVersion(version: string) {
        this._rarocCollaterals.RarocVersion = version;
    }

    private get _collaterals(): IRarocCollateralValueDto[] {
        if (this._rarocCollaterals)
            return this._rarocCollaterals.CollateralSet;
    }

    private set _collaterals(value: IRarocCollateralValueDto[]) {
        if (this._rarocCollaterals)
            this._rarocCollaterals.CollateralSet = value || [];
    }

    constructor(
        private codebook: CodebooksService,
        private codebookApiService: CodebookApiService,
        rarocApiService: RarocApiService,
    ) {
        super(rarocApiService);
    }

    query = (rarocId: number, state: State): void => {
        this.fetch(rarocId, state)
            .subscribe(x => super.next(x));
    }

    private fetch = (rarocId: number, state: State): Observable<DataResult> => {
        this.loading = true;

        return (() => {
            if (!this._rarocCollaterals)
                return this.rarocApiService.getCollateralDto(rarocId).pipe(
                    tap(m => this._rarocCollaterals = m),
                    map(m => m.CollateralSet));

            return of(this._collaterals);
        })().pipe(
            map(m => m.filter(c => !c.IsDeleted)),
            map(m => process(m, state)),
            tap(() => this.loading = false)
        );
    }

    deleteCollaterals(selection: number[]): void {
        if (this._rarocCollaterals)
            selection.forEach(id => {
                if (id > 0)
                    this._collaterals.find(x => x.Id == id).IsDeleted = true;
                else {
                    const idx = this._collaterals.findIndex(x => x.Id == id);
                    this._collaterals.splice(idx, 1);
                }
            });
    }

    async addCollateral(): Promise<IRarocCollateralValueDto> {
        if (this._rarocCollaterals) {
            const codebook = await this.codebook.GetCodebook(ECodetable[ECodetable.CurrencyCz]).toPromise();
            const currencyCzId = codebook[0].Value;

            return {
                Id: 0,
                CurrencyId: currencyCzId,
                ExpirationByProduct: true
            } as IRarocCollateralValueDto;
        }
        return {} as IRarocCollateralValueDto;
    }

    saveCollaterals$(): Observable<any> {
        return this.rarocApiService.postSaveRarocCollaterals(this._rarocCollaterals).pipe(
            tap(() => this._rarocCollaterals = null)
        );
    }

    saveCollateral$(product: IRarocCollateralValueDto): Observable<IRarocCollateralValueDto> {
        const rarocCollateral = this.getRarocCollateral(product);
        return this.rarocApiService.postSaveRarocCollateral(rarocCollateral).pipe(
            tap(p => {
                this.rarocVersion = p.RarocVersion;
                this.updateCollateral(p.RarocCollateral);
            }),
            map(p => p.RarocCollateral),
        );
    }

    allCollateralTypes$(lgdModelId: number) {
        if (!lgdModelId)
            return of([]);

        if (!this._allCollateralTypes)
            return this.codebookApiService.getValidCollateralTypeCUByLGD(lgdModelId).pipe(tap(m => this._allCollateralTypes = m));
        return of(this._allCollateralTypes);
    }

    getCollateralTypes(lgdModelId: number): ICodebookProvider {
        const types$ = this.allCollateralTypes$(lgdModelId).pipe(
            map(m => m
                .map(s => ({ Order: s.Order, Value: s.Id, Text: s.Description } as ICodebookItem))));

        return {
            getItems: () => types$.toPromise(),
            getItem: id => types$.pipe(map(model => model.find(s => s.Value == id))).toPromise()
        } as ICodebookProvider;
    }

    allCollateralSubtypes$(lgdModelId: number): Observable<ICollateralSubTypeCUDto[]> {
        if (!lgdModelId)
            return of([]);

        if (!this._allCollateralSubtypes)
            return this.codebookApiService.getValidCollateralSubTypeCUByLGD(lgdModelId).pipe(
                tap(m => this._allCollateralSubtypes = m));

        return of(this._allCollateralSubtypes);
    }

    getFilteredCollateralSubtypes(lgdModelId: number, collateralTypeId: number): ICodebookProvider {
        if (!collateralTypeId)
            return {
                getItems: () => Promise.resolve([]),
                getItem: id => Promise.resolve(undefined)
            } as ICodebookProvider;

        const subtypes$ = this.allCollateralSubtypes$(lgdModelId).pipe(
            map(m => m
                .filter(s => s.CollateralTypeCUId == collateralTypeId)
                .map(s => ({ Order: s.Order, Value: s.Id, Text: s.DescriptionL } as ICodebookItem))));

        return {
            getItems: () => subtypes$.toPromise(),
            getItem: id => subtypes$.pipe(map(model => model.find(s => s.Value == id))).toPromise()
        } as ICodebookProvider;
    }

    hasAnyProduct$(rarocId: number): Observable<boolean> {
        if (!this._rarocCollaterals)
            return this.rarocApiService.getCollateralDto(rarocId).pipe(
                tap(m => this._rarocCollaterals = m),
                map(m => m.HasAnyProduct && m.CollateralSet.length > 0));

        return of(this._rarocCollaterals.HasAnyProduct && this._rarocCollaterals.CollateralSet.length > 0);
    }

    isNew = (collateral: IRarocCollateralValueDto): boolean => collateral.Id <= 0;

    private getRarocCollateral(collateral: IRarocCollateralValueDto) {
        return {
            RarocId: this._rarocCollaterals.RarocId,
            RarocVersion: this.rarocVersion,
            RarocCollateral: collateral
        } as IRarocCollateralDto;
    }

    private updateCollateral(collateral: IRarocCollateralValueDto): void {
        if (this._rarocCollaterals) {
            const idx = this._collaterals.findIndex(c => c.Id == collateral.Id);
            if (idx >= 0)
                this._collaterals.splice(idx, 1, collateral);
            else
                this._collaterals.push(collateral);
        }
    }
}
