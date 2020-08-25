/*
 * Created on Thu Jan 02 2020
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class TripInvoicingListByTab {
    public eligible_for_invoicing?: TripInvoicingTab;
    public sent_for_validation?: TripInvoicingTab;
    public validation_rejected?: TripInvoicingTab;
    public ready_for_invoicing_system?: TripInvoicingTab;
    public ready_for_invoicing_manual?: TripInvoicingTab;
    public submission_pending?: TripInvoicingTab;
    public submitted?: TripInvoicingTab;
    public invoice_reserved?: TripInvoicingTab;
    public all?: TripInvoicingTab;

    constructor() {
        this.eligible_for_invoicing = new TripInvoicingTab();
        this.sent_for_validation = new TripInvoicingTab();
        this.validation_rejected = new TripInvoicingTab();
        this.ready_for_invoicing_system = new TripInvoicingTab();
        this.ready_for_invoicing_manual = new TripInvoicingTab();
        this.submission_pending = new TripInvoicingTab();
        this.submitted = new TripInvoicingTab();
        this.invoice_reserved = new TripInvoicingTab();
        this.all = new TripInvoicingTab();
    }
}

export class TripInvoicingTab {
    public data: Array<any>;
    public count: number;

    constructor() {
        this.data = undefined;
        this.count = 0;
    }
}
