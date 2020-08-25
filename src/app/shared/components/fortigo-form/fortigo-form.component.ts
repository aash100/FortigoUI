/*
 * Created on Thu Jan 31 2019
 * Created by - 1191: Ritesh Kant
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import Swal from 'sweetalert2';

import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { Tab } from '../../models/tab.model';
import { FieldGroup, FieldGroupList } from '../../models/field-group.model';
import { Card, CardData } from '../../models/card-data.model';
import { FormConfiguration } from '../../models/form-configuration.model';
import { CardConfiguration } from '../../models/card-configuration.model';
import { MatSnackBar } from '@angular/material';
import { SnackbarModel } from '../../models/snackbar.model';
import { FortigoSnackbarComponent } from '../fortigo-snackbar/fortigo-snackbar.component';
import { Util } from 'src/app/core/abstracts/util';
import { DataFormat } from '../../models/column.model';
import { FieldTypes } from '../../abstracts/field-type.model';

export type AlignmentMode = 'auto' | 'inline' | 'custom';
export type UserMode = 'editable-grid' | 'filter-theme1' | 'filter-theme2' | 'default' | 'tab';
type FieldType = 'text' | 'number' | 'date' | 'text-area';

@Component({
  selector: 'app-fortigo-form',
  templateUrl: './fortigo-form.component.html',
  styleUrls: ['./fortigo-form.component.css'],
  providers: [DatePipe]
})
export class FortigoFormComponent implements OnInit, OnChanges {
  // takes array of objects ( eg: TextInputField, NumberInputField) in an ordered way
  @Input() fields: Array<any>;
  // take data input i.e json data to auto-populate form
  @Input() data: any;
  // accept input index to select tab by default its 0
  @Input() selectTab = 0;
  // accept array of tab indexs to hide tab
  @Input() hideTab: Array<number>;
  // takes boolean value to make form readonly, by default its false
  @Input() isReadOnly = false;
  // accepts label for tabs
  @Input() tabList: Array<Tab>;
  // take boolean input to show submit clear button all together
  @Input() submitClearButtonEnabled = true;
  //  mode can be auto or inline ( auto will align elemnts according to media query ) (inline will align elements in a line with full width of the component) right now mode =  auto, filter and inline is suggested
  @Input() mode: AlignmentMode = 'auto';
  // mode can be auto or inline ( auto will align elemnts according to media query ) (inline will align elements in a line with full width of the component)right now mode =  auto, filter and inline is suggested
  @Input() userMode: UserMode = 'default';
  // form configuration
  @Input() formConfiguration: FormConfiguration;
  // card configuration
  @Input() cardConfiguration: CardConfiguration;
  // Takes font size
  @Input() fieldsFontSize: number = FortigoConstant.DEFAULT_FORM_FONT;
  // For grouping of fields in a single a group.
  @Input() groups: Array<FieldGroup> = undefined;
  // To update field value changes.
  @Input() updateChanges: Array<any> = undefined;
  // To validate each required field before submit by default false to avoid Validation before submit.
  @Input() checkValidationBeforeSubmit = false;
  // To clear form - set true.
  @Input() doFormClear = false;
  // Used to show/hide clear button
  @Input() displayClear = true;
  @Input() isDebug = false;
  @Input() isDisabled = false;
  @Input() isSubmitDisabled = false;

  //  Emits true/false i.e the status of submit button whether its clicked or not
  @Output() isSubmitClicked = new EventEmitter<boolean>();
  //  Emits true/false i.e the status of submit button whether its clicked or not
  @Output() isClearClicked = new EventEmitter<boolean>();
  //  Returns form value and trigger formSubmit event whenever form is submitted
  @Output() formSubmit = new EventEmitter<any>();
  // Returns selected value, dropdown name and form value event whenever slect dropdown is changed
  @Output() selectChanges = new EventEmitter<any>();
  // Returns number value, when changes done in number input field.
  @Output() inputChanges = new EventEmitter<any>();
  // Returns files selected, when changes done in upload doc.
  @Output() fileChanges = new EventEmitter<any>();
  //  Returns radio selection changes
  @Output() radioSelectionChanges = new EventEmitter<any>();
  // For emitting the changes done by user to parent component.
  @Output() fieldsChange = new EventEmitter<Array<any>>();
  // Emits the form clear value - sets false after clearing.
  @Output() doFormClearChange = new EventEmitter<boolean>();

  // Holds object of fortigo form component
  public fortigoForm: FormGroup;
  // used by fortigo form internally number of tabs to display
  public tabCount: number;
  // this variable is used lacally by fortigo form to control display of tab.
  public displayTab = false;
  // toggle visibility of back, clear, submit, next button
  public displayBack: boolean;
  public displaySubmit: boolean;
  public displayNext: boolean;
  // used internally to control input alignment
  public elementAlignment = 'col-md-4';
  // used to display apply button
  public displayApply: boolean;
  public filterStyle: any;
  // used for upload invoice functionality
  public fileName = '';
  //  used to define the threshold value of searchable select input field.
  public searchableThresholdValue = FortigoConstant.SEARCHABLE_DROPDOWN_THRESHOLD_VALUE;
  // used for chips(in theme2)
  public chipsData: { [key: string]: Object[] };
  // used to set appearance of input fields of form
  public themeAppearance = 'legacy';
  // Custom Group Alignment
  public isCustomGroupAlignment = true;
  private isMultiSelectPresent: boolean;
  private snackbarData: SnackbarModel;
  public cards: Array<Card>;
  public cardConfigurations: Array<CardConfiguration>;

  constructor(
    private _formBuilder: FormBuilder,
    private _datePipe: DatePipe,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.isMultiSelectPresent = false;
    // if filter mode is enabled
    this.filterStyle = { 'font-size.px': this.fieldsFontSize };

    if (!this.cardConfiguration) {
      this.setDefaultCardConfiguration();
    }

    if (this.mode) {
      this.displayApply = true;
      this.displaySubmit = false;
    }
    // for arranging groups in ascending order of id.
    this.groups = FieldGroupList.getArrangedData(this.groups);
    this.setCards();
    this.applyCustomGroupAlignment();
    // create form instance
    this.fortigoForm = this.createControl();
    // used to control tab visibility and defines no. of tabs
    if (this.tabList && this.tabList.length) {
      this.displayTab = true;
      this.tabCount = this.tabList.length - 1;
    } else {
      this.tabCount = -1;
      // used whenever their is no tab, -1 is used for the switch case of controlbuttonVisibility to control button
      this.selectTab = -1;
    }
    this.controlButtonVisibility('button');
    this.fieldsChange.emit(this.fields);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setAppearance();
    this.filterStyle = { 'font-size.px': this.fieldsFontSize };

    if (changes.cardConfiguration) {
      this.cardConfiguration = changes.cardConfiguration.currentValue;
    }
    if (changes.data) {
      this.data = changes.data.currentValue;
      this.fortigoForm = this.createControl();
    }
    if (changes.userMode) {
      switch (this.userMode) {
        case 'filter-theme1':
        case 'filter-theme2':
          this.displayApply = true;
          this.mode = 'inline';
          break;
        default:
          break;
      }
    }
    if (changes.formConfiguration) {
      this.formConfiguration = changes.formConfiguration.currentValue;
      this.applyFormConfigurationStyle();
    }
    if (changes.fields) {
      this.fields = changes.fields.currentValue;
      this.fortigoForm = this.createControl();
    }
    if (changes.groups) {
      this.groups = changes.groups.currentValue;
      this.applyCustomGroupAlignment();
    }
    if (changes.selectTab) {
      this.selectTab = changes.selectTab.currentValue;
    }
    if (changes.doFormClear) {
      this.doFormClear = changes.doFormClear.currentValue;
      if (this.doFormClear) {
        this.resetForm();
        // creating form
        this.fortigoForm = this.createControl();
      }
      // clearing the value - for next change detection
      this.doFormClearChange.emit(false);
    }
    // to update changes as per user selection.
    if (changes.updateChanges) {
      this.updateChanges = changes.updateChanges.currentValue;
      if (this.updateChanges && Array.isArray(this.updateChanges) && this.updateChanges.length > 0) {
        this.updateChanges.forEach((eachChange) => {
          if (this.fields && Array.isArray(this.fields) && this.fields.length > 0) {
            this.fields.forEach((field) => {
              if (field.name === eachChange.name) {
                field.defaultValue = eachChange.value;
              }
            });
          }
        });
      }
      this.fortigoForm = this.createControl();
    }
    this.fieldsChange.emit(this.fields);
  }

  private setCards() {
    this.cards = new Array<Card>();
    this.cardConfigurations = new Array<CardConfiguration>();

    this.groups.forEach((eachGroup, index) => {
      this.cards[index] = new Card();
      this.cards[index].data = <CardData>Util.getObjectCopy(eachGroup);

      this.cardConfigurations[index] = <CardConfiguration>Util.getObjectCopy(this.cardConfiguration);
    });
  }

  private setDefaultCardConfiguration() {
    this.cardConfiguration = new CardConfiguration();
    this.cardConfiguration.css.fontSize = this.fieldsFontSize.toString() + 'px';
  }

  /**
   * For Custom Styling of Groups
   */
  private applyCustomGroupAlignment() {
    let columnWidth = 0;
    let havingGroupColumnRatio = false;
    const groupArrayWithoutStyle = new Array<string>();
    if (this.groups && Array.isArray(this.groups) && this.groups.length > 0) {
      this.groups.forEach((group) => {
        if (group.id !== -1) {
          if (!group.columnRatio) {
            this.isCustomGroupAlignment = false;
            groupArrayWithoutStyle.push(group.title);
          } else {
            havingGroupColumnRatio = true;
            if (columnWidth === 12) {
              columnWidth = 0;
            }
            columnWidth += group.columnRatio;
            group.groupCSSClass = 'col-md-' + group.columnRatio.toString();
          }
        }
      });
      if (this.groups.length === 1) {
        this.isCustomGroupAlignment = false;
      }
    }
    if (this.isDebug && (havingGroupColumnRatio && !this.isCustomGroupAlignment)) {
      console.warn('Following groups do not have the column widths, group alignment will not be applied ', groupArrayWithoutStyle);
    }
  }

  /**
   * This function resets the form
   */
  private resetForm() {
    if (this.fields && Array.isArray(this.fields) && this.fields.length > 0) {
      this.fields.forEach((field) => {
        field.defaultValue = undefined;
      });
    }
    this.chipsData = {};
  }

  /**
   * This function is used to apply user defined css to different UI elements,
   * using style
   */
  private applyFormConfigurationStyle() {
    if (this.formConfiguration && this.formConfiguration.css) {
      this.formConfiguration.style.containerDiv = { 'max-width': this.formConfiguration.css.containerMaxWidth };
    }
  }

  /**
   * Create reactive form
   */
  private createControl() {
    // const group = this.fortigoForm.group({});
    const fortigoForm = this._formBuilder.group({});
    let columnWidth = 0;
    if (this.fields) {
      this.fields.forEach(field => {
        // Used to track multiselect drop doown present or not
        if (this.mode === 'inline' && !this.isMultiSelectPresent && field.multi && field.type === 'multiselect') {
          this.isMultiSelectPresent = true;
          this.userMode = 'filter-theme2';
          this.setAppearance();
        }
        // for field alignment purpose
        if (field.columnRatio !== undefined && field.columnRatio !== null) {
          if (columnWidth === 12) {
            columnWidth = 0;
          }
          columnWidth += field.columnRatio;
          field.elementAlignment = 'col-md-' + field.columnRatio.toString();
        }
        if (!field.elementAlignment) {
          this.setDefaultFieldAlignment(field);
        }
        if (field.type === 'button') {
          return;
        }
        // used for theme2(for chips configuration)
        if (this.userMode === 'filter-theme2' && field.type === 'multiselect') {
          this.chipsData[field.name] = [];
        }
        let value = '';
        if (field.defaultValue !== null && field.defaultValue !== undefined) {
          value = field.defaultValue;
        } else if ((this.data !== undefined && this.data !== null) && (this.data[field.name] !== null && this.data[field.name] !== undefined)) {
          value = this.data[field.name];
        }
        const control = this._formBuilder.control(
          {
            // populate fields based on json data object value or field value
            value: this.applyPipe(value, field.dataFormat, field.type),
            // check readonly on input level and on form level
            disabled: this.isReadOnly ? true : field.isReadOnly
          },
          this.bindValidations(field)
        );
        fortigoForm.addControl(field.name, control);
      });
    }
    return fortigoForm;
  }

  /**
 * Function applyPipe:
 *
 * This function applies pipe to row data
 * @param  {any} data: Data to which format applies
 * @param  {DataFormat} dataFormat: Format of Data
 * @returns string: Returns data in defined format
 */
  private applyPipe(data: any, dataFormat: DataFormat, field: FieldTypes): any {
    let formattedData: any;
    switch (dataFormat) {
      case DataFormat.Currency:
        if (data === undefined || data === null) {
          formattedData = 0;
        } else {
          formattedData = isNaN(data) ? data : Number.parseFloat(data).toFixed(2);
        }
        break;
      case DataFormat.None:
      default:
        return data;
    }

    switch (field) {
      case 'number':
        console.log('data1', data);
        console.log('data2', formattedData);
        console.log('data3', parseFloat(formattedData));
        return formattedData;
      case 'date':
      // return Date.parse(formattedData);
      default:
        break;
    }
  }

  /**
   * To set default alignment of field.
   * @param  {any} field: Input Field
   */
  private setDefaultFieldAlignment(field: any) {
    field.elementAlignment = {
      'col-12': this.mode === 'inline' && this.userMode !== 'filter-theme2',
      'col-6': this.userMode === 'filter-theme2',
      'col-lg-4 ': this.mode === 'auto'
    };
  }

  /**
   * Binds validation to the form control
   * @param validations
   */
  private bindValidations(field: any) {
    const validations = field.validations;
    const formattedValidations: Array<any> = new Array<any>();

    if (validations) {
      const validationsApplied = Object.getOwnPropertyNames(validations);
      // Below Validations is implemented only for Text and Text Area input field.
      validationsApplied.forEach((eachValidation) => {
        switch (eachValidation) {
          case FortigoConstant.REQUIRED:
            if (validations.required) {
              formattedValidations.push(Validators.required);
            }
            break;
          case FortigoConstant.MIN_LENGTH:
            formattedValidations.push(Validators.minLength(validations.minLength));
            break;
          case FortigoConstant.MAX_LENGTH:
            if (field.type === 'upload') {
              field.hintLabel = 'File size should be less than ' + validations.maxFileSize + 'Kb';
              field.hintMessage = '*Max file size limit ' + validations.maxFileSize + 'Kb';
              field.errorMessage = 'File size limit exceeded';
            } else {
              field.hintLabel = 'Max ' + field.validations.maxLength + ' characters';
              field.hintMessage = '/' + field.validations.maxLength;
              formattedValidations.push(Validators.maxLength(validations.maxLength));
            }
            break;
          case FortigoConstant.PATTERN:
            if (Validators.pattern(validations.pattern.regex) !== null) {
              field.errorMessage = validations.pattern.description;
            }
            formattedValidations.push(Validators.pattern(validations.pattern.regex.toString()));
            break;
        }
      });
    }

    return formattedValidations;
  }

  /**
   * Determines whether tab clicked on
   * @param index
   */
  public onTabClicked(index: number) {
    this.selectTab = index;
    this.controlButtonVisibility('button');
  }

  /**
   * Controls button visibility
   * @param action
   */
  public controlButtonVisibility(action: string) {
    this.resetButtonVisibility();

    switch (action) {
      case 'back':
        this.selectTab--;
        break;
      case 'next':
        this.selectTab++;
        break;
      case 'clear':
        this.isClearClicked.emit();
        break;
      default:
        break;
    }
    // set visibility of button according to the tabIndex
    switch (this.selectTab) {
      case -1:
        switch (this.userMode) {
          case 'filter-theme1':
            this.setButtonVisibility(false, this.displayClear, false, false);
            this.displayApply = true;
            break;
          case 'filter-theme2':
            this.setButtonVisibility(false, false, false, false);
            this.displayApply = true;
            break;
          case 'default':
            this.setButtonVisibility(false, true, true, false);
            break;
          default:
            break;
        }
        break;
      case 0:
        this.setButtonVisibility(false, false, false, true);
        break;
      case this.tabCount:
        this.setButtonVisibility(true, true, true, false);
        break;
      default:
        this.setButtonVisibility(true, false, false, true);
        break;
    }
  }

  /**
   * This function resets button's visibility to default;
   */
  private resetButtonVisibility() {
    this.displayBack = false;
    this.displayClear = false;
    this.displaySubmit = false;
    this.displayNext = false;
    this.displayApply = false;
  }

  /**
   * Sets button visibility
   * @param displayBack
   * @param displayClear
   * @param displaySubmit
   * @param displayNext
   */
  private setButtonVisibility(displayBack: boolean, displayClear: boolean, displaySubmit: boolean, displayNext: boolean) {
    this.displayBack = displayBack;
    this.displayClear = displayClear;
    this.displaySubmit = displaySubmit;
    this.displayNext = displayNext;
  }

  /**
   * Submits fortigo form component
   * @returns form submitted value
   */
  public submit(): any {
    this.isSubmitClicked.emit(true);
    // FIXME @ Aashish generic feature for required field
    let isValidSubmit = true;
    isValidSubmit = this.validateBeforeSubmit();
    if (isValidSubmit) {
      this.formSubmit.emit(this.fortigoForm.value);
      return this.fortigoForm.value;
    }
  }

  /**
   * To validate each required field before submit.
   * @returns boolean
   */
  private validateBeforeSubmit(): boolean {
    const fortigoFormKeys = Object.getOwnPropertyNames(this.fortigoForm.value);
    for (let i = 0; i < this.fields.length; i++) {
      if (this.fields[i].validations) {
        // By default validation.
        if (this.fortigoForm.controls[this.fields[i].name].errors && this.fortigoForm.controls[this.fields[i].name].errors.pattern) {
          this.snackbarData = new SnackbarModel('Invalid input in ' + this.fields[i].placeholder);
          this._snackBar.openFromComponent(FortigoSnackbarComponent, { data: this.snackbarData });
          return false;
        }
        // As per User choice of validation
        if (this.checkValidationBeforeSubmit) {
          if (this.fields[i].validations.required) {
            if (fortigoFormKeys.toString().includes(this.fields[i].name) && (this.fortigoForm.value[this.fields[i].name] === undefined || this.fortigoForm.value[this.fields[i].name] === null || this.fortigoForm.value[this.fields[i].name] === '')) {
              switch (this.fields[i].type) {
                case 'number':
                  if (isNaN(this.fortigoForm.value[this.fields[i].name]) || this.fortigoForm.value[this.fields[i].name] === '') {
                    Swal.fire('Warning', 'Please enter ' + this.fields[i].placeholder, 'warning');
                    return false;
                  }
                  break;
                case 'upload':
                  Swal.fire('Warning', 'Please select file/s for ' + this.fields[i].placeholder, 'warning');
                  return false;
                default:
                  Swal.fire('Warning', 'Please enter ' + this.fields[i].placeholder, 'warning');
                  return false;
              }
            }
          }
        }
      }
    }
    return true;
  }

  /**
   * Emits the event with field name whenever select value is changed in dropdown.
   * @param data
   */
  public onSelectChange(data: any) {
    this.updateFieldsOnChange(data.source.ngControl.name, data.value);
    this.selectChanges.emit({ name: data.source.ngControl.name, value: data.value });
  }

  /**
   * Updates the fields on any change event occurs.
   * @param  {string} fieldName
   * @param  {any} value
   */
  private updateFieldsOnChange(fieldName: string, value: any) {
    this.fields.forEach((field) => {
      if (field.name === fieldName) {
        field.defaultValue = value;
      }
    });
    this.fieldsChange.emit(this.fields);
  }

  /**
   * Determines whether searchable select change on
   * @param  {any} data
   * @param  {string} fieldName
   */
  public onSearchableSelectChange(data: any, fieldName: string) {
    if (this.userMode === 'filter-theme2') {
      this.setChipsData(data, fieldName);
    }
    this.selectChanges.emit({ name: fieldName, value: data.source.value });
    this.updateFieldsOnChange(fieldName, data.source.value);
  }

  /**
   * Determines whether input changes in any type of input field.
   * @param $event : input change by user.
   * @param fieldType : type of field.
   * @param fieldName : Field Name.
   */
  public onInputChanges($event: any, fieldType: FieldType, fieldName: string) {
    // REVIEW @Aashish: please add the name of the element with which data is emitted.
    let value: any;
    switch (fieldType) {
      case 'number':
      case 'text':
      case 'text-area':
        if (this.userMode === 'editable-grid') {
          if (Util.isString($event.target.value)) {
            value = $event.target.value.trim();
          } else {
            value = $event.target.value;
          }
        } else {
          if (Util.isString($event.target)) {
            value = $event.target.trim();
          } else {
            value = $event.target;
          }
        }
        // FIXME @Sachin: Validate all the scenario in all modules and update
        // this.inputChanges.emit({value: value, name: fieldName});
        this.inputChanges.emit(value);
        value = $event.target.value;
        break;
      case 'date':
        if (this.userMode === 'editable-grid') {
          value = this._datePipe.transform(new Date($event.value.toISOString()), FortigoConstant.INDIAN_DATE_FORMAT);
          // FIXME @Sachin: Validate all the scenario in all modules and update
          // this.inputChanges.emit({ value: this._datePipe.transform(new Date($event.value.toISOString()), FortigoConstant.INDIAN_DATE_FORMAT), name: fieldName });
          this.inputChanges.emit(this._datePipe.transform(new Date($event.value.toISOString())));
        } else {
          value = $event.value;
          // FIXME @Sachin: Validate all the scenario in all modules and update
          // this.inputChanges.emit({ value: $event.value, name: fieldName });
          this.inputChanges.emit($event.value);
        }
        break;
      default:
        break;
    }
    this.updateFieldsOnChange(fieldName, value);
  }

  /**
   * Used for upload document
   * @param  {any} event
   * @param  {boolean} multipleFileSelect
   * @param  {string} fieldName
   */
  public onSelectedFile(event: any, multipleFileSelect: boolean, field: any) {
    const fieldName = field.name;
    // REVIEW @Aashish: please add the name of the element with which data is emitted.
    if (multipleFileSelect) {
      for (let i = 0; i < event.target.files.length; i++) {
        this.fileName += event.target.files[i].name + ', ';
      }
      this.fileName = this.fileName.slice(0, this.fileName.length - 2);
    } else {
      this.fileName = event.target.files[event.target.files.length - 1].name;
    }
    const selectedFiles = event.target.files;
    this.applyValidations(selectedFiles, field, fieldName);
  }

  /**
   * To apply file validations.
   * @param  {any} selectedFiles:selectedFiles
   * @param  {any} field:field
   * @param  {any} fieldName:fieldName
   */
  private applyValidations(selectedFiles: any, field: any, fieldName: any) {
    if (field.validations) {
      if (selectedFiles[0].size / 1000 > field.validations.maxFileSize) {
        field.sizeLimitExceeded = true;
        field.defaultValue = undefined;
        field.hintMessage = '*Max file size limit ' + field.validations.maxFileSize + 'Kb';
        field.errorMessage = 'File size limit exceeded';
      } else {
        field.sizeLimitExceeded = false;
        field.hintMessage = 'Uploaded file size ' + selectedFiles[0].size / 1000 + 'Kb';
        this.fileChanges.emit(selectedFiles);
        this.updateFieldsOnChange(fieldName, this.fileName);
      }
    } else {
      this.fileChanges.emit(selectedFiles);
      this.updateFieldsOnChange(fieldName, this.fileName);
    }
  }

  /**
   * used to emit radio select change on click
   * @param radioChangeValue
   * @param fieldName
   */
  public radioSelectionChange(radioChangeValue: any, fieldName: string) {
    this.radioSelectionChanges.emit({ 'value': radioChangeValue.toString(), 'fieldName': fieldName.toString() });
    this.updateFieldsOnChange(fieldName, radioChangeValue.toString());
  }

  /**
   * Used to emit checkbox select change on click
   * @param event
   * @param fieldName
   */
  public checkBoxChanges(event: any, fieldName: string) {
    this.selectChanges.emit({ name: fieldName, value: event.checked });
    this.updateFieldsOnChange(fieldName, event.checked);
  }

  public getCard(group: FieldGroup): Card {
    const card = new Card();
    card.data = group;
    return card;
  }

  /**
   * This function is called whenever chip is closed
   *
   * @param  {string} fieldName
   * @param  {any} selectedValue
   */
  public removeChip(fieldName: string, selectedValue: any) {
    let removeIndex: number;
    this.chipsData[fieldName].forEach((each, index) => {
      if (each['id'].toString() === selectedValue.toString()) {
        removeIndex = index;
      }
    });
    this.chipsData[fieldName].splice(removeIndex, 1);
    this.fortigoForm.controls[fieldName].setValue(this.chipsData[fieldName].map(e => e['id']));
  }

  /**
   * This function is used to set chips data
   *
   * @param  {any} dataValue
   * @param  {string} fieldName
   */
  private setChipsData(dataValue: any, fieldName: string) {
    this.chipsData[fieldName] = [];
    dataValue.source.selected.forEach((selectedDataValue: any) => {
      this.chipsData[fieldName].push({ id: selectedDataValue.value, name: selectedDataValue._element.nativeElement.innerText.trim() });
    });
  }

  /**
   * set appearance of form
   */
  private setAppearance() {
    if (this.userMode === 'filter-theme2') {
      this.chipsData = {};
      this.themeAppearance = 'outline';
      this.displayClear = false;
    }
  }
}
