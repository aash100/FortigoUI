/*
 * Created on Tue May 19 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class CollectionManagementURL {
    public static LIST_COLLECTION = '/collections/getCollections';
    public static COMPANIES_LIST = '/getUserTripCompaniesAPI';
    public static COLLECTION_COMPANIES_LIST = '/collections/getCompanies';
    public static COLLECTION_MANAGER_LIST = '/collections/getCollectionManagers';
    public static ADD_COLLECTION = '/collections/addCollection';
    public static DELETE_COLLECTION = '/collections/deleteCollection';
    public static UPDATE_COLLECTION = '/collections/updateCollection';
    public static COLLECTION_ID_DETAIL = '/collections/getCollection';
    public static GET_LOCATION_LIST = '/collections/getLocations';
    public static GET_APPROPRIATION_LIST = '/collections/listAppropriation/';
    public static GET_CATEGORY = '/collections/getCompanies';
    public static GET_PAYMENT_LOCATION = '/collections/getPaymentLocation/';
    public static GET_BANK_LIST = '/collections/getCollectionAccountDetails';
    public static GET_DOWNLOAD_REPORT = '/collections/downloadCollectionReport';
    public static GET_FORTIGO_USERS = '/collections/getCollectionSubmittedBy';
    public static APPROPRIATION_GET_DATA = '/collections/getInvoiceDistributions';
    public static DELETE_RECEIPT_URL = '/collections/delete';
    public static ADD_HARD_APPROPRIATION = '/collections/addHardAppropriation';
    public static ADD_CLAIMED_APPROPRIATION = '/collections/addClaimedAppropriation';
    public static GET_INVOICE_DATA = '/collections/getAppropriations';
    public static DELETE_APPROPRIATION = '/collections/removeAppropriation';
    public static DELETE_CLAIMED_APPROPRIATION = '/collections/removeClaim';
    public static GET_CUSTOMER_SUMMARY = '/collections/appropriationSummaryOfEndCustomer';
}
