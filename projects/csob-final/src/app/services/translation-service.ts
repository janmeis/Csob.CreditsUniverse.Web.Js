import { Injectable, Injector } from '@angular/core';
import { LogFactoryService, ILogger } from './log-factory.service';
import { TranslationCacheService } from './translation-cache-service';

/**
 * this service should be provided in each component, which can use localization file
 * */
@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    private logger: ILogger;
    private cache: TranslationCacheService;
    constructor(injector: Injector) {
        this.logger = injector.get(LogFactoryService).get('TranslationService');
        this.cache = injector.get(TranslationCacheService);
    }
    /**
     * call this method to get localized string of given key in current locale
     * @param key
     */
    $$get(key: string, ...args: any[]): string {
        if (!key)
            return '';

        let s: string;
        if (key.startsWith('kendo.'))
            s = this.cache.get('app.kendo', key);
        else {
            const [componetName, _key] = key.split('.');
            s = this.cache.get(componetName, _key);
        }
        return !!s ? this.format.apply(this, [s].concat(args)) : '~' + key + '~';
    }
    /**
     * call this method when you want to localize given string
     * use appropriate tool to replace this call to calling get method with appropriate generated key
     * @param text - text to localize
     */
    $$localize(text: string, ...args: any[]): string {
        return this.format.apply(this, [text].concat(args));
    }

    format(s: string, ...args: any[]) {
        let result = s;
        if (result) {
            for (let i = 0; i < args.length; i++) {
                const strToReplace = '{' + i + '}';
                result = result.replace(strToReplace, (args[i] || ''));
            }
        }
        return result;
    }
}
