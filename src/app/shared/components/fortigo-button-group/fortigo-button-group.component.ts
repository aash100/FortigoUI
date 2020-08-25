
/*
 * Created on Mon Feb 04 2019
 * Created by - 1191: Ritesh Kant
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-fortigo-button-group',
  templateUrl: './fortigo-button-group.component.html',
  styleUrls: ['./fortigo-button-group.component.css']
})
export class FortigoButtonGroupComponent implements OnInit {
  /**
 * takes tabs count to operate buttons toggle
 */
  @Output() buttonClicked = new EventEmitter();
  /*
  * take the boolean input for the buttons ( submit, clear, back, next ) to make it visible, by default all are false
  */
  @Input() submit = false;
  @Input() clear = false;
  @Input() back = false;
  @Input() next = false;
  @Input() save = false;
  @Input() remove = false;
  @Input() apply = false;
  @Input() approve = false;
  @Input() reject = false;
  @Input() isDisabled = false;
  @Input() isSubmitDisabled = false;

  /**
   * take formRef to operate the button actions on form
   */
  @Input() formRef: FormGroup;
  /*
  * configure filter if mode is filter
  */
  @Input() filterMode = false;

  constructor() { }

  ngOnInit() {
    if (this.filterMode) {
      this.clear = true;
      this.submit = true;
    }
  }
  onClick(action: string) {
    switch (action) {
      case 'back':
        // this.formRef.reset();
        this.buttonClicked.emit('back');
        break;
      case 'clear':
        if (this.formRef) {
          this.formRef.reset();
        }
        this.buttonClicked.emit('clear');
        break;
      case 'submit':
        // this.formRef.reset();
        this.buttonClicked.emit('submit');
        break;
      case 'next':
        // this.formRef.reset();
        this.buttonClicked.emit('next');
        break;
      case 'save':
        // this.formRef.reset();
        this.buttonClicked.emit('save');
        break;
      case 'remove':
        // this.formRef.reset();
        this.buttonClicked.emit('remove');
        break;
      case 'apply':
        // this.formRef.reset();
        this.buttonClicked.emit('apply');
        break;
      case 'reject':
        if (this.formRef) {
          this.formRef.reset();
        }
        this.buttonClicked.emit('reject');
        break;
      case 'approve':
        // this.formRef.reset();
        this.buttonClicked.emit('approve');
        break;
      default:
        console.log('some error occurent in foriton button group with action: ', action);
        break;
    }
  }

}
