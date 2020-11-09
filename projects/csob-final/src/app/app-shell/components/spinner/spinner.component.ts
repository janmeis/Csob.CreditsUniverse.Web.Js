import { Component, OnInit, Injector, Input } from '@angular/core';
import { TranslationService } from 'projects/services/src/public-api';

@Component({
    selector: 'app-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.less'],
})
export class SpinnerComponent implements OnInit {
    @Input()
    visible: boolean = false
    constructor() { }

    ngOnInit() {
    }
}
