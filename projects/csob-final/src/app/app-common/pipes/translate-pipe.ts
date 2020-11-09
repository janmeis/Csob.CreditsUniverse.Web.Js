import { PipeTransform, Pipe } from "@angular/core";
import { TranslationService } from 'projects/services/src/lib/translation-service';

@Pipe({ name: 'translate' })
export class TranslatePipe implements PipeTransform {
    constructor(private translation: TranslationService) {
    }

    transform(value, ...args: any[]): any {
        return this.translation.$$get.apply(this.translation, [value].concat(args));
    }
}
