import { State, SortDescriptor } from '@progress/kendo-data-query';
import { IGridBaseDto } from '../../services/webapi/webapi-models';
import { ParamMap } from '@angular/router';
/*
declare interface GridBaseDto
{
  SortColumnName: string
  SortDirection: any
  Page: number
  PageSize: number
}
*/
export function setGridToCriteria(grid: State, criteria: IGridBaseDto): IGridBaseDto {
    criteria.SortColumnName = null;
    criteria.SortDirection = 0;
    if (grid.sort && grid.sort.length > 0) {
        criteria.SortColumnName = grid.sort[0].field;
        criteria.SortDirection = grid.sort[0].dir == 'asc' ? 0 : 1;
    }
    if (grid.filter) {
        console.error('grid filter not supported by GridBaseDto', grid.filter);
    }
    if (grid.group && grid.group.length > 0) {
        console.error('grid grouping not supported by GridBaseDto', grid.group);
    }
    criteria.PageSize = grid.take || 20;
    criteria.Page = 0;
    if (grid.skip && criteria.PageSize > 0) {
        criteria.Page = Math.trunc(grid.skip / criteria.PageSize);
    }
    return criteria;
}
export function stateToUrlParams(state: State, args: {}, prefix: string = ''): any {
    if (state.sort && state.sort.length > 0) {
        const s = state.sort[0];
        args[prefix + 'sort'] = (s.dir == 'desc' ? '~' : '') + s.field;
    }
    return args;
}
export function stateFromUrlParams(state: State, args: ParamMap, prefix: string = ''): void {
    let sort = args.get(prefix + 'sort');
    if (sort) {
        const dir = sort.length > 0 && sort[0] != '~';
        if (!dir) {
            sort = sort.substr(1);
        }
        state.sort = [{ dir: dir ? 'asc' : 'desc', field: sort }];
    }
}
export function setCriteriaToGrid(criteria: IGridBaseDto, grid: State): State {
    const sort: SortDescriptor = {
        field: criteria.SortColumnName,
    };
    sort.dir = 'asc';
    if (criteria.SortDirection && criteria.SortDirection == 1)
        sort.dir = 'desc';
    grid.sort = [sort];
    grid.skip = (criteria.PageSize || 0) * (criteria.Page || 0);
    grid.take = criteria.PageSize;

    return grid;
}

export class GridState implements IGridBaseDto {
    SortColumnName: string = null;
    SortDirection: number = null; //ListSortDirection from c# 0=Asc,1=Desc
    Page: number = null;
    PageSize: number = null;
    // Filter: IFilter = { Filters: [] } as IFilter;
    setState(state: State): this {
        setGridToCriteria(state, this);
        return this;
    }
}
