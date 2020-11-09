import { Injectable } from '@angular/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ISearchClientReqDto } from '../../services/webapi/webapi-models';
import { PartyApiService } from '../../services/webapi/party-api-service';

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
