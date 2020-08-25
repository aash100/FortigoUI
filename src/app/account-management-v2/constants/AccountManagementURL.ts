/*
 * Created on Tue May 19 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class AccountManagementURL {
    public static JSON_DATA_URL = '/src/app/core/data/';
    // Account Management Landing
    public static AM_LANDING_URL = 'account/landing';

    // Account Management - account
    public static AM_CYCLE_TIME_SUMMARY_URL = '/account/getSummaryCycleTime';
    public static AM_DASHBOARD_COMPANY_LIST_URL = '/account/list';
    public static AM_DASHBOARD_WITH_HIERARCHY_LIST_URL = '/account/listByHierarchy';
    public static AM_DASBOARD_RM_LIST_BY_COMPANY_URL = '/account/listRMByCompanyId/';
    public static AM_DASBOARD_RM_LIST_URL = '/account/listRMView/';
    public static AM_DASBOARD_COMPANY_LIST_BY_RM_URL = '/account/listRMCompanyView/';
    public static AM_ACCOUNT_VIEW_URL = '/account/view/';
    public static AM_ACCOUNT_DELETE_URL = '/account/delete/';
    public static AM_ACCOUNT_SEARCH_URL = '/account/search/';
    public static AM_ACCOUNT_ACTIVE_COMPANIES_LIST = '/meeting/list/companies'; // move service to account controller
    public static AM_CUSTOMER_TYPE = '/account/customerType';
    public static AM_LEGAL_ENTITY_TYPE = '/account/legalEntityType';
    public static AM_CATEGORY = '/account/category';
    public static AM_INDUSTRY_TYPE = '/account/industryType';
    public static AM_COMMODITY_TYPE = '/account/commodityTypes';
    public static AM_NAM_LIST = '/account/nationalAccountManager/list';
    public static AM_LOCATION_TYPE = '/account/locationType';
    public static AM_GET_RM = '/account/regionalAccountManager/list';
    public static AM_GET_LOCATION_LIST = '/contact/list/locations';
    public static AM_ACCOUNT_CREATE = '/account/create';
    public static AM_AACOUNT_DETAIL = '/account/userDetail/';
    public static AM_GET_COMPANY_IDS = '?action=getUserHierarchyAPI&userId=';
    public static AM_BPID = '&bpId=Xghdt7i0945';
    public static AM_UPDATE_ACCOUNT_URL = '/account/update/';
    public static AM_GET_SALES_LIST = '/account/salesManager/list';

    // Account Management - meeting
    public static AM_MEETING_LIST_URL = '/meeting/list';
    public static AM_MEETING_TYPE_URL = '/meeting/meetingtype';
    public static AM_MEETING_VIEW_URL = '/meeting/view/';
    public static AM_MEETING_PARTICIPANT_LIST = '/meeting/list/participant/';
    public static AM_MEETING_CREATE_URL = '/meeting/create';
    public static AM_MEETING_DELETE_URL = '/meeting/delete/';
    public static AM_MEETING_UPDATE_URL = '/meeting/update';
    public static AM_MEETING_USERS_URL = '/account/listMeetingForUser';

    // Account Management - document
    public static AM_DOUCUMENT_TYPE = '/document/getDocTypes';
    public static AM_DOCUMENT_INTERNAL_COMPANY = '/account/list/internalCompanies';
    public static AM_GET_DOCUMENT = '/document/getAllActiveDocuments/';
    public static AM_GET_DOCUMENT_STATUS = '/document/getAllStatus';
    public static AM_DELETE_DOC = '/document/remove';
    public static AM_ADD_DOC_FILE = '/document/addDocumentFile';
    public static AM_ADD_DOC_OBJ = '/document/addDocumentObject';
    public static AM_ADD_DOC_UPDATE = '/document/update';
    public static AM_GET_FILTERED_DOCUMENTS = '/document/getFilteredDocuments';
    public static AM_DOCUMENT_DOWNLOAD = '/document/download/';

    // Account Management - contact
    public static AM_CONTACT_LIST_URL = '/contact/list/';
    public static AM_CONTACT_VIEW_URL = '/contact/view/';
    public static AM_CONTACT_LOCATION_LIST_URL = '/contact/list/locations';
    public static AM_CONTACT_CREATE_URL = '/contact/create';
    public static AM_CONTACT_DELETE_URL = '/contact/delete';
    public static AM_CONTACT_UPDATE_URL = '/contact/update';

    // Account Management - target
    public static AM_TARGET_LIST = '/target/list';
    public static AM_TARGET_USER_NAME = '/account/userDetail/';
    public static AM_CREATE_TARGET_URL = '/target/create';

    // Manager view
    public static AM_List_RMS = '/account/listRMsForLoggedInUser';
    public static AM_LIST_SMS_FOR_RM = '/account/listSMForRM';
    public static AM_LIST_SM_AS_NAM = '/account/listSMasNAMCompanyView';

}
