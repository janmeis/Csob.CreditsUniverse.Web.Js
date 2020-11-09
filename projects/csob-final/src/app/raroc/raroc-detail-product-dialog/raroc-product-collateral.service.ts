import { Injectable } from '@angular/core';
import { DataResult } from '@progress/kendo-data-query';
import { BehaviorSubject, Observable } from 'rxjs';
import { RarocApiService } from 'src/app/services/webapi/raroc-api-service';
import { IMatrixDto } from 'src/app/services/webapi/webapi-models';

@Injectable()
export class RarocProductCollateralService extends BehaviorSubject<DataResult>{
    constructor(
        protected rarocApiService: RarocApiService) {
        super(null);
    }

    getMatrix$ = (rarocId: number): Observable<IMatrixDto> =>
         this.rarocApiService.getMatrixDto(rarocId)

    saveMatrix$ = (matrix: IMatrixDto): Observable<string> =>
         this.rarocApiService.postSaveMatrix(matrix.Items)
}
