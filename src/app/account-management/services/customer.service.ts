import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Account } from '../models/account.model';
import { AccountFilterCriteria } from '../models/account-filter-model';
import { HeaderCalculationRequest, HeaderCalculationResponse } from '../models/header-calculation.model';
import { LoginControlService } from 'src/app/app-landing/services/login-control.service';
import { TreeNode } from 'primeng/api';

@Injectable()
export class CustomerService {
  private baseUrl = environment.baseUrl + environment.baseAccountManagementPath;
  private basePHPUrl = environment.baseUrlPHP;

  nationalManagerList: Array<any>;
  rmList: any;
  refreshAccount = new Subject<string>();
  refreshTarget = new Subject<string>();
  updateAccountId: any;
  customerDetail: any;
  customerDetails: any;
  accountFilteredData: any;
  userNameAvailable = new Subject<void>();
  openAddModal = new Subject<void>();
  openEditModal = new Subject<any>();
  openViewModal = new Subject<any>();
  customerUpdated = new Subject<any>();
  accountFilter = new Subject<any>();
  gotAccountDetails = new Subject<void>();
  customerType: any;
  salesManagerList: any;
  legalType: any;
  locationTypeList: any;
  managerViewData: Array<TreeNode> = [];
  companyCategory: any;
  selectedCompanyId: string;
  selectedCompanyName: string;
  industryType: any;
  commodities: any;
  headerCalculatedValues: Array<HeaderCalculationResponse> = new Array<HeaderCalculationResponse>();
  users: Array<any> = new Array<any>();
  summaryCycleTime: string;
  userId: string;
  userName: string;
  isManagerDataLoaded = new Subject<any>();
  customerReload = new Subject<any>();
  searchFilterToggler = new Subject<string>();
  accSummLoading: boolean;
  filterApplied: any;
  isSearchApplied: boolean;
  isTargetCalculated: boolean;
  rMDetails: Array<any> = [];
  rmAsNamData: Array<any> = [];
  namData: Array<any> = [];
  filterSelectedField: Array<AccountFilterCriteria> = new Array<AccountFilterCriteria>();
  public salesFilter = new Subject();
  public salesReload = new Subject();
  public meetingReload = new Subject();
  public meetingFilter = new Subject<any>();
  public managerReload = new Subject();
  public managerFilter = new Subject<any>();
  public loadingManager: boolean;
  public loadingCustomer: boolean;
  public loadingMeeting: boolean;

  companyList: Array<any> = [];
  rmViewFilter = new Subject();
  rmViewReload = new Subject();
  fortigoContacts: any[];
  salesCustomerList: any;
  meetingViewTo: any;
  meetingViewFrom: any;
  targetFilterApplied = new EventEmitter();
  locationList: any[];
  exptDateOfBus: Date;
  biddingDate: Date;
  accountAddressableFreightValue: void;
  accountAddressableFTL: void;
  accountExpectedMonthlyBusiness: void;
  constructor(private http: HttpClient, private _loginService: LoginControlService) {
    this.searchFilterToggler.subscribe((data: string) => {
      switch (data) {
        case 'filter':
          this.isSearchApplied = false;
          this.filterApplied = true;
          break;
        case 'search':
          this.isSearchApplied = true;
          this.filterApplied = false;
          break;
        default:
          this.isSearchApplied = false;
          this.filterApplied = false;
          break;
      }
    });
  }

  checkIfUserIsReadOnly() {
    return this.http.get(this.baseUrl + '/user/checkIfReadOnly/' + this.userId);
  }

  onLoad(listAll: boolean, data?: Object) {
    if (listAll) {
      return this.http.get(this.baseUrl + '/account/list');
    } else {
      return this.http.post(this.baseUrl + '/account/listByHierarchy', data);
    }
  }

  searchAccountWithHierarchy(data: Object) {
    return this.http.post(this.baseUrl + '/account/listByHierarchy', data);
  }

  getTargetRevenueAndMargin() {
    return this.http.get(this.baseUrl + '/account/listTarget');
  }

  getAccountDetails(id: any) {
    this.accSummLoading = true;
    return this.http.get(this.baseUrl + '/account/view/' + id);
  }

  getDetailsFromTemp(id: any) {
    return this.http.get(this.baseUrl + '/account/detail/' + id);
  }

