import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { tap } from 'rxjs/operators';
import { GetStaticCodebookProvider, ICodebookProvider } from 'projects/app-common/src/public-api';
import { UserProgressService } from 'projects/services/src/public-api';
import { CodebookApiService } from 'projects/services/src/public-api';
import { ICodebookItem, IMonitoringCellEditDto } from 'projects/services/src/public-api';

@Component({
    selector: 'app-contract-terms-nonfinancial',
    templateUrl: './contract-terms-nonfinancial.component.html',
    styleUrls: ['./contract-terms-nonfinancial.component.less'],
})
export class ContractTermsNonfinancialComponent implements OnInit, OnChanges {
    @Input() model: IMonitoringCellEditDto;
    @Input() readonly = false;
    monthProvider: ICodebookProvider;
    semaphoreSource: ICodebookItem[];
    inputIndex = 0;

    constructor(
        private codebookApi: CodebookApiService,
        public progress: UserProgressService,
    ) { }

    ngOnInit() {
        this.progress.runProgress(
            this.codebookApi.getMonitoringSemaphore().pipe(
                tap(items => this.semaphoreSource = items.filter(i => ['white'].every(c => c != i.Text))))
        ).subscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['model'] && !!this.model.InputRows && this.model.InputRows.length > 0) {
            const datePipe = new DatePipe('CS-cz');
            const monthItems = this.model.InputRows.map((r, index) => ({ Value: index, Text: datePipe.transform(r.EOM, 'MM/yyyy') } as ICodebookItem));
            this.monthProvider = GetStaticCodebookProvider(monthItems);
        }
    }
}
