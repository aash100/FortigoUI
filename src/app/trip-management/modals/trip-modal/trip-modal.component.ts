/*
 * Created on Fri Jul 05 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DatePipe } from '@angular/common';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { TextInputField, SelectOption, SelectInputField, DateInputField, TextAreaInputField, CheckBoxInputField, FieldTypes } from 'src/app/shared/abstracts/field-type.model';
import { Column, DataType, DataFormat, CalculationDataType } from 'src/app/shared/models/column.model';
import { TripService } from '../../services/trip/trip.service';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { FortigoConstant, RoleId } from 'src/app/core/constants/FortigoConstant';
import { AutoUnsubscribe } from 'src/app/shared/decorators/auto-unsubscribe.decorator';
import { TripManagementConstant } from '../../constants/TripManagementConstant';
import { InvoiceDataList } from '../../models/trip-validation.model';
import { FortigoValidators } from 'src/app/shared/models/fortigo-validators.model';
import { FortigoPattern } from 'src/app/core/constants/FortigoPattern';
import { Util } from 'src/app/core/abstracts/util';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { Card } from 'src/app/shared/models/card-data.model';
import { CardConfiguration } from 'src/app/shared/models/card-configuration.model';

type GSTType = 'IGST' | 'CGST_SGST';

@Component({
  selector: 'app-trip-modal',
  templateUrl: './trip-modal.component.html',
  styleUrls: ['./trip-modal.component.css'],
  providers: [DatePipe]
})
@AutoUnsubscribe(['afterClosedSubscription'])
export class TripModalComponent implements OnInit {

  // binds UI element customerForm with the form.
  @ViewChild('customerForm', { static: false }) customerForm: ElementRef;

  // binds UI element consigneeForm with the form.
  @ViewChild('consigneeForm', { static: false }) consigneeForm: ElementRef;

  // binds UI element consignorForm with the form.
  @ViewChild('consignorForm', { static: false }) consignorForm: ElementRef;

  public fieldStyle = { 'font-size.px': FortigoConstant.FONT_SMALL };
  public fieldsFontSize = FortigoConstant.FONT_MEDIUM;
  public title: string;
  public submitClearButtonDisabled = true;
  public columnsDataTrip: Array<Column>;
  public rowsDataTrip: Array<any>;
  public columnsDataAdjustments: Array<Column>;
  public rowsDataAdjustments: Array<any>;
  public buttons: Array<any>;

  public customerTitle = TripManagementConstant.CUSTOMER_DETAILS;
  public consigneeTitle = TripManagementConstant.CONSIGNEE_DETAILS;
  public consignorTitle = TripManagementConstant.CONSIGNOR_DETAILS;

  public isSaved: boolean;
  public isSubmit: boolean;
  public isApproved: boolean;
  public isApprovedAndGenerate: boolean;
  public isRejected: boolean;

  public formData: Array<any>;
  public filterFieldsCustomer: Array<any>;
  public filterFieldsConsignee: Array<any>;
  public filterFieldsConsignor: Array<any>;
  public invoiceGstData: Array<any>;
  public cusReferenceData: Array<any>;
  public adjustmentsGridConfiguration: GridConfiguration;
  public tripRfvGridConfiguration: GridConfiguration;
  public remarksData: any;
  public isGenerateInvoice = false;
  public updateChanges: Array<any>;
  // generate invoice fields
  public generateInvoiceFields: Array<any>;

  private rfvViewSubscription: Subscription;
  private afterClosedSubscription: Subscription;
  private generateInvoiceSubscription: Subscription;
  private submitSentTripValidationSubscription: Subscription;
  private approveSentTripValidationSubscription: Subscription;
  private rejectSentTripValidationSubscription: Subscription;
  private downloadInvoicePDFSubscription: Subscription;

  public customerCard: Card;
  public customerCardConfiguration: CardConfiguration;

  public consignorCard: Card;
  public consignorCardConfiguration: CardConfiguration;

  public consigneeCard: Card;
  public consigneeCardConfiguration: CardConfiguration;

  private billFromValue = '';
  private ecContractType = '';
  private gstApplicable: boolean;
  private unRegGstFlag: boolean;
  private invoiceCustomerReferenceList: Array<any>;
  private isAprilMonth = false;
  private columnRatio = 3;
  private entityId: any;
  private invoiceRequestedData: Array<any>;
  private invoiceCustomerReferenceNumber: Array<any>;
  // To Store Grid Data.
  private rowsAdjustmentData: Array<any>;
  private rowsTripData: any;

  private responseTripData: any;
  private isFTAPL: boolean;
  private stateCode: string;
  private remarks = '';
  private invoiceNumberList: Array<InvoiceDataList>;
  private invoiceNumberDate: Date;
  private isGSTIN: boolean;

  private roleId: number;

  private adjustmentCheckbox1Data: Array<any>;
  private adjustmentCheckbox2Data: Array<any>;
  private kindAttention: string;
  public showModalLoader: boolean;
  private currentSupplyValue: number;
  private initialChargedWeight: string;
  private initialRowAdjData: Array<any>;
  private billFromGSTIN: string;
  private gstType: GSTType;
  private mode: any;
  private adjustmentAmountNonApproved = 0;
  private nonApprovedSelected = false;
  public isToPayTripType: boolean;

  constructor(
    public _dialogRef: MatDialogRef<TripModalComponent>,
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _tripService: TripService,
    private _datePipe: DatePipe,
    private _loginControlV2Service: LoginControlV2Service) {
    this.initializeData();
  }

  ngOnInit() {
    this.title = this._data.title;

    this.roleId = Number.parseInt(this._loginControlV2Service.roleId.toString());

    this.columnsDataTrip = this.getColumnsTripRfvScreen(this._data.actionItemIndex);
    this.rowsDataTrip = this._data.rowsDataTrip;
    this.columnsDataAdjustments = this.getAdjustmentColumnData(this._data.actionItemIndex);
    this.mode = this._data.mode;
    this.getRfvGridConfiguration();
    this.getAdjustmentGridConfiguartion();

    this.customerCard = new Card();
    this.customerCard.data = { id: 1, title: this.customerTitle };
    this.customerCardConfiguration = new CardConfiguration();
    this.customerCardConfiguration.css.fontSize = FortigoConstant.FONT_LARGE + 'px';

    this.consignorCard = new Card();
    this.consignorCard.data = { id: 1, title: this.consignorTitle };
    this.consignorCardConfiguration = new CardConfiguration();
    this.consignorCardConfiguration.css.fontSize = FortigoConstant.FONT_LARGE + 'px';
    this.consignorCardConfiguration.css.paddingTop = '57px';

    this.consigneeCard = new Card();
    this.consigneeCard.data = { id: 1, title: this.consigneeTitle };
    this.consigneeCardConfiguration = new CardConfiguration();
    this.consigneeCardConfiguration.css.fontSize = FortigoConstant.FONT_LARGE + 'px';
    this.consigneeCardConfiguration.css.paddingTop = '57px';

    const isReadOnlyForm = this.roleId === RoleId.FORTIGO_READ_ONLY_USER;
    this.getFields(isReadOnlyForm);

    this.adjustmentCheckbox1Data = new Array<any>();
    this.adjustmentCheckbox2Data = new Array<any>();

    switch (this._data.actionItemIndex) {
      case 1:
        this.viewRfvModal();
        break;
      case 2:
        this.validateRfvModal();
        break;
      case 6:
        this.generateInvoice();
        break;
    }

    const currentDate = new Date();
    // checking for April month
    if (currentDate.getMonth() === 3) {
      this.isAprilMonth = true;
      this.columnRatio = 2;
    }
  }

  /**
   * To get RFV Grid Configuration.
   */
  private getRfvGridConfiguration() {
    this.tripRfvGridConfiguration = new GridConfiguration();
    this.tripRfvGridConfiguration.css.tableFont = FortigoConstant.FONT_MEDIUM + 'px';
    this.tripRfvGridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.tripRfvGridConfiguration.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
    this.tripRfvGridConfiguration.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    this.tripRfvGridConfiguration.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.tripRfvGridConfiguration.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.tripRfvGridConfiguration.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.tripRfvGridConfiguration.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
    this.tripRfvGridConfiguration.css.fixedTableHeight = '74px';
    this.tripRfvGridConfiguration.css.tableRowHeight = TripManagementConstant.TABLE_ROW_HEIGHT;
    this.tripRfvGridConfiguration.editableFormConfiguration.css.containerMaxWidth = '100px';
  }

  /**
   * This function initializes the data values
   */
  private initializeData() {
    this.isSaved = false;
    this.isSubmit = false;
    this.isApproved = false;
    this.isApprovedAndGenerate = false;
    this.isRejected = false;
    this.formData = new Array<any>();
  }

  /**
   * Method to perform submission of all the forms.
   * @param  {Array<any>} formRef : reference of the form that is to be submitted.
   * @param  {any} event : event triggered as per user actions.
   */
  public onClick(formRef: Array<any>, event: any) {
    // initializing with default values.
    this.initializeData();
    formRef.forEach(element => {
      this.formData.push(element.submit());
    });
    this.formData.push(this.rowsDataTrip);
    this.formData.push(this._data.rowsDataAdjustments);
    this.formData.push(event);
    switch (event.toLowerCase()) {
      case TripManagementConstant.SAVE.toLowerCase():
        this.isSaved = true;
        // this.submitRequestForValidation();
        if (this.nonApprovedSelected) {
          Swal.fire({
            text: 'Unapproved adjustment for Rs.' + this.adjustmentAmountNonApproved + ' will be approved for the sale side. Any adjustments on the purchase side should be approved from the TVP page.',
            showCloseButton: true,
            showCancelButton: true
          }).then((result) => {
            if (result.value) {
              this.submitRequestForValidation();
            }
          });
        } else {
          this.submitRequestForValidation();
        }
        break;
      case TripManagementConstant.SUBMIT.toLowerCase():
        this.isSubmit = true;
        if (this.nonApprovedSelected) {
          Swal.fire({
            text: 'Unapproved adjustment for Rs.' + this.adjustmentAmountNonApproved + ' will be approved for the sale side. Any adjustments on the purchase side should be approved from the TVP page.',
            showCloseButton: true,
            showCancelButton: true
          }).then((result) => {
            if (result.value) {
              this.submitRequestForValidation();
            }
          });
        } else {
          this.submitRequestForValidation();
        }
        break;
      case TripManagementConstant.APPROVE_AND_GENERATE.toLowerCase():
        this.isApprovedAndGenerate = true;
        this.approveOrRejectValidation();
        break;
      case TripManagementConstant.APPROVE.toLowerCase():
        this.isApproved = true;
        this.approveOrRejectValidation();
        break;
      case TripManagementConstant.REJECT.toLowerCase():
        this.isRejected = true;
        this.approveOrRejectValidation();
        break;
      case TripManagementConstant.GENERATE_INVOICE.toLowerCase():
        if (this.isGenerateInvoice) {
          this.generateInvoiceOnGenerateInvoiceScreen();
        } else {
          // this.submitRequestForValidation();
          if (this.nonApprovedSelected) {
            Swal.fire({
              text: 'Unapproved adjustment for Rs.' + this.adjustmentAmountNonApproved + ' will be approved for the sale side. Any adjustments on the purchase side should be approved from the TVP page.',
              showCloseButton: true,
              showCancelButton: true
            }).then((result) => {
              if (result.value) {
                this.submitRequestForValidation();
              }
            });
          } else {
            this.submitRequestForValidation();
          }
        }
        break;
      case TripManagementConstant.CANCEL.toLowerCase():
        this.onClose();
        break;
    }
  }

  /**
   * To close the dialog
   */
  private onClose() {
    if (this.submitSentTripValidationSubscription) {
      this.submitSentTripValidationSubscription.unsubscribe();
    }
    if (this.approveSentTripValidationSubscription) {
      this.approveSentTripValidationSubscription.unsubscribe();
    }
    if (this.generateInvoiceSubscription) {
      this.generateInvoiceSubscription.unsubscribe();
    }
    this._dialogRef.close(this.formData);
  }

  /**
   * Method used to create fields for RFV Screen.
   * isReadOnly is false ie. Fields are editable.
   */
  private getFields(isReadOnly = false, isRemarksReadOnly = false) {
    const billToSelectDropDown = [
      { name: 'End Customer', action: TripManagementConstant.END_CUSTOMER, extra: 'extra' },
      { name: 'Bill To Location', action: TripManagementConstant.END_CUSTOMER_ALIAS, extra: 'extra' },
      { name: 'Consignee', action: TripManagementConstant.CONSIGNEE, extra: 'extra' },
      { name: 'Consignor', action: TripManagementConstant.CONSIGNOR, extra: 'extra' },
      { name: 'Others', action: 'others', extra: 'extra' }
    ];
    const billFromSelectDropDown = [
      { name: 'FTAPL', action: FortigoConstant.FTAPL, extra: 'extra' },
      { name: 'FNLPL', action: FortigoConstant.FNLPL, extra: 'extra' },
    ];
    const ecContractTypeSelectDropDown = [
      { name: 'Fixed', action: TripManagementConstant.FIXED_RATE, extra: 'extra' },
      { name: 'Rate per Ton', action: TripManagementConstant.RATE_PER_TON, extra: 'extra' }
    ];
    const billToValues = new SelectOption('name', 'name', billToSelectDropDown);
    const billToType = new SelectInputField('Bill To', 'billToType', billToValues, undefined, isReadOnly, {}, undefined, undefined);
    const billToAddress = new TextAreaInputField('Company Address', 'entityAddress', 12, isReadOnly, {}, undefined, undefined, undefined, undefined);
    const customerName = new TextInputField('Company Name', 'entityName', 6, isReadOnly, {}, undefined, undefined, undefined, undefined);
    const customerNameAlias = new TextInputField('Shipment Location', 'ecShipmentLocationName', 6, true, {}, undefined, undefined, undefined, undefined);
    const ecGstin = new TextInputField('GSTIN', 'gstin', 6, isReadOnly, new FortigoValidators(15, 15, true, FortigoPattern.GST_PATTERN), undefined, undefined);
    const ecStateCode = new TextInputField('State Code', 'stateCode', 6, true, {}, undefined, undefined);
    const invoiceNumberOptions = new SelectOption('invoiceNumber', 'invoiceNumber', this.invoiceNumberList !== null ? this.invoiceNumberList : []);
    const invoiceNumber = new SelectInputField('Invoice Number', 'invoiceNumber', invoiceNumberOptions, this.columnRatio, isReadOnly);
    const invoicedate = new DateInputField('Invoice Date', 'invoiceDate', this.columnRatio, true, undefined, undefined, undefined, this.invoiceNumberDate);
    const billFromValues = new SelectOption('name', 'action', billFromSelectDropDown);

    const billFrom = new SelectInputField('Bill From', 'billFrom', billFromValues, 2, isReadOnly, {}, undefined, undefined, this.billFromValue);
    const prevYear = new CheckBoxInputField('Previous Year', 'prevYear', 2, isReadOnly, {}, undefined, 1, isReadOnly);
    const isgstApplicableReadOnly = this.isFTAPL ? true : isReadOnly;
    // Gst Applicable Validation.
    const gstApplicable = new CheckBoxInputField('GST Applicable', 'gstApplicable', 2, isgstApplicableReadOnly, {}, undefined, 1, this.gstApplicable);
    let isUnRegGstFlagEnabled = false;
    // If gstin is there then disable UnRegGst.
    if (this.isGSTIN) {
      isUnRegGstFlagEnabled = true;
    }
    const unregesteredDestination = new CheckBoxInputField('Unregistered GST', 'unregesteredDestination', 2, isReadOnly || isUnRegGstFlagEnabled, {}, undefined, 1, this.unRegGstFlag);
    const kindAttention = new TextInputField('Kind Attention', 'kindAttention', 3, isReadOnly, {}, undefined, undefined, this.kindAttention);
    const ecContractTypeValues = new SelectOption('name', 'action', ecContractTypeSelectDropDown);
    const ecContractType = new SelectInputField('EC Contract Type', 'ecContractType', ecContractTypeValues, 3, true, {}, undefined, undefined, this.ecContractType);
    this.cusReferenceData = [kindAttention, ecContractType];
    if (this.invoiceCustomerReferenceList) {
      this.invoiceCustomerReferenceList.forEach((customerRef: any) => {
        this.cusReferenceData.push(new TextInputField(this.generatePlaceholder(customerRef['name']), customerRef['name'], 3, isReadOnly, {}, undefined, undefined, customerRef['value']));
      });
    }
    const consigneeName = new TextInputField('Consignee Name', 'entityName', undefined, isReadOnly);
    const consigneeAddress = new TextAreaInputField('Consignee Address', 'entityAddress', undefined, isReadOnly);
    const consigneeGSTIN = new TextInputField('GSTIN', 'gstin', 6, isReadOnly, undefined, undefined, undefined, undefined, undefined);
    const consigneeStateCode = new TextInputField('State Code', 'stateCode', 6, true);
    const consignorName = new TextInputField('Consignor Name', 'entityName', undefined, isReadOnly);
    const consignorAddress = new TextAreaInputField('Consignor Address', 'entityAddress', undefined, isReadOnly);
    const consignorGSTIN = new TextInputField('GSTIN', 'gstin', 6, isReadOnly, undefined, undefined, undefined, undefined, undefined);
    const consignorStateCode = new TextInputField('State Code', 'stateCode', 6, true);
    const remarks = new TextAreaInputField('Remarks', 'remarks', 12, isRemarksReadOnly, new FortigoValidators(undefined, 2000, undefined, undefined, undefined, true), undefined, undefined, this.remarks);
    this.invoiceGstData = [invoiceNumber, invoicedate, billFrom];
    if (!this.isGenerateInvoice) {
      // Add this field only in April month.
      if (this.isAprilMonth) {
        this.invoiceGstData.push(prevYear);
      }
      this.invoiceGstData.push(gstApplicable);
      this.invoiceGstData.push(unregesteredDestination);
    }
    this.filterFieldsCustomer =
      [billToType, customerName, customerNameAlias, billToAddress, ecGstin, ecStateCode];
    this.filterFieldsConsignee =
      [consigneeName, consigneeAddress, consigneeGSTIN, consigneeStateCode];
    this.filterFieldsConsignor =
      [consignorName, consignorAddress, consignorGSTIN, consignorStateCode];

    this.remarksData = [remarks];
  }

  /**
   * Method used to perform actions on change of Select Drop Down.
   * @param  {any} input : the changes done by user.
   */
  public onInputChanges(input: any, formRef: ElementRef) {
    // TODO check for input changes with input name
    if (formRef['data'] && Object.getOwnPropertyNames(formRef['data']).toString().includes('gstin')) {
      this.isGSTIN = input.value;
      this.updateUnregisteredGST();
      this.gstType = this.checkGSTType();
    } else {
      this.remarks = input.value;
    }
  }

  private setGSTFlag(gstApplicable: boolean) {
    const tempData: Array<any> = <Array<any>>Util.getObjectCopy(this._data.rowsDataAdjustments);
    this._data.rowsDataAdjustments = null;
    tempData.forEach((eachData) => {
      if (this.billFromValue === FortigoConstant.FNLPL.toLowerCase()) {
        eachData['isTaxApplicable'] = gstApplicable;
        eachData.itemAmountDetails.forEach((eachItemAmountDetails: any) => {
          eachItemAmountDetails.isTaxApplicable = gstApplicable;
        });
        this.updateGSTRateAmountTotalValue(eachData, gstApplicable);
        eachData[this.adjustmentsGridConfiguration.checkbox2IsDisabledColumnDef] = false;
      }
      eachData[this.adjustmentsGridConfiguration.checkbox2ColumnDef] = gstApplicable;
      eachData[this.adjustmentsGridConfiguration.checkbox2IsDisabledColumnDef] = this.isFTAPL;
    });
    if (gstApplicable) {
      this.adjustmentCheckbox2Data = <Array<any>>Util.getObjectCopy(tempData);
    } else {
      this.adjustmentCheckbox2Data = new Array<any>();

    }
    this._data.rowsDataAdjustments = tempData;
    this.rowsDataAdjustments = <Array<any>>Util.getObjectCopy(this._data.rowsDataAdjustments);
  }

  /**
   * For updating GST Value
   * @param  {} eachData
   * @param  {} gstApplicable
   */
  private updateGSTRateAmountTotalValue(eachData, gstApplicable) {
    switch (this.gstType) {
      case 'CGST_SGST':
        if (gstApplicable) {
          eachData.cgstRate = 6;
          eachData.sgstRate = 6;
        } else {
          eachData.cgstRate = 0;
          eachData.sgstRate = 0;
        }
        eachData.sgstAmount = Number.parseFloat(eachData.baseAmount) * Number.parseInt(eachData.sgstRate) / 100;
        eachData.cgstAmount = Number.parseFloat(eachData.baseAmount) * Number.parseInt(eachData.cgstRate) / 100;
        eachData.itemTotal = Number.parseFloat(eachData.baseAmount) + Number.parseFloat(eachData.cgstAmount);
        break;
      case 'IGST':
        if (gstApplicable) {
          eachData.igstRate = 12;
        } else {
          eachData.igstRate = 0;
        }
        eachData.igstAmount = Number.parseFloat(eachData.baseAmount) * Number.parseInt(eachData.igstRate) / 100;
        eachData.itemTotal = Number.parseFloat(eachData.baseAmount) + Number.parseFloat(eachData.igstAmount);
        break;
      default:
        break;
    }
    eachData.isTaxApplicable = gstApplicable;
  }

  /**
   * Method used to perform actions on change of Select Drop Down.
   * @param  {any} input : the changes done by user.
   */
  public onSelectChanges(input: any) {
    if (input.name === 'invoiceNumber') {
      this.updateInvNoAndDate(input);
    }
    if (typeof (input.value) === 'boolean') {
      if (input.name === 'gstApplicable') {
        this.setGSTFlag(input.value);
      }
      return;
    }
    switch (input.value.toLowerCase()) {
      case TripManagementConstant.CONSIGNEE.toLowerCase():
        this.updateCustomerDetailsForm(input, this.consigneeForm);
        if (this._data.tripValueFormData[TripManagementConstant.CONSIGNEE_DETAILS_KEY]['entityId'] === 0) {
          this.entityId = this._data.tripValueFormData[TripManagementConstant.CONSIGNEE_DETAILS_KEY]['entityId'];
        } else {
          this.entityId = this._data.tripValueFormData[TripManagementConstant.CONSIGNEE_DETAILS_KEY]['entityId'] ? this._data.tripValueFormData[TripManagementConstant.CONSIGNEE_DETAILS_KEY]['entityId'] : '';
        }
        break;
      case TripManagementConstant.CONSIGNOR.toLowerCase():
        this.updateCustomerDetailsForm(input, this.consignorForm);
        if (this._data.tripValueFormData[TripManagementConstant.CONSIGNOR_DETAILS_KEY]['entityId'] === 0) {
          this.entityId = this._data.tripValueFormData[TripManagementConstant.CONSIGNOR_DETAILS_KEY]['entityId'];
        } else {
          this.entityId = this._data.tripValueFormData[TripManagementConstant.CONSIGNOR_DETAILS_KEY]['entityId'] ? this._data.tripValueFormData[TripManagementConstant.CONSIGNOR_DETAILS_KEY]['entityId'] : '';
        }
        break;
      case TripManagementConstant.END_CUSTOMER.toLowerCase():
        this.updateInvoicedBillToDetails(input, TripManagementConstant.END_CUSTOMER_KEY);
        break;
      case TripManagementConstant.END_CUSTOMER_ALIAS.toLowerCase():
        this.updateInvoicedBillToDetails(input, TripManagementConstant.END_CUSTOMER_ALIAS_KEY);
        break;
      case TripManagementConstant.OTHERS.toLowerCase():
        this.updateInvoicedBillToDetails(input, TripManagementConstant.OTHERS_KEY);
        break;
      case FortigoConstant.FNLPL.toLowerCase():
        this.gstApplicable = true;
        this.billFromValue = input.value;
        this._data.tripValueFormData.billFromCompanyId = FortigoConstant.FNLPL_COMPANY_ID;
        this.isFTAPL = false;
        this.updateInvoiceGstData(input.value, false);
        this.gstType = this.checkGSTType();
        this.setGSTFlag(true);
        break;
      case FortigoConstant.FTAPL.toLowerCase():
        this.gstApplicable = false;
        this.isFTAPL = true;
        this.gstType = this.checkGSTType();
        this.setGSTFlag(false);
        this.billFromValue = input.value;
        this._data.tripValueFormData.billFromCompanyId = FortigoConstant.FTAPL_COMPANY_ID;
        this.updateInvoiceGstData(input.value, true);

        const tempData2: Array<any> = <Array<any>>Util.getObjectCopy(this._data.rowsDataAdjustments);
        this._data.rowsDataAdjustments = null;
        tempData2.forEach((eachDataAdjustment) => {
          eachDataAdjustment[this.adjustmentsGridConfiguration.checkbox2IsDisabledColumnDef] = true;
          eachDataAdjustment[this.adjustmentsGridConfiguration.checkbox2ColumnDef] = false;
        });
        this._data.rowsDataAdjustments = tempData2;

        break;
      case TripManagementConstant.FIXED_RATE.toLowerCase():
      case TripManagementConstant.RATE_PER_TON.toLowerCase():
        this.rowsDataTrip = [];
        this.getUpdatedColumnsTripRfvScreen(input.value.toLowerCase());
        this.rowsDataTrip = this._data.rowsDataTrip;
        break;
    }
  }

  /**
   * To update Invoice GST Data.
   * @param  {string} inputValue: Value from user.
   * @param  {boolean} isGstApplicableReadOnly: is GstApplicable ReadOnly or not
   */
  private updateInvoiceGstData(inputValue: string, isGstApplicableReadOnly: boolean) {
    this.updateChanges = [{
      name: 'billFrom',
      value: inputValue
    }, {
      name: 'gstApplicable',
      value: this.gstApplicable,
    }];
    if (this.invoiceGstData[3] && this.invoiceGstData[3].name === 'gstApplicable') {
      this.invoiceGstData[3].isReadOnly = isGstApplicableReadOnly;
    } else if (this.invoiceGstData[4] && this.invoiceGstData[4].name === 'gstApplicable') {
      this.invoiceGstData[4].isReadOnly = isGstApplicableReadOnly;
    }
    const invoiceFieldData = Util.getObjectCopy(this.invoiceGstData);
    this.invoiceGstData = [];
    this.invoiceGstData = <Array<any>>invoiceFieldData;
  }

  /**
   * To update invoice no and date as per invoice no entered by user.
   * @param  {any} input: invoice number
   */
  private updateInvNoAndDate(input: any) {
    if (this.invoiceNumberList) {
      this.invoiceNumberList.forEach((eachInvoiceNumber) => {
        if (eachInvoiceNumber.invoiceNumber === input.value.toString()) {
          this.invoiceNumberDate = new Date(eachInvoiceNumber.invoiceNumberDate.toString());
        }
      });
    }
    this.updateChanges = [{
      name: 'invoiceNumber',
      value: input.value
    }, {
      name: 'invoiceDate',
      value: this.invoiceNumberDate
    }];
  }

  /**
   * To Update Invoiced BillTo Details as per selection made by user.
   * @param  {any} input: Input Selected
   * @param  {string} selectedBillTo: BillTo selected
   */
  private updateInvoicedBillToDetails(input: any, selectedBillTo: string) {
    this.isGSTIN = this._data.tripValueFormData[selectedBillTo] && this._data.tripValueFormData[selectedBillTo]['gstin'] ? this._data.tripValueFormData[selectedBillTo]['gstin'].trim() : '';
    if (this._data.tripValueFormData[selectedBillTo] && this._data.tripValueFormData[selectedBillTo]['entityId'] === 0) {
      this.entityId = this._data.tripValueFormData[selectedBillTo]['entityId'];
    } else {
      this.entityId = this._data.tripValueFormData[selectedBillTo] && this._data.tripValueFormData[selectedBillTo]['entityId'] ? this._data.tripValueFormData[selectedBillTo]['entityId'].toString().trim() : '';
    }
    this.stateCode = this._data.tripValueFormData[selectedBillTo] && this._data.tripValueFormData[selectedBillTo]['stateCode'] ? this._data.tripValueFormData[selectedBillTo]['stateCode'].toString().trim() : '';
    this.updateChanges = [{
      name: 'billToType',
      value: input.value
    }, {
      name: 'entityName',
      value: this._data.tripValueFormData[selectedBillTo] && this._data.tripValueFormData[selectedBillTo]['entityName'] && this._data.tripValueFormData[selectedBillTo]['entityName'] !== null ? this._data.tripValueFormData[selectedBillTo]['entityName'].trim() : ''
    }, {
      name: 'entityAddress',
      value: this._data.tripValueFormData[selectedBillTo] && this._data.tripValueFormData[selectedBillTo]['entityAddress'] && this._data.tripValueFormData[selectedBillTo]['entityAddress'] !== null ? this._data.tripValueFormData[selectedBillTo]['entityAddress'].trim() : ''
    }, {
      name: 'gstin',
      value: this._data.tripValueFormData[selectedBillTo] && this._data.tripValueFormData[selectedBillTo]['gstin'] && this._data.tripValueFormData[selectedBillTo]['gstin'] !== null ? this._data.tripValueFormData[selectedBillTo]['gstin'].trim() : ''
    }, {
      name: 'stateCode',
      value: this._data.tripValueFormData[selectedBillTo] && this._data.tripValueFormData[selectedBillTo]['stateCode'] && this._data.tripValueFormData[selectedBillTo]['stateCode'] !== null ? this._data.tripValueFormData[selectedBillTo]['stateCode'].trim() : ''
    }];
    this.updateUnregisteredGST();

  }

  /**
   * TO update unregistered gst
   */
  private updateUnregisteredGST() {
    const unregesteredDestinationField = this.invoiceGstData.filter((eachField) => {
      return eachField.name === 'unregesteredDestination';
    })[0];

    if (this.isGSTIN) {
      unregesteredDestinationField.isReadOnly = true;
      unregesteredDestinationField.defaultValue = false;
    } else {
      unregesteredDestinationField.isReadOnly = false;
      unregesteredDestinationField.defaultValue = true;
    }
    this.invoiceGstData = <Array<any>>Util.getObjectCopy(this.invoiceGstData);
  }

  /**
   * Used to update customer form with consignee or consignor form.
   * @param  {any} input : input from select dropdown of billTo.
   * @param  {any} form : form by which the customer form should be updated.
   */
  private updateCustomerDetailsForm(input: any, form?: ElementRef) {
    this.updateChanges = [{
      name: 'billToType',
      value: input.value
    }, {
      name: 'entityName',
      value: form['data']['entityName'] && form['data']['entityName'] !== null ? form['data']['entityName'].trim() : ''
    }, {
      name: 'entityAddress',
      value: form['data']['entityAddress'] && form['data']['entityAddress'] !== null ? form['data']['entityAddress'].trim() : ''
    }, {
      name: 'gstin',
      value: form['data']['gstin'] && form['data']['gstin'] !== null ? form['data']['gstin'].trim() : ''
    }, {
      name: 'stateCode',
      value: form['data']['stateCode'] && form['data']['stateCode'] !== null ? form['data']['stateCode'].trim() : ''
    }];
    this.isGSTIN = form['data']['gstin'] && form['data']['gstin'] !== null ? form['data']['gstin'].trim() : '';
    this.stateCode = form['data']['stateCode'] && form['data']['stateCode'] !== null ? form['data']['stateCode'].trim() : '';
    this.updateUnregisteredGST();
  }

  /**
   * For generating keys for billFrom entities.
   */
  private createBillFromKey() {
    // FIXME Add it in constant file once the billfrom value is fixed.
    if (this.billFromValue && (this.billFromValue.includes(FortigoConstant.FTAPL_VALUE) || this.billFromValue.includes('(FTAPL) Fortigo Transport Agency Pvt. Ltd'))) {
      this.billFromValue = FortigoConstant.FTAPL;
      this.isFTAPL = true;
    } else if (this.billFromValue && (this.billFromValue.includes(FortigoConstant.FNLPL_VALUE) || this.billFromValue.includes('FNLPL Net Partner'))) {
      this.billFromValue = FortigoConstant.FNLPL;
    }
  }

  /**
   * Method to view RFV Data.
   */
  private viewRfvModal() {
    this.rfvViewSubscription = this._tripService.requestForTripValidation(this._data.tripValidationData).subscribe((response) => {
      if (response) {
        if (response['errorMessage']) {
          Swal.fire('Error', response['errorMessage'], 'error');
          this._dialogRef.close();
        } else {
          // Used to make 'charged Weight' field editable in case of 'rate_per_tone'
          if (response['ecContractType'] === TripManagementConstant.RATE_PER_TON.toLowerCase() && this.mode !== 'readOnly') {
            this.columnsDataTrip.forEach((eachColumn) => {
              if (eachColumn.columnDef === 'chargedWeight') {
                eachColumn.action = 'edit';
                eachColumn.editFieldType = FieldTypes.NumberInput;
              }
            }
            );
            this.columnsDataAdjustments.forEach((eachColumn) => {
              if (eachColumn.columnDef === 'baseAmount') {
                eachColumn.action = undefined;
              }
            });
          }

          this.billFromGSTIN = response.billFromGSTIN;
          // ends here
          this.settingRfvData(response);
          this.responseTripData = <any>Util.getObjectCopy(response);
          this.rowsAdjustmentData = this.responseTripData['listOfinvoiceItemDetails'];
          this.rowsTripData = this.responseTripData['tripItemDetails'];
          const isReadOnlyForm = this.roleId === RoleId.FORTIGO_READ_ONLY_USER;
          this.isToPayTripType = false;
          if (response.toPay) {
            this.isToPayTripType = response.toPay.toLowerCase() === 'to pay';
          }
          this.getFields(isReadOnlyForm, isReadOnlyForm);
          this.buttons = this._data.buttons;
        }
      }
    });

    if (RoleId.FORTIGO_FINANCE_ROLES.includes(this.roleId) && this.mode !== 'readOnly') {
      const gcnNoColumn = this.columnsDataTrip.filter(eachColumnData => eachColumnData.columnDef === 'gcn')[0];
      gcnNoColumn['action'] = 'edit';
      gcnNoColumn['editFieldType'] = FieldTypes.TextInput;
    }
  }

  /**
   * setting Rfv Data.
   */
  private settingRfvData(response: any) {
    this.rowsDataAdjustments = this._data.rowsDataAdjustments;

    this.invoiceNumberList = response['invoiceNumberList'];
    this.invoiceCustomerReferenceNumber = response['invoiceCustomerReferenceNumber'] ? response['invoiceCustomerReferenceNumber'] : [];
    this.invoiceRequestedData = response['invoiceRequestedData'] ? response['invoiceRequestedData'] : [];
    this.invoiceCustomerReferenceList = this.invoiceCustomerReferenceNumber.concat(this.invoiceRequestedData);
    this.remarks = response['remarks'] !== null ? response['remarks'] : '';
    this._data.tripValueFormData = response;
    this._data.tripValueFormData.invoicedBillToDetails['billToType'] = response['billToType'];
    // Added ec shipment location name
    this._data.tripValueFormData.invoicedBillToDetails['ecShipmentLocationName'] = response['ecShipmentLocationName'];
    this.isGSTIN = this._data.tripValueFormData.invoicedBillToDetails['gstin'];
    this.entityId = this._data.tripValueFormData.invoicedBillToDetails['entityId'];
    this.stateCode = this._data.tripValueFormData.invoicedBillToDetails['stateCode'];
    this.billFromValue = this._data.tripValueFormData.billFrom;
    this.gstApplicable = this._data.tripValueFormData.gstApplicable ? true : false;
    this.unRegGstFlag = this._data.tripValueFormData.unregesteredDestination ? true : false;
    this.ecContractType = this._data.tripValueFormData.ecContractType;
    this.kindAttention = this._data.tripValueFormData.kindAttention;
    this.createBillFromKey();
    this._data.rowsDataTrip = new Array<any>();
    this._data.rowsDataTrip.push(response.tripItemDetails);
    this.rowsDataTrip = this._data.rowsDataTrip;
    this.initialChargedWeight = Util.getObjectCopy(response.tripItemDetails)['chargedWeight'];
    this.initialRowAdjData = <Array<any>>Util.getObjectCopy(response['listOfinvoiceItemDetails']);
    this.processAdjustmentData(response['listOfinvoiceItemDetails']);
  }

  /**
   * To Submit request for validation.
   */
  private submitRequestForValidation() {
    const responseTripData = this.responseTripData;
    if (this.formData && this.formData.length > 0) {
      const rfvFormdata = this.formData;
      if (rfvFormdata && rfvFormdata[8]) {
        responseTripData.action = rfvFormdata[8] ? rfvFormdata[8].toString() : '';
        if (responseTripData.action) {

          responseTripData.action = responseTripData.action.toString().toLowerCase();

          if (responseTripData.action === TripManagementConstant.GENERATE_INVOICE.toLowerCase()) {
            responseTripData.action = 'generate';
          }
          // generating invoiceCustomerReferenceNumber Array of fields and values.
          if (this.invoiceCustomerReferenceNumber && this.invoiceCustomerReferenceNumber.length > 0) {
            responseTripData.invoiceCustomerReferenceNumber = [];
            this.invoiceCustomerReferenceList.forEach(customerReference => {
              if (customerReference && customerReference.name) {
                customerReference.value = rfvFormdata[4][customerReference.name];
                responseTripData.invoiceCustomerReferenceNumber.push(customerReference);
              }
            });
          }
          // generating invoiceRequestedData Array of fields and values.
          if (this.invoiceRequestedData && this.invoiceRequestedData.length > 0) {
            responseTripData.invoiceRequestedData = [];
            this.invoiceRequestedData.forEach(requestedData => {
              if (requestedData && requestedData.name) {
                requestedData.value = rfvFormdata[4][requestedData.name];
                responseTripData.invoiceRequestedData.push(requestedData);
              }
            });
          }
          const doSubmit = this.validateAdjustmentData(responseTripData, rfvFormdata);
          const requestObject = this.createRequestObjectRfv(responseTripData, rfvFormdata);
          if (doSubmit) {
            this.submitRfv(requestObject, responseTripData);
          }
        }
      }
    }
  }

  /**
   * To create Request Object for Rfv Screen while Submit/Save/Generate Action.
   * @param  {any} responseTripData: responseTripData
   * @param  {Array<any>} rfvFormdata: rfvFormdata
   */
  private createRequestObjectRfv(responseTripData: any, rfvFormdata: Array<any>) {
    responseTripData.unregesteredDestination = rfvFormdata[0].unregesteredDestination;
    responseTripData.gstApplicable = rfvFormdata[0].gstApplicable;
    responseTripData.billFrom = rfvFormdata[0].billFrom;
    responseTripData.ecContractType = this.ecContractType;
    responseTripData.remarks = rfvFormdata[5].remarks;
    responseTripData.tripItemDetails = this.rowsTripData;
    responseTripData.invoicedBillToDetails = rfvFormdata[1];
    responseTripData.invoicedBillToDetails.entityId = this.entityId;
    responseTripData.invoicedBillToDetails.stateCode = this.stateCode;
    responseTripData.consigneeDetails = rfvFormdata[2];
    responseTripData.consignorDetails = rfvFormdata[3];
    responseTripData.billToType = rfvFormdata[1].billToType;
    responseTripData.billFromCompanyId = this._data.tripValueFormData.billFromCompanyId;
    responseTripData.kindAttention = rfvFormdata[4].kindAttention;
    delete responseTripData.invoicedBillToDetails.billToType;
    //  Updating fields as per changes done by user.
    const requestObject = { 'trip_invoice_validation_details': responseTripData };
    return requestObject;
  }

  /**
   * To validate Adjustment Data.
   * @param  {any} responseTripData : responseTripData
   */
  private validateAdjustmentData(responseTripData: any, rfvFormdata: any) {
    let doSubmit = true;
    this.applyCheckboxData(this.rowsAdjustmentData);
    responseTripData.listOfinvoiceItemDetails = <Array<any>>Util.getObjectCopy(this.rowsDataAdjustments);
    // updated by ritesh
    responseTripData.listOfinvoiceItemDetails.forEach((eachItem) => {
      if (eachItem.description.toString().toLowerCase().trim() === 'freight') {
        eachItem.itemAmountDetails.forEach((eachAmount) => {
          eachAmount.baseAmount = eachItem.baseAmount;
          eachAmount.isTaxApplicable = eachItem.isTaxApplicable;
          this.setTaxAmountAndPercent(eachAmount, eachItem);
          eachAmount.finalAmount = Number.parseFloat(eachItem.baseAmount) + Number.parseFloat(eachItem.taxAmount);

        });
      } else {
        eachItem.itemAmountDetails.forEach((eachAmount) => {
          eachAmount.isTaxApplicable = eachItem.isTaxApplicable;
          this.setTaxAmountAndPercent(eachAmount, eachItem);
          eachAmount.finalAmount = Number.parseFloat(eachItem.baseAmount) + Number.parseFloat(eachItem.taxAmount);
        });
      }


      this.deleteUnusedReferences(eachItem);
    }
    );
    //@TODO @Ritesh remove this after implementing swal in abobe logic

    // if (responseTripData && responseTripData.listOfinvoiceItemDetails && isArray(responseTripData.listOfinvoiceItemDetails)) {
    //   responseTripData.listOfinvoiceItemDetails.forEach((adjustmentData: any) => {
    //     if (adjustmentData['baseAmount']) {
    //       adjustmentData.itemAmountDetails.forEach((eachData) => {
    //         console.log(+eachData['baseAmount'] >= +adjustmentData['baseAmount']);
    //         if (+eachData['baseAmount'] >= +adjustmentData['baseAmount']) {
    //           eachData['baseAmount'] = +adjustmentData['baseAmount'];
    //         } else {
    //           Swal.fire('Warning', 'Supply value should not exceed the given value', 'warning');
    //           // Since the Supply value entered is greater than the given value so stopping to save / submit/ generate.
    //           doSubmit = false;
    //         }
    //       });
    //     }
    //     // deleting temporary fields.
    //     this.deleteUnusedReferences(adjustmentData);
    //   });
    // }
    return doSubmit;
  }

  /**
   * For setting tax amount and rate.
   * @param  {any} taxType
   * @param  {any} eachItem
   */
  private setTaxAmountAndPercent(eachAmount: any, eachItem: any) {
    switch (eachAmount.taxType) {
      case 'CGST':
        eachAmount.taxAmount = eachItem.cgstAmount ? eachItem.cgstAmount : eachAmount.taxAmount;
        eachAmount.taxPercent = eachItem.cgstRate ? eachItem.cgstRate : eachAmount.taxPercent;
        break;
      case 'SGST':
        eachAmount.taxAmount = eachItem.sgstAmount ? eachItem.sgstAmount : eachAmount.taxAmount;
        eachAmount.taxPercent = eachItem.sgstRate ? eachItem.sgstRate : eachAmount.taxPercent;
        break;
      case 'IGST':
        eachAmount.taxAmount = eachItem.igstAmount ? eachItem.igstAmount : eachAmount.taxAmount;
        eachAmount.taxPercent = eachItem.igstRate ? eachItem.igstRate : eachAmount.taxPercent;
        break;
      default:
        break;
    }
  }

  /**
   * This function applies checkbox data to payload object
   * @param  {Array<any>} rowsAdjustmentData: payload object
   */
  private applyCheckboxData(rowsAdjustmentData: Array<any>) {
    if (rowsAdjustmentData && Array.isArray(rowsAdjustmentData)) {
      // resetting data
      rowsAdjustmentData.forEach((eachData) => {
        if (this.adjustmentCheckbox1Data.length > 0) {
          eachData.selected = false;
        }
        if (this.adjustmentCheckbox2Data.length > 0) {
          eachData.isTaxApplicable = false;
          eachData.itemAmountDetails.forEach((eachItemAmountDetails: any) => {
            eachItemAmountDetails.isTaxApplicable = false;
          });
        }
      });
      // applying data from checkbox
      rowsAdjustmentData.forEach((eachData) => {
        if (this.adjustmentCheckbox1Data && Array.isArray(this.adjustmentCheckbox1Data)) {
          this.adjustmentCheckbox1Data.forEach((eachCheckboxData) => {
            if (eachData.subServiceReferenceId && eachCheckboxData.subServiceReferenceId && (eachData.subServiceReferenceId.toLowerCase() === eachCheckboxData.subServiceReferenceId.toLowerCase())) {
              eachData.selected = true;
            }
          });
        }
        if (this.adjustmentCheckbox2Data && Array.isArray(this.adjustmentCheckbox2Data)) {
          this.adjustmentCheckbox2Data.forEach((eachCheckboxData) => {
            if (eachData.subServiceReferenceId && eachCheckboxData.subServiceReferenceId && (eachData.subServiceReferenceId.toLowerCase() === eachCheckboxData.subServiceReferenceId.toLowerCase())) {
              eachData.isTaxApplicable = true;
              if (eachData.itemAmountDetails && Array.isArray(eachData.itemAmountDetails)) {
                eachData.itemAmountDetails.forEach((eachItemAmountDetails) => {
                  eachItemAmountDetails.isTaxApplicable = true;
                });
              }
            }
          });
        }
      });
    }
  }

  /**
   * To submit Request for Validation screen.
   * @param  {{'trip_invoice_validation_details':any;}} requestObject : requestObject
   * @param  {any} responseTripdata :responseTripdata
   */
  private submitRfv(requestObject: { 'trip_invoice_validation_details': any; }, responseTripdata: any) {
    this.tripRfvGridConfiguration.showLoader = true;
    // trimming whitespaces
    if (requestObject && requestObject.trip_invoice_validation_details && requestObject.trip_invoice_validation_details.invoicedBillToDetails && requestObject.trip_invoice_validation_details.invoicedBillToDetails.entityAddress && Util.isString(requestObject.trip_invoice_validation_details.invoicedBillToDetails.entityAddress)) {
      requestObject.trip_invoice_validation_details.invoicedBillToDetails.entityAddress = requestObject.trip_invoice_validation_details.invoicedBillToDetails.entityAddress.trim();
    }
    // changing the date format
    // ANCHOR Ritesh remove hardcoded date format
    requestObject['trip_invoice_validation_details']['tripItemDetails']['gcnDate'] = this._datePipe.transform(requestObject['trip_invoice_validation_details']['tripItemDetails']['gcnDate'], 'yyyy-MM-dd');
    this.submitSentTripValidationSubscription = this._tripService.submitSentTripValidation(requestObject).subscribe((response) => {
      if (response) {
        if (response['response']) {
          this.formData.push('success');
          if (responseTripdata.action !== TripManagementConstant.SAVE.toLowerCase()) {
            if (responseTripdata.action.toLowerCase() === 'generate') {
              this.swalGenerateInvoice(response);
            } else {
              Swal.fire('Success', response['response'].toString(), 'success');
            }
            this._tripService.refresh.next();
          } else {
            Swal.fire('Success', response['response'].toString(), 'success');
            this.viewRfvModal();
          }
        } else {
          if (response['errorMessage']) {
            Swal.fire('Error', response['errorMessage'].toString(), 'error');
            if (responseTripdata.action === TripManagementConstant.SAVE.toLowerCase()) {
              this.viewRfvModal();
            }
          }
        }
      } else {
        Swal.fire('Error', 'error');
      }
      this.nonApprovedSelected = false;
      this.adjustmentAmountNonApproved = 0;
      this.tripRfvGridConfiguration.showLoader = false;
      if (!this.isSaved) {
        this.onClose();
      }
    });
  }

  /**
   * To show pop up and download option for invoice.
   * @param  Object response : response
   */
  private swalGenerateInvoice(response: Object) {
    Swal.fire({
      title: response['response'].toString(),
      type: 'success',
      html: '<button type="button" class="swal2-styled swal2-confirm">Download</button>',
      showCloseButton: true,
      showConfirmButton: false,
      onBeforeOpen: () => {
        Swal.getContent().querySelector('button').addEventListener('click', () => {
          Swal.getContent().querySelector('button').style.display = 'none';
          Swal.showLoading();
          const encodedInvoiceNumber = btoa(response['invoice_number'].toString());
          this.downloadInvoicePDFSubscription = this._tripService.downloadInvoicePDF(encodedInvoiceNumber).subscribe((downloadResponse) => {
            this.saveToFileSystem(downloadResponse);
            Swal.close();
          });
        });
      }
    });
  }

  /**
   * To delete unused references.
   * @param  {any} adjustmentData :adjustmentData
   */
  private deleteUnusedReferences(adjustmentData: any) {
    delete adjustmentData['baseAmount'];
    delete adjustmentData['igstRate'];
    delete adjustmentData['igstAmount'];
    delete adjustmentData['cgstRate'];
    delete adjustmentData['cgstAmount'];
    delete adjustmentData['sgstRate'];
    delete adjustmentData['sgstAmount'];
    delete adjustmentData['baseAmount'];
    delete adjustmentData['isTaxApplicable'];
    delete adjustmentData['discount'];
    delete adjustmentData['taxAmount'];
    delete adjustmentData['baseAmount_isReadOnly'];
    delete adjustmentData['checkbox1Disable'];
    delete adjustmentData['checkbox2Disable'];
  }

  /**
   * Method for validation purpose.
   */
  private validateRfvModal() {
    this.buttons = [{ name: TripManagementConstant.APPROVE, icon: 'check', isDisabled: true }, { name: TripManagementConstant.REJECT, icon: 'close', isDisabled: true }];
    this.rfvViewSubscription = this._tripService.requestForTripValidation(this._data.tripValidationData).subscribe((response) => {
      if (response) {
        if (response['errorMessage']) {
          Swal.fire('Error', response['errorMessage'], 'error');
          this._dialogRef.close();
        } else {
          // To Decouple the references.
          const listOfinvoiceItemDetails = Util.getObjectCopy(response.listOfinvoiceItemDetails);
          this._data.tripValueFormData = response;
          this.remarks = response['remarks'] !== null ? response['remarks'] : '';
          this.invoiceCustomerReferenceNumber = response['invoiceCustomerReferenceNumber'] ? response['invoiceCustomerReferenceNumber'] : [];
          this.invoiceRequestedData = response['invoiceRequestedData'] ? response['invoiceRequestedData'] : [];
          this.invoiceCustomerReferenceList = this.invoiceCustomerReferenceNumber.concat(this.invoiceRequestedData);
          this._data.tripValueFormData.invoicedBillToDetails['billToType'] = response['billToType'];
          this.billFromValue = this._data.tripValueFormData.billFrom;
          this.gstApplicable = this._data.tripValueFormData.gstApplicable ? true : false;
          this.unRegGstFlag = this._data.tripValueFormData.unregesteredDestination ? true : false;
          this.createBillFromKey();
          this.ecContractType = this._data.tripValueFormData.ecContractType;
          this.rowsDataTrip = new Array<any>();
          this.rowsDataTrip.push(response.tripItemDetails);
          this.processAdjustmentData(listOfinvoiceItemDetails, true);
          this.getFields(true);
          this.buttons = this._data.buttons;
        }
      }
    });
  }

  /**
   * To Approve or Reject the validation.
   */
  private approveOrRejectValidation() {
    const rfvFormdata = this.formData;
    if (rfvFormdata[8]) {
      if (rfvFormdata[8] === TripManagementConstant.APPROVE || rfvFormdata[8] === TripManagementConstant.APPROVE_AND_GENERATE) {
        this.tripRfvGridConfiguration.showLoader = true;

        const payload = Util.getObjectCopy(this._data.tripValidationData);
        payload['remarks'] = this.remarks;

        switch (rfvFormdata[8]) {
          case TripManagementConstant.APPROVE_AND_GENERATE:
            payload['action'] = 'generate_action';
            break;
          case TripManagementConstant.APPROVE:
            payload['action'] = 'approve_action';
            break;
          default:
            break;
        }

        this.approveSentTripValidationSubscription = this._tripService.approveSentTripValidation(payload).subscribe((response) => {
          if (response) {
            if (response['response']) {
              this.formData.push('success');
              if (payload['action'] === 'generate_action') {
                this.swalGenerateInvoice(response);
              } else {
                Swal.fire('Success', response['response'].toString(), 'success');
              }
              this._tripService.refresh.next();
            } else {
              Swal.fire('Error', response['errorMessage'].toString(), 'error');
            }
          } else {
            Swal.fire('Error');
          }
          this.tripRfvGridConfiguration.showLoader = false;
          this.onClose();
        });
      }
      if (rfvFormdata[8] === TripManagementConstant.REJECT) {
        if (this.remarks === '') {
          Swal.fire('Error', 'Please enter remarks', 'error');
          return;
        }
        this.tripRfvGridConfiguration.showLoader = true;
        const payload = Util.getObjectCopy(this._data.tripValidationData);
        payload['remarks'] = this.remarks;
        this.rejectSentTripValidationSubscription = this._tripService.rejectSentTripValidation(payload).subscribe((response) => {
          if (response) {
            if (response['response']) {
              this.formData.push('success');
              Swal.fire('Success', response['response'].toString(), 'success');
              this._tripService.refresh.next();
            } else {
              Swal.fire('Error', response['errorMessage'].toString(), 'error');
            }
          } else {
            Swal.fire('Error');
          }
          this.tripRfvGridConfiguration.showLoader = false;
          this.onClose();
        });
      }
    }
  }

  /**
   * Method for Generate Invoice purpose.
   */
  private generateInvoice() {
    this._data.tripValidationData.is_manual = false;
    this.buttons = [{ name: TripManagementConstant.GENERATE_INVOICE, icon: 'check', isDisabled: true }, { name: 'Cancel', icon: 'close', isDisabled: true }];
    this.isGenerateInvoice = true;
    this.responseTripData = { 'service_ref_ids': [] };
    this.rfvViewSubscription = this._tripService.viewGenerateInvoice(this._data.tripValidationData).subscribe((response) => {
      if (response['errorCode']) {
        Swal.fire('Error', response['errorMessage'], 'error');
        this._dialogRef.close();
      }
      //ANCHOR asked by Mayur
      if (response) {
        if (response['errorMessage']) {
          Swal.fire('Error', response['errorMessage'], 'error');
          this._dialogRef.close();
        } else {
          this._data.tripValueFormData = response['response'];
          this.billFromValue = this._data.tripValueFormData.billFrom;
          this.createBillFromKey();
          this.ecContractType = this._data.tripValueFormData.ecContractType;
          this.buttons = this._data.buttons;
          this.rowsDataTrip = this._data.tripValueFormData['tripAdjustmentDetailsForGenerate'];

          this.getGenerateInvoiceFields();
          this.rowsDataTrip.forEach((eachTrip) => { this.responseTripData.service_ref_ids.push(eachTrip.tripId); });
        }
      }
    });
  }

  /**
   * Call Generate Invoice on generate invoice screen.
   */
  private generateInvoiceOnGenerateInvoiceScreen() {
    const rfvFormdata = this.formData;
    if (rfvFormdata && rfvFormdata[8] && rfvFormdata[8].toString().toLowerCase() === TripManagementConstant.GENERATE_INVOICE.toLowerCase()) {
      this.tripRfvGridConfiguration.showLoader = true;
      this.responseTripData.source = this._data.tripValidationData.source;
      this.responseTripData.kind_attention = rfvFormdata[4].kindAttention ? rfvFormdata[4].kindAttention.toString() : '';
      this.generateInvoiceSubscription = this._tripService.generateInvoice(this.responseTripData).subscribe((response) => {
        if (response) {
          if (response['response']) {
            this.swalGenerateInvoice(response);
            this._tripService.refresh.next();
          } else if (response['errorMessage']) {
            Swal.fire('Error', response['errorMessage'], 'error');
          }
        } else {
          Swal.fire('Error');
        }
        this.tripRfvGridConfiguration.showLoader = false;
        this.onClose();
      });
    }
  }

  /**
   * Method used to process and merge all the gst values into a single line item of a given adjustment data.
   * @param  {any} response : response in the form of user view.
   */
  private processAdjustmentData(listOfinvoiceItemDetails: any, isValidate?: boolean) {
    if (listOfinvoiceItemDetails && Array.isArray(listOfinvoiceItemDetails)) {
      listOfinvoiceItemDetails.forEach((adjustmentData: any) => {
        adjustmentData.itemAmountDetails.forEach((eachData) => {
          if (eachData.taxType) {
            switch (eachData.taxType) {
              case TripManagementConstant.IGST:
                adjustmentData['igstRate'] = eachData['taxPercent'];
                adjustmentData['igstAmount'] = eachData['taxAmount'];
                break;
              case TripManagementConstant.CGST:
                adjustmentData['cgstRate'] = eachData['taxPercent'];
                adjustmentData['cgstAmount'] = eachData['taxAmount'];
                break;
              case TripManagementConstant.SGST:
                adjustmentData['sgstRate'] = eachData['taxPercent'];
                adjustmentData['sgstAmount'] = eachData['taxAmount'];
                break;
            }
          }

          adjustmentData['baseAmount'] = eachData['baseAmount'];
          adjustmentData['isTaxApplicable'] = eachData['isTaxApplicable'];
          adjustmentData['discount'] = eachData['discount'];
        });

        if (adjustmentData['description']) {
          switch (adjustmentData['description'].toLowerCase()) {
            case 'freight':
              adjustmentData[this.adjustmentsGridConfiguration.checkbox2IsDisabledColumnDef] = true;
              adjustmentData[this.adjustmentsGridConfiguration.checkbox1IsDisabledColumnDef] = true;
              adjustmentData[this.adjustmentsGridConfiguration.checkbox1ColumnDef] = true;
              adjustmentData['baseAmount_isReadOnly'] = false;
              break;
            case 'adjustments':
              adjustmentData[this.adjustmentsGridConfiguration.checkbox2IsDisabledColumnDef] = adjustmentData['disable'];
              adjustmentData[this.adjustmentsGridConfiguration.checkbox1IsDisabledColumnDef] = adjustmentData['disable'];
              adjustmentData['baseAmount_isReadOnly'] = true;
              break;
            default:
              break;
          }
        }

        if (adjustmentData[this.adjustmentsGridConfiguration.checkbox1ColumnDef] === false) {
          adjustmentData[this.adjustmentsGridConfiguration.checkbox2IsDisabledColumnDef] = true;
          if (adjustmentData['description'] && adjustmentData['description'].toLowerCase() === 'adjustments') {
            adjustmentData['baseAmount_isReadOnly'] = true;
          }
        }

        if (isValidate || this.roleId === RoleId.FORTIGO_READ_ONLY_USER) {
          adjustmentData[this.adjustmentsGridConfiguration.checkbox1IsDisabledColumnDef] = true;
          adjustmentData[this.adjustmentsGridConfiguration.checkbox2IsDisabledColumnDef] = true;
          adjustmentData['baseAmount_isReadOnly'] = true;
        }

        if (this.isFTAPL) {
          adjustmentData[this.adjustmentsGridConfiguration.checkbox2IsDisabledColumnDef] = true;
          adjustmentData[this.adjustmentsGridConfiguration.checkbox2ColumnDef] = false;
        }

        if (!this.isFTAPL) {
          adjustmentData[this.adjustmentsGridConfiguration.checkbox2IsDisabledColumnDef] = false;
        }
      });
    }
    this._data.rowsDataAdjustments = listOfinvoiceItemDetails;
    this.rowsDataAdjustments = this._data.rowsDataAdjustments;
  }

  /**
   * To generate placeholder for formfields.
   * @param  {string} fieldName : name of the field.
   * @returns string
   */
  private generatePlaceholder(fieldName: string): string {
    if (fieldName) {
      fieldName = fieldName.toUpperCase();
    }
    return fieldName;
  }

  /**
   * To generate fields for Generate Invoice.
   */
  private getGenerateInvoiceFields() {
    const invoiceNumber = new TextInputField('Invoice Number', 'invoiceNumber', this.columnRatio, true, undefined, undefined, undefined, this._data.tripValueFormData.invoiceNumber);
    const invoicedate = new DateInputField('Invoice Date', 'invoiceDate', this.columnRatio, true, undefined, undefined, undefined, this._data.tripValueFormData.invoiceDate);
    const billFrom = new TextInputField('Bill From', 'billFrom', 2, true, [], undefined, undefined, this.billFromValue.toUpperCase());
    const prevYear = new CheckBoxInputField('Previous Year', 'prevYear', 2, true, null, undefined, undefined, false);
    // Removed as per request made by Anusha.
    // const gstApplicable = new CheckBoxInputField('GST Applicable', 'gstApplicable', 2, true, null, undefined, undefined, this.gstApplicable);
    // const unregesteredDestination = new CheckBoxInputField('Unregistered GST', 'unregesteredDestination', 2, true, null, undefined, undefined, this.unRegGstFlag);

    this.generateInvoiceFields = [invoiceNumber, invoicedate, billFrom];
    if (this.isAprilMonth) {
      this.generateInvoiceFields.push(prevYear);
    }
    const customerName = new TextInputField('Company Name', 'entityName', 4, true, undefined, undefined, undefined, this._data.tripValueFormData.billToName);
    const billToAddress = new TextAreaInputField('Company Address', 'entityAddress', 4, true, undefined, undefined, undefined, this._data.tripValueFormData.billToAddress);
    const ecGstin = new TextInputField('GSTIN', 'gstin', 2, true, undefined, undefined, undefined, this._data.tripValueFormData.billToGSTIN);
    const ecStateCode = new TextInputField('State Code', 'stateCode', 2, true, undefined, undefined, undefined, this._data.tripValueFormData.billToStateCode);

    this.generateInvoiceFields.push(customerName, billToAddress, ecGstin, ecStateCode);
    // Removed as per request made by Anusha.
    // const ecContractType = new TextInputField('EC Contract Type', 'ecContractType', 3, false, [], undefined, undefined, this.ecContractType);
    // this.generateInvoiceFields.push(ecContractType);
    const kindAttention = new TextInputField('Kind Attention', 'kindAttention', 3, false, {}, undefined, undefined, this._data.tripValueFormData.kindAttention);
    this.cusReferenceData = [kindAttention];
    if (this.invoiceCustomerReferenceList) {
      this.generateInvoiceFields.forEach((customerRef: any) => {
        this.cusReferenceData.push(new TextInputField(this.generatePlaceholder(customerRef['name']), customerRef['name'], 3, true, undefined, undefined, undefined, customerRef['value']));
      });
    }
  }

  /**
   * Update the grids as per user changes.
   * @param  {any} editedRowsData
   * @param  {string} type
   */
  public editRows(editedRowsData: any, type: string) {
    if (type === 'trip') {
      if (Number.parseFloat(editedRowsData.row['chargedWeight']) > Number.parseFloat(this.responseTripData.uninvoicedChargedWeight)) {
        editedRowsData.row['chargedWeight'] = this.initialChargedWeight;
        this.rowsDataTrip = [];
        this.rowsDataTrip.push(editedRowsData.row);
        delete this.rowsDataTrip[0].tripId_icon;
        delete this.rowsDataTrip[0].tripId_isExpanded;

        Swal.fire('Warning', 'Charge weight must be less than ' + this.responseTripData.uninvoicedChargedWeight.toString(), 'warning');

      } else {
        this.showModalLoader = true;
        this.rowsTripData = editedRowsData.row;
        // get the charged weight  and do calculation and update adjustment data
        this.rowsDataAdjustments = [];
        //TODO Ritesh ( fix this in fortigo grid )
        setTimeout(() => {
          this.showModalLoader = false;
          if (!this.currentSupplyValue) {
            this.currentSupplyValue = Number.parseFloat(this.responseTripData.uninvoicedFreightValue);
          }
          this.rowsDataAdjustments = this._data.rowsDataAdjustments.slice();
          const temp: number = Number.parseFloat(this.rowsTripData['chargedWeight']) * Number.parseFloat(this.rowsTripData['rateWeight']);
          if (temp > Number.parseFloat(this.responseTripData.uninvoicedFreightValue)) {
            Swal.fire('Warning', 'Supply value range exceeded !', 'warning');
            this.rowsDataAdjustments[0]['baseAmount'] = (this.currentSupplyValue).toFixed(4);
          } else {
            if (this.rowsTripData['chargedWeight'] !== 'FIXED' && this.rowsTripData['rateWeight'] !== 'FIXED') {
              this.rowsDataAdjustments[0]['baseAmount'] = (Number.parseFloat(this.rowsTripData['chargedWeight']) * Number.parseFloat(this.rowsTripData['rateWeight'])).toFixed(4);
            }
          }
          this.updateAdjustmentFields(this.rowsDataAdjustments[0]);
        }, 1000);
      }
    } else {
      if (this.rowsDataAdjustments[0]['baseAmount'] > this.responseTripData.uninvoicedFreightValue) {
        this.initialRowAdjData[0]['baseAmount'] = this.initialRowAdjData[0]['itemAmountDetails'][0]['baseAmount'];
        this.rowsDataAdjustments[0]['baseAmount'] = this.initialRowAdjData[0]['baseAmount'];
        Swal.fire('Warning', 'Supply value range exceeded for Supply Value!', 'warning');
      } else {
        const adjustmentData = this.rowsDataAdjustments[0];
        this.updateAdjustmentFields(adjustmentData);
      }
      this.rowsAdjustmentData = new Array<any>();
      this.rowsAdjustmentData.push(editedRowsData.row);
    }
  }

  private updateAdjustmentFields(adjustmentData: any) {
    adjustmentData.itemAmountDetails.forEach((eachData) => {
      eachData['baseAmount'] = Number.parseFloat(adjustmentData['baseAmount']);
      adjustmentData.sgstAmount = Number.parseFloat(adjustmentData['baseAmount']) * Number.parseInt(adjustmentData['sgstRate']) / 100;
      adjustmentData.cgstAmount = Number.parseFloat(adjustmentData['baseAmount']) * Number.parseInt(adjustmentData['cgstRate']) / 100;
      adjustmentData.igstAmount = Number.parseFloat(adjustmentData['baseAmount']) * Number.parseInt(adjustmentData['igstRate']) / 100;
      adjustmentData.itemTotal = Number.parseFloat(adjustmentData.cgstAmount) + Number.parseFloat(adjustmentData.sgstAmount) + Number.parseFloat(adjustmentData.igstAmount) + Number.parseFloat(adjustmentData['baseAmount']);
    });
  }

  /**
   * To generate column fields for trip details grid in rfv view screen.
   */
  private getUpdatedColumnsTripRfvScreen(ecContractType: string) {

    if (ecContractType && ecContractType === TripManagementConstant.RATE_PER_TON.toLowerCase() && this.mode !== 'readOnly') {
      this.columnsDataTrip.forEach((eachColumn) => {
        if (eachColumn.columnDef === 'gcnDate') {
          eachColumn.action = 'edit';
          eachColumn.editFieldType = FieldTypes.Date;
        }
        if (eachColumn.columnDef === 'actualWeight') {
          eachColumn.action = 'edit';
          eachColumn.editFieldType = FieldTypes.TextInput;
        }
        if (eachColumn.columnDef === 'chargedWeight') {
          eachColumn.action = 'edit';
          eachColumn.editFieldType = FieldTypes.TextInput;
        }
      });
    } else {
      this.columnsDataTrip.forEach((eachColumn) => {
        if (eachColumn.columnDef === 'gcnDate') {
          delete eachColumn.action;
          delete eachColumn.editFieldType;
        }
        if (eachColumn.columnDef === 'actualWeight') {
          delete eachColumn.action;
          delete eachColumn.editFieldType;
        }
        if (eachColumn.columnDef === 'chargedWeight') {
          delete eachColumn.action;
          delete eachColumn.editFieldType;
        }
      });
    }
  }

  /**
  * To get adjustment grid configuration for rfv/validate screen.
  */
  private getAdjustmentGridConfiguartion() {
    this.adjustmentsGridConfiguration = new GridConfiguration();
    // checkbox 1 configuration
    this.adjustmentsGridConfiguration.isCheckbox1Enabled = true;
    this.adjustmentsGridConfiguration.isCheckbox1AtStart = true;
    this.adjustmentsGridConfiguration.showCheckbox1HeaderText = true;
    this.adjustmentsGridConfiguration.checkbox1HeaderText = '';
    this.adjustmentsGridConfiguration.checkbox1ColumnDef = 'selected';
    this.adjustmentsGridConfiguration.checkbox1IsDisabledColumnDef = 'checkbox1Disable';
    // checkbox 2 configuration
    this.adjustmentsGridConfiguration.isCheckbox2Enabled = true;
    this.adjustmentsGridConfiguration.checkbox2Postion = 2;
    this.adjustmentsGridConfiguration.showCheckbox2HeaderText = true;
    this.adjustmentsGridConfiguration.checkbox2HeaderText = 'GST Applicable';
    this.adjustmentsGridConfiguration.checkbox2ColumnDef = 'isTaxApplicable';
    this.adjustmentsGridConfiguration.checkbox2IsDisabledColumnDef = 'checkbox2Disable';

    this.adjustmentsGridConfiguration.css.fixedTableHeight = 'max-content';
    this.adjustmentsGridConfiguration.css.tableFont = FortigoConstant.FONT_MEDIUM + 'px';
    this.adjustmentsGridConfiguration.css.tableOverflowX = 'scroll';
    this.adjustmentsGridConfiguration.css.tableOverflowY = 'hidden';
    this.adjustmentsGridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.adjustmentsGridConfiguration.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    this.adjustmentsGridConfiguration.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
    this.adjustmentsGridConfiguration.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.adjustmentsGridConfiguration.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.adjustmentsGridConfiguration.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.adjustmentsGridConfiguration.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
    this.adjustmentsGridConfiguration.editableFormConfiguration.css.containerMaxWidth = '100px';
    this.adjustmentsGridConfiguration.css.tableRowHeight = TripManagementConstant.TABLE_ROW_HEIGHT;
  }

  /**
   * This function updates adjustment checkbox and store data into global variable
   * @param  {Array<any>} data: data of a checkbox
   * @param  {number} checkboxNumber: checkbox number/index of checkbox for which data is sent
   */
  public updateAdjustmentCheckbox(data: Array<any>, checkboxNumber: number) {
    switch (checkboxNumber) {
      case 1:
        this.adjustmentCheckbox1Data = data;
        this.disableRowDataOnUncheck();
        break;
      case 2:
        this.adjustmentCheckbox2Data = data;
        this.updateGSTAmount(data);
        break;
      default:
        break;
    }
  }

  private updateGSTAmount(data: Array<any>) {
    const visited = Array<Boolean>();
    this.rowsDataAdjustments.forEach(() => visited.push(false));
    if (data.length === 0) {
      this.rowsDataAdjustments.forEach((eachrowDataAdjustments) => {
        this.gstType = this.checkGSTType();
        this.updateGSTRateAmountTotalValue(eachrowDataAdjustments, false);
      });
    } else {
      data.forEach((eachData) => {
        this.rowsDataAdjustments.forEach((eachrowDataAdjustments, index: number) => {
          if ((eachData.serviceReferenceId && eachrowDataAdjustments.serviceReferenceId === eachData.serviceReferenceId)) {
            if (eachrowDataAdjustments.subServiceReferenceId === eachData.subServiceReferenceId) {
              // mark visited adjustment that are applicable for gst.
              visited[index] = true;
              this.gstType = this.checkGSTType();
              this.updateGSTRateAmountTotalValue(eachrowDataAdjustments, true);
            }
          }
        });
      });
      // Adjustments not applicable for gst.
      this.rowsDataAdjustments.forEach((eachrowDataAdjustments, index) => {
        if (!visited[index]) {
          this.gstType = this.checkGSTType();
          this.updateGSTRateAmountTotalValue(eachrowDataAdjustments, false);
        }
      });
    }
  }

  private checkGSTType(): GSTType {
    // checking unregistered GST
    const unregisteredGSTField = this.invoiceGstData.filter((eachField) => {
      return eachField.name === 'unregesteredDestination';
    })[0];

    if (unregisteredGSTField && unregisteredGSTField.defaultValue) {
      return 'IGST';
    }

    if (this.customerForm['data'].gstin.substr(0, 2) === this.billFromGSTIN.substr(0, 2)) {
      return 'CGST_SGST';
    } else {
      return 'IGST';
    }
  }

  /**
   * This function checks for unselected adjustments,
   * disables gst and supply value as read only.
   */
  private disableRowDataOnUncheck() {
    this.adjustmentAmountNonApproved = 0;
    this.nonApprovedSelected = false;
    const checkedRow: Array<boolean> = new Array<boolean>();
    checkedRow.length = this._data.rowsDataAdjustments.length;
    checkedRow.fill(false);
    if (this.adjustmentCheckbox1Data && Array.isArray(this.adjustmentCheckbox1Data) && this.adjustmentCheckbox1Data.length > 0) {
      this._data.rowsDataAdjustments.forEach((eachDataAdjustment: any, index: number) => {
        if (this.adjustmentCheckbox1Data && Array.isArray(this.adjustmentCheckbox1Data)) {
          this.adjustmentCheckbox1Data.forEach((eachCheckboxData) => {
            if (eachCheckboxData.description.toLowerCase() !== 'freight' && eachDataAdjustment.subServiceReferenceId && eachCheckboxData.subServiceReferenceId && (eachDataAdjustment.subServiceReferenceId.toLowerCase() === eachCheckboxData.subServiceReferenceId.toLowerCase())) {
              if (eachDataAdjustment.approved === false) {
                this.nonApprovedSelected = true;
                this.adjustmentAmountNonApproved += Number.parseFloat((eachDataAdjustment.itemAmountDetails[0].baseAmount).toString());
              }
              if (eachDataAdjustment.disabled === false) {
                checkedRow[index] = eachDataAdjustment[this.adjustmentsGridConfiguration.checkbox1ColumnDef];
              } else {
                checkedRow[index] = true;
              }
              if (eachDataAdjustment.selected) {
                checkedRow[index] = true;
              }
            }
          });
        }
      });
    }

    if (checkedRow && Array.isArray(checkedRow)) {
      checkedRow.forEach((eachCheckedRow, index: number) => {
        if (this._data.rowsDataAdjustments[index].description.toLowerCase() !== 'freight') {
          if (this._data.rowsDataAdjustments[index].disable === false) {
            this._data.rowsDataAdjustments[index][this.adjustmentsGridConfiguration.checkbox1ColumnDef] = eachCheckedRow;
            if (eachCheckedRow) {
              // this._data.rowsDataAdjustments[index].checkbox2Disable = false;
              // As per comments of Anusha Check box should be disabled if bill from is FTAPL.
              this._data.rowsDataAdjustments[index].checkbox2Disable = this.isFTAPL;
            } else {
              this._data.rowsDataAdjustments[index].checkbox2Disable = true;
            }
            this._data.rowsDataAdjustments[index].baseAmount_isReadOnly = true;
          }
        }
      });
    }
    // TODO Commented for testing
    // this.rowsDataAdjustments = <Array<any>>Util.getObjectCopy(this._data.rowsDataAdjustments);
    // this._data.rowsDataAdjustments = <Array<any>>Util.getObjectCopy(this._data.rowsDataAdjustments);
  }

  /**
   * This function is used to get column data for adjustment
   *
   * @param  {number} index: Index of tab
   * @returns Array: Column array
   */
  private getAdjustmentColumnData(index: number): Array<Column> {
    const adjustmentColumnData: Array<Column> = [
      { columnDef: 'serviceName', headerName: 'Description of Service', dataType: DataType.String, width: '150px' },
      { columnDef: 'description', headerName: 'Description', dataType: DataType.String, width: '10px' },
      { columnDef: 'sacCode', headerName: 'SAC', dataType: DataType.String, width: '10px', css: { horizontalAlign: 'left' } }];
    if (index === 1 && this.mode !== 'readOnly') {
      adjustmentColumnData.push({ columnDef: 'baseAmount', headerName: 'Supply value', dataType: DataType.Number, action: 'edit', width: '10px', editFieldType: FieldTypes.NumberInput });
    } else {
      adjustmentColumnData.push({ columnDef: 'baseAmount', headerName: 'Supply value', dataType: DataType.Number, width: '10px', css: { horizontalAlign: 'left' } });
    }
    adjustmentColumnData.push(
      { columnDef: 'discount', headerName: 'Discount', dataType: DataType.Number, width: '10px', css: { horizontalAlign: 'left' } });
    adjustmentColumnData.push(
      { columnDef: 'taxAmount', headerName: 'Tax value', dataType: DataType.Number, width: '10px', css: { horizontalAlign: 'left' } });
    adjustmentColumnData.push(
      { columnDef: 'cgstRate', headerName: 'Rate', dataType: DataType.Number, subHeader1Name: 'CGST', subHeader1Colspan: 2, width: '10px', css: { horizontalAlign: 'left' } });
    adjustmentColumnData.push(
      { columnDef: 'cgstAmount', headerName: 'Amount', dataType: DataType.Number, css: { horizontalAlign: 'left' } });
    adjustmentColumnData.push(
      { columnDef: 'sgstRate', headerName: 'Rate', dataType: DataType.Number, subHeader1Name: 'SGST', subHeader1Colspan: 2, width: '10px', css: { horizontalAlign: 'left' } });
    adjustmentColumnData.push(
      { columnDef: 'sgstAmount', headerName: 'Amount', dataType: DataType.Number, css: { horizontalAlign: 'left' } });
    adjustmentColumnData.push(
      { columnDef: 'igstRate', headerName: 'Rate', dataType: DataType.Number, subHeader1Name: 'IGST', subHeader1Colspan: 2, width: '10px', css: { horizontalAlign: 'left' } });
    adjustmentColumnData.push(
      { columnDef: 'igstAmount', headerName: 'Amount', dataType: DataType.Number, css: { horizontalAlign: 'left' } });

    adjustmentColumnData.push(
      { columnDef: 'itemTotal', headerName: 'TOTAL', dataType: DataType.Number, width: '10px', css: { horizontalAlign: 'left' } });
    return adjustmentColumnData;
  }

  /**
    * To generate column fields for trip details grid in rfv view screen.
    * @returns Array of column for grid of trip data in rfv screen
    */
  private getColumnsTripRfvScreen(actionItemIndex: number): Array<Column> {
    let columnsTrip: Array<Column>;
    if (actionItemIndex === 1 || actionItemIndex === 2) {
      columnsTrip = [
        { columnDef: 'tripId', headerName: 'Trip Id', dataType: DataType.String, css: { userSelect: 'text' } },
        { columnDef: 'truckType', headerName: 'Truck Type', dataType: DataType.String },
        { columnDef: 'truckNumber', headerName: 'Truck No.', dataType: DataType.String },
        { columnDef: 'fromLocation', headerName: 'From', dataType: DataType.String },
        { columnDef: 'toLocation', headerName: 'To', dataType: DataType.String },
        { columnDef: 'actualWeight', headerName: 'Actual Weight(Kgs)', dataType: DataType.Number, css: { horizontalAlign: 'left' } },
        { columnDef: 'chargedWeight', headerName: 'Charged Weight(Kgs)', dataType: DataType.Number, css: { horizontalAlign: 'left' } },
        { columnDef: 'rateWeight', headerName: 'Rate (Per Ton)', dataType: DataType.String },
        { columnDef: 'gcn', headerName: 'GCN No.', dataType: DataType.String },
        // ANCHOR @Ritesh : review the changes with Mayur
        // { columnDef: 'gcnDate', headerName: 'GCN Date', dataType: DataType.Date, dataFormat: DataFormat.Date, action: 'edit', editFieldType: FieldTypes.Date, maxDate: new Date() }
      ];
      if (this.mode !== 'readOnly') {
        columnsTrip.push(
          { columnDef: 'gcnDate', headerName: 'GCN Date', dataType: DataType.Date, dataFormat: DataFormat.Date, action: 'edit', editFieldType: FieldTypes.Date, maxDate: new Date() }
        );
      } else {
        columnsTrip.push(
          { columnDef: 'gcnDate', headerName: 'GCN Date', dataType: DataType.Date, dataFormat: DataFormat.Date, maxDate: new Date() }
        );
      }
    } else if (actionItemIndex === 6) {
      columnsTrip = [
        { columnDef: 'tripId', headerName: 'Trip ID', dataType: DataType.String, css: { userSelect: 'text' } },
        { columnDef: 'pickUpDate', headerName: 'Pickup Dt', dataType: DataType.Date, dataFormat: DataFormat.Date },
        { columnDef: 'fromCity', headerName: 'From', dataType: DataType.String },
        { columnDef: 'toCity', headerName: 'To', dataType: DataType.String },
        { columnDef: 'truckNumber', headerName: 'Truck No', dataType: DataType.String },
        { columnDef: 'supplyValue', headerName: 'EC Contract Value', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { textColor: 'blue', horizontalAlign: 'center' }, isHavingFooter: true, footerCalculatedDataType: CalculationDataType.Sum },
        { columnDef: 'adjustmentAmount', headerName: 'Adjustment', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { textColor: 'blue', horizontalAlign: 'center' }, isHavingFooter: true, footerCalculatedDataType: CalculationDataType.Sum },
        { columnDef: 'gstAmount', headerName: 'GST', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { horizontalAlign: 'center' }, isHavingFooter: true, footerCalculatedDataType: CalculationDataType.Sum },
        { columnDef: 'total', headerName: 'Total', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { horizontalAlign: 'center' }, isHavingFooter: true, footerCalculatedDataType: CalculationDataType.RoundedSum },
      ];
    }
    return columnsTrip;
  }

  /**
   * Download report and export into file
   * @param  {any} response: Response data.
   * @param action : specifies for what action
   * 
   */
  private saveToFileSystem(response: any, action?: string) {
    const contentDispositionHeader: string = response.headers.get('Content-Disposition');
    const parts: string[] = contentDispositionHeader.split(';');
    let fileName = decodeURI(parts[1].split('=')[1]);
    const blob = new Blob([response.body], { type: response.headers.get('Content-Type') });
    // fileName = fileName.replace('"', '').split('.').splice(0, fileName.split('.').length - 1).join();
    fileName = fileName.replace(/"/g, '');
    // TODO @Sanjiv: for quick fix ritesh added , asked by sanjiv
    if (action === 'invoice') {
      fileName = fileName.replace('trip', 'invoice');
    }
    saveAs(blob, fileName);
  }
}
