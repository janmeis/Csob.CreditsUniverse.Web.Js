import { Component, Input, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
import { UserProgressService } from '../../../services/user-progress.service';
import { CodebookApiService } from '../../../services/webapi/codebook-api-service';
import { ICodebookItem, IMonitoringCellEditDto, IMonitoringCellEditRowDto, IMonitoringRowDto } from '../../../services/webapi/webapi-models';

@Component({
    selector: 'app-negative-information-specific',
    templateUrl: './negative-information-specific.component.html',
    styleUrls: ['./negative-information-specific.component.less'],
})
export class NegativeInformationSpecificComponent implements OnInit {
    @Input() model: IMonitoringCellEditDto;

    get row(): IMonitoringCellEditRowDto {
        if (!!this.model.InputRows && this.model.InputRows.length > 0)
            return this.model.InputRows[0];

        return null;
    }
    set row(r: IMonitoringCellEditRowDto) {
        if (!!this.model.InputRows && this.model.InputRows.length > 0)
            this.model.InputRows[0] = r;
    }
    semaphoreSource: ICodebookItem[];

    constructor(
        private codebookApi: CodebookApiService,
        public progress: UserProgressService,
    ) { }

    ngOnInit() {
        this.progress.runProgress(
            this.codebookApi.getMonitoringSemaphore().pipe(
                tap(items => this.semaphoreSource = items.filter(i => ['green', 'white'].every(c => c != i.Text))))
        ).subscribe(_ => {
            if (!!this.row && !this.row.SemaphoreId)
                this.row.SemaphoreId = this.semaphoreSource.find(s => s.Text == 'orange').Value;
        });
    }

    getDetails = (rows: IMonitoringRowDto[]): string[][] =>
        rows.map(r => r.Values)
}
