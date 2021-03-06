import { Injectable } from '@angular/core';
import { CodebookApiService, EKeyEnum, ETimeUnit, ICodebookItem, ILGDModelCodebookItem, IRarocContainerDto, IRarocValidationDto, RarocApiService } from 'projects/services/src/public-api';
import { Observable, of } from 'rxjs';
import { flatMap, map, tap } from 'rxjs/operators';
import { GetEmptyCodebookProvider, GridEnumService, ICodebookProvider } from 'projects/app-common/src/public-api';

@Injectable()
export class RarocDetailService {
    private _allLgdModels: ILGDModelCodebookItem[];

    constructor(
        private codebookApiService: CodebookApiService,
        private gridEnumService: GridEnumService,
        private rarocApiService: RarocApiService,
    ) {
    }

    getRaroc$(rarocId: number | 'new', creditFileId: number): Observable<IRarocContainerDto> {
        if (rarocId != 'new')
            return this.rarocApiService.getMainRaroc(+rarocId);
        else
            return this.rarocApiService.getNewRaroc(creditFileId).pipe(
                flatMap((id: number) => this.rarocApiService.getMainRaroc(id)));
    }

    saveRaroc$(rarocContainer: IRarocContainerDto) {
        return this.rarocApiService.postSaveRaroc(rarocContainer);
    }

    get allLgdModels$() {
        if (!this._allLgdModels)
            return this.codebookApiService.getLGDModel().pipe(tap(m => this._allLgdModels = m));
        return of(this._allLgdModels);
    }

    get frequencyUnits(): ICodebookProvider {
        return this.gridEnumService.GetEnumCodebookProviderFiltered(EKeyEnum.TimeUnit, null, [ETimeUnit.Day, ETimeUnit.Week]);
    }

    get monthYear(): ICodebookProvider {
        return this.gridEnumService.GetEnumCodebookProviderFiltered(EKeyEnum.TimeUnit, [ETimeUnit.Month, ETimeUnit.Year]);
    }

    getFilteredLgdModels(pdRatingModelId: number): ICodebookProvider {
        if (!pdRatingModelId)
            return GetEmptyCodebookProvider();

        const lgdModels$ = this.allLgdModels$.pipe(
            map(m => m
                .filter(s => s.PDRatingModelId == pdRatingModelId)
                .map(s => ({ Value: s.Value, Text: s.Text, Order: s.Order } as ICodebookItem))));

        return {
            getItems: () => lgdModels$.toPromise(),
            getItem: id => lgdModels$.pipe(map(model => model.find(s => s.Value == id))).toPromise()
        } as ICodebookProvider;
    }

    getValidationRaroc(rarocId: number): Observable<IRarocValidationDto> {
        return this.rarocApiService.getValidationRarocSubProdColl(rarocId)
    }
}
