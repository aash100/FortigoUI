/*
 * Created on Thu Jan 31 2019
 * Created by - 1191: Ritesh Kant
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Directive, HostListener, Input } from '@angular/core';
import { InputValidation } from '../models/input-validator.model';

@Directive({
  selector: '[appInputValidator]'
})
export class FortigoInputValidatorDirective {
  // Takes regex input pattern from user.
  @Input() appInputValidator: InputValidation;
  // regular expression to allow the input letter
  constructor() { }

  @HostListener('keypress', ['$event']) onkeypress(event) {
    if (this.appInputValidator && this.appInputValidator.pattern && this.appInputValidator.text && this.appInputValidator.allowKeyInput !== undefined && this.appInputValidator.allowKeyInput === false) {
      return new RegExp(this.appInputValidator.pattern).test(this.appInputValidator.text + event.key);
    } else {
      return true;
    }
  }

}
