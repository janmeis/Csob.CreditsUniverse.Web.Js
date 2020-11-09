import { Component, OnInit, OnChanges, SimpleChanges, Injector } from '@angular/core';
import { UserNotificationService, ENotificationType, NotificationMessageOptions, NotificationMessage } from '../../../services/user-notification.service';
import { TranslationService } from '../../../services/translation-service';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-notification-area',
    templateUrl: './notification-area.component.html',
    styleUrls: ['./notification-area.component.less'],
})
export class NotificationAreaComponent implements OnInit {
    ENotificationType = ENotificationType
    constructor(
        public userNotificationService: UserNotificationService,
        private router: Router
    ) {
        //this.userNotificationService.updated.subscribe(() => this.updated());
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd)
            )
            .subscribe((ev: NavigationEnd) => {
                //clear all not-pinned messages on navigation
                this.userNotificationService.clear('navigation');
            });
    }

    ngOnInit() {
    }
    removeMessage(m: NotificationMessage) {
        this.userNotificationService.remove(m);
    }
}
