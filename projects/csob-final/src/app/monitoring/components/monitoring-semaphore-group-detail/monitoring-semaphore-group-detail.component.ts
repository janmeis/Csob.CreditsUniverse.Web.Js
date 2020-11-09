import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-monitoring-semaphore-group-detail',
    templateUrl: './monitoring-semaphore-group-detail.component.html',
    styleUrls: ['./monitoring-semaphore-group-detail.component.less']
})
export class MonitoringSemaphoreGroupDetailComponent implements OnInit {
    @Input() details: string[][];

    constructor() { }

    ngOnInit() {
    }

}
