import { ILogListenerFactory, ILogListener, LogType } from "./log-factory.service";
import { AppConfig } from "../app-config";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class ConsoleListenerFactory implements ILogListenerFactory {
    constructor(private appConfig: AppConfig) { }
    get(module: string): ILogListener {
        if (!this.appConfig.logging)
            return null;
        if (!this.isEnabled(module))
            return null;
        return new ConsoleListener(module, this.appConfig.logger.debug.indexOf(module) >= 0);
    }
    private isEnabled(module: string) {
        if (this.appConfig.logger && this.appConfig.logger.disable) {
            if (this.appConfig.logger.disable.indexOf(module) >= 0)
                return false;
        }
        return true;
    }
}
class ConsoleListener implements ILogListener {
    private call = {};
    constructor(private module: string, private debugAlso: boolean) {
        this.call[LogType.debug] = console.log;
        this.call[LogType.error] = console.error;
        this.call[LogType.info] = console.info;
        this.call[LogType.warn] = console.warn;
    }

    log(type: LogType, msg: string, data: any) {
        if (!this.debugAlso && type == LogType.debug)
            return;
        //console.info("[" + this.module + "]:" + msg, data);
        msg = "[" + this.module + "]:" + msg;
        var args = [msg];
        if (data) args.push(data);
        this.call[type].apply(console, args);
    }
}

