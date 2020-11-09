import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'keys' })
export class KeysPipe implements PipeTransform {
    transform(value, args: string[]): any {
        const keys = [];
        // tslint:disable-next-line: forin
        for (const enumMember in value) {
            const isValueProperty = parseInt(enumMember, 10) >= 0
            if (isValueProperty) {
                keys.push({ key: enumMember, value: value[enumMember] });
                //console.log('enum member: ', value[enumMember]);
            }
        }
        return keys;
    }
}
