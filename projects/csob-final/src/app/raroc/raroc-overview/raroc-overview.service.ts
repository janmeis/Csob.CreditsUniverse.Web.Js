import { Injectable } from '@angular/core';
import { GridState } from 'projects/app-common/src/lib/models/GridBaseDto';
import { IGridResult, IRarocOverviewReqDto, IRarocOverviewResDto, RarocApiService } from 'projects/services/src/public-api';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
