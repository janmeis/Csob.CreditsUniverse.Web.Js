import { Injectable, Injector } from '@angular/core';
import { ICodebookProvider2, EditorCodeBookComponent } from '../../app-common/components/editor-codebook/editor-codebook.component';
import { ICodebookItem, ISearchClientInCuReqDto } from 'projects/services/src/public-api';
import { PartyApiService } from 'projects/services/src/public-api';
import { SearchClientInCuReqDto } from 'projects/services/src/public-api';
import { of } from 'rxjs';
import { TranslationService } from 'projects/services/src/public-api';
import { Arrays } from '../../app-common/arrays';

function getName(item: { FullName: string, ClientName: string }) {
    var s = item.ClientName || item.FullName;
    if (s && item.FullName && s != item.FullName) {
        s += ' (' + item.FullName + ')';
    }
    return s;
}

@Injectable({
    providedIn: 'root'
})
export class PartyCodebookService implements ICodebookProvider2 {
    constructor(private partyApi: PartyApiService, injector: Injector) {
    }

    getFilteredItems(filter: string): Promise<ICodebookItem[]> {
        if (!filter || filter.length < 2)
            return Promise.resolve(EditorCodeBookComponent.BEMORESPECIFIC);
        var criteria = new SearchClientInCuReqDto();
        criteria.PageSize = 9999;
        criteria.StartsWith = filter;
        return this.partyApi.postSearchInCU(criteria).toPromise()
            .then(data => {
                var result = data.data.map(x => ({ Value: x.Id, Text: getName(x) }));
                result = Arrays.sortBy(result, x => x.Text);
                result.forEach((x, i) => x['Order'] = i);
                return result;
            });
    }
    getItems(): Promise<ICodebookItem[]> {
        return this.getFilteredItems('');
    }
    getItem(id: number): Promise<ICodebookItem> {
        return this.partyApi.getPartyHeader(id).toPromise()
            .then(data => {
                return { Value: id, Text: data.PartyName };
            });
    }
}
