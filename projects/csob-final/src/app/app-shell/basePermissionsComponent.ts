import { IComponentWithPermissionState, PartyPermissionState } from '../app-common/services/permission-service';
import { ApiBaseService } from '../services/api-base.service';
import { SecurityService } from '../services/security.service';
import { IPartyHeaderDto } from '../services/webapi/webapi-models';

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
