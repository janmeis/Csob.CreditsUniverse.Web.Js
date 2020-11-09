import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig } from './app-config';
import { ILogger, LogFactoryService } from './log-factory.service';
import { SharedCacheService } from './shared-cache.service';
import { CodebookApiService } from './webapi/codebook-api-service';
import { ECodetable, EKeyEnum } from './webapi/webapi-models';
import { CodebookItem } from './webapi/webapi-models-classes';


@Injectable({
    providedIn: 'root'
})
export class CodebooksService {
    private logger: ILogger;
    public nameMap: { [name: string]: string } = {};

    constructor(
        private sharedCache: SharedCacheService,
        private appConfig: AppConfig,
        logFactory: LogFactoryService,
        // todo: how to disable error notifications ? (codebooksApi.api is shared ...)
        private codebooksApi: CodebookApiService,
    ) {
        this.logger = logFactory.get('CodebooksService');
        this.nameMap = this.appConfig.codeBookMap || {};
        this.addEnumsToMap();
    }
    private addEnumsToMap() {
        // tslint:disable-next-line: forin
        for (const enumName in EKeyEnum) {
            // warning, some enums from EKeyEnum are not serverd by this way (no backend tables)
            const key = 'e' + enumName.toLowerCase();
            if (isNaN(parseInt(enumName, 10)) && !this.nameMap[key])
                this.nameMap[key] = 'keyenums?keyEnum=' + EKeyEnum[enumName] + '&(name)=' + enumName;
        }
        // tslint:disable-next-line: forin
        for (const table in ECodetable) {
            const key = table.toLowerCase();
            // tslint:disable-next-line: radix
            if (isNaN(parseInt(table)) && !this.nameMap[key]) {
                this.nameMap[key] = 'codebook?table=' + ECodetable[table] + '&(name)=' + table;
            }
        }
        this.logger.info('nameMap', this.nameMap);
    }
    private getMapped(name: string) {
        name = name.toLowerCase();
        name = this.nameMap[name] || name;
        return name;
    }
    private getUrl(name: string) {
        return '/codebook/' + name;
    }
    public GetCodebook(name: string): Observable<CodebookItem[]> {
        name = this.getMapped(name);
        return this.sharedCache.get('codebook-' + name, () => {
            this.logger.info('calling httpclient ' + name);
            const url = this.getUrl(name);
            return this.codebooksApi.api.get<CodebookItem[]>(url);
        });
    }
    // vraci nazev z ECodetable
    private isCodebookTable(name: string): string {
        name = name.toLowerCase();
        for (const t in ECodetable) {
            if (t.toLowerCase() && t.toLowerCase() == name) {
                return t;
            }
        }
        return undefined;
    }
    public async LoadTableItemByIdAsync(name: string, id: number) {
        const mapped = this.getMapped(name);
        if (!!mapped && mapped.indexOf('KeyEnums') >= 0)
            return this.GetCodebook(name).pipe(
                map(codebook => codebook.find(c => c.Value == id))
            ).toPromise();

        const eTable = this.isCodebookTable(name);
        this.logger.debug(`LoadTableItemByIdAsync for ${name} (${ECodetable[eTable]}) ${id} started`);
        if (!eTable)
            return undefined;
        const table = ECodetable[eTable];
        return this.codebooksApi.getCodebookById(table, id).toPromise();
    }
    public async LookupAsync(name: string, value: number): Promise<CodebookItem> {
        this.logger.debug(`lookupAsync for ${name} ${value} started`);
        const data = await this.GetCodebook(name).toPromise();
        const found = data.find(x => x.Value == value);
        if (!found) {
            if (value != 0 && this.isCodebookTable(name)) {
                this.logger.debug(`lookup for ${name} ${value} not found, trying not-valid codetable`);
                return this.LoadTableItemByIdAsync(name, value);
            } else {
                this.logger.error(`lookup for ${name} ${value} not found`);
            }
        } else {
            this.logger.debug(`lookup for ${name} ${value}=${found && found.Value}`);
        }
        return found;
    }
    public LookupEnum(enumname: string, value: number): Observable<CodebookItem> {
        const result = new Subject<CodebookItem>();
        this.GetCodebook(name)
            .subscribe(data => {
                result.next(data.find(x => x.Value == value));
                // result.complete();
            });
        return result;
    }
}
