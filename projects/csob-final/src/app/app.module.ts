// angular imports
import { registerLocaleData } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injector, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { MessageService } from '@progress/kendo-angular-l10n';

/* app */
import { AppCommonModule } from './app-common/app-common.module';
import { AppRoutingModule } from './app-routing.module';
import { AppShellModule } from './app-shell/app-shell.module';
import { AppComponent } from './app.component';
import { JsonInterceptor } from 'projects/services/src/public-api';

/* locales */
import '@progress/kendo-angular-intl/locales/cs/all';
import { IntlModule } from '@progress/kendo-angular-intl';

import localeCs from '@angular/common/locales/cs';
import { CurrentLangService } from 'projects/services/src/public-api';
import { TranslationKendoService } from 'projects/services/src/public-api';
import { TranslationService } from 'projects/services/src/public-api';

registerLocaleData(localeCs);

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        IntlModule,
        RouterModule,

        AppCommonModule,
        AppShellModule,

        /* WARNING: AppRoutingModule must be last in this list (after all modules)*/
        AppRoutingModule,
    ],
    providers: [
        // Location,
        // Title,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: JsonInterceptor,
            multi: true
        },
        {
            provide: MessageService,
            useFactory: (injector: Injector) =>
                new TranslationKendoService(new TranslationService(injector)),
            deps: [Injector]
        },
        {
            provide: LOCALE_ID,
            useFactory: (lang: CurrentLangService) => {
                return lang.getCurrentLang();
            },
            deps: [CurrentLangService]
        }
    ],
    declarations: [
        AppComponent,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
