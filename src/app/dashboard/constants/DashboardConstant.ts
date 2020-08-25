/*
 * Created on Tue May 19 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class DashboardConstant {
    // Collection Cycle Time Dashboard Constants
    public static COLLECTION_CYCLE_TIME_DASHBOARD_RM_VIEW_VALUE = 'RM View';
    public static COLLECTION_CYCLE_TIME_DASHBOARD_RM_VIEW_KEY = 'rmView';
    public static COLLECTION_CYCLE_TIME_DASHBOARD_CUSTOMER_VIEW_VALUE = 'Customer View';
    public static COLLECTION_CYCLE_TIME_DASHBOARD_CUSTOMER_VIEW_KEY = 'customerView';
    public static COLLECTION_CYCLE_TIME_DASHBOARD_CUSTOMER_VIEW_TO_PAY_VALUE = 'Customer View (to Pay)';
    public static COLLECTION_CYCLE_TIME_DASHBOARD_CUSTOMER_VIEW_TO_PAY_KEY = 'customerViewToPay';
    // Regex Pattern either include comma seperated value or without comma seperated value starting with alphanumeric character and can contain "/" character in between alphanumeric characters.
    public static SEARCH_REGEX_PATTERN = '^[0-9a-zA-Z][0-9,\/a-zA-Z]*[0-9a-zA-Z]*$';

    // used for dropdowns 
    public static COLLECTION_SUBMISSION_DATE_KEY = 'invSubDate';
    public static COLLECTION_SUBMISSION_DATE_VALUE = 'Invoice Submission Date';
    public static COLLECTION_TRIP_DATE_KEY = 'tripStartDate';
    public static COLLECTION_TRIP_DATE_VALUE = 'Trip Start Date';
    public static UNBILLED_POD_RCVD_DATE_KEY = 'pODRcvdDate';
    public static UNBILLED_POD_RCVD_DATE_VALUE = 'POD Received Date';
    public static UNBILLED_TRIP_START_KEY = 'tripStart';
    public static UNBILLED_TRIP_START_VALUE = 'Trip Start';
    public static UNBILLED_TRIP_COMP_DATE_KEY = 'tripCompDate';
    public static UNBILLED_TRIP_COMP_DATE_VALUE = 'Trip Completion Date';
    public static UNBILLED_DRAFT_GEN_DATE_KEY = 'draftGenDate'
    public static UNBILLED_DRAFT_GEN_DATE_VALUE = 'Draft generated Date';
    public static UNBILLED_INVOICE_GEN_DATE_KEY = 'invoiceGenDate';
    public static UNBILLED_INVOICE_GEN_DATE_VALUE = 'Invoice Generated Date';

}
