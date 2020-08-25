/*
 * Created on Tue May 19 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class DashboardURL {
    // Collection Cycle Time Dashboard URLs
    // RM View
    public static RM_VIEW_LIST_CYCLE_TIME_REPORT_RM = '/generateReport/cycleTimeReportRM';
    public static RM_VIEW_LIST_CYCLE_TIME_REPORT_FFE = '/generateReport/cycleTimeReportFFE';
    public static RM_VIEW_LIST_CYCLE_TIME_REPORT_COMPANY = '/generateReport/cycleTimeReportCompany';
    // Customer View
    public static CUSTOMER_VIEW_LIST_CYCLE_TIME_REPORT_RM = '/generateReport/cycleTimeCustomerReportRM';
    public static CUSTOMER_VIEW_LIST_CYCLE_TIME_REPORT_FFE = '/generateReport/cycleTimeCustomerReportFFE';
    public static CUSTOMER_VIEW_LIST_CYCLE_TIME_REPORT_COMPANY = '/generateReport/cycleTimeCustomerReportCompany';
    // Filters
    public static FILTER_RM_LIST = '/generateReport/cycleTimeFilterRMs';
    public static FILTER_CM_LIST = '/generateReport/cycleTimeFilterCMs';
    public static FILTER_SM_LIST = '/generateReport/cycleTimeFilterSMs';

    public static EC_RECIPT_SUSPENSE_REPORT = '/generateReport/EcReceiptSuspenseReportDownload';


    public static FILTER_COMPANIES_LIST = '/generateReport/cycleTimeFilterCompanies';


    // Unbilled Report Dashboard URLs
    public static LIST_UNBILLED_REPORT_RM = '/generateReport/unbilledReportRM';
    public static LIST_UNBILLED_REPORT_FFE = '/generateReport/unbilledReportFFE';
    public static LIST_UNBILLED_REPORT_COMPANY = '/generateReport/unbilledReportCompany';
    // Filters
    public static FILTER_TRIP_SM_LIST = '/generateReport/cycleTimeFilterSMs';
    // trip ids
    public static FILTERED_TRIP_ID_LIST = '/generateReport/unbilledTripIds';
}
