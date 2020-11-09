import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-dashboard-detail-semaphores',
    templateUrl: './dashboard-detail-semaphores.component.html',
    styleUrls: ['./dashboard-detail-semaphores.component.less'],
})
export class DashboardDetailSemaphoresComponent {
    private _clientSemaphoreColor: string;
    get clientSemaphoreColor(): string {
        return this._clientSemaphoreColor;
    }
    @Input() set clientSemaphoreColor(value: string) {
        this._clientSemaphoreColor = value;
        this.clientSemaphoreColorChange.emit(this.clientSemaphoreColor);
    }
    @Output() clientSemaphoreColorChange = new EventEmitter<string>();
    @Input() readonly = false;

    onClientSemaphoreColorClick(color: string) {
        if (!this.readonly)
            this.clientSemaphoreColor = color;
    }
}
