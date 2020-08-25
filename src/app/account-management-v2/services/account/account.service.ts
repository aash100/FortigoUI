/*
 * Created on Wed Feb 27 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AccountManagementURL } from '../../constants/AccountManagementURL';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';

@Injectable()
export class AccountService {
  private baseUrl = environment.baseUrl + environment.baseAccountManagementPath;
  private basePHPUrl = environment.baseUrlPHP;
  public customerViewUpdated = new EventEmitter();
  public managerViewUpdated = new EventEmitter();
  public meetingViewUpdated = new EventEmitter();
  rMDetails: Object[];
  rmAsNamData: Object[];

  constructor(private http: HttpClient, private _loginControlServiceV2: LoginControlV2Service) { }

  /**
   * Return observable for Summary Cycle Time data
   */
  public getSummaryCycleTime(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_CYCLE_TIME_SUMMARY_URL);
  }

  /**
   * Return observable for Company
   * @param  {boolean} listAll
   * @param  {Object} data?
   */
  public getCompanyDashbaord(listAll: boolean, data?: Object): Observable<any> {
    if (listAll) {
      return this.http.get(this.baseUrl + AccountManagementURL.AM_DASHBOARD_COMPANY_LIST_URL);
    } else {
      return this.http.post(this.baseUrl + AccountManagementURL.AM_DASHBOARD_WITH_HIERARCHY_LIST_URL, data);
    }
  }

  /**
   * Return observable for Companies List data
   */
  public getCompaniesList(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_ACCOUNT_ACTIVE_COMPANIES_LIST);
  }

  /**
   * Return observable for Company Dasboard With RMs data
   * @param  {string} companyId: Selected company id
   */
  public getCompanyDasboardWithRMs(companyId: string): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_DASBOARD_RM_LIST_BY_COMPANY_URL + companyId);
  }

  /**
   * Return observable for Dasboard With RMs data
   * @param  {boolean} listAll
   * @param  {Object} data?
   */
  public getRMDashbaord(listAll: boolean, data?: Object): Observable<any> {
    if (listAll) {
      return this.http.get(this.baseUrl + AccountManagementURL.AM_DASBOARD_RM_LIST_URL);
    } else {
      return this.http.post(this.baseUrl + AccountManagementURL.AM_DASHBOARD_WITH_HIERARCHY_LIST_URL, data);
    }
  }

  /**
   * Return observable for RM Dasboard With Companies data
   * @param  {string} rmId: Selected rm id
   */
  public getRMDasboardWithCompanies(rmId: string): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_DASBOARD_COMPANY_LIST_BY_RM_URL + rmId);
  }

  /**
   * Return observable for Account data
   * @param  {string} companyId: selected company
   */
  public viewAccount(companyId: string): Observable<any> {
    return this.http.get<Array<any>>(this.baseUrl + AccountManagementURL.AM_ACCOUNT_VIEW_URL + companyId);
  }

  /**
   * Return observable for deleting account
   * @param  {any} companyId: selected company id
   */
  public deleteAccount(companyId: any): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_ACCOUNT_DELETE_URL + companyId);
  }

  /**
   * Return observable for searching account
   * @param  {string} searchText: text typed in the search box.
   */
  public searchAccount(searchText: string): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_ACCOUNT_SEARCH_URL + searchText);
  }

  /**
   * Return observable for Customer Type data
   */
  public getCustomerType(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_CUSTOMER_TYPE);
  }

  /**
   * Return observable for Legal Type data
   */
  public getLegalType(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_LEGAL_ENTITY_TYPE);
  }

  /**
   * Return observable for Company Category data
   */
  public getCompanyCategory(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_CATEGORY);
  }

  /**
   * Return observable for Industry Type data
   */
  public getIndustryType(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_INDUSTRY_TYPE);
  }

  /**
   * Return observable for Commodities data
   */
  public getCommodities(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_COMMODITY_TYPE);
  }

  /**
   * Return observable for National Account Manager List data
   */
  public getNationalAccountManagerList(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_NAM_LIST);
  }

  /**
   * Return observable for Location Type List data
   */
  public getLocationTypeList(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_LOCATION_TYPE);
  }

  /**
   * Return observable to get Account AM Data.
   * @param  {{companyIds:'', userIds: '' }} data: Filter values
   */
  public filterAccountByAM(data: { companyIds: '', userIds: '' }): Observable<any> {
    return this.http.post(this.baseUrl + AccountManagementURL.AM_DASHBOARD_WITH_HIERARCHY_LIST_URL, data);
  }

  /**
   * Search customer by the hierarchy
   * @param  {any} data
   */
  public searchCustomerByHierarchy(data: any): Observable<any> {
    return this.http.post(this.baseUrl + AccountManagementURL.AM_DASHBOARD_WITH_HIERARCHY_LIST_URL, data);
  }



  /**
   * Return observable to get company data
   * @param  {string} userId
   */
  public getCompanyIds(userId: string): Observable<any> {
    return this.http.get(this.basePHPUrl + AccountManagementURL.AM_GET_COMPANY_IDS + userId + AccountManagementURL.AM_BPID);
  }

  /**
   * Return observable for Location Type List data
   * @param  {any} userId:selected user id
   */
  public getUserName(userId: any): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_AACOUNT_DETAIL + userId, { responseType: 'text' });
  }

  /**
   * Return observable for Routes Oprated data
   */
  public getRoutesOprated(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_MEETING_LIST_URL);
  }

  /**
   * Return observable for creating new account
   * @param  {Account} data: All account data.
   */
  public createCustomer(data: Account): Observable<any> {
    return this.http.post(this.baseUrl + AccountManagementURL.AM_ACCOUNT_CREATE, data);
  }

  /**
   * return observable for meeting list
   * @param  {string} companyId: Company id
   */
  public getMeetinsgList(companyId: string): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_MEETING_LIST_URL + companyId);
  }

  /**
   * return observable for Regional Manager
   */
  public getRegionalManagerList(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_NAM_LIST);
  }

  /**
   * return observable to update account
   * @param  {any} data: account data
   */
  public updateCustomer(data: any) {
    return this.http.put(this.baseUrl + AccountManagementURL.AM_UPDATE_ACCOUNT_URL + data.accountStringId, data);
  }
  /**
     * returns observable for list of rms for logged in user
     * @param data 
     */
  public listRMsForLoggedInUser(data: any) {
    return this.http.post(this.baseUrl + AccountManagementURL.AM_List_RMS, data);
  }

  /**
 * returns observable for list of sms for rm
 */
  public listSMForRM() {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_LIST_SMS_FOR_RM);
  }

  /**
 * returns observable for list of rms for logged in user
 * @param {string} data 
 */
  public listSMasNAMCompanyView(data: string) {
    return this.http.post(this.baseUrl + AccountManagementURL.AM_LIST_SM_AS_NAM, { 'smManagerIds': data });
  }

  /**
* returns observable for list of sales manager
* @param {string} smIds: Sales managers ids 
*/
  public getSalesManagerDataList(smIds: string) {
    return this.http.post(this.baseUrl + '/account/listSalesView', { salesManagerIds: smIds, isReadOnly: this._loginControlServiceV2.isReadOnlyUser });
  }

  /**
* returns observable for list of companies for sales manager
* @param {string} salesManagerId: Sales managers ids 
*/
  public getCompaniesForSalesManager(salesManagerId: string) {
    return this.http.get(this.baseUrl + '/account/listSalesCompanyView/' + salesManagerId);
  }

  /**
* returns observable for list of companies for RMs
* @param {string} smIds: Sales managers ids 
*/
  public getRMsForCompany(companyId: string) {
    return this.http.get(this.baseUrl + '/account/listRMByCompanyId/' + companyId);
  }
}
