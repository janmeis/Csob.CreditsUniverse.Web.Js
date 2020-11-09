import { Component, EventEmitter, Injector } from '@angular/core';
import { AppDialog, AppDialogContainerService } from '../../app-common/services/app-dialog-container.service';
import { TranslationService } from '../../services/translation-service';
import { UserProgressService } from '../../services/user-progress.service';
import { RarocApiService } from 'src/app/services/webapi/raroc-api-service';
import { RarocExportOptions } from 'src/app/services/webapi/webapi-models-classes';
import { UserNotificationService } from 'src/app/services/user-notification.service';
import { UserBlobService } from '../../app-common/services/user-blob-service';
import { Language, Languages } from 'src/app/app-common/models/language';

@Component({
    selector: 'raroc-export-dialog',
    templateUrl: './raroc-export-dialog.component.html',
    styleUrls: ['./raroc-export-dialog.component.less'],
})

export class RarocExportDialogComponent implements AppDialog {
    exportOptions: RarocExportOptions = {
        Culture: null
    }
    close: Function
    closed = new EventEmitter<any>()
    partyId: number;
    rarocId: number;
    public title: string;
    public errMessage: string = null;
    selectedLanguage: Language = this.languages[0];

    get languages() {
        return Languages;
    }

    constructor(
        private translation: TranslationService,
        private rarocApi: RarocApiService,
        private notification: UserNotificationService,
        private blob: UserBlobService,
        public progressService: UserProgressService) {
        this.title = this.translation.$$get('raroc_export_dialog.export_options');
    }

    public onExport(anchor: HTMLAnchorElement) {
        this.exportOptions.Culture = this.selectedLanguage.cultureCode;

        this.progressService.runProgress(
            this.rarocApi.downloadExport(this.partyId, this.rarocId, this.exportOptions))
            .subscribe(resp => {
                this.blob.downloadFile(anchor, resp);
                this.close();
            },
                err => {
                    this.notification.error(this.translation.$$get('raroc_export_dialog.export_error') + "\n" + err);
                }
            );
    }

    static show(injector: Injector, partyId: number, rarocId: number): Promise<boolean> {
        let dlgSvc = injector.get(AppDialogContainerService);
        const dlg = dlgSvc.createDialog(injector, RarocExportDialogComponent, {}, { partyId, rarocId });
        return dlgSvc.wait(dlg.closed);
    }
}
