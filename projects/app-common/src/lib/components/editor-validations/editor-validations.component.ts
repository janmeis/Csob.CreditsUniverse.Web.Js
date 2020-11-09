import { Component, Input, OnInit } from '@angular/core';

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
