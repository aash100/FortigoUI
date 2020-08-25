/*
 * Created on Tue May 19 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class InvoiceManagementConstant {

    // invoice status
    public static RESERVED_KEY = 'reserved';
    public static RESERVED_VALUE = 'Reserved';
    public static RESERVED_TOOLTIP_TEXT = 'Reserved invoice numbers';
    public static SUBMISSION_PENDING_KEY = 'submission_pending';
    public static SUBMISSION_PENDING_VALUE = 'Submission Pending';
    public static SUBMISSION_PENDING_TOOLTIP_TEXT = 'Invoice generated but not submitted to customer(submission date not entered in the system)';
    public static SUBMITTED_KEY = 'submitted';
    public static SUBMITTED_VALUE = 'Submitted';
    public static SUBMITTED_TOOLTIP_TEXT = 'Invoices submitted to customer and receivables is not zero';
    public static ZERO_RECEIVABLES_KEY = 'zero_receivables';
    public static ZERO_RECEIVABLES_VALUE = 'Zero Receivables';
    public static ZERO_RECEIVABLES_TOOLTIP_TEXT = 'Receivables is zero and not settled';
    public static ALL_KEY = 'all';
    public static ALL_VALUE = 'All';

    // actions
    public static GENERATE_CREDIT_NOTE = 'Generate Credit Note';
    public static RESERVE_INVOICE_NO = 'Reserve Invoice #';
    public static DISCARD_INVOICE_NO = 'Discard Invoice #';

    // Grid constants
    public static UNIQUE_COLUMN = undefined;
    public static SORT_COLUMN = 'invoiceDate';
    public static TABLE_ROW_HEIGHT = '25px';

    // To store tab index corresponding to each tab.
    public static INVOICE_TAB_DATA = {
        submission_pending: 0,
        submitted: 1,
        zero_receivables: 2,
        reserved: 3,
        null: 4
    };
    public static SEARCH_REGEX_PATTERN = '^[0-9a-zA-Z][0-9,\/a-zA-Z]*[0-9a-zA-Z]*$';
    // filter local storage - keys
    public static MODULE_FILTER_KEY = 'invoice-filter';
}
