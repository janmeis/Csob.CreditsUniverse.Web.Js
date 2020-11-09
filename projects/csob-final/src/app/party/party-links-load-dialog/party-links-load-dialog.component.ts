import { Component, OnInit, Injector, EventEmitter } from '@angular/core';
import { AppDialog, AppDialogContainerService } from '../../app-common/services/app-dialog-container.service';

@Component({
    selector: 'app-party-links-load-dialog',
    templateUrl: './party-links-load-dialog.component.html',
    styleUrls: ['./party-links-load-dialog.component.less']
})
export class PartyLinksLoadDialogComponent implements OnInit, AppDialog {
    close: Function
    closed = new EventEmitter<any>()
    public progress;

    constructor(private dlgSvc: AppDialogContainerService) { }

    ngOnInit() {
    }

    public wait() {
        return this.dlgSvc.wait(this.closed);
    }
    public static show(injector: Injector) {
        var svc = injector.get(AppDialogContainerService);
        var dlg = svc.createDialog(injector, PartyLinksLoadDialogComponent, {}, {});
        return dlg;
    }
}