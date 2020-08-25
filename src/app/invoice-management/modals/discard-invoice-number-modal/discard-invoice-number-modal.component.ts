/*
 * Created on Wed Oct 15 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Component, OnInit, Inject } from '@angular/core';
import { TextInputField, TextAreaInputField } from 'src/app/shared/abstracts/field-type.model';
import { FortigoValidators } from 'src/app/shared/models/fortigo-validators.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { InvoiceService } from '../../services/invoice/invoice.service';
import { InvoiceDetail } from '../../models/billing-entity.model';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-discard-invoice-number-modal',
  templateUrl: './discard-invoice-number-modal.component.html',
  styleUrls: ['./discard-invoice-number-modal.component.css']
})
export class DiscardInvoiceNumberModalComponent implements OnInit {
  public fields: Array<any>;
  public title = 'DISCARD INVOICE NUMBER';
  discardInvoiceNumberSubscription: Subscription;
  showLoader: boolean;
  constructor(public dialogRef: MatDialogRef<DiscardInvoiceNumberModalComponent>,
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _invoiceService: InvoiceService) { }

  ngOnInit() {
    const invoiceNumber = new TextInputField('InvoiceNumber', 'invoiceNumber', 12, true, undefined, undefined, undefined, this._data.invoiceNumber);
    const remarks = new TextAreaInputField('Remarks', 'remarks', 12, false, new FortigoValidators(10, 2000, true), undefined, undefined);
    this.fields = [invoiceNumber, remarks];
  }

  /**
   * Perform submit operation.
   * @param formData: formData
   */
  public onSubmit(formData: any) {
    console.log('formData', formData);
    const discardInvoiceData = new InvoiceDetail();
    discardInvoiceData.invoice_number = this._data.invoiceNumber;
    discardInvoiceData.user_comments = formData['remarks'];
    this.showLoader = true;
    this.discardInvoiceNumberSubscription = this._invoiceService.discardInvoiceNumber(discardInvoiceData).subscribe((response: any) => {
      if (response) {
        if (response['errorMessage']) {
          Swal.fire('Error', response.errorMessage, 'error');
        } else if (response['response']) {
          Swal.fire('Success', response['response'], 'success');
          this.showLoader = false;
          this.onClose();
          this.dialogRef.afterClosed().subscribe(() => {
            this._invoiceService.invoiceDataReload.emit('refresh');
          });
        }
      }
    });
  }

  /**
   * Perform close operation of Mat Dialog.
   */
  private onClose() {
    this.dialogRef.close();
  }

}
