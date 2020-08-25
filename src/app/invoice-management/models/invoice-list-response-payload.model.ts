/*
* Created on Sun Nov 10 2019
* Created by - 1157: Mayur Ranjan
*
* Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/

export class InvoiceListResponsePayload {
    public invoicingList?: Array<any>;
    public statusCount?: Array<StatusCount>;
    public errorCode?: number;
    public errorMessage?: string;
}

export class StatusCount {
    public invoiceCount: number;
    public invoiceStatus: string;
}
