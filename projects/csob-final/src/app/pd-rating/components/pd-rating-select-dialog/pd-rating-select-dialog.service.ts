import { Injectable } from '@angular/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { IPDRatingOverviewReqDto } from '../../../services/webapi/webapi-models';
import { PdRatingApiService } from '../../../services/webapi/pdrating-api-service';

@Injectable({
    providedIn: 'root'
})
export class PdRatingSelectDialogService extends BehaviorSubject<GridDataResult> {
    loading = false;

    constructor(
        private pdRatingApi: PdRatingApiService,
    ) {
        super(null);
    }

    query(criteria: IPDRatingOverviewReqDto): void {
        this.fetch(criteria)
            .subscribe(x => super.next(x));
    }

    private fetch(criteria: IPDRatingOverviewReqDto): Observable<GridDataResult> {
        this.loading = true;

        return this.pdRatingApi.postPdRatingOverview(criteria)
            .pipe(
                tap(() => this.loading = false)
            );
    }
}