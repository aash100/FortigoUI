/*
 * Created on Wed May 15 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceString'
})
export class ReplaceStringPipe implements PipeTransform {

  transform(value: any, _replaceString?: string, _replaceWith?: string): any {
    return value && _replaceString && _replaceWith && value !== '' ? value.split(_replaceString).join(_replaceWith) : value;
  }

}

