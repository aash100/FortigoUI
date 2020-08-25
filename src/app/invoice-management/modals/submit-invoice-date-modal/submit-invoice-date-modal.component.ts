/*
 * Created on Thu Jun 13 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DatePipe } from '@angular/common';

import Swal from 'sweetalert2';

import { DateInputField, TextInputField, TextAreaInputField, UploadInputField, RadioInputField, SelectOption, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { InvoiceService } from '../../services/invoice/invoice.service';
import { CaptureInvoiceSubmission } from '../../models/capture-invoice-submission.model';
import { FortigoValidators } from 'src/app/shared/models/fortigo-validators.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { Column, DataType, DataFormat, CalculationDataType } from 'src/app/shared/models/column.model';
import { InvoiceManagementConstant } from '../../constants/InvoiceManagementConstant';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { forkJoin, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-submit-invoice-date-modal',
  templateUrl: './submit-invoice-date-modal.component.html',
  styleUrls: ['./submit-invoice-date-modal.component.css'],
  providers: [DatePipe]
})
export class SubmitInvoiceDateModalComponent implements OnInit {

  public fields: Array<any> = Array<any>();
  public title = 'INVOICE DATE SUBMISSION';
  public isReadOnly = false;

  private formData: Array<any>;
  private invoice_submission = new CaptureInvoiceSubmission();
  private selectedFile: Array<any>;

  public showMultipleInvoice: boolean;
  public gridConfiguration: GridConfiguration = new GridConfiguration();
  public columnsData: Array<Column> = [];
  public rowsData: Array<any>;
  public upload = false;
  public uploadInvoiceAcknowledge = new ReplaySubject(1);

  constructor(
    public dialogRef: MatDialogRef<SubmitInvoiceDateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _invoiceService: InvoiceService, private _loginControlV2Service: LoginControlV2Service) {
  }

  ngOnInit() {
    this.formData = new Array<any>();
    switch (this.data.mode.toLowerCase()) {
      case FortigoConstant.FORM_EDIT_MODE:
      case FortigoConstant.FORM_VIEW_MODE:
        this.isReadOnly = this.data.mode === FortigoConstant.FORM_VIEW_MODE ? true : false;
        // single invoice
        this.showMultipleInvoice = false;
        this.getData(this.data.rowsData[0].invoiceNumber);
        break;
      case FortigoConstant.FORM_CREATE_MODE:
        this.getColumnData();
        this.getGridConfiguration();
        this.rowsData = this.data.rowsData;
        // multiple invoice
        this.showMultipleInvoice = true;
        this.getFields(this.data.mode);
        break;
      default:
        break;
    }
  }

  /**
   * To create fields for form.
   *
   * @param  {string} mode?
   */
  private getFields(mode?: string) {
    const invoiceNumber = new TextInputField('InvoiceNumber', 'invoiceNumber', 3, true, undefined, undefined, undefined, this.data.rowsData[0].invoiceNumber);
    const invoiceSubDate = new DateInputField('Enter Submission Date', 'invoiceSubDate', mode.toLowerCase() === FortigoConstant.FORM_CREATE_MODE ? 4 : 3, undefined, undefined, undefined, undefined, this.invoice_submission.submission_date, undefined, undefined, new Date());
    const submittedByList = this._invoiceService.submittedByList;
    const submittedByListOption = new SelectOption('name', 'id', submittedByList);
    const submittedBy = new SearchableSelectInputField('Submitted By', 'submittedBy', submittedByListOption, mode.toLowerCase() === FortigoConstant.FORM_CREATE_MODE ? 4 : 3, undefined, undefined, undefined, undefined, undefined, this.invoice_submission.submitted_by);
    const enteredOn = new DateInputField('Entered On', 'enteredOn', mode.toLowerCase() === FortigoConstant.FORM_CREATE_MODE ? 4 : 3, true, undefined, undefined, undefined, this.invoice_submission.enteredOn, undefined, undefined, new Date());
    const remarks = new TextAreaInputField('Remarks', 'remarks', 12, false, new FortigoValidators(10, 2000, true), undefined, undefined, this.invoice_submission.submission_remarks);
    const document = new UploadInputField('Upload Document', 'document', 6, undefined, undefined, undefined, undefined, undefined, -1, undefined, true);

    const optionList = [{ name: 'Yes', action: 'yes' }, { name: 'No', action: 'no' }];
    const options = new SelectOption('name', 'action', optionList);
    const optionList2 = [{ name: 'Correct', action: 'correct' }, { name: 'Wrong', action: 'wrong' }];
    const options2 = new SelectOption('name', 'action', optionList2);
    const radioOption1 = new RadioInputField('RadioOption1', 'radioOptions', options, undefined, undefined, undefined, undefined, undefined);
    const radioOption2 = new RadioInputField('RadioOption2', 'radioOptions', options2, undefined, undefined, undefined, undefined, undefined);
    switch (mode.toLowerCase()) {
      case FortigoConstant.FORM_EDIT_MODE:
      case FortigoConstant.FORM_VIEW_MODE:
        this.fields = [invoiceNumber, invoiceSubDate, submittedBy, enteredOn, remarks];
        break;
      case FortigoConstant.FORM_CREATE_MODE:
        this.fields = [invoiceSubDate, submittedBy, enteredOn, document, remarks];
        break;
      default:
        break;
    }
  }

  /**
   * This function gets data for already submitted invoice
   *
   * @param  {string} invoiceNumber: invoice number of selected row
   */
  public getData(invoiceNumber: string) {
    this._invoiceService.getInvoiceDetails({ invoice_number: invoiceNumber }).subscribe((response: any) => {
      if (response.errorMessage) {
        Swal.fire('Error', response.errorMessage, 'error');
        this.onClose();
      } else {
        if (environment.name !== 'prod') {
          this.invoice_submission.submission_date = new Date(response.invoiceSubmissionDetails.submissionDate);
          this.invoice_submission.submission_remarks = response.invoiceSubmissionDetails.submissionRemarks;
          this.invoice_submission.enteredOn = new Date(response.invoiceSubmissionDetails.enteredOn);
          // FIXME @Mayur: please update once ready from backend
          // this.invoice_submission.submitted_by = response.submittedBy.id;
          if (response.invoiceSubmissionDetails.submittedBy.id && response.invoiceSubmissionDetails.submittedBy.id !== null) {
            this.invoice_submission.submitted_by = response.invoiceSubmissionDetails.submittedBy.id;
          }
        } else {
          this.invoice_submission.submission_date = new Date(response.submissionDate);
          this.invoice_submission.submission_remarks = response.submissionRemarks;
          // FIXME @Mayur: please update once ready from backend
          this.invoice_submission.submitted_by = response.submittedBy.id;
        }
        this.getFields(this.data.mode);
      }
    });
  }

  /**
   * Method called on submit of form.
   *
   * @param  {any} formValue the field values.
   */
  public formSubmit(formValue: any) {
    this.invoice_submission.invoice_number = this.data.rowsData.map((eachData: { invoiceNumber: any; }) => eachData.invoiceNumber);
    this.invoice_submission.submission_date = (formValue['invoiceSubDate']) ? formValue['invoiceSubDate'].format(FortigoConstant.FILTER_DATE_FORMAT).toString() : undefined;
    this.invoice_submission.submitted_by = formValue['submittedBy'];
    this.invoice_submission.submission_remarks = formValue['remarks'];
    if (this.invoice_submission.submission_remarks) {
      if (this.invoice_submission.submission_date) {
        if (this.invoice_submission.submitted_by) {
          this.formData.push(formValue);
          this._invoiceService.captureInvoiceSubmissionData(this.invoice_submission).subscribe((response: any) => {
            if (response) {
              if (response.errorMessage) {
                Swal.fire('Error', response.errorMessage, 'error');
              } else {
                if (this.selectedFile) {
                  this.upload = true;
                  const keyList = Object.getOwnPropertyNames(this.selectedFile);
                  const fileLocation = new Array<string>();
                  const subscriptionArray = new Array<any>();
                  for (let i = 0; i < keyList.length; i++) {
                    subscriptionArray.push(this._invoiceService.uploadDocument(this.selectedFile[i]));
                  }
                  const requestPayload = {
                    document_type: 'invoice_acknowledgement',
                    invoice_number: this.invoice_submission.invoice_number[0],
                    document_path: fileLocation,
                    user_id: this._loginControlV2Service.userId,
                    role_id: parseInt(this._loginControlV2Service.roleId.toString())
                  };
                  forkJoin(subscriptionArray).subscribe((pathArray: Array<any>) => {
                    pathArray.forEach((eachPath) => {
                      const filePath = JSON.parse(eachPath.text).file_path.toString();
                      requestPayload.document_path.push(filePath);
                      this.upload = false;
                    });
                    if (subscriptionArray.length === pathArray.length) {
                      this.uploadInvoiceAcknowledge.next(requestPayload);
                    }
                  });
                  this.uploadInvoiceAcknowledge.subscribe((payload: any) => {
                    this._invoiceService.uploadInvoiceAckData(payload).subscribe((response2) => {
                      if (response2['response']) {
                        Swal.fire('Success', response2['response'], 'success');
                        this.onClose();
                        this.dialogRef.afterClosed().subscribe(() => {
                          this._invoiceService.invoiceDataReload.emit('refresh');
                        });
                      } else {
                        Swal.fire('Error', response2['errorMessage'], 'error');
                      }
                    });
                  });
                } else {
                  Swal.fire('Success', response.response, 'success');
                  this.onClose();
                  this.dialogRef.afterClosed().subscribe(() => {
                    this._invoiceService.invoiceDataReload.emit('refresh');
                  });
                }
              }
            }
          });
        } else {
          Swal.fire('Please Enter Submitted By');
        }
      } else {
        Swal.fire('Please enter Submission Date');
      }
    } else {
      Swal.fire('Please enter Remarks');

    }
  }

  private onClose() {
    this.dialogRef.close(this.formData);
  }

  /**
   * uploads the Invoice Ack to database
   */
  private uploadInvoiceAck(file: any, fileLocation: Array<string>) {
    this._invoiceService.uploadDocument(file).subscribe((response1) => {
      const responseResult = JSON.parse(response1['text']);
      if (responseResult['response'] === 'success') {
        fileLocation.push(responseResult['file_path']);
        // FIXME  Check why role_id is string in request
        // const requestPayload = {
        //   document_type: 'invoice_acknowledgement',
        //   invoice_number: this.invoice_submission.invoice_number[0],
        //   document_path: fileLocation,
        //   user_id: this._loginControlV2Service.userId,
        //   role_id: parseInt(this._loginControlV2Service.roleId.toString())
        // };
        // this._invoiceService.uploadInvoiceAckData(requestPayload).subscribe((response2) => {
        //   if (response2['response']) {
        //     Swal.fire('Success', response2['response'], 'success');
        //     this.onClose();
        //     this.dialogRef.afterClosed().subscribe(() => {
        //       this._invoiceService.invoiceDataReload.emit('refresh');
        //     });
        //   } else {
        //     Swal.fire('Error', response2['errorMessage'], 'error');
        //   }
        // });
      } else {
        Swal.fire('Error', response1['errorMessage'], 'error');
      }
    });
  }

  /**
   * Mehthod called on radio selection change.
   *
   * @param  {string} radioChange
   */
  public onRadioSelectionChange(radioChange: string) {
    if (radioChange === 'no') {
      this.fields = [];
      this.getFields(radioChange);
      this.data.invList.forEach((eachData) => {
        this.fields.push(new TextInputField('Invoice Number', 'invNo' + eachData.invoiceNumber, 2, true, undefined, undefined, undefined, eachData.invoiceNumber.toString()));
        this.fields.push(new UploadInputField('Document', 'doc' + eachData.invoiceNumber, 2));
      });
    }
  }

  /**
   * This method is called after the file selection
   * @param  {any} fileList
   */
  public onFileSelectionChange(fileList: any) {
    if (fileList) {
      this.selectedFile = fileList;
    }
  }

  /**
   * Function to create columns for the grid.
   */
  private getColumnData() {
    this.columnsData = [
      { columnDef: 'invoiceNumber', headerName: 'Invoice Number', dataType: DataType.String, css: { userSelect: 'text' }, disableHeaderToolTipText: true },
      { columnDef: 'invoiceDate', headerName: 'Invoice Date', dataType: DataType.Date, dataFormat: DataFormat.Date, disableHeaderToolTipText: true, css: { horizontalAlign: 'left' } },
      { columnDef: 'customerName', headerName: 'Customer Name', dataType: DataType.String, disableHeaderToolTipText: true }
    ];
  }

  /**
   * Function to get grid configuration.
   */
  private getGridConfiguration() {
    this.gridConfiguration.isSortingEnabled = true;
    this.gridConfiguration.sortOrder = 'desc';
    this.gridConfiguration.sortColumnName = InvoiceManagementConstant.SORT_COLUMN;
    this.gridConfiguration.isFilterEnabled = false;
    this.gridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfiguration.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.fixedTableHeight = '125px';
  }
}
