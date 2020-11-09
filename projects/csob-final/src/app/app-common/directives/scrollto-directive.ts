import { Directive, ElementRef, AfterViewInit, Input, OnChanges, SimpleChanges } from "@angular/core";
import { LogFactoryService, ILogger } from "../../services/log-factory.service";

@Directive({ selector: '[scrollTo]' })
export class ScrollToDirective implements AfterViewInit, OnChanges {
    private _scrollEnabled: boolean = true;
    get scrollEnabled(): any {
        return this._scrollEnabled;
    }
    @Input("scrollTo") set scrollEnabled(x) {
        this._scrollEnabled = x;
        this.scrollIfNeeded();
    }

    private log: ILogger
    constructor(private elRef: ElementRef, logFactory: LogFactoryService) {
        this.log = logFactory.get("ScrollToDirective");
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['scrollTo']) {
            this.scrollIfNeeded();
        }
    }

    ngAfterViewInit() {
        this.scrollIfNeeded();
    }

    private scrollIfNeeded() {
        this.log.warn("scrollIfNeeded", this.scrollEnabled);
        if (this.scrollEnabled) {
            window.setTimeout(() => {
                this.elRef.nativeElement.scrollIntoView();
            }, 0);
        }
    }
}