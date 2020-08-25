import { DataFormat } from '../models/column.model';

/*
 * Created on Sat Mar 09 2019
 * Created by - 1191: Ritesh Kant
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */


export enum FieldTypes {
  TextInput = 'text',
  NumberInput = 'number',
  DropDown = 'select',
  Date = 'date',
  Email = 'email',
  CheckBox = 'checkBox',
  TextArea = 'textArea',
  Hidden = 'hidden',
  MultiSelect = 'multiselect',
  UploadInput = 'upload',
  RadioInput = 'radio'
}

export type Prefix = 'Currency' | 'Country Code';
export type Suffix = 'Decimal';
export type Alignment = 'left' | 'right' | 'initial' | 'center';

export abstract class FieldType {
  protected prefixContent: string;
  protected suffixContent: string;
  constructor(
    protected placeholder?: string,
    protected type?: string,
    protected name?: string,
    protected columnRatio?: number,
    protected isReadOnly?: boolean,
    protected validations?: any,
    protected displayInTabIndex?: number,
    protected displayInRow?: number,
    protected prefix?: Prefix,
    protected suffix?: Suffix,
    protected alignment?: Alignment
  ) {
    if (this.prefix) {
      switch (this.prefix) {
        case 'Currency':
          this.prefixContent = '₹';
          break;
        case 'Country Code':
          this.prefixContent = '+91';
          break;
        default:
          this.prefixContent = this.prefix;
          break;
      }
    }
    if (this.suffix) {
      switch (this.suffix) {
        case 'Decimal':
          this.suffixContent = '.00';
          break;
        default:
          this.suffixContent = this.suffix;
          break;
      }
    }
    if (!this.alignment) {
      this.alignment = 'initial';
    }
  }
}

export class TextInputField extends FieldType {
  constructor(
    protected placeholder?: string,
    protected name?: string,
    protected columnRatio?: number,
    protected isReadOnly?: boolean,
    protected validations?: any,
    protected displayInTabIndex?: number,
    protected displayInRow?: number,
    protected defaultValue?: string,
    protected groupId = -1, // setting default value to -1 for new Field
    protected prefix?: Prefix,
    protected suffix?: Suffix,
    protected alignment?: Alignment
  ) {
    super(placeholder, FieldTypes.TextInput, name, columnRatio, isReadOnly, validations, displayInTabIndex, displayInRow, prefix, suffix);
  }
}
export class HiddenInputField extends FieldType {
  constructor(
    protected placeholder?: string,
    protected name?: string,
    protected columnRatio?: number,
    protected isReadOnly?: boolean,
    protected validations?: any,
    protected displayInTabIndex?: number,
    protected displayInRow?: number,
    public defaultValue?: string,
    protected groupId = -1, // setting default value to -1 for new Field
    protected prefix?: Prefix,
    protected suffix?: Suffix,
    protected alignment?: Alignment
  ) {
    super(placeholder, FieldTypes.Hidden, name, columnRatio, isReadOnly, validations, displayInTabIndex, displayInRow, prefix, suffix);
  }
}

