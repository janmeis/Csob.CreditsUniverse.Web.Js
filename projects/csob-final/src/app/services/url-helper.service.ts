import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ParamMap } from '@angular/router';
import { toDateOnlyString } from '../app-common/dates';
import { convertToDate } from './json-interceptor';

@Injectable({
    providedIn: 'root'
})
export class UrlHelperService {
    constructor(
    ) { }
    static toServerDate(dt: Date): any {
        return toDateOnlyString(dt);
    }

    loadFromUrl<T extends { [param: string]: any }>(data: T, params: ParamMap) {
        // tslint:disable-next-line: forin
        for (const p in data) {
            const dataValue = data[p];
            if (typeof dataValue === 'function')
                continue;
            if (Array.isArray(dataValue)) {
                // TODO:
                continue;
            }
            if (dataValue !== null && typeof dataValue === 'object') {
                // TODO:
                continue;
            }
            let v = params.get(p);
            v = convertToDate(v);
            (data as any)[p] = v;
        }
        return data;
    }

    private convertRec(o: any, qs: HttpParams, prefix: string = null): HttpParams {
        // tslint:disable-next-line: forin
        for (const p in o) {
            let v = o[p];
            if (v == undefined || typeof v === 'function')
                continue;
            const name = (prefix ? prefix + '.' : '') + p;
            if (v instanceof Date) {
                v = v.toISOString();
            }
            if (Array.isArray(v)) {
                // tslint:disable-next-line: forin
                for (const key in v) {
                    qs = qs.append(name, v[key]);
                }
                continue;
            } else if (v !== null && typeof v === 'object') {
                qs = this.convertRec(v, qs, name);
                continue;
            }

            if (v != undefined && v != null && v !== '') {
                qs = qs.set(name, v);
            }
        }
        return qs;
    }
    addData(data: any, src: ParamMap) {
        let params = new HttpParams();
        src.keys.forEach(k => {
            src.getAll(k).forEach(v => {
                params = params.append(k, v);
            });
        });
        return this.dataToParams(data, params);
    }
    dataToParams(data: any, source: HttpParams = null) {
        const qs = this.convertRec(data, source || new HttpParams());
        return qs;
    }

    saveToUrl(data: any, location: Location) {
        let qs: HttpParams;
        if (data instanceof HttpParams) {
            qs = data;
        } else {
            qs = this.dataToParams(data);
        }
        const path = location.path().split('?')[0];
        // console.log('replacing qs = ' + qs.toString() + ' path=' + path);
        location.replaceState(path, qs.toString());
    }
}
