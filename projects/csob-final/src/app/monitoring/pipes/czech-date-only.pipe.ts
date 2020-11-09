import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'czechDateOnly'
})
export class CzechDateOnlyPipe implements PipeTransform {

  transform(value: string): string {
    if (value.indexOf(' ') < 0)
      return value;

    const parts = value.split(' ');
    return parts[0];
  }
}
