/*
* Created on Thu Jul 18 2019
* Created by - 1149: Aashish Kumar
*
* Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/

import { InvoiceManagementConstant } from '../constants/InvoiceManagementConstant';

export class InvoiceListRequestPayload {
    service_ref_ids: Array<string>;
    tab_filter: string;
    search_text: string;
    filter: Filter;

    constructor(service_ref_ids = new Array<string>(), tab_filter = InvoiceManagementConstant.SUBMISSION_PENDING_KEY) {
        this.tab_filter = tab_filter;
        this.search_text = '';
        this.filter = new Filter();
        this.service_ref_ids = service_ref_ids;
    }
}

export class Filter {
    invoiceDateFrom: any;
    invoiceDateTo: any;
    customerName: any;
    accountManager: any;
    collectionManager: any;
    status: any;
    invoicingEntity: any;

    constructor() {
        this.invoiceDateFrom = null;
        this.invoiceDateTo = null;
        this.customerName = null;
        this.accountManager = null;
        this.collectionManager = null;
        this.status = null;
        this.invoicingEntity = null;
    }
}
