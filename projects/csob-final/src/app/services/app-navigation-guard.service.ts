import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanDeactivate, Route, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { from, isObservable, Observable } from 'rxjs';
import { isPromise } from 'rxjs/internal-compatibility';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Arrays } from '../app-common/arrays';
import { hasPermission } from '../app-common/common-functions';
import { AppDialogContainerService } from '../app-common/services/app-dialog-container.service';
import { ILogger, LogFactoryService } from './log-factory.service';
import { SecurityService } from './security.service';
import { SelectedPartyService } from './selected-party.service';
import { UserProgressService } from './user-progress.service';
import { EPermissionAreaType, IPartyHeaderDto, IWebUserDto } from './webapi/webapi-models';

export function AddGuards(routes: Routes): Routes {
    var result = addGuardsRec(routes);
    //console.log('AddGuards', result);
    return result;
}
export interface CanComponentDeactivate {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

function addGuard(guards: any[], toAdd: any[]): any[] {
    if (guards == null || guards.length == 0)
        return toAdd;
    const result = [].concat(guards);
    toAdd.forEach(g => {
        if (!Arrays.any(result, x => x == g)) {
            result.push(g);
        }
    });
    return result;
}

function addGuardsRec(routes: Route[]): Route[] {
    routes.forEach(route => {
        route.canDeactivate = addGuard(route.canDeactivate, [DialogGuard, CanDeactivateGuard]);
        //TODO: prava - v route ale musi byt kod akce
        //route.canActivate = addGuard(route.c, [x=>x]);
        if (route.children) {
            route.children = addGuardsRec(route.children);
        }
    });
    return routes;
}
export type DialogGuardMode = 'activate' | 'deactivate' | 'activatechild';


/** AppNavigationGuardService
 * - singleton, ktery shromazduje informace o aktualni deaktivaci,
 * - pouziva se interne z CanDeactivateGuard, ten tedy umi vratit promise/observable
 * - spravne funguje pouze pokud CanDeactivateGuard je posledni (tj. DialogGuard musi byt predtim)
 * - angular + browser ale neumi rozumne resit historii, takze mackani 'Back/Forward' v browseru meni url i Title stranky
 * */
@Injectable({
    providedIn: 'root'
})
export class AppNavigationGuardService {
    log: ILogger;
    constructor(logFactory: LogFactoryService) {
        this.log = logFactory.get('AppNavigationGuardService');
    }
    BeforeUnload(e: BeforeUnloadEvent): any {
        //console.log('>beforeunload ');
        this.log.info('beforeunload window', e);
        e.returnValue = 'Opravdu si přejete aplikaci opustit?'; //ask user
        e.preventDefault();
    }
    private canDeactivateIsRunning = false;
    public get isDeactivating(): boolean {
        return this.canDeactivateIsRunning;
    }
    subscribeCanDeactivate(result: boolean | Observable<boolean> | Promise<boolean>): any {
        if (isObservable(result)) {
            this.log.debug('canDeactivate Observable');
            this.canDeactivateIsRunning = true;
            return result.pipe(
                tap(x => {
                    this.canDeactivateIsRunning = false;
                    this.log.debug('canDeactivate Observable - continue');
                })
            )
        }
        if (isPromise(result)) {
            this.log.debug('canDeactivate promise', result);
            this.canDeactivateIsRunning = true;
            return result.then(
                x => {
                    this.canDeactivateIsRunning = false;
                    this.log.debug(`canDeactivate promise fulfiled=${x}`);
                    return x;
                },
                x => {
                    this.canDeactivateIsRunning = false;
                    this.log.debug(`canDeactivate promise rejected=${x}`);
                    throw x;
                }
            )
        }
        this.log.debug(`scalar canDeactivate: ${result}`);
        return result;
    }
}

/** DialogGuard
 * - nedovoli opustit stranku, pokud je otevreny dialog
 * */
@Injectable()
export class DialogGuard implements CanDeactivate<any>, CanActivateChild, CanActivate {
    private log: ILogger;
    constructor(
        private dialog: AppDialogContainerService,
        logFactory: LogFactoryService,
        private appNav: AppNavigationGuardService,
        private title: Title) {
        this.log = logFactory.get('DialogGuard');
    }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.can('activate');
    }
    canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot) {
        return this.can('deactivate');
    }
    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.can('activatechild');
    }
    public can(mode: DialogGuardMode) {
        this.log.debug(`can-${mode}, current title = ${this.title.getTitle()}`);
        if (this.dialog.activeInstances > 0) {
            var view = this.dialog.container.get(0);
            this.log.warn(`can-${mode} blocked by DialogGuard`);
            return false;
        }
        return true;
    }
}

/** AuthGuard
 * z konfigurace routy zjisti ucType
 * - nedovoli aktivaci, pokud uzivatel nema na dany UC prava
 * */
@UntilDestroy()
@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
    private log: ILogger;
    constructor(
        public progress: UserProgressService,
        private router: Router,
        private security: SecurityService,
        private selectedParty: SelectedPartyService,
        logFactory: LogFactoryService) {
        this.log = logFactory.get('AuthGuard');
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot) {
        return this.canActivateChild(next, state);
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const ucType = childRoute.data['ucType'] as EPermissionAreaType;
        if (ucType == null) {
            this.log.debug('canActivateChild - no ucType found on route config');
            return true;
        }
        let party: IPartyHeaderDto;
        return this.selectedParty.getData(childRoute.params).pipe(
            tap(data => party = data),
            mergeMap(_ => from(this.security.getOrLoadCurrentUser())),
            map(usr => {
                const hp = hasPermission({ party: party, user: usr }, ucType);
                this.log.debug(`canActivateChild ucType:${ucType}, hasPermission:${hp}`);
                if (!hp) {
                    this.router.navigate(['party/search']);
                    return false;
                }
                return true;
            }));
    }
}

/** CanDeactivateGuard
 * - vola canDeactivate od 'Page' komponenty, ta musi implementvat CanComponentDeactivate
 */
@Injectable()
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
    private log: ILogger;
    constructor(logFactory: LogFactoryService,
        private appNav: AppNavigationGuardService,
        private title: Title) {
        this.log = logFactory.get('CanDeactivateGuard');
    }

    canDeactivate(component: CanComponentDeactivate,
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        this.log.debug(`Url: ${state.url}, current title=${this.title.getTitle()}`);
        if (this.appNav.isDeactivating) {
            this.log.debug(`CanDeactivate blocked by another CanDeactivate`);
            return false;
        }
        if (component == null)
            return true;
        const canDeactivate = component.canDeactivate;
        if (canDeactivate == undefined)
            return true;
        const result = component.canDeactivate(); //observable, promise, or value
        this.log.debug(`canDeactivate result`, result);
        return this.appNav.subscribeCanDeactivate(result);
    }
}
