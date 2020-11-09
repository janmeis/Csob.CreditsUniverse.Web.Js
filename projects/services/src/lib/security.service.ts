import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserApiService } from './webapi/user-api-service';
import { IOperationModelDto, IWebUserDto } from './webapi/webapi-models';

@Injectable({
    providedIn: 'root'
})
export class SecurityService {
    public currentUser: IWebUserDto = null;
    constructor(
        public userApi: UserApiService
    ) {
    }
    // called only from main module!
    public async loadCurrentUser(): Promise<void> {
        const user = await this.userApi.getCurrentUser().toPromise();
        this.currentUser = user;
    }

    public getOMGraph = (cultureCode: string): Observable<IOperationModelDto[]> =>
        this.userApi.getOperationModelGraph(cultureCode)

    public async getOrLoadCurrentUser(): Promise<IWebUserDto> {
        if (!this.currentUser) {
            await this.loadCurrentUser();
        }
        return this.currentUser;
    }
}
