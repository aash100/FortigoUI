/*
 * Created on Thu Jan 02 2020
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class InvoiceListByTab {
    public reserved?: InvoiceTab;
    public submission_pending?: InvoiceTab;
    public submitted?: InvoiceTab;
    public zero_receivables?: InvoiceTab;
    public all?: InvoiceTab;

    constructor() {
        this.reserved = new InvoiceTab();
        this.submission_pending = new InvoiceTab();
        this.submitted = new InvoiceTab();
        this.zero_receivables = new InvoiceTab();
        this.all = new InvoiceTab();
    }
}

export class InvoiceTab {
    public data: Array<any>;
    public count: number;

    constructor() {
        this.data = undefined;
        this.count = 0;
    }
}
