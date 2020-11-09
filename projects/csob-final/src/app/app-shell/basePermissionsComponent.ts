import { ApiBaseService } from 'projects/services/src/lib/api-base.service';
import { IPartyHeaderDto, SecurityService } from 'projects/services/src/public-api';
import { IComponentWithPermissionState, PartyPermissionState } from '../app-common/services/permission-service';

// do not use this, use PermissionService
export abstract class BasePermissionsComponent implements IComponentWithPermissionState {
    permissionState: PartyPermissionState = null;
    get hasRightTo() {
        return this.permissionState && this.permissionState.hasRightTo;
    }
    private api: ApiBaseService;

    protected fillRights(party: IPartyHeaderDto) {
        if (!party)
            return;
        this.permissionState = new PartyPermissionState(party);
        this.api.setCurrentCreditFile(`${party.CreditFileId}`);
    }

    constructor(protected securityService: SecurityService) {
        this.api = securityService.userApi.api;
    }
}
