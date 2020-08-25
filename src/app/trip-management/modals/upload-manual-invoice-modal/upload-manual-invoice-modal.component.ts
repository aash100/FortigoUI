/*
 * Created on Fri Jul 05 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import Swal from 'sweetalert2';

import { DateInputField, NumberInputField, UploadInputField, TextInputField } from 'src/app/shared/abstracts/field-type.model';
import { FortigoConstant, FortigoFileType } from 'src/app/core/constants/FortigoConstant';
import { Column, DataType, DataFormat, CalculationDataType } from 'src/app/shared/models/column.model';
import { GridConfiguration, GridActionIcon } from 'src/app/shared/models/grid-configuration.model';
import { TripManagementConstant } from '../../constants/TripManagementConstant';
import { TripService } from '../../services/trip/trip.service';
import { FortigoValidators } from 'src/app/shared/models/fortigo-validators.model';
import { FortigoPattern } from 'src/app/core/constants/FortigoPattern';
import { Util } from 'src/app/core/abstracts/util';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upload-manual-invoice-modal',
  templateUrl: './upload-manual-invoice-modal.component.html',
  styleUrls: ['./upload-manual-invoice-modal.component.css']
})
export class UploadManualInvoiceModalComponent implements OnInit {
  public fields: Array<any>;
  public title: string;
  public fieldsFontSize = FortigoConstant.FONT_MEDIUM;
  public columnsData: Array<Column>;
  public rowsData: Array<any>;
  public gridConfigurationData: GridConfiguration;
  public tripFilteredList: Array<any>;
  public dataInput = { 'tiv': undefined, 'taxableValue': undefined, 'gst': undefined, 'noOfTrips': undefined };
  public formData: Array<any>;
  public isSaved: boolean;
  public isSubmit: boolean;
  public isApproved: boolean;
  public isRejected: boolean;
  public buttons: Array<any>;
  private invoiceNumber: string;
  private invoiceDate: string;
  private selectedFile: any;
  public showLoader = false;
  private downloadInvoicePDFSubscription: Subscription;

  constructor(
    public _dialogRef: MatDialogRef<UploadManualInvoiceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _tripService: TripService
  ) { }

  ngOnInit() {
    this.rowsData = new Array<any>();
    this._data.requestPayload.is_manual = true;
    this.getGridConfiguration();
    this.columnsData = this.getGenerateInvoiceTripColumns();
    this.showLoader = true;
    this._tripService.viewGenerateInvoice(this._data.requestPayload).subscribe((response) => {
      //ANCHOR asked by Mayur
      // if (environment.name === 'pre-prod' || environment.name === 'localhost') {
      //   response = response['response'];
      // }
      this.showLoader = false;
      if (response) {
        if (response['errorMessage']) {
          Swal.fire('Error', response['errorMessage'], 'error');
          this._dialogRef.close();
        } else {
          response = response['response'];
          if (response['errorCode']) {
            Swal.fire('Error', response['errorMessage'], 'error');
            this._dialogRef.close();
          }
          this.rowsData = response['tripAdjustmentDetailsForGenerate'];
          if (this.rowsData && Array.isArray(this.rowsData)) {
            this.dataInput.noOfTrips = this.rowsData.length;
          }
          this.invoiceNumber = response['invoiceNumber'];
          this.invoiceDate = response['invoiceDate'];
          this.getFields();
          this.title = 'UPLOAD MANUAL INVOICE';
          this.formData = new Array<any>();
          this.buttons = [{ name: 'Submit', icon: 'check', isDisabled: false }, { name: 'Cancel', icon: 'close', isDisabled: false }];
          // this.rowsDataTrip.forEach((eachTrip) => { this.responseTripdata.service_ref_ids.push(eachTrip.tripId); });
        }
      }
    });
  }

  /**
   * generates grid configuration for grid data.
   */
  private getGridConfiguration() {
    this.gridConfigurationData = new GridConfiguration();
    this.gridConfigurationData.css.tableFont = FortigoConstant.FONT_MEDIUM + 'px';
    this.gridConfigurationData.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfigurationData.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfigurationData.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
    this.gridConfigurationData.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    this.gridConfigurationData.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfigurationData.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfigurationData.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfigurationData.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfigurationData.css.fixedTableHeight = 'max-content';
    this.gridConfigurationData.css.tableOverflow = 'hidden';
    this.gridConfigurationData.uniqueColumnName = TripManagementConstant.UNIQUE_COLUMN;
    this.gridConfigurationData.isActionButtonEnabled = true;
    this.gridConfigurationData.isActionIconEnabled = true;
    this.gridConfigurationData.actionIconList.push(new GridActionIcon('close', 'Remove'));
  }

  /**
   * Method used to perform functions as per select changes.
   * @param  {any} event: event triggered as per changes made.
   */
  public onSelectChanges(event: any) {
    this.columnsData = [];
    this.rowsData = [];
    this.rowsData.push(this._data.actionData.data);
    const tripIdList = event.value;
    tripIdList.forEach((tripId: string) => {
      this.fillRowsData(tripId);
    });
    this.getColumnData();
  }

  /**
   * To fill table grid with trip data.
   * @param  {} tripId: tripId entered by user.
   */
  private fillRowsData(tripId: string) {
    this._data.tripList.forEach((eachTrip) => {
      if (eachTrip.tripId.toString() === tripId) {
        this.rowsData.push(eachTrip);
        return;
      }
    });
  }

  /**
   * To get the required columns for the grid.
   */
  private getColumnData() {
    this.columnsData = this._data.column;
  }

  /**
   * Method used to get all the required filter fields.
   * isTripSelected = true ie. By default Trip select drop down should be enabled.
   */
  private getFields(isTripSelected = true) {
    // const commodity = [{ invNo: '' }];
    // const invoiceOptions = new SelectOption('invNo', 'invNo', commodity);
    // Removed Dropdown of inv. no as per discussion with anusha and nethra.
    // const invoiceNumber = new SearchableSelectInputField('Invoice #', 'invoiceNumber', undefined, 2);
    const invoiceNumber = new TextInputField('Invoice #', 'invoiceNumber', 2, true, undefined, undefined, undefined, this.invoiceNumber);
    const invoiceDate = new DateInputField('Invoice Date', 'invoiceDate', 2, true, undefined, undefined, undefined, new Date(this.invoiceDate));
    // FIXME Non Decimal value validation removed as per comments by anusha.
    // const taxableValue = new NumberInputField('Taxable Value', 'taxableValue', 1, undefined, new FortigoValidators(undefined, undefined, true, FortigoPattern.NON_DECIMAL_NUMBER_PATTERN, true, true, false), undefined, undefined, this.dataInput.taxableValue);
    const taxableValue = new NumberInputField('Taxable Value', 'taxableValue', 1, undefined, new FortigoValidators(undefined, undefined, true, undefined, true, true, false), undefined, undefined, this.dataInput.taxableValue);
    // FIXME Non Decimal value validation removed as per comments by anusha.
    // const gst = new NumberInputField('GST', 'gst', 1, undefined, new FortigoValidators(undefined, undefined, true, FortigoPattern.NON_DECIMAL_NUMBER_PATTERN, true, true, false), undefined, undefined, this.dataInput.gst);
    const gst = new NumberInputField('GST', 'gst', 1, undefined, new FortigoValidators(undefined, undefined, true, undefined, true, true, false), undefined, undefined, this.dataInput.gst);
    // FIXME Non Decimal value validation removed as per comments by anusha.
    // const tiv = new NumberInputField('TIV(Taxable Value + GST)', 'tiv', 1, undefined, new FortigoValidators(undefined, undefined, true, FortigoPattern.NON_DECIMAL_NUMBER_PATTERN, true, true, false), undefined, undefined, this.dataInput.tiv);
    const tiv = new NumberInputField('TIV(Taxable Value + GST)', 'tiv', 1, undefined, new FortigoValidators(undefined, undefined, true, undefined, true, true, false), undefined, undefined, this.dataInput.tiv);
    const tripsCount = new NumberInputField('No. of Trips', 'tripsCount', 1, false, {}, undefined, undefined, this.dataInput.noOfTrips);
    const uploadInvoiceDoc = new UploadInputField('Upload Invoice Document', 'uploadInvoiceDoc', 4, undefined, new FortigoValidators(undefined, undefined, true), undefined, undefined, this.selectedFile, -1, FortigoFileType.PDF);
    // const options = new SelectOption('name', 'action', [new RadioInput('Trip Id', 'tripId'), new RadioInput('Customer Reference', 'cusRef')]);
    // const selectedOption = isTripSelected ? 'tripId' : 'cusRef';
    // Radio Option is commented as per now as discussed with anusha.
    // const radioOption = new RadioInputField('Make Selection', 'radioOption', options, undefined, false, {}, undefined, undefined, selectedOption);
    // FIXME Use actual cusRefId.
    // const optionList = [
    //   { cusRefId: '151513589' },
    //   { cusRefId: '23971806254366' },
    // ];
    // const optionList2 = new Array<any>();
    // this.data.tripList.forEach((eachTrip) =>
    //   eachTrip.tripId !== this.data.actionData.data.tripId ? optionList2.push({ tripId: eachTrip.tripId.toString() }) : ''
    // );
    // const selectOptionCustomer = new SelectOption('cusRefId', 'cusRefId', optionList);
    // const customerRefIds = new SearchableSelectInputField('Enter Customer Reference Ids', 'customerRefIds', selectOptionCustomer, 4, true, undefined, undefined, undefined, undefined, optionList);
    // const selectOption = new SelectOption('tripId', 'tripId', optionList2);
    // const tripIds = new SearchableSelectInputField('Enter Trip Ids', 'tripIds', selectOption, 4, true, undefined, undefined, undefined, undefined, optionList2);
    this.fields = [invoiceNumber, invoiceDate, taxableValue, gst, tiv, tripsCount, uploadInvoiceDoc];
    // Radio Option is commented as per now discussed with anusha.
    // this.fields = [invoiceNumber, invoiceDate, taxableValue, gst, tiv, tripsCount, uploadInvoiceDoc, radioOption];
    // this.fields.push(isTripSelected ? tripIds : customerRefIds);
  }

  /**
   * For search operations
   * @param  {string} tripIdList : Takes the input in the form of array of tripIds.
   */
  public searchIsClicked(tripIdList: string) {
    const tripIds = tripIdList.split(',');
    this.tripFilteredList = this._data.tripList.filter((eachTrip) => {
      return tripIds.includes(eachTrip.tripId);
    });
  }

  /**
   * To perform actions on the click of action items.
   * @param  {any} event : The event triggered as per actions.
   */
  public actionExtraButtonClickedTrip(event: any) {
    if (this.rowsData.length === 1) {
      Swal.fire('Error', 'Atleast one trip is required', 'error');
      return;
    }
    this.rowsData = this.rowsData.filter((eachRowsData) => {
      return event.data[this.gridConfigurationData.uniqueColumnName] !== eachRowsData[this.gridConfigurationData.uniqueColumnName];
    });
    this._data.requestPayload.service_ref_ids = this.rowsData.map(eachRowData => eachRowData.tripId);
    this.getFields();
  }

  /**
   * Method used to update the values as per changes made by user.
   * @param  {any} event : the changes performed by user.
   */
  public inputChanges(event: any) {
    switch (event.placeholder) {
      case 'Taxable Value':
        this.dataInput.taxableValue = Number.parseFloat(Number.parseFloat(event.value).toFixed(2));
        break;
      case 'GST':
        this.dataInput.gst = Number.parseFloat(Number.parseFloat(event.value).toFixed(2));
        break;
      case 'No. of Trips':
        this.dataInput.noOfTrips = Number.parseInt(event.value);
        break;
      default:
        break;
    }

    if (Util.isNumber(this.dataInput.taxableValue) && Util.isNumber(this.dataInput.gst)) {
      this.dataInput.tiv = Number.parseFloat((this.dataInput.taxableValue + this.dataInput.gst).toFixed(2));
    }

    this.getFields();
  }

  /**
   * Method used to perform submit operation on click of submit button.
   * @param  {Array<any>} formRef : the reference of the form to be submitted.
   * @param  {any} event : the action performed by user.
   */
  public onSubmit(formRef: Array<any>, event: any) {
    let isValidSubmission = true;
    formRef.forEach(element => {
      if (!element.submit()) {
        isValidSubmission = false;
      }
    });
    if (isValidSubmission) {
      switch (event) {
        case TripManagementConstant.SUBMIT:
          this.isSubmit = true;
          this.submitUploadManualInvoice();
          break;
        case TripManagementConstant.CANCEL:
          break;
      }
    }
  }

  /**
   * This function sets the file selected
   * @param  {any} selectedFiles
   */
  public onFileChanges(selectedFiles: any) {
    if (selectedFiles) {
      this.selectedFile = selectedFiles[0];
    }
  }

  /**
   * To Submit upload manual invoice data.
   */
  private submitUploadManualInvoice() {
    this._data.requestPayload.is_manual = true;

    this._data.requestPayload.invoice_number = this.invoiceNumber;
    this._data.requestPayload.invoice_date = this.invoiceDate;
    if (this.dataInput.taxableValue !== null && this.dataInput.taxableValue !== undefined) {
      this._data.requestPayload.invoice_base_amount = this.dataInput.taxableValue.toString();
    }
    if (this.dataInput.gst !== null && this.dataInput.gst !== undefined) {
      this._data.requestPayload.invoice_gst_amount = this.dataInput.gst.toString();
    }
    if (this.dataInput.tiv !== null && this.dataInput.tiv !== undefined) {
      this._data.requestPayload.invoice_total_amount = this.dataInput.tiv.toString();
    }
    if (this.dataInput.noOfTrips !== null && this.dataInput.noOfTrips !== undefined) {
      this._data.requestPayload.trip_count = this.dataInput.noOfTrips;
    }
    this.gridConfigurationData.showLoader = true;
    this._tripService.submitManualDocumentWithDocument(this.selectedFile, this._data.requestPayload).subscribe((response) => {
      if (response) {
        if (response['response']) {
          this.swalGenerateInvoice(response);
          this._tripService.refresh.next();
          this.onClose();
        } else {
          Swal.fire('Error', response['errorMessage'].toString(), 'error');
        }
      } else {
        Swal.fire('Error');
      }
      this.gridConfigurationData.showLoader = false;
    });
  }

  /**
   * method used for closing the dialog.
   */
  private onClose() {
    this._dialogRef.close(this.formData);
  }

  /**
   * To perform actions on radio input changes.
   * @param  {any} event
   */
  public radioSelection(event: any) {
    switch (event.value.toLowerCase()) {
      case 'tripId'.toLowerCase():
        this.getFields(true);
        break;
      case 'cusRef'.toLowerCase():
        this.getFields(false);
        break;
    }
  }

  /**
   * To get columns for trip data of Generate Invoice POP UP screen.
   */
  private getGenerateInvoiceTripColumns(): Array<Column> {
    const generateInvoiceTripColumns: Array<Column> = [
      { columnDef: 'tripId', headerName: 'Trip ID', dataType: DataType.Number, css: { userSelect: 'text' } },
      { columnDef: 'pickUpDate', headerName: 'Pickup Dt', dataType: DataType.Date, dataFormat: DataFormat.Date },
      { columnDef: 'fromCity', headerName: 'From', dataType: DataType.String },
      { columnDef: 'toCity', headerName: 'To', dataType: DataType.String },
      { columnDef: 'truckNumber', headerName: 'Truck No', dataType: DataType.String },
      { columnDef: 'supplyValue', headerName: 'EC Contract Value', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { textColor: 'blue', horizontalAlign: 'right' }, isHavingFooter: true, footerCalculatedDataType: CalculationDataType.Sum },
      { columnDef: 'adjustmentAmount', headerName: 'Adjustment', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { textColor: 'blue', horizontalAlign: 'right' }, isHavingFooter: true, footerCalculatedDataType: CalculationDataType.Sum },
      { columnDef: 'gstAmount', headerName: 'GST', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { horizontalAlign: 'right' }, isHavingFooter: true, footerCalculatedDataType: CalculationDataType.Sum },
      { columnDef: 'total', headerName: 'Total', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { horizontalAlign: 'right' }, isHavingFooter: true, footerCalculatedDataType: CalculationDataType.RoundedSum },
    ];
    return generateInvoiceTripColumns;
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
