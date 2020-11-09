import { Component, EventEmitter, Input, Optional, Output } from '@angular/core';
import { ControlContainer, NgForm, NgModelGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EditorValidate, EditorValidation } from '../../../app-common/directives/editor-validator.directive';
import { uniqueId } from '../../../app-common/uniqueId';
import { TranslationService } from '../../../services/translation-service';
import { IProductInfoDto } from '../../../services/webapi/webapi-models';
import { ContractConditionsService } from '../../services/contract-conditions.service';

@Component({
    selector: 'product-multiselect',
    templateUrl: './product-multiselect.component.html',
    styleUrls: ['./product-multiselect.component.less'],
    viewProviders: [{
        provide: ControlContainer,
        deps: [NgForm, [new Optional(), NgModelGroup]],
        useFactory: (ngForm: NgForm, ngModelGroup: NgModelGroup): ControlContainer => ngModelGroup || ngForm
    }],
})
export class ProductMultiselectComponent {
    private _values: number[] = null;
    get values(): number[] {
        return this._values;
    }
    @Input() set values(x) {
        this._values = x;
        this.valuesChange.emit(this._values);
    }
    @Input() creditFileId: number;
    @Input() readonly = false;
    @Output() validate = new EventEmitter<EditorValidation>();
    @Output() valuesChange = new EventEmitter<number[]>();
    @Input() name = uniqueId('multi-');

    get label(): string {
        return this.translation.$$get('product_multiselect.line_selection');
    }
    @Input() label2: string;
    required = true;

    get source(): Observable<IProductInfoDto[]> {
        return this.contractConditionsService.getProducts(this.creditFileId);
    }

    get shortItems(): Observable<string[]> {
        return this.source.pipe(map(s => s.map(s => s.ShortDescription)));
    }

    constructor(
        private contractConditionsService: ContractConditionsService,
        private translation: TranslationService,
    ) { }

    onValidate = (c) => EditorValidate(c, this);

    isItemSelected = (item: IProductInfoDto): boolean =>
        this.values.some(v => v == item.Id);
}
