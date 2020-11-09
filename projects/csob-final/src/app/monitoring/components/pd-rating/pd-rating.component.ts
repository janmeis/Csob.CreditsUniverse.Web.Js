import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isNumber } from 'projects/app-common/src/public-api'
import { EMonitoringCategory, IMonitoringRowDto } from 'projects/services/src/public-api';
import { getLinkClicked } from '../../monitoring-overview/monitoring-overview-utils';

@Component({
    selector: 'app-pd-rating',
    templateUrl: './pd-rating.component.html',
    styleUrls: ['./pd-rating.component.less']
})
export class PdRatingComponent implements OnChanges {
    @Input() pdRatingId: number;
    @Input() data: IMonitoringRowDto[];
    @Output() detailLinkHandler = new EventEmitter<string>();
    rows: IMonitoringRowDto[];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] && !!this.data && this.data.length > 1)
            this.rows = this.data.slice(1, this.data.length);
    }

    isNumber = (value: string): boolean => isNumber(value);

    onLinkClicked(link: string[]) {
        const url = getLinkClicked(link, EMonitoringCategory.PDRating, this.route, this.router);
        if (url.length > 0)
            this.detailLinkHandler.emit(url);
    }
}
