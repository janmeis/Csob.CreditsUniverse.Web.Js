import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';

/** nastavi viditelnost podle prav
 * - jde pouze o syntaxi, nema zadnou jinou funkci nez *ngIf
 * */
@Directive({ selector: '[hasRightTo]' })
export class HasRightToDirective {
    private hasView = false;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef) { }

    @Input() set hasRightTo(condition: boolean) {
        this.setViewVisible(condition);
    }
    private setViewVisible(visible: boolean) {
        if (this.hasView == visible)
            return;
        if (visible) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
        this.hasView = visible;
    }
}
