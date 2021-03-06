import { Component, EventEmitter, Injector } from '@angular/core';
import { AppDialog, AppDialogContainerService } from 'projects/app-common/src/public-api';
import { EExportFormat, IExportOptions, Language, Languages, PdRatingApiService, TranslationService, UserProgressService } from 'projects/services/src/public-api';
import { UserBlobService } from 'projects/app-common/src/public-api';

@Component({
    selector: 'pd-rating-export-dialog',
    templateUrl: './pd-rating-export-dialog.component.html',
    styleUrls: ['./pd-rating-export-dialog.component.less'],
})

export class PdRatingExportDialogComponent implements AppDialog {
    ExportFormat = EExportFormat;
    pdRatingId: number;

    exportOptions: IExportOptions = {
        Format: EExportFormat.XLS,
        Culture: null,
        IsCollapsed: true,
        IsHeaderCollapsed: true
    }

    close: Function
    closed = new EventEmitter<any>()
    public title: string;
    public errMessage: string = null;

    selectedLanguage: Language = this.languages[0];

    get languages() {
        return Languages;
    }

    constructor(
        private pdRatingApi: PdRatingApiService,
        private translation: TranslationService,
        private blob: UserBlobService,
        public progressService: UserProgressService) {
        this.title = this.translation.$$get('pd_rating_export_dialog.export_options');
    }

    public onExport(anchor: HTMLAnchorElement) {
        this.exportOptions.Culture = this.selectedLanguage.cultureCode;

        this.blob.processBlob(
            anchor,
            this.pdRatingApi.downloadExport(this.pdRatingId, this.exportOptions),
            () => this.close());
    }

    static showDialog(injector: Injector, pdRatingId: number) {
        let dialogs = injector.get(AppDialogContainerService);
        return dialogs.createDialog(injector, PdRatingExportDialogComponent, {},
            {
                pdRatingId: pdRatingId,
            });
    }
}
