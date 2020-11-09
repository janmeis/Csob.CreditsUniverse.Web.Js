import { Injectable } from "@angular/core";
import { AppConfig } from "./app-config";
import { Languages } from './models/language';

@Injectable({
    providedIn: 'root'
})
export class CurrentLangService {
    constructor(private appConfig: AppConfig) { }

    getCurrentLangCultureCode() {
        const currentLangCode = this.getCurrentLang();
        return Languages.find(l => l.value == currentLangCode).cultureCode;
    }

    getCurrentLang(): string {
        if (window.localStorage) {
            return window.localStorage.getItem("language") || this.appConfig.defaultLanguage;
        }
        return this.appConfig.defaultLanguage;
    }
    setCurrentLang(lang: string) {
        if (window.localStorage) {
            return window.localStorage.setItem("language", lang);
        }
    }
    getDateFormat(style?) {
        switch (this.getCurrentLang()) {
            // case 'cs': return 'd. MMMM yyyy';
            // default: return 'dd MMMM yyyy';
            case 'cs': return 'dd.MM.yyyy';
            default: return 'MMMM dd yyyy';
        }
    }
}
