/*
 * Created on Tue Feb 19 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
export class RoleId {
    public static FORTIGO_READ_ONLY_USER = 1;
    public static FBO_TEAM_LEADER = 2; // Finance Back Office
    public static FBO_TEAM_MEMBER = 3;
    public static FORTIGO_TXN_TEAM_LEADER = 4;
    public static FORTIGO_TXN_TEAM_MEMBER = 5;
    public static MAGUS_TL = 6;
    public static MAGUS_BO_TEAM = 7;
    public static GREET_TL = 8;
    public static GREET_BO_TEAM = 9;
    public static SALES_MANAGER = 10;
    public static SALES_EXECUTIVE = 11;
    public static OPERATION_MANAGER = 12;
    public static OPERATION_EXECUTIVE = 13;
    public static TECH_BO_TL = 14;
    public static TECH_BO = 15;
    public static RBO_TEAM_LEADER = 16; // Regional Back Office
    public static RBO_TEAM_MEMBER = 17;
    public static NRO_SALES_REP = 18;
    public static OPERATION_MANAGER_HO = 19;
    public static TBO_BTH = 20;
    public static HR_EXECUTIVE = 21;
    public static FBO_AR = 22;
    public static SALES_MANAGER_PAYMENT_AUTHORIZED = 23;
    public static OPERATION_MANAGER_PAYMENT_AUTHORIZED = 24;
    public static MARKETING_HO = 25;
    public static FBO_WITH_FUEL_PAYMENT = 26;
    public static OPERATION_MANAGER_SYSTEM = 27;
    public static REGIONAL_MANAGER = 28;
    public static TERMS_TL = 29;
    public static COLLECTION_BACK_OFFICE = 30;
    public static KEY_ACCOUNT_MANAGER = 31;
    public static TBO_BTH_LEAD = 32;
    public static REGIONAL_KEY_ACCOUNT_MANAGER = 33;
    public static FBO_TM_WITHOUT_BANK_ACCOUNT_UPDATE = 34;
    public static FBO_AR_WITH_BANK_ACCOUNT_UPDATE = 35;
    public static FBO_TM_WITH_FULL_PAYMENT_ACCESS = 36;
    public static MEDIA_CONTENT_PUBLISHER = 38;

    public static FORTIGO_FINANCE_ROLES = [RoleId.FBO_TEAM_LEADER, RoleId.FBO_TEAM_MEMBER, RoleId.FBO_WITH_FUEL_PAYMENT, RoleId.FBO_AR, RoleId.FBO_TM_WITHOUT_BANK_ACCOUNT_UPDATE, RoleId.FBO_AR_WITH_BANK_ACCOUNT_UPDATE, RoleId.FBO_TM_WITH_FULL_PAYMENT_ACCESS];
    public static FORTIGO_SALES_ROLES = [RoleId.SALES_MANAGER, RoleId.SALES_MANAGER_PAYMENT_AUTHORIZED];
    public static FORTIGO_OPERATIONS_ROLES = [RoleId.OPERATION_MANAGER, RoleId.OPERATION_MANAGER_PAYMENT_AUTHORIZED, RoleId.OPERATION_MANAGER_PAYMENT_AUTHORIZED, RoleId.OPERATION_MANAGER_SYSTEM];
    public static FORTIGO_SALES_AND_OPERATIONS_ROLES = RoleId.FORTIGO_SALES_ROLES.concat(...RoleId.FORTIGO_OPERATIONS_ROLES);
    public static FORTIGO_SALES_REGIONAL_AND_OPERATIONS_ROLES = RoleId.FORTIGO_SALES_ROLES.concat(...RoleId.FORTIGO_OPERATIONS_ROLES).concat(RoleId.REGIONAL_MANAGER);
}

export class FortigoConstant {
    // interceptor name/values - TODO name should be - seperated Title case (like Channel-Type)
    public static TOKEN_HEADER_NAME = 'token';
    public static CHILDREN_HEADER_NAME = 'children';
    public static USER_ID_HEADER_NAME = 'userId';
    public static CHANNEL_TYPE_HEADER_NAME = 'channel_name';
    public static CHANNEL_TYPE_HEADER_VALUE = 'web_desktop';

    // FNLPL
    public static FNLPL_VALUE = 'Fortigo Network Logistics Private Limited';
    public static FNLPL = 'fnlpl';
    public static FNLPL_COMPANY_ID = 1920171030190227;
    // FTAPL
    public static FTAPL_VALUE = 'Fortigo Transport Agency Private Limited';
    public static FTAPL = 'ftapl';
    public static FTAPL_COMPANY_ID = 6620180509131900;

    public static ICON_FILE_NAME = 'icons.json';

    // Modal window properties
    public static SMALL_MODAL = '250px';
    public static MEDIUM_MODAL = '550px';

    // Form modes
    public static FORM_VIEW_MODE = 'view';
    public static FORM_EDIT_MODE = 'edit';
    public static FORM_CREATE_MODE = 'create';

    // grid pagination properties
    public static STARTING_PAGE_INDEX = 0;
    public static DEFAULT_GRID_PAGE_SIZE_OPTIONS = [50];

    // headers
    public static FILE_OPERATION_HEADER_KEY = 'File-Operation';
    public static FILE_UPLOAD_HEADER_VALUE = 'upload';
    public static FILE_DOWNLOAD_HEADER_VALUE = 'download';
    public static FILE_SERVICE_HEADER_VALUE = 'service';
    public static MODULE_INTERCEPTOR_HEADER_KEY = 'module';

    public static SIDE_NAV_DEFAULT_ICON = 'account_circle';

    // swal default timer
    public static ALERT_DEFAULT_TIME_IN_SEC = 20; // 20 secs

    // filter storage default expiry
    public static FILTER_DEFAULT_EXPIRY_IN_HOUR = 24;

    // session and idle timers
    public static IDLE_TIME_IN_SEC = 1500; // 25 mins
    public static TIMEOUT_TIME_IN_SEC = 300; // 5 mins
    public static PING_TIME_IN_SEC = 5; // 5 sec

    public static SESSION_COOKIE_NAME = 'loginSession';
    public static SESSION_COOKIE_VALUE_IN_SEC = (1200 - 1); // 20 mins - 1 sec
    public static SESSION_COOKIE_EXPIRY_IN_SEC = (FortigoConstant.IDLE_TIME_IN_SEC + 60); // idle time + 1 min
    public static SESSION_COOKIE_PATH = '/';
    public static SESSION_COOKIE_DOMAIN = '.'.concat(location.hostname.split('.').slice(location.hostname.split('.').length - 2).join('.'));

    // snackbar default timer
    public static SNACKBAR_DEFAULT_DURATION_IN_SEC = 4; // 4 secs

    public static FILTER_DATE_FORMAT = 'YYYY-MM-DD';
    public static INDIAN_CUR_SYM = 'INR';
    public static INDIAN_DATE_FORMAT = 'dd-MMM-yy';
    public static INDIAN_DATE_FORMAT_DATE_PICKER = 'DD-MMM-YY';
    public static INDIAN_MONTH_YEAR_FORMAT_DATE_PICKER = 'MMM-YY';
    public static INDIAN_DATE_FORMAT_GRID = 'dd-MMM-yy';
    public static INDIAN_TIME_FORMAT = 'h:mm a';
    public static INDIAN_DATE_AND_TIME_FORMAT = 'dd-MMM-yy h:mm a';
    public static INDIAN_DATE_AND_TIME_IN_SEC_FORMAT = 'dd-MMM-yy h:mm:ss a';

    public static ACCOUNT_MANAGEMENT_MODULE = 'account';
    public static TRIP_MANAGEMENT_MODULE = 'trip';
    public static TRIP_DOC_VIEW_PAGE = 'trip-doc-view';
    public static INVOICE_MANAGEMENT_MODULE = 'invoice';
    public static EXAMPLE_MODULE = 'example';
    public static CONTRACT_MANAGEMENT_MODULE = 'contract-management';
    public static COLLECTION_MANAGEMENT_MODULE = 'collection';
    public static MEDIA_MANAGEMENT_MODULE = 'media';
    public static INDENT_TRIP_MANAGEMENT_MODULE = 'indent';
    public static CUSTOMER_COLLECTION_MANAGEMENT_MODULE = 'customer-detail';
    public static INVENTORY_MANAGEMENT_MODULE = 'inventory-management';
    public static INVENTORY_MANAGEMENT_ASSOCIATE_DISSOCIATE_PAGE = 'inventory-associate-dissociate';
    public static SUPPORT_MANAGEMENT_MODULE = 'support';
    public static DASHBOARD_MODULE = 'dashboard';
    public static EC_ACCOUNT_DASHBOARD_PAGE = 'ec_account_dashboard';
    public static COLLECTION_CYCLE_TIME_REPORT_PAGE = 'collection-cycle-time-report';
    public static UNBILLED_REVENUE_DASHBOARD_PAGE = 'unbilled-revenue';
    public static CUSTOMER_COLLECTION_SUMMARY = 'EC Collection Summary';

    // progress bar default properties
    public static PROGRESS_BAR_COLOR = 'warn';
    public static PROGRESS_BAR_MODE = 'determinate';
    public static PROGRESS_BAR_INITIAL_VALUE = 0;
    public static PROGRESS_BAR_INITIAL_BUFFER_VALUE = 0;

    // font size
    public static FONT_VERY_SMALL = 10;
    public static FONT_SMALL = 11;
    public static FONT_MEDIUM = 12;
    public static FONT_LARGE = 14;
    public static FONT_VERY_LARGE = 15;

    // border style
    public static BORDER_GREY = '1px solid #d9d9d9';
    public static BORDER_BLACK = '1px solid #cacaca';

    public static DEFAULT_FORM_FONT = FortigoConstant.FONT_VERY_LARGE;
    public static DEFAULT_FORM_BORDER = FortigoConstant.BORDER_GREY;
    public static DEFAULT_ACTION_ITEM_FONT = FortigoConstant.FONT_MEDIUM;

    // Fortigo Searchable default limit value
    public static SEARCHABLE_LIMIT_DEFAULT_VALUE = 30;

    public static SEARCHABLE_DROPDOWN_THRESHOLD_VALUE = 6;

    public static SUCCESS_RESPONSE = 'success';
    public static FAILURE_RESPONSE = 'failure';

    public static DEFAULT_DATE_VALUE = '1970-01-01 00:00:01';
    public static DEFAULT_STRING_VALUE = '';

    // Fortigo standard colors
    public static COLOR_BLUE = '#0a50a1';
    public static COLOR_MAROON = '#800000';
    public static COLOR_ORANGE = '#FFB100';
    public static COLOR_BLACK = 'black';
    public static COLOR_GREEN = '#5CAD00';
    public static COLOR_RED = '#E60000';
    public static COLOR_WHITE = '#ffffff';

    // Fortigo Constants for form validations.
    public static REQUIRED = 'required';
    public static MIN_LENGTH = 'minLength';
    public static MAX_LENGTH = 'maxLength';
    public static PATTERN = 'pattern';
    // Fortigo Constants for Swal Button Color
    public static DEFAULT_SWAL_CONFIRM_BUTTON_COLOR = '#3085d6';
    public static DEFAULT_SWAL_CANCEL_BUTTON_COLOR = '#d33';

}

export class FortigoFileType {
    public static PDF = 'application/pdf';
}

export class FortigoFileSize {
    // 10 MB default size.
    public static DEFAULT_FILE_SIZE = 10000;
}