export class NumberInputField extends FieldType {
  constructor(
    protected placeholder?: string,
    protected name?: string,
    protected columnRatio?: number,
    protected isReadOnly?: boolean,
    protected validations?: any,
    protected displayInTabIndex?: number,
    protected displayInRow?: number,
    protected defaultValue?: any,
    protected groupId = -1, // setting default value to -1 for new Field
    protected prefix?: Prefix,
    protected suffix?: Suffix,
    protected alignment?: Alignment,
    protected dataFormat?: DataFormat
  ) {
    super(placeholder, FieldTypes.NumberInput, name, columnRatio, isReadOnly, validations, displayInTabIndex, displayInRow, prefix, suffix);
  }
}
export class EmailInputField extends FieldType {
  constructor(
    protected placeholder?: string,
    protected name?: string,
    protected columnRatio?: number,
    protected isReadOnly?: boolean,
    protected validations?: any,
    protected displayInTabIndex?: number,
    protected displayInRow?: number,
    protected defaultValue?: string,
    protected groupId = -1, // setting default value to -1 for new Field
    protected prefix?: Prefix,
    protected suffix?: Suffix,
    protected alignment?: Alignment
  ) {
    super(placeholder, FieldTypes.Email, name, columnRatio, isReadOnly, validations, displayInTabIndex, displayInRow, prefix, suffix);
  }
}
export class SelectInputField extends FieldType {
  constructor(
    protected placeholder?: string,
    protected name?: string,
    protected option?: SelectOption,
    protected columnRatio?: number,
    protected isReadOnly?: boolean,
    protected validations?: any,
    protected displayInTabIndex?: number,
    protected displayInRow?: number,
    protected defaultValue?: any,
    protected groupId = -1 // setting default value to -1 for new Field
  ) {
    super(placeholder, FieldTypes.DropDown, name, columnRatio, isReadOnly, validations, displayInTabIndex, displayInRow);
  }
}
export class MultiSelectSearchableInputField extends FieldType {
  constructor(
    protected placeholder?: string,
    protected name?: string,
    protected option?: SelectOption,
    protected columnRatio?: number,
    protected isReadOnly?: boolean,
    protected validations?: any,
    protected displayInTabIndex?: number,
    protected displayInRow?: number,
    protected defaultValue?: Array<any>,
    protected groupId = -1 // setting default value to -1 for new Field
  ) {
    super(placeholder, FieldTypes.MultiSelect, name, columnRatio, isReadOnly, validations, displayInTabIndex, displayInRow);
  }
}
export class SearchableSelectInputField extends FieldType {
  constructor(
    protected placeholder?: string,
    protected name?: string,
    protected option?: SelectOption,
    protected columnRatio?: number,
    protected multi?: boolean,
    protected isReadOnly?: boolean,
    protected validations?: any,
    protected displayInTabIndex?: number,
    protected displayInRow?: number,
    protected defaultValue?: any,
    protected displayLimit?: number,
    protected isSearchPlaceHolder = true,
    protected groupId = -1 // setting default value to -1 for new Field
  ) {
    super(placeholder, FieldTypes.MultiSelect, name, columnRatio, isReadOnly, validations, displayInTabIndex, displayInRow);
  }
}
export class DateInputField extends FieldType {
  constructor(
    protected placeholder?: string,
    protected name?: string,
    protected columnRatio?: number,
    protected isReadOnly?: boolean,
    protected validations?: any,
    protected displayInTabIndex?: number,
    protected displayInRow?: number,
    public defaultValue?: Date,
    protected groupId = -1, // setting default value to -1 for new Field
    protected minDate?: Date,
    protected maxDate?: Date
  ) {
    super(placeholder, FieldTypes.Date, name, columnRatio, isReadOnly, validations, displayInTabIndex, displayInRow);
  }
}
export class SelectOption {
  constructor(
    protected key?: string,
    protected value?: string,
    protected data?: Array<any>
  ) { }
}

export class CheckBoxInputField extends FieldType {
  constructor(
    protected placeholder?: string,
    protected name?: string,
    protected columnRatio?: number,
    protected isReadOnly?: boolean,
    protected validations?: any,
    protected displayInTabIndex?: number,
    protected displayInRow?: number,
    protected defaultValue?: boolean,
    protected groupId = -1 // setting default value to -1 for new Field
  ) {
    super(placeholder, FieldTypes.CheckBox, name, columnRatio, isReadOnly, validations, displayInTabIndex, displayInRow);
  }
}


export class TextAreaInputField extends FieldType {
  constructor(
    protected placeholder?: string,
    protected name?: string,
    protected columnRatio?: number,
    protected isReadOnly?: boolean,
    protected validations?: any,
    protected displayInTabIndex?: number,
    protected displayInRow?: number,
    protected defaultValue?: string,
    protected groupId = -1 // setting default value to -1 for new Field
  ) {
    super(placeholder, FieldTypes.TextArea, name, columnRatio, isReadOnly, validations, displayInTabIndex, displayInRow);
  }
}

export class UploadInputField extends FieldType {
  constructor(
    protected placeholder?: string,
    protected name?: string,
    protected columnRatio?: number,
    protected isReadOnly?: boolean,
    protected validations?: any,
    protected displayInTabIndex?: number,
    protected displayInRow?: number,
    protected defaultValue?: string,
    protected groupId = -1, // setting default value to -1 for new Field
    protected fileFormat = '*', // setting default file format i.e. all type of file allowed.
    protected multipleFileSelect = false // by default single file select enabled.
  ) {
    super(placeholder, FieldTypes.UploadInput, name, columnRatio, isReadOnly, validations, displayInTabIndex, displayInRow);
  }
}
export class RadioInputField extends FieldType {
  constructor(
    protected placeholder?: string,
    protected name?: string,
    protected option?: SelectOption,
    protected columnRatio?: number,
    protected isReadOnly?: boolean,
    protected validations?: any,
    protected displayInTabIndex?: number,
    protected displayInRow?: number,
    protected defaultValue?: string,
    protected groupId = -1 // setting default value to -1 for new Field
  ) {
    super(placeholder, FieldTypes.RadioInput, name, columnRatio, isReadOnly, validations, displayInTabIndex, displayInRow);
  }
}

/*
 * Created on Wed Aug 28 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
export class RadioInput {
  name: string;
  action: string;
  checked?: boolean;
  constructor(name: string, action: string, checked?: boolean) {
    this.name = name;
    this.action = action;
    this.checked = checked;
  }
}


