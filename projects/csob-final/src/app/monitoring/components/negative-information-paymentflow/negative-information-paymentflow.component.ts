import { Component, Input, OnInit } from '@angular/core';
import { IMonitoringRowDto } from 'projects/services/src/public-api';

interface IMonitoringPaymentFlowRow {
    Validity: boolean;
    SOM: string;
    EOM: string;
    Ratio: string;
}

@Component({
    selector: 'app-negative-information-paymentflow',
    templateUrl: './negative-information-paymentflow.component.html',
    styleUrls: ['./negative-information-paymentflow.component.less'],
})
export class NegativeInformationPaymentFlowComponent implements OnInit {
    @Input() data: IMonitoringRowDto[];

    gridData: IMonitoringPaymentFlowRow[];

    ngOnInit() {
        this.gridData = this.getPaymentFlowRow(this.data);
    }

    private getPaymentFlowRow(negativeRows: IMonitoringRowDto[]): IMonitoringPaymentFlowRow[] {
        return negativeRows.map((r: IMonitoringRowDto) => ({
            Validity: r.Validity,
            SOM: r.Values[0],
            EOM: r.Values[1],
            Ratio: r.Values[2],
        } as IMonitoringPaymentFlowRow));
    }
}
