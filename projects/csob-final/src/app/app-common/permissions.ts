import { ViewContainerRef } from '@angular/core';
import { BasePermissionsComponent } from '../app-shell/basePermissionsComponent';
import { EPermissionType, IPartyHeaderDto } from 'projects/services/src/public-api';

interface IPermissionData {
    Permissions: string[];
    IsPartyManaged: boolean;
}
//TODO: refactor backend to use EPermissionType in DTO
export class UserPermissions {
    // obsolete, use hasPermission
    hasRightTo: { [permission: string]: boolean } = {};
    hasPermission(p: EPermissionType) {
        return this.hasRightTo[EPermissionType[p]];
    }

    constructor(data?: IPermissionData | IPartyHeaderDto) {
        if (data && data.Permissions) {
            data.Permissions.forEach(xPer => {
                this.hasRightTo[xPer] = true;
            });
        }
    }
}
export interface IComponentWithUserPermissions {
    userPermissions: UserPermissions;
}

export function getUserPermissionsFromView(viewContainer: ViewContainerRef): UserPermissions {
    const pc = getPermissionsComponent(viewContainer);
    if (pc) {
        return pc.userPermissions;
    }
    /* backward -compatibility*/
    const component = getLegacyPermissionsComponent(viewContainer);
    if (component) {
        const s = new UserPermissions(null);
        s.hasRightTo = component.hasRightTo;
        return s;
    }
    return new UserPermissions(null);
}
function getPermissionsComponent(viewContainer: ViewContainerRef): IComponentWithUserPermissions {
    let view = (viewContainer.injector as any).view;
    while (view && !isComponentWithUserPermissions(view.component) && view.parent)
        view = view.parent.parent;
    if (view)
        return view.component;
    return null;
}

function getLegacyPermissionsComponent(viewContainer: ViewContainerRef): BasePermissionsComponent {
    let view = (viewContainer.injector as any).view;
    while (view && !(view.component instanceof BasePermissionsComponent) && view.parent)
        view = view.parent.parent;
    if (view)
        return view.component;
    return null;
}
function isComponentWithUserPermissions(x: any): x is IComponentWithUserPermissions {
    return (x as IComponentWithUserPermissions).userPermissions !== undefined;
}

