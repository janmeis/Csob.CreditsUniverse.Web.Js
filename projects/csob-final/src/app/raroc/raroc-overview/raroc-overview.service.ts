import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RarocApiService } from 'src/app/services/webapi/raroc-api-service';
import { IGridResult, IRarocOverviewResDto, IRarocOverviewReqDto } from 'src/app/services/webapi/webapi-models';
import { GridState } from 'src/app/app-common/models/GridBaseDto';

export class RarocCriteria extends GridState implements IRarocOverviewReqDto {
    CreditFileId: number;
}
@Injectable()
export class RarocOverviewService extends BehaviorSubject<IGridResult<IRarocOverviewResDto>> {
    loading = false;

    constructor(
        private rarocApi: RarocApiService
    ) {
        super(null);
    }
    query = (criteria: RarocCriteria): void => {
        this.fetch(criteria)
            .subscribe(x => super.next(x));
    }
    private fetch = (criteria: RarocCriteria): Observable<IGridResult<IRarocOverviewResDto>> => {
        this.loading = true;

        return this.rarocApi.postRarocOverview(criteria).pipe(
            tap(() => this.loading = false)
        );
    }
}