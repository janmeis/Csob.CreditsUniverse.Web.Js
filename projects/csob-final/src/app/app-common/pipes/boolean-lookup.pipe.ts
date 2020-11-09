import { Pipe, PipeTransform, Injector } from '@angular/core';
import { TranslationService } from '../../services/translation-service';

@Pipe({
    name: 'booleanLookup'
})
export class BooleanLookupPipe implements PipeTransform {
    private translation: TranslationService;
    constructor(injector: Injector) {
        this.translation = new TranslationService(injector);
    }
    transform(value: any, args?: any): any {
        return (value as boolean) ? this.translation.$$get('boolean_lookup.yes') : this.translation.$$get('boolean_lookup.no');
    }
}
