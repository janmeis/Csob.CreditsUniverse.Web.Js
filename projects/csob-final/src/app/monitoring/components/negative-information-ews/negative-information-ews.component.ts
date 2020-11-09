import { Component, Input } from '@angular/core';
import { fixToNumber } from '../../../app-common/common-functions';
import { IMonitoringRowDto } from 'projects/services/src/public-api';

interface INegativeInfoEwsRow {
    valueFoundOn: string;
    value: number;
    validTo: string;
    financialType: string;
}

@Component({
    selector: 'app-negative-information-ews',
    templateUrl: './negative-information-ews.component.html',
    styleUrls: ['./negative-information-ews.component.less']
})
export class NegativeInformationEwsComponent {
    @Input() data: IMonitoringRowDto[];
    @Input() comment: string;

    get rows(): INegativeInfoEwsRow[] {
        if (!!this.data && this.data.length > 0)
            return this.data.map(r => r.Values).map(v => ({
                valueFoundOn: v[0],
                value: fixToNumber(v[1]),
                validTo: v[2],
                financialType: v[3]
            } as INegativeInfoEwsRow));

        return null;
    }
}
