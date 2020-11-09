import { Injectable } from '@angular/core';
import { RarocApiService } from 'projects/services/src/public-api';
import { Observable } from 'rxjs';
import { IRarocOutputContainerDto } from 'projects/services/src/public-api';

@Injectable()
export class RarocDetailResultService {
    constructor(
        private rarocApiService: RarocApiService,
    ) { }

    getRarocOutputt$(rarocId: number): Observable<IRarocOutputContainerDto> {
        return this.rarocApiService.getRarocOutput(rarocId);
    }
}
