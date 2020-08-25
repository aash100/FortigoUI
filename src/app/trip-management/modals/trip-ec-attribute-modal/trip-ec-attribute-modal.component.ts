/*
 * Created on Fri Oct 04 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Component, OnInit, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TripService } from '../../services/trip/trip.service';
import { TextInputField } from 'src/app/shared/abstracts/field-type.model';

@Component({
  selector: 'app-trip-ec-attribute-modal',
  templateUrl: './trip-ec-attribute-modal.component.html',
  styleUrls: ['./trip-ec-attribute-modal.component.css']
})
export class TripEcAttributeModalComponent implements OnInit {

  public title = 'EC Attribute';
  public fields: Array<any>;
  public isLoadingData = true;

  constructor(
    public _dialogRef: MatDialogRef<TripEcAttributeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _tripService: TripService
  ) { }

  ngOnInit() {
    if (this._data && this._data.rowData && this._data.rowData.customer && this._data.rowData.customer.stringId) {
      const requestPayload = { company_id: this._data.rowData.customer.stringId };
      this._tripService.getECAttributes(requestPayload).subscribe((response) => {
        this.fields = [
          new TextInputField('Company Id', 'companyId', 6, true, {}, undefined, undefined, response['companyId']),
          new TextInputField('Company Name', 'companyName', 6, true, {}, undefined, undefined, response['companyName']),
          new TextInputField('Payment Terms', 'paymentTerms', 6, true, {}, undefined, undefined, response['paymentTerms']),
          new TextInputField('Invoice Docs', 'invoiceDocs', 6, true, {}, undefined, undefined, response['invoiceDocs']),
          new TextInputField('Collection Trigger', 'collectionTrigger', 6, true, {}, undefined, undefined, response['collectionTrigger']),
          new TextInputField('Invoice Accept Frequency', 'invoiceAcceptFrequency', 6, true, {}, undefined, undefined, response['invoiceAcceptFrequency']),
          new TextInputField('Invoice Format', 'invoiceFormat', 6, true, {}, undefined, undefined, response['invoiceFormat']),
          new TextInputField('Invoice Type', 'invoiceType', 6, true, {}, undefined, undefined, response['invoiceType'])
        ];
        this.isLoadingData = false;

      });
    }
  }

}
