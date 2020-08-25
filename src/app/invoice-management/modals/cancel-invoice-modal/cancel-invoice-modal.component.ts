/*
 * Created on Thu Jun 13 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Component, OnInit, Inject, EventEmitter, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { InvoiceService } from '../../services/invoice/invoice.service';
import { NgForm } from '@angular/forms';
import { InvoiceManagementConstant } from '../../constants/InvoiceManagementConstant';

@Component({
  selector: 'app-cancel-invoice-modal',
  templateUrl: './cancel-invoice-modal.component.html',
  styleUrls: ['./cancel-invoice-modal.component.css']
})
export class CancelInvoiceModalComponent implements OnInit {
  @ViewChild('f', { static: false }) form: NgForm;
  input: string;
  tripId: number;
  options: Array<string>;
  onAdd = new EventEmitter();
  cancelInvoiceData = {
    'isGenerateCreditNote': false,
    'isReserveInvoiceNumber': true,
    'invoiceNumber': 'FN/g19/267',
    'tripId': '141423456789',
    'user_comments': 'invoice is cancelled',
    'userId': 12345676789
  };
  trips: Array<number>;
  isGenerateCreditNote: boolean;
  constructor(
    public dialogRef: MatDialogRef<CancelInvoiceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _invoiceService: InvoiceService) { }

  ngOnInit() {
    this.options = this._data.options;
    this.trips = this._data.tripDataList.map(tripData => {
      return tripData.itemServiceRefId;
    });
  }

  /**
   * @param  {string} input
   * Method is called on submit of form.
   */
  onSubmit(input: string) {
    switch (input) {
      case InvoiceManagementConstant.GENERATE_CREDIT_NOTE:
        this.cancelInvoiceData.isGenerateCreditNote = false;
        this.cancelInvoiceData.isReserveInvoiceNumber = true;
        break;
      case InvoiceManagementConstant.RESERVE_INVOICE_NO:

        break;
      default:

    }
    this.onClose();
  }

  onClose() {
    this.dialogRef.close(this.cancelInvoiceData);
  }
}
