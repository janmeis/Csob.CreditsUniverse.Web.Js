import { FormArray, FormGroup } from '@angular/forms';
import { Params } from '@angular/router';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { EPermissionAreaType, IPartyHeaderDto, IWebUserDto } from '../services/webapi/webapi-models';
import { Arrays } from './arrays';

// tslint:disable-next-line: radix
export const MAXINT = parseInt('0x7FFFFFFF');
const _numberRegex = /^\s*[+-]?\d+([,\.]\d+)?$/;
const _colorRegex = /^#\w+$/;

/// <see cref='https://stackoverflow.com/a/50992362'></see>
export function markControlsDirty(group: FormGroup | FormArray): void {
    Object.keys(group.controls).forEach((key: string) => {
        const abstractControl = group.controls[key];

        if (abstractControl instanceof FormGroup || abstractControl instanceof FormArray)
            markControlsDirty(abstractControl);
        else
            abstractControl.markAsDirty();
    });
}

export function showTooltip(e: MouseEvent, kendoTooltipInstance: TooltipDirective, htmlElements: string[] = ['TD', 'TH', 'A']): void {
    const element = e.target as HTMLElement;
    if (htmlElements.some(h => h == element.nodeName)
        && !!element.textContent && element.textContent.length > 0
        && element.offsetWidth < element.scrollWidth)
        kendoTooltipInstance.toggle(element);
    else
        kendoTooltipInstance.hide();
}

export function hideTooltip(kendoTooltipInstance: TooltipDirective) {
    kendoTooltipInstance.hide();
}

export function hexToRGB(hex: string, alpha: string | number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
    } else {
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
}

export const getLinkQueryParams = (link: string): { [key: string]: string } => {
    if (link.indexOf('?') < 0)
        return {};

    const queryParamString = link.substring(link.indexOf('?') + 1);
    const queryParamsPairs = queryParamString.split('&');
    const queryParams = {};
    queryParamsPairs.forEach(p => {
        const pair = p.split('=');
        queryParams[pair[0]] = pair[1];
    });

    return queryParams;
};

export const getUrlAndQuery = (link: string, currentParams: Params): { url: string[], queryParams: Params } => {
    if (link.indexOf('?') < 0)
        return { url: link.split('/'), queryParams: currentParams };

    const modifiedLink = link.substring(0, link.indexOf('?'));
    const queryParams = Object.assign({}, getLinkQueryParams(link), currentParams);

    return { url: modifiedLink.split('/'), queryParams: queryParams };
};

export const isNumber = (value: string): boolean => _numberRegex.test(value);

export const isColor = (value: string): boolean => _colorRegex.test(value);

export const getCurrentComponetPath = (constructor: any): string => {
    try {
        const useFactory = (constructor as any).decorators[0].args[0].providers[0].useFactory.toString();
        const parts = /\$\$component\(\'([^\']+)\'\)/.exec(useFactory);
        return parts[1].replace(/\\\\/g, '\\');
    } catch (error) {
        return null;
    }
};

export const fixToString = (value: number): string =>
    value != null ? `${value}`.replace('.', ',') : null;


export const fixToNumber = (value: string): number =>
    !!value ? +value.replace(/ /g, '').replace(',', '.') : null;

export const hasPermission = (ctx: { party: IPartyHeaderDto, user: IWebUserDto }, action: EPermissionAreaType): boolean => {
    if (ctx.party == null && ctx.user == null)
        return false;
    return ctx.party == null
        ? Arrays.any(ctx.user.Areas, x => x == action)
        : Arrays.any(ctx.party.Areas, x => x == action);
};
