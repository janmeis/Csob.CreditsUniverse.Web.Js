import { Component, ElementRef, EventEmitter, Injector, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FileItem, FileUploader, Headers } from 'ng2-file-upload';
import { CurrentLangService, EUpdateRowsResult, FinancialApiService, ICodebookItem, IImportFileRowDto, ILogger, ImportFinancialStatementResultDto, LogFactoryService, SelectedPartyService, TranslationService, UserNotificationService, UserProgressService } from 'projects/services/src/public-api';
import { mergeMap, tap } from 'rxjs/operators';
import { ICodebookProvider } from 'projects/app-common/src/public-api';
import { MessageBoxDialogComponent } from 'projects/app-common/src/public-api';
import { FinancialDetailUtils } from '../financial-detail/financial-detail-utils';

@UntilDestroy()
@Component({
    selector: 'app-financial-data-import-dialog',
    templateUrl: './financial-data-import-dialog.component.html',
    styleUrls: ['./financial-data-import-dialog.component.less'],
})

export class FinancialDataImportDialogComponent implements OnInit {
    @ViewChildren('fileSelector') uploadInput: ElementRef[];
    @ViewChildren('myInput') myUploads: QueryList<any>;
    @ViewChild('anchor') anchor: ElementRef;
    @ViewChild('form') private form: NgForm;
    close: Function;
    isDirty = true;
    isLocal = false;
    closed = new EventEmitter<boolean>();
    uploader: FileUploader;
    headerId: number;
    model: IImportFileRowDto[];
    jskFiles: ICodebookProvider = {
        getItems: () => Promise.resolve(this.jskCodebookItems),
        getItem: () => null
    };
    get canUpload(): boolean {
        return this.uploader.getNotUploadedItems().length > 0
            || this.model && this.model.some(a => a.IdJskFile != null && a.IdJskFile > 0);
    }

    jskCodebookItems: ICodebookItem[] = null;

    private creditFileId: number;
    private currentFileItem: FileItem;
    private isError: boolean;
    private resultMessage: string;
    private result: EUpdateRowsResult;
    private _log: ILogger;

    constructor(
        private currentLangService: CurrentLangService,
        private finApi: FinancialApiService,
        private injector: Injector,
        logFactory: LogFactoryService,
        private notification: UserNotificationService,
        public progress: UserProgressService,
        private route: ActivatedRoute,
        private selectedPartyService: SelectedPartyService,
        private translation: TranslationService,
    ) {
        this._log = logFactory.get('FinancialDataImportDialogComponent');
    }
    ngOnInit() {
        this.headerId = +this.route.snapshot.queryParams['id'];
        if (this.headerId)
            this.progress.runProgress(this.finApi.getImportFileDef(this.headerId))
                .subscribe(row => this.model = row);

        this.setUploaderEvents();
        this.loadJskFiles();
    }

    private loadJskFiles() {
        this.selectedPartyService.partyHeader.pipe(
            untilDestroyed(this),
            tap(partyHeader => {
                this.creditFileId = partyHeader.CreditFileId;
            }),
            mergeMap(partyHeader => this.finApi.getJskDocumentsList(partyHeader.Id))
        ).subscribe(files => this.jskCodebookItems = files);
    }

