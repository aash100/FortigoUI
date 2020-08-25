import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rsToLakh'
})
export class RsToLakhPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (isNaN(value)) {
      return value;
    }
    if (value === 0) {
      return 0;
    } else {
      return value / 100000;
    }
  }

}
