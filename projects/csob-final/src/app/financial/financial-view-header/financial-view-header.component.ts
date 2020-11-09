import { ImportFileDto } from './../../services/webapi/webapi-models-classes';
import { Component, OnInit, Input, TemplateRef, ContentChild } from '@angular/core';
import { IFinStatDataDto, IFinStatHeaderDto, EStateFinData } from '../../services/webapi/webapi-models';
import { FinancialDomainService } from '../services/financial-domain.service';

interface HeaderModel {
    item: IFinStatHeaderDto;
    importFiles: ImportFileDto[];
    readonly: boolean;
    left: boolean;
    right: boolean;
    template?: TemplateRef<any>;
}

@Component({
    selector: '[fin-view-header]',
    templateUrl: './financial-view-header.component.html',
    styleUrls: ['./financial-view-header.component.less']
})
export class FinancialViewHeaderComponent implements OnInit {
    @Input()
    label: string;

    @Input()
    hasIdent: boolean = false;

    headers: HeaderModel[] = [];
    @Input()
    set dataSource(value: IFinStatDataDto) {
        this.headers = []
            .concat(value.ReadonlyHeaders.map(x => this.getHeader(x, true)))
            .concat(value.EditableHeaders.map(x => this.getHeader(x, value.IsLocked)));
    }
    @ContentChild('headerReadonly') readonlyTemplate: TemplateRef<any>;
    @ContentChild('headerEditor') editorTemplate: TemplateRef<any>;
    @Input() readonly: (data: IFinStatHeaderDto) => boolean = null;
    constructor(
        private domain: FinancialDomainService
    ) { }

    @Input() forceEditable = null;

    ngOnInit() {
    }
    getHeader(x: IFinStatHeaderDto, isLeft: boolean): HeaderModel {
        const result: HeaderModel = {
            item: x,
            importFiles: x.ImportFiles,
            left: isLeft,
            right: !isLeft,
            readonly: false,
        };

        if (isLeft) {
            result.readonly = true;
        } else if (this.domain.isHeaderReadonly(x)) {
            result.readonly = true;
        } else if (this.readonly) {
            result.readonly = this.readonly(x);
        }

        if (!isLeft &&
            this.forceEditable &&
            x.StateEnum != EStateFinData.OriginalCompleted &&
            x.StateEnum != EStateFinData.ConvertedCompleted) {
            result.readonly = false;
        }

        if (result.readonly) {
            result.template = this.readonlyTemplate;
        } else {
            result.template = this.editorTemplate || this.readonlyTemplate;
            if (!this.editorTemplate) {
                result.readonly = true;
            }
        }
        return result;
    }
}
