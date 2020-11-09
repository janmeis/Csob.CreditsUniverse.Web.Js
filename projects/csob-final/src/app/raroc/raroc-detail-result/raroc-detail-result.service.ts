import { Injectable } from '@angular/core';
import { RarocApiService } from '../../services/webapi/raroc-api-service';
import { Observable } from 'rxjs';
import { IRarocOutputContainerDto } from '../../services/webapi/webapi-models';

@Injectable()
export class RarocDetailResultService {
    constructor(
        private rarocApiService: RarocApiService,
    ) { }

    getRarocOutputt$(rarocId: number): Observable<IRarocOutputContainerDto> {
        return this.rarocApiService.getRarocOutput(rarocId);
    }
}
