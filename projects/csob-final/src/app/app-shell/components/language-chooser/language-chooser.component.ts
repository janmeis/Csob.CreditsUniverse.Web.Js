import { Component, Injector, OnInit } from '@angular/core';
import { MessageBoxDialogComponent, Options } from 'projects/app-common/src/public-api';
import { CurrentLangService, Languages, TranslationService } from 'projects/services/src/public-api';

@Component({
    selector: 'app-language-chooser',
    templateUrl: './language-chooser.component.html',
    styleUrls: ['./language-chooser.component.less'],
})
export class LanguageChooserComponent implements OnInit {
    currentLanguage: string = null;
    previousLanguage: string = null;

    get languages() {
        return Languages;
    }

    opts: Options;

    constructor(
        private currentLangService: CurrentLangService,
        private injector: Injector,
        private translation: TranslationService,
    ) { }

    ngOnInit() {
        this.currentLanguage = this.currentLangService.getCurrentLang();
        this.previousLanguage = this.currentLanguage;
        this.opts = MessageBoxDialogComponent.createYesNoOptions(this.injector);
        this.opts.messageHTML = this.translation.$$get('language_chooser.langchooser_warning');
    }
    async onLanguageChanged(lng: string) {
        if (await MessageBoxDialogComponent.show(this.injector, this.opts).toPromise()) {
            this.currentLangService.setCurrentLang(lng);
            window.location.reload();
        } else
            this.currentLanguage = this.previousLanguage;
    }
}
