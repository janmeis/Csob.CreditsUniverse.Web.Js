import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';

export interface IUserProgressService {
    start();
    stop();
}

@Injectable({
    providedIn: 'root'
})
export class UserProgressService implements IUserProgressService {
    private _running: boolean = false; //this is bound to spinner visibility
    get running(): boolean {
        return this._running;
    }
    set running(value: boolean) {
        this._running = value;
        if (value) {
            setTimeout(() => { if (this._running) this.isVisible = true; }, 120);
        } else {
            this.isVisible = false;
        }
    }
    isVisible: boolean = false;

    loading: boolean = false;
    constructor() { }
    start(isLoading: boolean = false) {
        setTimeout(() => isLoading ? this.loading = true : this.running = true, 0);
    }
    stop() {
        setTimeout(() => this.loading = this.running = false, 0);
    }

    runProgress<T>(obs: Observable<T>, isLoading: boolean = false): Observable<T> {
        this.start(isLoading);
        return obs
            .pipe(
                catchError(e => { this.stop(); throw e; }),
                map(x => { this.stop(); return x; }),
                first(),
            );
    }

    runAsync<T>(obs: Observable<T>, isLoading: boolean = false): Promise<T> {
        return this.run(obs.toPromise(), isLoading);
    }
    run<T>(promise: Promise<T>, isLoading: boolean = false): Promise<T> {
        this.start();
        return promise
            .then(data => {
                this.stop();
                return data;
            })
            .catch(x => {
                this.stop();
                throw x;
            });
    }
}
