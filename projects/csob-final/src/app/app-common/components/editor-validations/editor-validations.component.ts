import { Component, OnInit, Input, Injector } from '@angular/core';
import { TranslationService } from '../../../services/translation-service';

@Component({
    selector:  'editor-validations',
    templateUrl: './editor-validations.component.html',
    styleUrls: ['./editor-validations.component.less'],
})
export class EditorValidationsComponent implements OnInit {
    @Input() label: string
    @Input() state: any
    @Input() editor: any
    constructor() { }

    ngOnInit() {
    }
}
