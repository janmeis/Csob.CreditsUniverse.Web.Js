import { ECodetable, EKeyEnum } from './services/webapi/webapi-models';
import { Injectable } from '@angular/core';

declare interface DeploymentConfig {
    apiEndPoint: string;
    defaultLanguage: string;
    logging: boolean;
    logger?: LogConfig;
    codeBookMap?: { [key: string]: string };
    checkLockingInterval: number;
    minSearchChars: number;
    adminUrl: string;
}

interface LogConfig {
    // add your module here in debugging stage, so your .debug messages will be shown highlighted
    debug?: string[]
    // add your module here to disable logging when logging is enabled
    disable?: string[]
}
@Injectable({ providedIn: 'root' })
export class AppConfig implements DeploymentConfig {
    // POZOR, defaulty nastavujte tak, aby mohly být na PROD prostředí.
    // Pro DEV použijte /src/deployment / config.js
    apiEndPoint = '/api';
    defaultLanguage = 'cs';
    logging = false;
    codeBookMap = {
        'kbcs': `codebook?table=${ECodetable.KBC}`,
        'currencies': `codebook?table=${ECodetable.Currency}`,
        'unit': `KeyEnums?keyenum=${EKeyEnum[EKeyEnum.Unit]}`,
        'overrulingreason': `KeyEnums?keyenum=${EKeyEnum[EKeyEnum.OverrulingReason]}`,
        'ratingcode': `codebookcode?table=${ECodetable.Rating}`,
        'erecurrencetype': `langtable?name=erecurrencetype`,
        'efinancialconditionoperator': `langtable?name=efinancialconditionoperator`,
    };
    // do not send traces to server
    disableTrace = false;
    // do not send logger errors to server
    disableTraceErrors = false;
    logger: LogConfig = {};
    checkLockingInterval: number = 5 * 60 * 1000;
    minSearchChars: 3;
    adminUrl: '';
    constructor() {
        const deployment = <DeploymentConfig>(<any>window).appConfig;
        Object.assign(this, deployment);
    }
}
