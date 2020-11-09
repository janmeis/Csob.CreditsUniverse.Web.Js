import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class BrowserInfoService {
    public get isIE(): boolean {
        var r = this.detectIE();
        return r && r <= 11;
    }
	/**
	 * detect IE
	 * returns version of IE or false, if browser is not Internet Explorer
	 */
    public detectIE() {
        var ua = window.navigator.userAgent;

        // Test values; Uncomment to check result …

        // IE 10
        // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

        // IE 11
        // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

        // Edge 12 (Spartan)
        // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

        // Edge 13
        // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    }
    public getInfo() {
        return {
            userAgent: window.navigator.userAgent,
            browserAppVersion: window.navigator.appVersion,
            browserAppName : window.navigator.appName,
            isIE: this.isIE,
            screen: {
                w: screen.width || undefined,
                h: screen.height || undefined
            },
            window: {
                w: window.innerWidth || undefined,
                h: window.innerHeight || undefined
            },
        }
    }
}
