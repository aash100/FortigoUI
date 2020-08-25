
/*
 * Created on Mon Dec 16 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class CollectionListRequestPayload {
    constructor(public tab_filter?: string,
        public role_id?: number,
        public search_text?: string,
        public user_id?: number,
        public collection_ids?: Array<string>,
        public filter?: Filter) {
        if (tab_filter) {
            this.tab_filter = tab_filter;
        }
        if (role_id) {
            this.role_id = role_id;
        }
        if (search_text) {
            this.search_text = search_text;
        } else {
            this.search_text = '';
        }
        if (user_id) {
            this.user_id = user_id;
        }
        if (collection_ids) {
            this.collection_ids = collection_ids;
        }
        if (filter) {
            this.filter = filter;
        } else {
            this.filter = new Filter();
        }
    }
}

export class Filter {
    dateFrom: any;
    dateTo: any;
    transactionMode: any;
    depositedBank: any;
    ecCustomerId: any;
    paymentLocation: any;
    collectionManagerId: any;
    claimStatus: any;
    appropriationStatus: any;

    constructor() {
        this.dateFrom = null;
        this.dateTo = null;
        this.transactionMode = null;
        this.depositedBank = null;
        this.ecCustomerId = null;
        this.paymentLocation = null;
        this.collectionManagerId = null;
        this.claimStatus = null;
        this.appropriationStatus = null;
    }
}

export class Receipt {
    receiptId: any;
    receiptAmount: any;
    userId: any;
    companyId: any;
    invoiceList: Array<any>;
}

export class Invoice {
    invoiceNumber: any;
    invoiceAmount: any;
    outStandingAmount: any;
    tripList: Array<any>;
    referenceNumber: any;
    appropriationAmount: any;
    cashDiscount: any;
    deduction: any;
    tdsAmount: any;
    invoiceId: any;
    hardAppropriated: any;
    baseAmount: any;
}

export class TripList {
    baseAmount: any;
    cashDiscount: any;
    deduction: any;
    hardAppropriated: any;
    referenceNumber: any;
    taxAmount: any;
    tds: any;
    totalAmount: any;
    tripId: any;
    usedAmount: any;
}

export class ActionItemsDisableConfiguration {
    isdownloadCollectionDataDisabled: boolean;
    isEditCollectionDataDisabled: boolean;
    isViewCollectionDataDisabled: boolean;
    isValidateCollectionDataDisabled: boolean;
    isAppropriateCollectionDataDisabled: boolean;
    isViewAppropriateCollectionDataDisabled: boolean;
    isReverseAppropriateCollectionDataDisabled: boolean;
    isDeleteCollectionDataDisabled: boolean;

    constructor() {
        this.isdownloadCollectionDataDisabled = false;
        this.isEditCollectionDataDisabled = false;
        this.isViewCollectionDataDisabled = false;
        this.isDeleteCollectionDataDisabled = false;
        this.isValidateCollectionDataDisabled = false;
        this.isAppropriateCollectionDataDisabled = true;
        this.isReverseAppropriateCollectionDataDisabled = true;
        this.isViewAppropriateCollectionDataDisabled = true;

    }
}
