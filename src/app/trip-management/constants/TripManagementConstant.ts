/*
 * Created on Tue May 19 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class TripManagementConstant {

    public static ELIGIBLE_KEY = 'eligible_for_invoicing';
    public static ELIGIBLE_VALUE = 'Eligible';
    public static SENT_FOR_VALIDATION_KEY = 'sent_for_validation';
    public static SENT_FOR_VALIDATION_VALUE = 'Validation Pending';
    public static VALIDATION_FAILED_KEY = 'validation_rejected'; // As per request by @Samyuktha.
    public static VALIDATION_FAILED_VALUE = 'Validation Rejected';
    public static READY_FOR_INVOICING_SYSTEM_KEY = 'ready_for_invoicing_system';
    public static READY_FOR_INVOICING_SYSTEM_VALUE = 'Ready - Invoicing';
    public static READY_FOR_INVOICING_MANUAL_KEY = 'ready_for_invoicing_manual';
    public static READY_FOR_INVOICING_MANUAL_VALUE = 'Ready - Upload';
    // Tabs added as per request made by anusha.
    public static GENERATED_KEY = 'submission_pending';
    public static GENERATED_VALUE = 'Generated';
    public static SUBMITTED_KEY = 'submitted';
    public static SUBMITTED_VALUE = 'Submitted';

    public static INVOICE_RESERVED_KEY = 'invoice_reserved';
    public static INVOICE_RESERVED_VALUE = 'Invoice # Reserved';
    public static ALL_KEY = 'all';
    public static ALL_VALUE = 'All';

    public static FIXED_RATE = 'fixed_rate';
    public static RATE_PER_TON = 'per_ton_rate';
    public static OTHERS = 'others';
    public static OTHERS_KEY = 'othersBillToDetails';

    // Grid constants
    // Upload Manual Invoice & Trip Dashboard
    public static UNIQUE_COLUMN = 'tripId';
    public static TABLE_ROW_HEIGHT = '25px';
    // Trip Dashboard
    public static SORT_COLUMN = 'pickUpDate';

    // Rfv screen constants
    public static APPROVE_AND_GENERATE = 'Approve & Generate';
    public static APPROVE = 'Approve';
    public static REJECT = 'Reject';
    public static SAVE = 'Save';
    public static SUBMIT = 'Submit';
    public static CUSTOMER_DETAILS = 'Customer Details';
    public static CONSIGNEE_DETAILS = 'Consignee Details';
    public static CONSIGNEE_DETAILS_KEY = 'consigneeDetails';
    public static CONSIGNOR_DETAILS = 'Consignor Details';
    public static CONSIGNOR_DETAILS_KEY = 'consignorDetails';
    public static CONSIGNEE = 'consignee';
    public static CONSIGNOR = 'consignor';
    public static END_CUSTOMER = 'End Customer';
    public static END_CUSTOMER_KEY = 'customerDetails';
    public static END_CUSTOMER_ALIAS = 'Bill To Location';
    public static END_CUSTOMER_ALIAS_KEY = 'billToDetails';
    public static IGST = 'IGST';
    public static CGST = 'CGST';
    public static SGST = 'SGST';
    public static GENERATE_INVOICE = 'Generate Invoice';
    public static CANCEL = 'Cancel';

    // To store tab index corresponding to each tab.
    public static TRIP_INVOICING_TAB_DATA = {
        eligible_for_invoicing: 0,
        sent_for_validation: 1,
        validation_rejected: 2,
        ready_for_invoicing_system: 3,
        ready_for_invoicing_manual: 4,
        submission_pending: 5,
        submitted: 6,
        invoice_reserved: 7,
        // FIXME should be a valid key.
        null: 8
    };
    public static SEARCH_REGEX_PATTERN = '^[0-9a-zA-Z][0-9,a-zA-Z]*[0-9a-zA-Z]*$';
    // To get Month Value.
    // FIXME Put this in util class.
    public static findMonth = {
        1: 'Jan',
        2: 'Feb',
        3: 'Mar',
        4: 'Apr',
        5: 'May',
        6: 'Jun',
        7: 'Jul',
        8: 'Aug',
        9: 'Sep',
        10: 'Oct',
        11: 'Nov',
        12: 'Dec'
    };
    // filter local storage - keys
    public static MODULE_FILTER_KEY = 'trip-filter';

}
