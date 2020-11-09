import { Injectable } from '@angular/core';
import * as dates from '@progress/kendo-date-math';
import { getToday } from 'projects/app-common/src/public-api';
import { Observable, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ILogger, LogFactoryService } from './log-factory.service';

@Injectable({
    providedIn: 'root'
})
export class SharedCacheService {
    private logger: ILogger;
    private _cache: { [name: string]: Observable<any> } = {};
    private _validUntil = dates. addDays(getToday(), 1); // nasledujici pulnoc
    constructor(
        logFactory: LogFactoryService) {
        this.logger = logFactory.get('SharedCacheService');
    }
    public get<T>(key: string, getter: (name: string) => Observable<T>) {
        const found = this.findInCache(key);
        if (found) {
            return found;
        }
        this.logger.debug(`Key [${key}] missing, fetching`);
        const subject = new Subject<T>();
        getter(key)
            .subscribe(x => {
                this.logger.debug(`Key [${key}] fetched`);
                subject.next(x);
                subject.complete();
            });
        const result = subject
            .pipe(
                shareReplay(1)
            );
        this._cache[key] = result;
        return result;
    }
    public findInCache(key: string) {
        if (this._validUntil.valueOf() < new Date().valueOf()) {
            this.logger.debug(`cache expired`);
            this._cache = {};
            return undefined;
        }
        return this._cache[key];
    }
    public invalidate(key) {
        delete this._cache[key];
    }
}
