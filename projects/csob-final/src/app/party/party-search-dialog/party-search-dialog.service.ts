import { Injectable } from '@angular/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ISearchClientReqDto } from 'projects/services/src/public-api';
import { PartyApiService } from 'projects/services/src/public-api';

@Injectable({
    providedIn: 'root'
})
export class PartySearchDialogService extends BehaviorSubject<GridDataResult> {
    loading = false;

    constructor(
        private partyApi: PartyApiService
    ) {
        super(null);
    }
    query(criteria: ISearchClientReqDto) {
        this.fetch(criteria)
            .subscribe(x => super.next(x));
    }
    private fetch(criteria: ISearchClientReqDto): Observable<GridDataResult> {
        this.loading = true;

        return this.partyApi.postSearch(criteria)
            .pipe(
                tap(() => this.loading = false)
            );
    }
}
