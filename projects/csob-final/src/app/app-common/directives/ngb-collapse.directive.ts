import { Directive, Input } from '@angular/core';

/**
 * A directive to provide a simple way of hiding and showing elements on the page.
 */
/// <see href="https://github.com/ng-bootstrap/ng-bootstrap/blob/master/src/collapse/collapse.ts" />
@Directive({
    selector: '[ngbCollapse]',
    exportAs: 'ngbCollapse',
    host: { '[class.collapse]': 'true', '[class.show]': '!collapsed' }
})
export class NgbCollapseDirective {
    /**
     * If `true`, will collapse the element or show it otherwise.
     */
    @Input('ngbCollapse') collapsed = false;
}
