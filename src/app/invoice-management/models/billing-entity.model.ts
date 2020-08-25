/*
 * Created on Tue Jan 07 2020
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class BillingEntity {
    cin: string;
    companyAddress: string;
    companyId: 0;
    companyName: string;
    emailId: string;
    gstin: string;
    panNumber: string;
    stateCode: number;
    website: string;
}

// Storing Invoice Details.
export class InvoiceDetail {
    invoice_number: string;
    user_comments: string;
    // Setting User Comments by default null value.
    constructor(user_comments = null) {
        this.user_comments = user_comments;
    }
}

// Storing Cancel Invoice Details.
export class CancelInvoiceDetail {
    invoice_number: string;
    user_comments: string;
    is_discard_invoice_number: boolean;
    is_reserve_invoice_number: boolean;
    service_reference_id: string;
}
