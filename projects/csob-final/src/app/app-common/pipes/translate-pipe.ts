import { PipeTransform, Pipe } from "@angular/core";
import { TranslationService } from "../../services/translation-service";

@Pipe({ name: 'translate' })
export class TranslatePipe implements PipeTransform {
    constructor(private translation: TranslationService) {
    }

    transform(value, ...args: any[]): any {
        return this.translation.$$get.apply(this.translation, [value].concat(args));
    }
}