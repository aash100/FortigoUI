import { Directive, ElementRef, HostBinding } from '@angular/core';

@Directive({
  selector: '[appModalTitle]'
})
export class ModalTitleDirective {
  /*
 * set the style property of the element
 */
  @HostBinding('style.border-left') borderLeft = '10px solid #0A50A1';
  @HostBinding('style.padding') padding = '6px ';
  @HostBinding('style.font-size') font = '15px ';
  // @HostBinding('style.height') height = '57px ';

  constructor() { }


}
