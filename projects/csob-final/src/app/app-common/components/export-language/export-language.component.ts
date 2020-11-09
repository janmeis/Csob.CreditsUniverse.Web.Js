import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Language, Languages } from 'projects/services/src/public-api';

@Component({
    selector: 'app-export-language',
    templateUrl: './export-language.component.html',
    styleUrls: ['./export-language.component.less'],
})
export class ExportLanguageComponent{

    get languages() {
        return Languages;
    }

    private _language = Languages[0];

    get language(): Language {
        return this._language;
    }
    @Input() set language(x: Language) {
        this._language = x;
        this.languageChange.emit(this._language);
    }
    @Output() languageChange = new EventEmitter<Language>();
}
