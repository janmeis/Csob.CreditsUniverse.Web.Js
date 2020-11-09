import { Injectable } from '@angular/core';
import { DataResult, process, State } from '@progress/kendo-data-query';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserProgressService } from 'src/app/services/user-progress.service';
import { DashboardApiService } from 'src/app/services/webapi/dashboard-api-service';
import { IDashboardEventDto, IDashboardItemDto, IDashboardItemResDto, ECalendarType, IDashboardSearchDto } from 'src/app/services/webapi/webapi-models';
import { CodebookApiService } from 'src/app/services/webapi/codebook-api-service';

export interface IDashboardType {
    Value: number;
    Text: string;
    Color: string;
}

@Injectable()
export class DashboardEventsService extends BehaviorSubject<DataResult>  {
    private creditFileId: number = null;
    private _dashboadTypes: IDashboardType[];

    constructor(
        protected codebooksApi: CodebookApiService,
        private dashboardApiService: DashboardApiService,
        public progress: UserProgressService,
    ) {
        super(null);
    }

    getDashboardTypes$(all: string, isForUser: boolean): Observable<IDashboardType[]> {
        if (!this._dashboadTypes)
            return this.codebooksApi.getDashboardTypes({ isForUser: isForUser }).pipe(
                map(dashboardType =>
                    [{ Id: 0, Value: null, Text: all, Color: null } as IDashboardType]
                        .concat(dashboardType
                            .sort((a, b) => a.Order - b.Order)
                            .map(t => ({ Value: t.Id, Text: t.Description, Color: t.Color } as IDashboardType)))),
                tap(dashboardType => this._dashboadTypes = dashboardType));

        return of(this._dashboadTypes);
    }

    getDashboardItems$ = (): Observable<IDashboardItemDto[]> => this.dashboardApiService.getDashboardItems();

    getDashboardEvents$ = (isForUser: boolean = false): Observable<IDashboardEventDto[]> => this.dashboardApiService.postEvents({ CreditFileId: this.creditFileId, IsForUser: isForUser } as IDashboardSearchDto);

    getDashboardItemsbyDate$ = (date: Date, calendarType: ECalendarType, isForUser = false): Observable<IDashboardItemResDto> => this.dashboardApiService.getDashboardItemsbyDate(date, calendarType, { isForUser: isForUser });

    query = (state: State, creditFileId?: number, isForUser: boolean = false): void => {
        this.fetch(state, creditFileId, isForUser)
            .subscribe(x => super.next(x));
    }

    private fetch = (state: State, creditFileId?: number, isForUser: boolean = false): Observable<DataResult> => {
        this.creditFileId = creditFileId;

        return this.progress.runProgress(
            this.getDashboardEvents$(isForUser).pipe(
                map(m => process(m, state)),
            ));
    }
}
