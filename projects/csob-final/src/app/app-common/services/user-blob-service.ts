import { Injectable } from "@angular/core";
import { HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { UserProgressService } from "../../services/user-progress.service";
import { LogFactoryService, ILogger } from "../../services/log-factory.service";
import { UserNotificationService } from "../../services/user-notification.service";

@Injectable({
    providedIn: 'root',
})
export class UserBlobService {
    private log: ILogger
    constructor(
        private progressService: UserProgressService,
        private notificationService: UserNotificationService,
        logFactory: LogFactoryService
    ) {
        this.log = logFactory.get('UserBlobService');
    }

    public processBlob(
        anchor: HTMLAnchorElement,
        data: Observable<HttpResponse<Blob>>,
        success: () => void = null,
        err: () => void = null
    ) {
        this.progressService.runProgress(data)
            .subscribe(r => {
                this.downloadFile(anchor, r);
                if (success)
                    success();
            }, e => {
                this.showErrorFromBlob(e);
                if (err)
                    err();
            });
    }

    public downloadFile(a: HTMLAnchorElement, response: HttpResponse<Blob>) {
        let filename = response.headers.get('content-disposition');
        if (filename) {
            filename = filename.split(';')[1].trim().split('=')[1];
            filename = filename.replace(/"/g, '');
        }
        let blob = response.body;
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
            // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
            window.navigator.msSaveOrOpenBlob(blob, filename);
            return;
        }
        let URL = window.URL || ((window as any).webkitURL);
        let downloadUrl = URL.createObjectURL(blob);

        // use HTML5 a[download] attribute to specify filename
        //var a = document.createElement("a");

        // safari doesn't support this yet
        if (!a || typeof a.download === 'undefined') {
            window.location = downloadUrl;
        } else {
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
        }
    }

    public showErrorFromBlob(errorObject: any) {
        let reader = new FileReader();
        reader.onload = () => {
            let errorJson = JSON.parse(String(reader.result));
            let errorMessage = errorJson && errorJson.Statuses && errorJson.Statuses[0] && errorJson.Statuses[0].Message;
            this.notificationService.error(errorMessage);
            this.log.error("errorJson from BLOB ", errorJson);
        };
        reader.readAsText(errorObject.error);
    }
}