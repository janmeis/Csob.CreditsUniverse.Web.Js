
import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[autofocus]'
})
export class AutoFocusDirective {
    @Input() set autofocus(condition: boolean) {
        if (!!condition)
            setTimeout(() => this.host.nativeElement.focus(), 100);
    }

    public constructor(
        private host: ElementRef,
    ) { }
}
