import { Injectable } from '@angular/core';
import { MessageService } from '@progress/kendo-angular-l10n';
import { TranslationService } from './translation-service';

@Injectable()
export class TranslationKendoService extends MessageService {
    constructor(private translation: TranslationService) {
        super();
    }
    public get(key: string): string {
        return this.translation.$$get(key);
    }
}
