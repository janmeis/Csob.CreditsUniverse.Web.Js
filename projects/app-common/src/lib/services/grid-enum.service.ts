import { Injectable } from '@angular/core';
import * as RxJsOperators from 'rxjs/operators';
import { CodebooksService, EKeyEnum } from 'projects/services/src/public-api';
import { ICodebookProvider } from 'projects/app-common/src/public-api';

@Injectable({
    providedIn: 'root',
})
export class GridEnumService {

    constructor(
        private codebooksService: CodebooksService,
    ) {}

    public GetEnumCodebookProvider(enumType: EKeyEnum): ICodebookProvider {
        const name = 'E' + EKeyEnum[enumType];
        return {
            getItem: (v: number) => this.codebooksService.LookupAsync(name, v),
            getItems: () => this.codebooksService.GetCodebook(name).toPromise()
        };
    }
    public GetEnumCodebookProviderFiltered<T>(enumType: EKeyEnum, include: T[] = null, exclude: T[] = []): ICodebookProvider {
        const name = 'E' + EKeyEnum[enumType];
        function isValid(v: number): boolean {
            if (include != null) {
                return include.indexOf(v as any) >= 0;
            }
            if (exclude && exclude.length > 0) {
                return exclude.indexOf(v as any) < 0;
            }
            return true;
        }
        return {
            getItem: (v: number) => this.codebooksService.LookupAsync(name, v).then(v => isValid(v.Value) ? v : null),
            getItems: () => this.codebooksService.GetCodebook(name)
                .pipe(
                    RxJsOperators.map(x => x.filter(v => isValid(v.Value)))
                )
                .toPromise()
        }
    }
}
