import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ContractConditionsApiService } from '../../services/webapi/contractconditions-api-service';
import { IContractConditionFilterDto, IContractConditionViewDto, IGridResult } from '../../services/webapi/webapi-models';

@Injectable({
    providedIn: 'root'
})
export class ContractConditionsOverviewService extends BehaviorSubject<IGridResult<IContractConditionViewDto>> {
    loading = false;
    constructor(
        private contractConditionsApiService: ContractConditionsApiService
    ) {
        super(null);
    }
    query = (criteria: IContractConditionFilterDto): void => {
        this.fetch(criteria)
            .subscribe(x => super.next(x));
    }
    private fetch = (criteria: IContractConditionFilterDto): Observable<IGridResult<IContractConditionViewDto>> => {
        this.loading = true;

        return this.contractConditionsApiService.postContractConditionOverview(criteria).pipe(
            tap(() => this.loading = false)
        );
    }
}
