/*
 * Created on Mon Feb 04 2019
 * Created by - 1191: Ritesh Kant
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[appFortigoClearButton]'
})
export class FortigoClearButtonDirective {
    /*
   * set the style property of the element
   */
  @HostBinding('style.background') background = 'transparent ' ;
  @HostBinding('style.font-size') fontSize = '12px ';
  @HostBinding('style.border-radius') borderRadius = '0.25rem ';
  @HostBinding('style.color') color = '#E66006 ';
  @HostBinding('style.padding') padding = '0px 10px ';
  @HostBinding('style.margin') margin = '0px 10px ';
  @HostBinding('style.font-family') fontFamily = 'swis721 ';
  @HostBinding('style.line-height') lineHeight = '2.4 ';

  constructor() { }

}
