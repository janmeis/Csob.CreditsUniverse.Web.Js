import { IProductViewDto } from './../../services/webapi/webapi-models';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataResult, process, State } from '@progress/kendo-data-query';
import { ProductApiService } from '../../services/webapi/product-api-service';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class ProductOverviewService extends BehaviorSubject<DataResult> {
    loading = false;

    constructor(
        private productApi: ProductApiService
    ) {
        super(null);
    }
    query = (creditFileId: number, state: State): void => {
        this.fetch(creditFileId, state)
            .subscribe(x => super.next(x));
    }
    private fetch = (creditFileId: number, state: State): Observable<DataResult> => {
        this.loading = true;
        return this.productApi.getProductOverview(creditFileId).pipe(
            map((productOverview: IProductViewDto[]) => process(productOverview, state)),
            tap(() => this.loading = false)
        );
    }
}
