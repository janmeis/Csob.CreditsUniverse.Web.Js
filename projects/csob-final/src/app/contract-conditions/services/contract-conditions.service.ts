import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ContractConditionsApiService } from 'src/app/services/webapi/contractconditions-api-service';
import { IProductInfoDto } from 'src/app/services/webapi/webapi-models';

@Injectable()
export class ContractConditionsService {
    private _cache: { [name: string]: Observable<any> } = {};

    constructor(
        private contractConditionsApiService: ContractConditionsApiService,
    ) { }

    getProducts(creditFileId: number): Observable<IProductInfoDto[]> {
        const name = this.getMapped(creditFileId, 'products');
        const found = this._cache[name];
        if (found)
            return found as Observable<IProductInfoDto[]>;

        const result = this.contractConditionsApiService.getAvailableProductsForClient(creditFileId)
            .pipe(
                shareReplay(1)
            );
        this._cache[name] = result;
        return result;
    }
    private getMapped = (creditFileId: number, dtoName: string) => `${creditFileId}_${dtoName}`;
}
