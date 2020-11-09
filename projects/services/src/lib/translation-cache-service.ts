import { Injectable } from '@angular/core';
import { keyFor } from 'core-js/fn/symbol';
import { ILogger, LogFactoryService } from './log-factory.service';
import { UserApiService } from './webapi/user-api-service';

interface ModuleLocales { [key: string]: string; }

@Injectable({
    providedIn: 'root'
})
export class TranslationCacheService {
    private logger: ILogger
    constructor(logFactory: LogFactoryService, private userService: UserApiService) {
        this.logger = logFactory.get('TranslationCacheService');
    }

    private locales: { [key: string]: ModuleLocales } = {}

    public async loadLocales(): Promise<any> {
        const data = await this.userService.getTranslations().toPromise();
        for (let i = 0; i < data.length; i++) {
            const m = data[i];
            if (Object.keys(this.locales).every(s => s != m.Module))
                this.locales[m.Module] = m.Texts;
        }
    }

    public get(component: string, key: string): string {
        const module = this.locales[component];
        if (!module) {
            this.logger.warn(`Module ${component} not found in localizations (key:${key})`);
            return null;
        }
        return module[key];
    }
}
