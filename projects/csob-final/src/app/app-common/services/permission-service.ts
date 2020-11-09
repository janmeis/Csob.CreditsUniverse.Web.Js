import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { Injectable, ViewContainerRef } from '@angular/core';
import { ILogger, LogFactoryService } from 'projects/services/src/public-api';
import { IPartyHeaderDto, EPermissionType } from 'projects/services/src/public-api';

interface IPermissionData {
    // Permissions: string[]
    PartyPermissions: EPermissionType[];
    IsPartyManaged: boolean;
}
export class PartyPermissionState {
    // obsolete, use hasPermission
    public hasRightTo: { [permission: string]: boolean }
    public hasPermission: { [permission: number]: boolean };
    public IsPartyManaged = true;
    constructor(data: IPermissionData | IPartyHeaderDto) {
        this.hasRightTo = {};
        this.hasPermission = {};
        if (data && data.PartyPermissions) {
            this.IsPartyManaged = data.IsPartyManaged;
            data.PartyPermissions.forEach(xPer => {
                this.hasRightTo[EPermissionType[xPer]] = true;
                this.hasPermission[xPer] = true;
            });
        }
    }
}
export interface IComponentWithPermissionState {
    permissionState: PartyPermissionState;
}

function isComponentWithPermissionState(x: any): x is IComponentWithPermissionState {
    return (x as IComponentWithPermissionState).permissionState !== undefined;
}

@Injectable()
export class PermissionService {
    private log: ILogger;
    constructor(
        logFactory: LogFactoryService,
    ) {
        this.log = logFactory.get('PermissionService');
    }
    public getStateFromView(viewContainer: ViewContainerRef): PartyPermissionState {
        const pc = this.getPermissionsComponent(viewContainer);
        if (pc) {
            return pc.permissionState;
        }
        return new PartyPermissionState(null);
    }
    private getPermissionsComponent(viewContainer: ViewContainerRef): IComponentWithPermissionState {
        let view = (viewContainer.injector as any).view;
        while (view && !isComponentWithPermissionState(view.component) && view.parent)
            view = view.parent.parent;
        if (view)
            return view.component;
        return null;
    }
}
