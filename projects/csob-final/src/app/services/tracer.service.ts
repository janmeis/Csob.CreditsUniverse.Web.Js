import { Injectable, Injector } from '@angular/core';
import { AppConfig } from '../app-config';
import { ILogListener, ILogListenerFactory, LogType } from './log-factory.service';
import { UserApiService } from './webapi/user-api-service';
import { ETraceLevel, ITraceDto } from './webapi/webapi-models';

var noop = function () { };

interface TraceOptions {
}

@Injectable({
    providedIn: 'root'
})
export class TraceErrorLogListenerFactory implements ILogListenerFactory {
    constructor(
        //private tracer: TracerService,
        private injector : Injector,
        private appConfig: AppConfig) {
    }
    get(module: string): ILogListener {
        if (this.appConfig.disableTraceErrors)
            return null;

        return new TraceErrorLogListener(module, this.injector.get(TracerService));
    }
}

class TraceErrorLogListener implements ILogListener {
    constructor(private module: string, private tracer: TracerService) { }
    log(type: LogType, msg: string, data: any) {
        if (type != LogType.error)
            return;
        this.tracer.log(ETraceLevel.Error, this.module, data);
    };
}

@Injectable({
    providedIn: 'root'
})
export class TracerService {
    constructor(private appConfig: AppConfig, private userApi: UserApiService) {
        if (this.appConfig.disableTrace) {
            //warning, this disables tracer until next app load
            this.log = noop;
            return;
        }
        window.setInterval(() => this.interval_tick(), 500);
    }
    private _records: ITraceDto[] = [];
    private _counter = 0;

    public sendEvent(msg: string, data: any = null) {
        this.log(ETraceLevel.Info, msg, data);
    }
    public log(level: ETraceLevel, msg: string, data: any = null, traceOptions: TraceOptions = {}) {
        if (this.appConfig.disableTrace)
            return;
        var r: ITraceDto = { Counter: (++this._counter), TimeStamp: new Date(), Message: msg, Data: null, Level: level };
        if (data) {
            r.Data = JSON.stringify(data);
        }
        this._records.push(r);
    }
    private interval_tick() {
        var data = this._records.splice(0, this._records.length);
        if (data.length == 0)
            return;
        this.send(data);
    }
    private send(data: ITraceDto[]) {
        this.userApi
            .postSaveTraces(data)
            .subscribe(
                next => {
                },
                error => {
                    //if (error && error.status && error.status >= 400) {

                    //}
                    console.error('Error sending trace', error);
                });
    }
}
