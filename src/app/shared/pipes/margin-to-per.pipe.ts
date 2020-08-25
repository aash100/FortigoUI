import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'marginToPer'
})
export class MarginToPerPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (isNaN(value)) {
      return 0;
    } else {
      return value * 100;

    }
  }

}
