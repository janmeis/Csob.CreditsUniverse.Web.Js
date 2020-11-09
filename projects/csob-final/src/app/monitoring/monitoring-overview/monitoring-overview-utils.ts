import { ActivatedRoute, Params, Router } from '@angular/router';
import * as dates from '@progress/kendo-date-math';
import { getToday, fromDateOnlyString } from '../../app-common/dates';
import { EFrequencyUnit, EMonitoringCategory, IMonitoringFilterDto } from '../../services/webapi/webapi-models';
import { IMonitoringQueryParams } from './monitoring-overview.component';

const getSessionStorageKey = (partyId: number) => `monitoringParams_${partyId}`;

export const getMonitoringParams = (params: { [key: string]: string }, filter: IMonitoringFilterDto): IMonitoringFilterDto => {
    const _filter: IMonitoringFilterDto = Object.assign({}, filter);
    if (!_filter || !_filter.PartyId || _filter.PartyId == 0)
        return _filter;

    const monitoringParams = getParamsFromStorage(_filter.PartyId);
    _filter.ByToDate = +monitoringParams['ByToDate'] || +params['ByToDate'] || 0;
    _filter.Granularity = +monitoringParams['Granularity'] || +params['Granularity'] || EFrequencyUnit.Month;
    _filter.EOP = fromDateOnlyString(monitoringParams['EOP']) || fromDateOnlyString(params['EOP']) || dates.addMonths(getToday(), 0);
    _filter.Delta = +monitoringParams['Delta'] || +params['Delta'] || 0;

    return _filter;
};

export const updateMonitoringParams = (partyId: number, params: IMonitoringQueryParams): void => {
    if (!params || !partyId)
        return;

    (params as any)['created'] = (new Date()).getTime();
    const serializedParams = JSON.stringify(params);
    sessionStorage.setItem(getSessionStorageKey(partyId), serializedParams);
};

const getSlicedUrl = (urlTree: string): string => urlTree.split('/').length > 3 ? urlTree.split('/').slice(3).join('/') : urlTree;

const getUrl = (url: string, id: number, queryParams: Params, route: ActivatedRoute, router: Router) => {
    const urlTree = router.createUrlTree(!!id ? [url, id] : [url], {
        queryParams: queryParams,
        relativeTo: route.parent
    }).toString();
    return getSlicedUrl(urlTree);
};

export const getLinkClicked = (link: any[], category: EMonitoringCategory, route: ActivatedRoute, router: Router): string => {
    let url = '';
    switch (category) {
        case EMonitoringCategory.PDRating:
            url = getUrl('../pd-rating/detail', +link[0], {}, route, router);
            break;
        case EMonitoringCategory.ContractTermsFinancial:
            switch (link[0]) {
                case 'contractConditions':
                    url = getUrl('../contract-condition/detail', +link[1], { versionNumber: +link[2], readonly: true }, route, router);
                    break;
                case 'financial':
                    url = getUrl('../financial/detail', null, { readonlyIds: +link[1], showDefaults: false }, route, router);
                    break;
            }
            break;
        default:
            break;
    }

    return url;
};

const getParamsFromStorage = (partyId: number): { [key: string]: string } => {
    const sessionStorageKey = getSessionStorageKey(partyId);
    let params = JSON.parse(sessionStorage.getItem(sessionStorageKey)) as { [key: string]: string };

    if (!params && Object.keys(sessionStorage).length > 0) {
        const items = { ...sessionStorage };
        const values = Object.keys(items).map(k => items[k]);
        const latestParams = values.reduce((a, b) => a['created'] > b['created'] ? a : b);
        params = JSON.parse(latestParams) as { [key: string]: string };
    }

    return params || {};
};
