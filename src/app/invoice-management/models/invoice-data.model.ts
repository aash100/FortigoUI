/*
 * Created on Tue Jan 07 2020
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { BillingEntity } from './billing-entity.model';
import { TripData } from 'src/app/trip-management/models/trip-data.model';

export class InvoiceData {
    invoiceNumber: number;
    invoiceDate: string;
    customerName;
    alias;
    serviceBy: string;
    billTo: string;
    fromBillingEntity: BillingEntity;
    accountManager;
    collectionManager;
    toBillingEntity: BillingEntity;
    trips;
    value;
    adjustments;
    gst;
    totalInvoiceValue;
    invoiceSubmissionDate;
    invoiceStatus;
    downloadInvoice;
    source;
    tripDataList: Array<TripData>;
}
