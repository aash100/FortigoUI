/*
 * Created on Tue May 19 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class InvoiceManagementURL {

    public static INVOICE_LIST = '/invoice/getInvoiceList';
    public static DISCARD_INVOICE_NO = '/invoice/discardInvoiceNumber';
    public static CANCEL_INVOICE = '/invoice/cancelInvoice';
    public static GET_ITEM_DETAILS = '/invoice/getItemDetails?invoiceNumber=';
    public static GET_INVOICE_DETAILS = '/invoice/getInvoiceDetails';
    public static GET_LOCATION_LIST = '/invoice/getLocationList';
    public static LIST_COLLECTION_MANAGER = '/invoice/listCollectionManager';
    public static LIST_ACCOUNT_MANAGER = '/invoice/listAccountManager';
    public static LIST_INVOICE_SUBMITTED_BY = '/invoice/listUsers';
    public static LIST_CUSTOMER = '/invoice/listCustomerName';
    public static INVOICE_SUBMISSION = '/invoice/submissionDate';
    public static GET_SERVICE_REFERENCE_DETAILS = '/invoice/getServiceReferenceDetails';

    public static DOWNLOAD_INVOICE_DETAILS = '/invoice/downloadInvoiceReport';
    public static DOWNLOAD_INVOICE_PDF = '/invoice/download?invoiceNumber=';
    public static FILTER = '&source=old&filter=';
    public static GET_USER_TRIPS = '/getUserTrips';
    public static GET_FILTERED_TRIPS = '/filterInvoiceTrips';
    public static INVOICE_ACKNOWLEDGEMENT_DOCUMENT_DOWNLOAD = '/invoice/downloadInvoiceDocument';
    public static INVOICE_ACKNOWLEDGEMENT_DOCUMENT_UPLOAD_DATA = '/invoice/uploadInvoiceDocument';
    public static GET_INVOICING_STATUS = '/invoice/getInvoicingStatus';
    public static DOWNLOAD_RESERVED_INVOICE_REPORT = '/invoice/reservedInvoiceNumberReport';
    public static ACCOUNT_MANAGER_DETAILS = '/invoice/accountManagerDetail';
}
