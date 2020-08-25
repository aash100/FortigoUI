/*
 * Created on Tue Jun 11 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { Column } from '../../models/column.model';
import { DateInputField, TextInputField, NumberInputField, FieldTypes, SelectInputField, SelectOption } from '../../abstracts/field-type.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { FormConfiguration } from '../../models/form-configuration.model';

@Component({
  selector: 'app-fortigo-edit-grid',
  templateUrl: './fortigo-edit-grid.component.html',
  styleUrls: ['./fortigo-edit-grid.component.css']
})
export class FortigoEditGridComponent implements OnInit {

  // Takes input value from grid that is to be updated by user.
  @Input() value: any;
  // Takes Column input from grid
  @Input() column: Column;
  // Takes font size
  @Input() fieldsFontSize: number = FortigoConstant.DEFAULT_FORM_FONT;
  // read only input from user.
  @Input() isReadOnly = false;
  // form configuration
  @Input() formConfiguration: FormConfiguration;
  // form configuration
  @Input() dropdownOption: SelectOption;

  // Emits the output as per user changes.
  @Output() editChanges = new EventEmitter<any>();
  // Input field.
  public fields = new Array<any>();

  constructor() { }

  ngOnInit() {
    this.getFields();
    this.fieldsFontSize = Number.parseInt(this.fieldsFontSize.toString().replace('px', ''));
  }

  /**
   * To get the required input fields as per cell data type.
   */
  private getFields() {
    this.fields.length = 0;
    switch (this.column.editFieldType) {
      case FieldTypes.TextInput:
        this.fields.push(new TextInputField('', this.column.columnDef, 12, this.isReadOnly, {}, undefined, undefined, this.value, undefined, undefined, undefined, this.column.css ? this.column.css.horizontalAlign : 'initial'));
        break;
      case FieldTypes.Date:
        this.fields.push(new DateInputField('', this.column.columnDef, 12, this.isReadOnly, {}, undefined, undefined, new Date(this.value), undefined, this.column.minDate, this.column.maxDate));
        break;
      case FieldTypes.NumberInput:
        this.fields.push(new NumberInputField('', this.column.columnDef, 12, this.isReadOnly, {}, undefined, undefined, this.value, undefined, this.column.editPrefix, this.column.editSuffix, this.column.css ? this.column.css.horizontalAlign : 'initial', this.column.editDataFormat));
        break;
      case FieldTypes.DropDown:
        this.fields.push(new SelectInputField('', this.column.columnDef, this.dropdownOption, 12, this.isReadOnly, {}, undefined, undefined, this.value));
        break;
      default:
        break;
    }
  }

  /**
   * method used to update the rowdata with input value from user.
   * @param  {any} inputvalue
   */
  updateChanges(inputvalue: any) {
    this.editChanges.emit(inputvalue);
  }

}
