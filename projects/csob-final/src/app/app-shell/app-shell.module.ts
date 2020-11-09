import { LayoutModule } from '@progress/kendo-angular-layout';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HeaderComponent } from './components/header/header.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { NotificationAreaComponent } from './components/notification-area/notification-area.component';
import { AppCommonModule } from '../app-common/app-common.module';
import { FormsModule } from '@angular/forms';
import { LanguageChooserComponent } from './components/language-chooser/language-chooser.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { OperationModelDialogComponent } from './components/operation-model-dialog/operation-model-dialog.component';

@NgModule({
    imports: [
        RouterModule,
        FormsModule,
        CommonModule,
        AppCommonModule,
        LayoutModule
    ],
    declarations: [
        NavigationComponent,
        PageNotFoundComponent,
        HeaderComponent,
        NotificationAreaComponent,
        LanguageChooserComponent,
        SpinnerComponent,
        OperationModelDialogComponent,
    ],
    exports: [
        NavigationComponent,
        PageNotFoundComponent,
        HeaderComponent,
        NotificationAreaComponent,
        LanguageChooserComponent,
        SpinnerComponent,
    ]
})
export class AppShellModule { }
