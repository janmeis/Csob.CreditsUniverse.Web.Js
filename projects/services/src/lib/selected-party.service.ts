import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Params, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, shareReplay, tap } from 'rxjs/operators';
import { ILogger, LogFactoryService } from './log-factory.service';
import { PartyApiService } from './webapi/party-api-service';
import { IPartyHeaderDto } from './webapi/webapi-models';

export function getRouteParamsRec(r: ActivatedRoute) {
    let params = {};
    while (r) {
        params = Object.assign(params, r.snapshot.params);
        r = r.firstChild;
    }
    return params;
}

@Injectable({
    providedIn: 'root'
})
export class SelectedPartyService {
    private log: ILogger;
    private partyId: number = null;
    private _partyHeader = new Subject<IPartyHeaderDto>();
    private sharedPartyHeader = this._partyHeader
        .pipe(
            shareReplay(1),
            tap(x => this.log.debug('sharedPartyHeader tap', x))
        );
    public get partyHeader(): Observable<IPartyHeaderDto> {
        this.log.debug('get partyHeader()');
        return this.sharedPartyHeader;
    }
    constructor(
        logFactory: LogFactoryService,
        private partyApi: PartyApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.log = logFactory.get('SelectedPartyService');
        this.log.debug('started');
        this.clear();
        this.router.events
            .pipe(
                //tap(ev => this.log.debug('router event ' + ev, ev)),
                filter(event => event instanceof ActivationEnd)
            )
            .subscribe((ev: ActivationEnd) => {
                //TODO: getRouteParamsRec ??? when BACK/FW clicked
                this.setIdFromRouter(ev.snapshot.params);
            });
        const params = getRouteParamsRec(this.route);
        this.setIdFromRouter(params);
    }
    private setIdFromRouter(params: Params): boolean {
        const id = +params['partyId'];
        this.log.debug('setIdFromRouter', [id, params['partyId'], JSON.stringify(params)]);
        if (id && id != this.partyId) {
            this.setId(id);
            return true;
        }
        return false;
    }
    public reload() {
        const id = this.partyId;
        this.clear();
        return this.setId(id);
    }
    onLoaded(){
        this.partyApi.postResolveNegatives(this.partyId).subscribe();
    }
    setId(partyId: number) {
        this.log.debug('updating party to ' + partyId);
        if (partyId == 0)
            return;
        this.partyId = partyId;
        const r = this.partyApi.getPartyHeader(partyId);

        r.subscribe(d => {
            this.onLoaded();
            this.log.debug('selected party data fetch');
            this.setData(d);
        },
        err => {
            this.clear();
        });
        return r;
    }
    setData(partyHeader: IPartyHeaderDto) {
        this.partyId = partyHeader.Id;
        this.log.debug('set data party', partyHeader);
        this._partyHeader.next(partyHeader);
    }
    clear() {
        this.log.debug('clear party');
        this.partyId = null;
        this._partyHeader.next(null);
    }
	/**
	 * returns actual data, or waits for loading them. Doesn't wait for more data.
	 * You can pass actual params of current route (from example in CanActivateGuard)
	 *  when current router state is not yet ready
	 * */
    getData(params?: Params): Observable<IPartyHeaderDto> {
        if (!this.partyId) {
            this.setIdFromRouter(params);
        }
        return this.partyHeader;
    }
}
