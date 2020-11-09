import { Pipe, PipeTransform } from '@angular/core';
import { CodebookItem } from 'projects/services/src/public-api';
import { CodebooksService } from 'projects/services/src/public-api';
import { ILogger, LogFactoryService } from 'projects/services/src/public-api';

/*
 * returns text value from codebook
 * if value doesn't exists, it will return null
 * example
 * {{ 42 | codebookLookup:'country'}}
 * */
@Pipe({
    name: 'codebookLookup',
    pure: false
})
export class CodebookLookupPipe implements PipeTransform {
    private logger: ILogger
    private lastValue: any;
    private result: any;
    constructor(
        private codebookService: CodebooksService,
        logFactory: LogFactoryService
    ) {
        this.logger = logFactory.get('CodebookLookupPipe');
    }
    transform(value: any, codebook: string | CodebookItem[]): any {
        //warning, pipe is inpure, so this method is called frequently
        //this.logger.debug("transform", [this.lastValue, value, codebookName]);
        if (value == null)
            return '';

        if (this.lastValue == value) {
            return this.result;
        }

        if (codebook instanceof Array)
            return (codebook as CodebookItem[]).find(c => c.Value == +value).Text;

        const codebookName = codebook as string;

        //this.result = null;
        this.lastValue = value;
        this.logger.debug("transform", [this.lastValue, value, codebookName]);
        this.codebookService
            .LookupAsync(codebookName, value)
            .then(
                x => {
                    this.logger.debug('pipe lookup onnext');
                    this.result = x == null ? null : x.Text;
                    this.logger.debug(`result of pipe lookup ${value}=${this.result}`)
                })
            .catch(
                err => {
                    this.result = err;
                });
        return this.result;
    }
}
