/*
 * Created on Tue Feb 12 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import Swal from 'sweetalert2';

import { Column } from 'src/app/shared/models/column.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { TextAreaInputField } from 'src/app/shared/abstracts/field-type.model';
import { FortigoValidators } from 'src/app/shared/models/fortigo-validators.model';
import { InvoiceManagementConstant } from '../../constants/InvoiceManagementConstant';
import { CancelInvoiceDetail } from '../../models/billing-entity.model';
import { InvoiceService } from '../../services/invoice/invoice.service';

@Component({
  selector: 'app-invoicing-trip-list',
  templateUrl: './invoicing-trip-list.component.html',
  styleUrls: ['./invoicing-trip-list.component.css']
})
export class InvoicingTripListComponent implements OnInit {

  public rows: Array<any>;
  public columns: Array<Column>;
  public gridConfiguration: GridConfiguration;
  public options: Array<any>;
  public rowIndexValue: number;
  public inputValue: string;
  public isButtonEnabled: boolean;
  public fields: Array<any>;
  public title: string;

  private outputData = { rowIndex: undefined, input: undefined, user_comments: undefined };

  constructor(
    public _dialogRef: MatDialogRef<InvoicingTripListComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _invoiceService: InvoiceService
  ) {
    this.gridConfiguration = new GridConfiguration();
  }

  ngOnInit(): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.

    this.rows = this._data.rowsData;
    this.columns = this._data.column;
    this.options = this._data.options;
    this.title = this._data.title;
    this.isButtonEnabled = true;
    this.gridConfiguration = this._data.gridConfiguration;
    if (!this._data.mode || (this._data.mode && this._data.mode !== 'click')) {
      this.fields = [new TextAreaInputField('Remarks', 'user_comments', 12, false, new FortigoValidators(undefined, 2000, true))];
    }
  }

  /**
   * @param  {number} rowIndex
   * Method called to select single row.
   */
  public onSelectedRow(rowIndex: number) {
    this.rowIndexValue = rowIndex;
  }

  /**
   * @param  {string} input
   * Method called to submit the form.
   */
  onSubmit(input: any, formRef: any) {
    const cancelInvoiceData = new CancelInvoiceDetail();
    this.inputValue = input;
    if (this.rows[this.rowIndexValue] && (formRef.submit().user_comments && formRef.submit().user_comments !== '')) {
      this.outputData.user_comments = formRef.submit().user_comments;
      cancelInvoiceData.service_reference_id = this.rows[this.rowIndexValue].serviceReferenceId;
      cancelInvoiceData.invoice_number = this._data.invoiceNumber;
      // Commented as per request by nethra.
      // cancelInvoiceData.source = this._data.source;
      cancelInvoiceData.user_comments = formRef.submit().user_comments;
      switch (input.name) {
        case InvoiceManagementConstant.DISCARD_INVOICE_NO:
          cancelInvoiceData.is_discard_invoice_number = true;
          cancelInvoiceData.is_reserve_invoice_number = false;

          break;
        case InvoiceManagementConstant.RESERVE_INVOICE_NO:
          cancelInvoiceData.is_discard_invoice_number = false;
          cancelInvoiceData.is_reserve_invoice_number = true;
          break;
        default:
      }
      this.gridConfiguration.showLoader = true;
      this._invoiceService.cancelInvoice(cancelInvoiceData).subscribe((response) => {
        if (response['errorMessage']) {
          Swal.fire('Error', response['errorMessage'], 'error');
        } else {
          Swal.fire('Success', response['response'], 'success');
          this._invoiceService.invoiceDataReload.emit('refresh');
        }
        this.gridConfiguration.showLoader = false;
        this.onClose();
      }, (error) => {
        Swal.fire('Error', 'Failed', 'error');
      }
      );
    } else if (!this.rows[this.rowIndexValue]) {
      Swal.fire('Warning', 'Please select a Trip', 'warning');
    } else {
      Swal.fire('Warning', 'Please enter the remarks.', 'warning');
    }
  }

  private onClose() {
    this._dialogRef.close(this.outputData);
    console.log('outputData', this.outputData);
  }
}
