import { Injectable, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Arrays } from '../app-common/arrays';

export enum ENotificationType {
    Information,
    Warning,
    Success,
    Error
}

export interface NotificationMessageOptions {
    message: string
    type: ENotificationType
    delay?: number //zero means do not hide
    canClose?: boolean
    pinned?: boolean | 'while' //true means do not clear on navigation, 'while' means do not clear
}

export interface NotificationMessage extends NotificationMessageOptions {
    created: Date
}

@Injectable({
    providedIn: 'root'
})
export class UserNotificationService {
    messages: NotificationMessage[] = [];
    public updated = new EventEmitter<void>();
    constructor() {
    }
    public error(message: string) {
        this.show({ message, type: ENotificationType.Error, delay: 0 });
    }
    public warning(message: string) {
        this.show({ message, type: ENotificationType.Warning, pinned: true });
    }
    public information(message: string) {
        this.show({ message, type: ENotificationType.Information });
    }
    public success(message: string) {
        this.show({ message, type: ENotificationType.Success, pinned: true });
    }
    public show(message: NotificationMessageOptions) {
        let m = message as NotificationMessage;
        m.created = new Date();
        if (m.canClose == undefined) {
            m.canClose = true; //default
        }
        if (m.delay == undefined) {
            m.delay = 3000; //default
        }
        this.messages.push(m);
        if (m.delay > 0) {
            window.setTimeout(() => {
                this.remove(m);
            }, m.delay);
        }
        this.updated.emit();
    }
    public remove(message: NotificationMessage) {
        let i = this.messages.indexOf(message);
        if (i >= 0) {
            this.messages.splice(i, 1);
            this.updated.emit();
        }
    }
    public clear(reason?: 'navigation') {
        this.messages = this.messages.filter(x => x.pinned == true || x.pinned == 'while');
        if (reason == 'navigation') {
            var limit = new Date().getTime() - 500;
            this.messages = this.messages.filter(m => {
                if (m.pinned == "while" && m.created.getTime() < limit) {
                    return false;
                }
                return true;
            });
        }
        this.updated.emit();
    }
}