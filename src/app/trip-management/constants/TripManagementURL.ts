/*
 * Created on Tue May 19 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class TripManagementURL {
    public static LIST_TRIP = '/trip/listTripDetails';
    public static VIEW_TRIP_VALIDATION = '/trip/viewTripValidationDetails';
    public static DOWNLOAD_INVOICE_DATA = '/trip/getTripList.xlsx?tripId=';
    public static VIEW_RESERVED_INVOICE = '/trip/viewReservedInvoiceNumber';
    public static RESERVE_INVOICE = '/trip/reserveInvoiceNumber';
    public static SUBMIT_AFTER_UPDATE = '/trip/submitAfterUpdate';
    public static APPROVE_TRIP = '/trip/approveTrip';
    public static REJECT_TRIP = '/trip/rejectTrip';
    public static GENERATE_INVOICE = '/trip/generateInvoice';
    public static GET_USER_TRIPS = '/getUserTrips';
    public static GET_FILTERED_TRIPS = '/filterTrips';
    public static GET_LOCATION_LIST = '/trip/getLocations';
    public static LIST_COLLECTION_MANAGER = '/trip/getCollectionManager';
    public static LIST_CUSTOMER = '/trip/getCompanies';
    public static INVOICING_STATUS = '/trip/getTripInvoicingStatus';
    public static VIEW_GENERATE_INVOICE = '/trip/viewGenerateInvoice';
    public static SUBMIT_MANUAL_DOCUMENT = '/trip/submitManualDocument';
    public static UPLOAD_DOCUMENT = '/trip/uploadDocs';
    public static ADD_DOCUMENT_FILE = '/trip/addDocumentFile';
    public static GET_CUSTOMER_ATTRIBUTE = '/trip/getCustomerAttributes';
    public static GET_COMPANY_LOCATIONS = '/trip/getCompanyLocations';
    public static BULK_UPDATE_BILLING_DETAILS = '/trip/bulkUpdateBillingDetails';
    public static DOWNLOAD_TRIP_INVOICING_REPORT = '/trip/downloadTripReport';
    public static GET_ALL_STATECODES = '/trip/listAllStateCodes';
    public static DOWNLOAD_INVOICE_PDF = '/invoice/download?invoiceNumber=';
    public static GET_TRIP_ADJUSTMENTS_DETAILS = '/trip/getTripAdjustmentDetails';
}
