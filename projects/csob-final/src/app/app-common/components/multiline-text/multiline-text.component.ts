import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'multiline-text',
    templateUrl: './multiline-text.component.html',
    styleUrls: ['./multiline-text.component.less']
})
export class MultilineTextComponent implements OnInit {
    get value(): string {
        return this.lines.join("\n");
    }
    @Input()
    set value(v: string) {
        if (!v)
            this.lines = [];
        else
            this.lines = v.split('\n');
    }
    lines: string[];
    constructor() { }

    ngOnInit() {
    }
}