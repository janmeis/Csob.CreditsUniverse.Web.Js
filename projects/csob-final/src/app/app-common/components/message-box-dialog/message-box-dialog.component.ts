import { Component, EventEmitter, Injector } from '@angular/core';
import { isObservable, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationService } from '../../../services/translation-service';
import { AppDialog, AppDialogContainerService } from '../../services/app-dialog-container.service';

interface Button {
    title: string;
    css?: string;
    result?: any;
}

export interface Options {
    title?: string;
    message: string;
    messageHTML?: string;
    minWidth?: number;
    icon?: string;
    buttons?: Button[];
}

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'message-box-dialog',
    templateUrl: './message-box-dialog.component.html',
    styleUrls: ['./message-box-dialog.component.less']
})
export class MessageBoxDialogComponent implements AppDialog {
    close: Function;
    closed = new EventEmitter<boolean>()
    icon: string;
    message: string;
    messageHTML: string;
    buttons: Button[] = [];

    static dirtyConfirmation(
        injector: Injector,
        saveCallback: () => Observable<boolean> | Promise<boolean>,
        customMessageHTML: string = null
    ): Promise<boolean> {
        const translation = this.createTranslation(injector);
        const opts: Options = {
            title: translation.$$get('message_box_dialog.dirty_title'),
            message: null,
            messageHTML: customMessageHTML ? customMessageHTML : translation.$$get('message_box_dialog.dirty_question'),
            icon: 'fa fa-warning',
            buttons: [
                { title: translation.$$get('message_box_dialog.yes'), result: true, css: 'k-button k-success' },
                { title: translation.$$get('message_box_dialog.no'), result: false, css: 'k-button k-primary' },
                { title: translation.$$get('message_box_dialog.cancel'), result: null, css: 'k-button' },
            ]
        };
        return MessageBoxDialogComponent.show(injector, opts).toPromise()
            .then(r => {
                if (r == false)
                    return true; // do not save, but continue
                if (r == true) {
                    let save = saveCallback();
                    if (isObservable(save))
                        save = save.toPromise();
                    return save;
                }
                return false;
            });
    }

    static dirtyConfirmationWithoutSave(
        injector: Injector,
    ): Promise<boolean> {
        const translation = this.createTranslation(injector);
        const opts: Options = {
            title: translation.$$get('message_box_dialog.dirty_title'),
            message: null,
            messageHTML: translation.$$get('message_box_dialog.dirty_question'),
            icon: 'fa fa-warning',
            buttons: [
                { title: translation.$$get('message_box_dialog.yes'), result: true, css: 'k-button k-success' },
                { title: translation.$$get('message_box_dialog.no'), result: false, css: 'k-button k-primary' },
                { title: translation.$$get('message_box_dialog.cancel'), result: null, css: 'k-button' },
            ]
        };
        return MessageBoxDialogComponent.show(injector, opts).toPromise().then(r =>  r);
    }

    static createYesNoOptions(injector: Injector): Options {
        const translation = this.createTranslation(injector);
        const opts: Options = {
            title: translation.$$get('message_box_dialog.please_confirm'),
            message: null,
            icon: 'fa fa-question-circle',
            buttons: [
                { title: translation.$$get('message_box_dialog.yes'), result: true, css: 'k-button k-primary' },
                { title: translation.$$get('message_box_dialog.no'), result: false, css: 'k-button' },
            ]
        };
        return opts;
    }
    static createAlertOption(injector: Injector): Options {
        const translation = this.createTranslation(injector);
        const opts: Options = {
            title: translation.$$get('message_box_dialog.alert'),
            message: null,
            buttons: [
                { title: translation.$$get('message_box_dialog.ok'), result: true, css: 'k-button k-primary' }
            ]
        };
        return opts;
    }
    static createDeleteAlertOption(injector: Injector): Options {
        const translation = this.createTranslation(injector);
        const opts: Options = {
            title: translation.$$get('message_box_dialog.please_confirm_deletion_of_selected_items'),
            message: null,
            buttons: [
                { title: translation.$$get('message_box_dialog.delete'), result: true, css: 'k-button k-danger' },
                { title: translation.$$get('message_box_dialog.close'), result: false, css: 'k-button' },
            ]
        };
        return opts;
    }
    static createYesCancelOptions(injector: Injector): Options {
        const translation = this.createTranslation(injector);
        const opts: Options = MessageBoxDialogComponent.createYesNoOptions(injector);
        opts.buttons.splice(1, 1, { title: translation.$$get('message_box_dialog.cancel'), result: false, css: 'k-button' });

        return opts;
    }

    static confirmYesNo(injector: Injector, message: string): Observable<boolean> {
        const opts = MessageBoxDialogComponent.createYesNoOptions(injector);
        opts.message = message;
        return MessageBoxDialogComponent.show(injector, opts).pipe(map(r => <boolean>r || false));
    }
    static confirmAlert(injector: Injector, message: string): Observable<boolean> {
        const opts = MessageBoxDialogComponent.createAlertOption(injector);
        opts.message = message;
        return MessageBoxDialogComponent.show(injector, opts).pipe(map(r => <boolean>r || false));
    }
    static show(injector: Injector, options: Options): Observable<any> {
        options.buttons.forEach((b, i) => {
            if (b.result == undefined) b.result = i;
            if (!b.css) b.css = 'btn';
        });
        const opts = Object.assign({}, options);
        //opts.buttons = opts.buttons.reverse();
        const appDlgSvc = injector.get(AppDialogContainerService);
        const dlg = appDlgSvc.createDialog(injector, MessageBoxDialogComponent,
            { title: options.title, minWidth: options.minWidth },
            opts);
        const result = new Subject<any>();
        dlg.closed.subscribe(r => {
            result.next(r);
            result.complete();
        });
        return result;
    }

    private static createTranslation(injector: Injector): TranslationService {
        return new TranslationService(injector);
    }

    onCloseClick(result: boolean) {
        this.close(result);
    }
}
