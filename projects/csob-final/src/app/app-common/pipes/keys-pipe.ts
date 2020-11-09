import { PipeTransform, Pipe } from "@angular/core";

@Pipe({ name: 'keys' })
export class KeysPipe implements PipeTransform {
    transform(value, args: string[]): any {
        let keys = [];
        for (var enumMember in value) {
            var isValueProperty = parseInt(enumMember, 10) >= 0
            if (isValueProperty) {
                keys.push({ key: enumMember, value: value[enumMember] });
                //console.log("enum member: ", value[enumMember]);
            }
        }
        return keys;
    }
}