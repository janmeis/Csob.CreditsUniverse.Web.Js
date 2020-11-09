import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { EPermissionType } from 'projects/services/src/public-api';
import { PermissionService } from '../services/permission-service';

@Directive({ selector: '[ifPermitted]' })
export class IfPermittedDirective {
    private hasView = false;

    constructor(
        private templateRef: TemplateRef<any>,
        private permissionService: PermissionService,
        private viewContainer: ViewContainerRef) { }


    @Input() set ifPermitted(permission: EPermissionType) {
        var state = this.permissionService.getStateFromView(this.viewContainer);
        var permitted = state && state.hasPermission[permission];
        //console.log(`ifPermitted ${EPermissionType[permission]}=${permission}: ${permitted}`);
        this.setViewVisible(permitted);
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
