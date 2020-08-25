/*
* Created on Fri Jul 05 2019
* Created by - 1149: Aashish Kumar
*
* Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/

import { TripManagementConstant } from '../constants/TripManagementConstant';

export class TripInvoicingListRequestPayload {
    service_ref_ids: Array<string>;
    tab_filter: string;
    search_text: string;
    filter: Filter;

    constructor(service_ref_ids = new Array<string>(), tab_filter = TripManagementConstant.ELIGIBLE_KEY) {
        this.tab_filter = tab_filter;
        this.search_text = '';
        this.filter = new Filter();
        this.service_ref_ids = service_ref_ids;
    }
}

export class Filter {
    customerName: any;
    shipmentLocation: any;
    fromCity: any;
    toCity: any;
    invoicingEntity: any;
    pPodUploadDateTo: any;
    pPodUploadDateFrom: any;
    ePodUploadDateTo: any;
    ePodUploadDateFrom: any;
    invoicingStatus: any;
    pickupDateFrom: any;
    pickupDateTo: any;
    ePodStatus: any;
    pPodStatus: any;
    tripType: any;

    constructor() {
        this.customerName = null;
        this.shipmentLocation = null;
        this.fromCity = null;
        this.toCity = null;
        this.invoicingEntity = null;
        this.pPodUploadDateTo = null;
        this.pPodUploadDateFrom = null;
        this.ePodUploadDateTo = null;
        this.ePodUploadDateFrom = null;
        this.ePodStatus = null;
        this.pPodStatus = null;
        this.invoicingStatus = null;
        this.pickupDateFrom = null;
        this.pickupDateTo = null;
        this.tripType = null;
    }
}
