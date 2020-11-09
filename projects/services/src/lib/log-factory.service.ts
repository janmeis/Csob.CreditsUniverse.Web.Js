import { Injectable, Injector, InjectionToken } from "@angular/core";


//warning, maps to console[xxx] functions
export enum LogType {
    info = 'info',
    warn = 'warn',
    error = 'error',
    debug = 'debug'
}

export interface ILogListenerFactory {
    get(module: string): ILogListener
}
export interface ILogListener {
    log(type: LogType, msg: string, data: any);
}
function noop() { }

export interface ILogger {
    info(msg: string, data?: any)
    warn(msg: string, data?: any)
    error(msg: string, data?: any)
    debug(msg: string, data?: any)
}
class EmptyListener implements ILogListener {
    log(type: LogType, msg: string, data: any) { };
}

class LoggerToListeners implements ILogger {
    constructor(public listeners: ILogListener[]) { }
    log(type: LogType, msg: string, data: any) {
        this.listeners.forEach(x => x.log(type, msg, data));
    };

    info(msg: string, data?: any) {
        this.log(LogType.info, msg, data);
    }
    warn(msg: string, data?: any) {
        this.log(LogType.warn, msg, data);
    }
    error(msg: string, data?: any) {
        this.log(LogType.error, msg, data);
    }
    debug(msg: string, data?: any) {
        this.log(LogType.debug, msg, data);
    }
}

@Injectable({ providedIn: 'root' })
export class LogFactoryService {
    private factories: ILogListenerFactory[] = [];
    constructor() {
    }
    get(module: string): ILogger {
        var listeners: ILogListener[] = this.factories.map(f => f.get(module)).filter(x => x);
        if (listeners.length == 0)
            return { debug: noop, error: noop, info: noop, warn: noop };
        return new LoggerToListeners(listeners);
    }
    addListener(f: ILogListenerFactory) {
        this.factories.push(f);
    }
}
