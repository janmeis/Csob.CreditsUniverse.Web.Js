import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { AppConfig } from '../app-config';
import { UserNotificationService, ENotificationType } from './user-notification.service';
import { Observable, ObservableInput } from 'rxjs';
import { UrlHelperService } from './url-helper.service';
import { ESeverity, ResultStatus, Result } from '../app-common/models/Result';
import { ILogger, LogFactoryService } from './log-factory.service';
import { CurrentLangService } from './current-lang-service';
import { tap, map, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ApiBaseService {
    private logger: ILogger;
    public options: {
        headers: {
            [header: string]: string | string[];
        },
        withCredentials: true
    } = {
            headers: {},
            withCredentials: true
        };
    constructor(
        logFactory: LogFactoryService,
        private httpClient: HttpClient,
        private appConfig: AppConfig,
        private notification: UserNotificationService,
        private urlHelper: UrlHelperService,
        private currentLang: CurrentLangService
    ) {
        this.options.headers['X-LANGUAGE'] = currentLang.getCurrentLang();
        this.logger = logFactory.get('ApiBaseService');
    }
    public setApiVersion(version: string, clientVersion: string) {
        const HEADER1 = 'X-WEBAPIVERSION';
        if (version == undefined) {
            delete this.options.headers[HEADER1];
        } else {
            this.options.headers[HEADER1] = version;
        }
        const HEADER2 = 'X-CLIENTVERSION';
        if (clientVersion == undefined) {
            delete this.options.headers[HEADER2];
        } else {
            this.options.headers[HEADER2] = clientVersion;
        }
    }

    public setCurrentCreditFile(selectedCreditFileId: string) {
        const creditFileHeader = 'X-SELECTED-CREDITFILE';

        if (selectedCreditFileId == undefined) {
            delete this.options.headers[creditFileHeader];
        } else {
            this.options.headers[creditFileHeader] = selectedCreditFileId;
        }
    }

    private reportError(err: any) {
        try {
            if (err.status === 0) {
                this.notification.error(`Cannot connect to server - please check your connection`);
                return;
            }
            const error = JSON.parse(err.error);
            if (error && error.Statuses) {
                //error.Statuses.forEach(s => this.notification.error(`${s.Code}: ${s.Message}`));
                this.notifyStatuses(error.Statuses, false);
                return;
            }
            switch (err.status) {
                case 401:
                    this.notification.error(`Unauthorised - you are not logged in`);
                    return;
                case 403:
                    this.notification.error(`Forbidden - this action is forbidden for current user`);
                    return;
                case 404:
                    this.notification.error(`Data not found - data was moved, or deleted from server`);
                    return;
                case 409:
                    this.notification.error(`Confict - data was modified before your action, please reload and repeat your action`);
                    return;
                case 500:
                    this.notification.error(`Internal server error - please repeat your action, or contact administrator`);
                    return;
                default:
                    var s = err.status && '(' + err.status + ')';
                    this.notification.error(`General communication error - ${err.message || err} ${s}`);
                    return;
            }
        } catch (e) {
            this.notification.error(`General communication error - ${err.message || err}`);
            return;
        }
    }
    private handleError<T>(err: any, data: Observable<T>): ObservableInput<T> {
        this.logger.info("Error", err);
        this.reportError(err);
        throw err;
    }

    getNotificationType(s: ESeverity) {
        switch (s) {
            case ESeverity.Error: return ENotificationType.Error;
            case ESeverity.Info: return ENotificationType.Information;
            case ESeverity.Warning: return ENotificationType.Warning;
            default: return undefined;
        }
    }

    notifyStatuses(s: ResultStatus[], skipErrors = true) {
        if (!s || !s.length)
            return;
        s.forEach(x => {
            if (x.Severity == ESeverity.Error) {
                if (!skipErrors) {
                    this.notification.error(x.Message);
                }
            } else {
                this.notification.show({ type: this.getNotificationType(x.Severity), message: x.Message });
            }
        });
    }

    normalizeUrl(url: string, args = null) {
        if (args) {
            var params = this.urlHelper.dataToParams(args);
            if (url.indexOf('?') >= 0) {
                url += "&" + params.toString();
            } else {
                url += "?" + params.toString();
            }
        }
        if (url.startsWith('/'))
            url = url.substr(1);
        var result = this.appConfig.apiEndPoint;
        if (!result.endsWith('/'))
            result += '/';
        return result + url;
    }
    url(url: string, args: any = null): string {
        return this.normalizeUrl(url, args);
    }
    get<T>(url: string, args: any = null): Observable<T> {
        this.logger.info("GET", url);
        return this.httpClient
            .get<T>(this.normalizeUrl(url, args), this.options)
            .pipe(
                catchError((x, data) => this.handleError(x, data))
            );
    }
    post<T>(url: string, args = null, data = null): Observable<T> {
        this.logger.info("POST", url);
        return this.httpClient
            .post<T>(this.normalizeUrl(url, args), data, this.options)
            .pipe(
                catchError((x, data) => this.handleError(x, data))
            );
    }
    download(url: string, args = null, data = null): Observable<HttpResponse<Blob>> {
        this.logger.info("POST/download", url);
        let options = Object.assign({}, this.options) as any;
        options.observe = 'response';
        options.responseType = 'blob';
        return this.httpClient
            .post(this.normalizeUrl(url, args), data, options)
            .pipe(
                //tap(x => this.notifyStatuses(x.Statuses)),
                map(x => x as any as HttpResponse<Blob>)
            );
    }
    postResult<T>(url: string, args = null, data = null): Observable<T> {
        return this
            .post<Result<T>>(url, args, data)
            .pipe(
                tap(x => this.notifyStatuses(x.Statuses)),
                map(x => x.Data)
            );
    }
    getResult<T>(url: string, args: any = null): Observable<T> {
        //this.notification.clear();
        return this.get<Result<T>>(url, args)
            .pipe(
                //catchError((x, data) => this.handleError(x, data)),
                tap(x => this.notifyStatuses(x.Statuses)),
                map(x => x.Data)
            );
    }
}
