/*
* Created on Tue May 19 2019
* Created by - 1157: Mayur Ranjan.
*
* Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/

export class CollectionManagementConstant {
    // filter local storage - keys
    public static MODULE_FILTER_KEY = 'collection-filter';
    // Claimed Status
    public static CLAIMED_REQUESTED_KEY = 'requested';
    public static CLAIMED_REQUESTED_VALUE = 'Requested';
    public static CLAIMED_CHEQUE_RECEIVED_KEY = 'cheque_received';
    public static CLAIMED_CHEQUE_RECEIVED_VALUE = 'Cheque Received';
    public static CLAIMED_ENCASHED_KEY = 'approved';
    public static CLAIMED_ENCASHED_VALUE = 'Encashed';
    public static CLAIMED_CLAIMED_KEY = 'claimed';
    public static CLAIMED_CLAIMED_VALUE = 'Claimed';
    public static CLAIMED_REJECTED_KEY = 'rejected';
    public static CLAIMED_REJECTED_VALUE = 'Rejected';
    public static CLAIMED_SUSPENSE_KEY = 'suspense';
    public static CLAIMED_SUSPENSE_VALUE = 'Suspense';
    public static CLAIMED_LOCATION_NA_KEY = 'payment_location_na';
    public static CLAIMED_LOCATION_NA_VALUE = 'Payment Location NA';
    // Appropriation Status
    public static APPROPRIATION_REQUEST_KEY = 'identified';
    public static APPROPRIATION_REQUEST_VALUE = 'Identified';
    public static APPROPRIATION_ENCASHED_KEY = 'encashed';
    public static APPROPRIATION_ENCASHED_VALUE = 'Encashed';
    public static APPROPRIATION_REJECTED_KEY = 'rejected';
    public static APPROPRIATION_REJECTED_VALUE = 'Rejected';
    public static APPROPRIATION_DELETED_KEY = 'deleted';
    public static APPROPRIATION_DELETED_VALUE = 'Deleted';
    public static APPROPRIATION_PARTIALLY_APPROPRIATED_KEY = 'partially_appropriated';
    public static APPROPRIATION_PARTIALLY_APPROPRIATED_VALUE = 'Partially appropriated';
    public static APPROPRIATION_APPROPRIATED_KEY = 'appropriated';
    public static APPROPRIATION_APPROPRIATED_VALUE = 'Appropriated';
    // All status for List
    public static ALL_KEY = 'all';
    public static ALL_VALUE = 'All';

    // Grid constants
    public static SORT_COLUMN = 'collectionEntryDate';
    public static UNIQUE_COLUMN_APP = 'invoiceNumber';
    public static UNIQUE_COLUMN_COLLECTION = 'collectionId';

    // To store tab index corresponding to each tab.
    public static COLLECTION_TAB_DATA = {
        requested: 1,
        cheque_received: 0,
        approved: 3,
        rejected: 4,
        suspense: 2,
        appropriated: 5,
        all: 6,
        // FIXME should be a valid key.
        null: 7
    };

    // Mode of Receipt
    public static MODE_NEFT_KEY = 'NEFT';
    public static MODE_NEFT_VALUE = 'NEFT';
    public static MODE_IMPS_KEY = 'IMPS';
    public static MODE_IMPS_VALUE = 'IMPS';
    public static MODE_UPI_KEY = 'UPI';
    public static MODE_UPI_VALUE = 'UPI';
    public static MODE_CHEQUE_KEY = 'cheque';
    public static MODE_CHEQUE_VALUE = 'Cheque';
    public static MODE_OTHERS_KEY = 'others';
    public static MODE_OTHERS_VALUE = 'Others';
    public static MODE_PDC_KEY = 'PDC';
    public static MODE_PDC_VALUE = 'PDC';
    public static MODE_DD_KEY = 'DD';
    public static MODE_DD_VALUE = 'DD';
    public static MODE_ONLINE_KEY = 'online';
    public static MODE_ONLINE_VALUE = 'Online';
    public static MODE_CASH_KEY = 'cash';
    public static MODE_CASH_VALUE = 'Cash';

    // Deposited Account
    public static DEPOSITED_ACCOUNT_FED_FNLPL_KEY = 'fedFnlpl';
    public static DEPOSITED_ACCOUNT_FED_FNLPL_VALUE = 'FED/FNLPL';
    public static DEPOSITED_ACCOUNT_FED_FTAPL_KEY = 'fedFtapl';
    public static DEPOSITED_ACCOUNT_FED_FTAPL_VALUE = 'FED/FTAPL';
    public static DEPOSITED_ACCOUNT_ICICI_FNLPL_KEY = 'iciciFnlpl';
    public static DEPOSITED_ACCOUNT_ICICI_FNLPL_VALUE = 'ICICI/FNLPL';
    public static DEPOSITED_ACCOUNT_ICICI_FTAPL_KEY = 'iciciFtapl';
    public static DEPOSITED_ACCOUNT_ICICI_FTAPL_VALUE = 'ICICI/FTAPL';


    public static NET_AMOUNT = 'NET_AMOUNT';
    public static TDS_AMOUNT = 'TDS_AMOUNT';
    public static TRIP_DEDUCTION = 'TRIP_DEDUCTION';
    public static NON_TRIP_DEDUCTION = 'NON_TRIP_DEDUCTION';
    public static TOTAL_APPROPRIATION = 'TOTAL_APPROPRIATION';


    // Font size
    public static FONT_SMALL = 11;
    // search regex pattern for collection
    public static SEARCH_REGEX_PATTERN = '^[0-9a-zA-Z][0-9-_,\/a-zA-Z," "]*[0-9a-zA-Z]*$';
    public static SEARCH_TEXT_MAX_LENGTH = 1000;

    public static EC_RECIPT_SUSPENSE_REPORT = '/generateReport/EcReceiptSuspenseReportDownload';

}