  updateCustomer(data: any) {
    return this.http.put(this.baseUrl + '/account/update/' + data.accountStringId, data);
  }

  createCustomer(data: Account) {
    return this.http.post(this.baseUrl + '/account/create', data);
  }

  deleteCustomer(value: any) {
    return this.http.get(this.baseUrl + '/account/delete/' + value);
  }

  getCustomerType() {
    return this.http.get(this.baseUrl + '/account/customerType');
  }

  getLegalType() {
    return this.http.get(this.baseUrl + '/account/legalEntityType');
  }

  getCompanyCategory() {
    return this.http.get(this.baseUrl + '/account/category');
  }

  getIndustryType() {
    return this.http.get(this.baseUrl + '/account/industryType');
  }

  getCommodities() {
    return this.http.get(this.baseUrl + '/account/commodityTypes');
  }

  searchCustomer(query: string) {
    return this.http.get(this.baseUrl + '/account/search/' + query);
  }

  getUserName(id) {
    return this.http.get(this.baseUrl + '/account/userDetail/' + id, { responseType: 'text' });
  }

  getUsers() {
    return this.http.get(this.baseUrl + '/account/4TigoUser/list');
  }

  applyAccountFilter(value: any) {
    return this.http.get(this.baseUrl + '/account/applyAccountFilter', { params: value });
  }

  applyAccountFilterWithHierarchy(value: any) {
    return this.http.post(this.baseUrl + '/account/applyAccountFilterByHierarchy', value);
  }

  getNationalAccountManagerList() {
    return this.http.get(this.baseUrl + '/account/nationalAccountManager/list');
  }

  getLocationTypeList() {
    return this.http.get(this.baseUrl + '/account/locationType');
  }

  getGridHeaderValues(headerCalculationRequests: Array<HeaderCalculationRequest>) {
    return this.http.post(this.baseUrl + '/account/getGridHeaderValues', headerCalculationRequests);
  }

  getSummaryCycleTime() {
    return this.http.get(this.baseUrl + '/account/getSummaryCycleTime');
  }

  getRMsForCompany(companyId: string) {
    return this.http.get(this.baseUrl + '/account/listRMByCompanyId/' + companyId);
  }

  getRMDashboard(rmIds?: Array<any>) {
    return this.http.post(this.baseUrl + '/account/listRMView', { rmManagerIds: rmIds, isReadOnly: this._loginService.isReadOnlyUser });
  }

  getRegionalManagerList() {
    return this.http.get(this.baseUrl + '/account/regionalAccountManager/list');
  }

  getSalesManagerDataList(smIds: string) {
    return this.http.post(this.baseUrl + '/account/listSalesView', { salesManagerIds: smIds, isReadOnly: this._loginService.isReadOnlyUser });
  }

  getSalesManager() {
    return this.http.get(this.baseUrl + '/account/salesManager/list');
  }

  getCompaniesForSalesManager(salesManagerId: string) {
    return this.http.get(this.baseUrl + '/account/listSalesCompanyView/' + salesManagerId);
  }

  getMeetingView(userIds: Array<any>, from, to) {
    return this.http.post(this.baseUrl + '/account/listMeetingForUser', { userIds: userIds, isReadOnly: this._loginService.isReadOnlyUser, fromDate: from, toDate: to, loginUserId: this._loginService.userId.toString() });
  }

  getSMIds(rmId: string) {
    return this.http.get(this.basePHPUrl + '?action=getUserHierarchyAPI&userId=' + rmId + '&bpId=Xghdt7i0945');
  }

  getTargetList(compId: string, fromDate, toDate) {
    return this.http.post(this.baseUrl + '/target/list', { companyId: compId, fromDate: fromDate, toDate: toDate });
  }

  updateTargetList(data: any) {
    return this.http.post(this.baseUrl + '/target/update', data);
  }

  listRMsForLoggedInUser(data: any) {
    return this.http.post(this.baseUrl + '/account/listRMsForLoggedInUser', data);
  }

  listSMForRM() {
    return this.http.get(this.baseUrl + '/account/listSMForRM');
  }

  listSMasNAMCompanyView(data: string) {
    return this.http.post(this.baseUrl + '/account/listSMasNAMCompanyView', { 'smManagerIds': data });
  }

  getSalesManagerList() {
    return this.http.get(this.baseUrl + '/account/salesManager/list');
  }
}