    getTitle() {
        return this.translation.$$get('financial_data_import_dialog.import_file_dialog_title');
    }
    updateIsLocal(value: boolean) {
        this.isLocal = value;
        this.clearForm();
    }
    removeFile(row: IImportFileRowDto, element) {
        if (row.FileItem)
            row.FileItem.remove();

        if (element) {
            element.value = '';
            if (element.nativeElement)
                element.nativeElement.value = '';
        }

        row.FileItem = null;
    }
    isTabEnabled(row: IImportFileRowDto) {
        const alreadySelectedRows = this.model.filter(r => r.FileItem != null || r.IdJskFile);

        const alreadySelectedTabs: number[] = [];

        alreadySelectedRows.forEach(r => {
            r != row &&
                r.Tabs.forEach(t => {
                    if (!alreadySelectedTabs.includes(t)) {
                        alreadySelectedTabs.push(t);
                    }
                });
        });

        return alreadySelectedTabs.every(selTab => !row.Tabs.includes(selTab));
    }
    async onSave(f: NgForm) {
        this.notification.clear();
        //TODO: inform user about result (count of processed fin. values, etc.)
        if (this.uploader.getNotUploadedItems().length > 0) {
            FinancialDetailUtils.storeReadonlyRequiredStorageFlag(true);
            this.uploader.uploadAll();
        } else if (this.model.some(a => a.IdJskFile != null)) {
            FinancialDetailUtils.storeReadonlyRequiredStorageFlag(true);
            const jskImportFileRows = this.model.filter(a => a.IdJskFile != null && a.IdJskFile > 0);
            for (let i = 0; i < jskImportFileRows.length; i++) {
                const element = jskImportFileRows[i];
                // todo vah odstranit progress pokud nedobehne
                const res = await this.progress.runAsync(this.finApi.postImportFinancialStatementFromJskFile(element.IdJskFile, this.headerId, element.Tabs));
                this.result = res.ImportResult;
            }

            f.reset();
            this.showImportFinishedDialog();
        } else {
            this.notification.error(this.translation.$$get('financial_data_import_dialog.empty_import_queue_error'));
            return;
        }
    }
    private clearForm() {
        this.form.reset();
        this.uploadInput.forEach((inp) => {
            inp.nativeElement.value = '';
        });

        this.uploader.clearQueue();
        this.progress.stop();
        this.myUploads.forEach((child) => {
            child.nativeElement.value = '';
        });
        this.model.forEach((child) => {
            child.FileItem = null;
        });

        this.form.reset();
        this.isError = false;
        this.resultMessage = null;
    }
    private setUploaderEvents() {
        this.uploader = new FileUploader({
            itemAlias: 'no-alias',
            removeAfterUpload: true,
        });

        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
            if (status == 200) {
                const importResult = new ImportFinancialStatementResultDto();
                Object.assign(importResult, JSON.parse(response));

                this.result = importResult.ImportResult;

                if (importResult.ResultMessage) {
                    this.notification.warning(importResult.ResultMessage);
                    this.resultMessage = importResult.ResultMessage;
                } else {
                    this.resultMessage = null;
                }
            } else {
                const parsed = JSON.parse(response);
                const errorMessage = parsed && parsed.Statuses && parsed.Statuses[0] && parsed.Statuses[0].Message;

                this.clearStorageFlags();
                this.notification.error(this.translation.$$get('financial_data_import_dialog.import_error') + ': ' + errorMessage);
            }
        };

        this.uploader.onAfterAddingFile = (item) => {
            this.currentFileItem = item;
        };

        this.uploader.onBeforeUploadItem = (item) => {
            this.progress.start();

            const tabs = this.model.find(a => a.FileItem == item).Tabs;
            item.withCredentials = false;

            const cultureCode = this.currentLangService.getCurrentLangCultureCode();

            item.url = this.finApi.urlImportFinancialStatement(this.headerId, item.file.name, tabs, cultureCode);
            const creditFileHeader = { name: 'X-SELECTED-CREDITFILE', value: `${this.creditFileId}` } as Headers;
            item.headers = [...item.headers, creditFileHeader];
        };

        this.uploader.onCompleteAll = () => {
            if (!this.isError) {
                this.showImportFinishedDialog();
            } else
                this.clearForm();
        };

        this.uploader.onErrorItem = (item: FileItem, response: string, status: number, headers: any): any => {
            this.isError = true;
            this._log.error('uploader.onErrorItem', [status, headers, response]);
            //TODO: do not localize server-side keys!
            // a) send err-code and do somw switch here
            // b) or send localized message from server (server knowns client culture, use ResourceManager)
            //this.notification.error(this.translation.$$get(`financial_data_import_dialog.${response}`));
        };
    }

    onUploadFileChange(row: IImportFileRowDto) {
        this.removeFile(row, null);
        row.FileItem = this.currentFileItem;
    }
    onCancel() {
        this.back();
    }

    back() {
        window.close();
    }

    private clearStorageFlags() {
        FinancialDetailUtils.removeReadonlyRequiredStorageFlag();
        FinancialDetailUtils.removeImportResultFromStorage();
    }

    showImportFinishedDialog() {
        let opts = MessageBoxDialogComponent.createYesNoOptions(this.injector);
        opts.icon = '';

        let message = this.resultMessage;
        if (!message) {
            message = this.translation.$$get('financial_data_import_dialog.import_completed');
        }

        opts.messageHTML = '<p>' + message + '</p>';
        MessageBoxDialogComponent.show(this.injector, opts)
            .subscribe(yes => {
                if (yes) {
                    FinancialDetailUtils.removeReadonlyRequiredStorageFlag();
                    FinancialDetailUtils.storeImportResultToStorage(this.result);

                    window.close();
                }
            });
        this.clearForm();
    }
}
