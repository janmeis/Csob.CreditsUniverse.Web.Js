import { TabStripComponent } from '@progress/kendo-angular-layout';
import { NgForm } from '@angular/forms';
import { TranslationService } from './../../../services/translation-service';
import { Component, EventEmitter, Injector, Input, OnInit } from '@angular/core';
import { AppDialog, AppDialogContainerService } from 'src/app/app-common/services/app-dialog-container.service';
import { SecurityService } from 'src/app/services/security.service';
import { OperationModelDto } from 'src/app/services/webapi/webapi-models-classes';
import { CurrentLangService } from 'src/app/services/current-lang-service';




@Component({
    selector: 'app-operation-model-dialog',
    templateUrl: './operation-model-dialog.component.html',
    styleUrls: ['./operation-model-dialog.component.less'],
})
export class OperationModelDialogComponent implements OnInit, AppDialog {
    close: Function = null
    closed = new EventEmitter<boolean>()
    title?: string;
    @Input() operModelGraph: OperationModelDto[];
    data: any[] = [];
    secondData: any[] = [];
    getTitle?(): string {

        return this.translation.$$get('operation_model_dialog.OMGraph').toString();
    }

    constructor(
        private securityService: SecurityService,
        private currentLangService: CurrentLangService,
        private translation: TranslationService,

    ) { }

    ngOnInit() {
        this.operModelGraph[0].operationChildDto.forEach(line => {
            const parent = { text: line.Text, items: [] };
            line.Items.forEach(child => parent.items.push({ text: child.Text }));
            this.data.push(parent);

        });
        this.operModelGraph[1].operationChildDto.forEach(line => {
            const parent = { text: line.Text, items: [] };
            line.Items.forEach(child => parent.items.push({ text: child.Text }));
            this.secondData.push(parent);

        });

    }

    static showDialog(injector: Injector, operModelGraph: OperationModelDto[], ) {
        const dlgService = injector.get(AppDialogContainerService);
        const dlg = dlgService.createDialog(injector, OperationModelDialogComponent, { width: 800 }, { operModelGraph: operModelGraph });

        return dlgService.wait(dlg.closed);
    }

    onClose() {
        this.closed.emit();
        this.close(null);
    }

    temp: string[];



}
