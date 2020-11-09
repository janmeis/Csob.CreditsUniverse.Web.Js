import { Injectable } from '@angular/core';
import { DataResult, process, State } from '@progress/kendo-data-query';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PartyCreditFileManagementApiService } from 'src/app/services/webapi/partycreditfilemanagement-api-service';
import { ICreditComponentManagerModel } from 'src/app/services/webapi/webapi-models';

@Injectable()
export class PartyCreditFileManagementOverviewService extends BehaviorSubject<DataResult> {
    loading = false;

    private _hasNonStandardAccess: boolean;
    get hasNonStandardAccess(): boolean {
        return this._hasNonStandardAccess;
    }
    set hasNonStandardAccess(value: boolean) {
        this._hasNonStandardAccess = value;
    }
    private _managers: ICreditComponentManagerModel[];
    get total(): number {
        return this._managers.length;
    }

    constructor(
        private partyCreditFileManagementApiService: PartyCreditFileManagementApiService,
    ) {
        super(null);
    }

    query = (creditFileId: number, state: State, refresh: boolean = false): void => {
        this.fetch(creditFileId, state, refresh)
            .subscribe(x => super.next(x));
    }

    private fetch = (creditFileId: number, state: State, refresh: boolean = false): Observable<DataResult> => {
        this.loading = true;

        const managers$: Observable<ICreditComponentManagerModel[]> = !this._managers || refresh
            ? this.partyCreditFileManagementApiService.getList(creditFileId).pipe(
                tap(conditions => {
                    this.hasNonStandardAccess = conditions.HasNonStandardAccess;
                    this._managers = conditions.Managers;
                }),
                map(conditions => conditions.Managers))
            : of(this._managers);

        return managers$.pipe(
            map((result: ICreditComponentManagerModel[]) => process(result, state)),
            tap(() => this.loading = false)
        );
    }

    setCreditFileAccess(creditFileId: number): Observable<boolean> {
        return this.partyCreditFileManagementApiService.postSetCreditFileAccess(this.hasNonStandardAccess, creditFileId);
    }

    deleteManagers(selectedRows: ICreditComponentManagerModel[]) {
        return this.partyCreditFileManagementApiService.postDelete(selectedRows);
    }

    isDeletionValid(selectedRows: ICreditComponentManagerModel[]): boolean {
        const remainingRows = this._managers.filter(m => selectedRows.every(s => s.Id != m.Id));
        console.log(remainingRows);
        // no problem if main manager is not set
        if (!remainingRows.some(m => m.IsMainManagerSet))
            return true;

        const hasMainManager = remainingRows.some(m => !!m.MainManager && m.MainManager.length > 0);
        // main manager is set but no main manager remains
        return hasMainManager;
    }
}
