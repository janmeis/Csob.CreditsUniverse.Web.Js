import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PdRatingApiService } from '../../services/webapi/pdrating-api-service';
import { IGridResult, IPDRatingOverviewResDto } from '../../services/webapi/webapi-models';
import { PdCriteria } from '../models/pd-overview';

@Injectable()
export class PdRatingOverviewService extends BehaviorSubject<IGridResult<IPDRatingOverviewResDto>> {
    loading = false;

    constructor(
        private pdRatingApi: PdRatingApiService,
    ) {
        super(null);
    }
    query = (criteria: PdCriteria): void => {
        this.fetch(criteria)
            .subscribe(x => super.next(x));
    }
    private fetch = (criteria: PdCriteria): Observable<IGridResult<IPDRatingOverviewResDto>> => {
        this.loading = true;

        return this.pdRatingApi.postPdRatingOverview(criteria).pipe(
            tap(() => this.loading = false)
        );
    }
}
