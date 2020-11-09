import { Injectable } from '@angular/core';
import { DataResult, process, State } from '@progress/kendo-data-query';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { CollateralApiService } from '../../services/webapi/collateral-api-service';
import { ICollateralViewDto } from '../../services/webapi/webapi-models';

@Injectable()
export class CollateralOverviewService extends BehaviorSubject<DataResult> {
    loading = false;

    constructor(
        private collateralApiService: CollateralApiService,
    ) {
        super(null)
    }
    query = (creditFileId: number, state: State): void => {
        this.fetch(creditFileId, state)
            .subscribe(x => super.next(x));
    }
    private fetch = (creditFileId: number, state: State): Observable<DataResult> => {
        this.loading = true;
        return this.collateralApiService.getCollateralOverview(creditFileId).pipe(
            map((collateralDetails: ICollateralViewDto[]) => process(collateralDetails, state)),
            tap(() => this.loading = false)
        );
    }
}
