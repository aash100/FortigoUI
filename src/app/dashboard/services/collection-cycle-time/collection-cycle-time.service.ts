/*
 * Created on Fri Aug 09 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

import { DashboardURL } from '../../constants/DashboardURL';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { CollectionCycleTimeFilterModel } from '../../models/collection-cycle-time-filter.model';

@Injectable()
export class CollectionCycleTimeService {

  private baseUrl = environment.baseUrl + environment.baseReportsPath;
  public tripSourcingManager: Array<any>;
  public regionalManager: Array<any>;
  public collectionManager: Array<any>;
  public customerName: Array<any>;

  constructor(private _http: HttpClient, private _loginService: LoginControlV2Service) { }

  /**
   * Method used to create headers consisting role_id and user_id.
   * @returns HttpHeaders : containing role_id and user_id.
   */
  private getModuleHeader(): HttpHeaders {
    const headers = new HttpHeaders().set(FortigoConstant.MODULE_INTERCEPTOR_HEADER_KEY, FortigoConstant.COLLECTION_CYCLE_TIME_REPORT_PAGE);
    return headers;
  }

  /**
   * This function extracts keys from object and adds as a plain key/value pair
   * @param  {any} data: input payload
   * @returns any: payload after adding extracted keys
   */
  private addFilterFlatData(data: any, filter: CollectionCycleTimeFilterModel): any {
    const filterKeys = Object.getOwnPropertyNames(filter);
    filterKeys.forEach((eachkey) => {
      data[eachkey] = filter[eachkey];
    });
    return data;
  }

  /**
   * This method is use to get Cycle Time Report RM
   * @param  {CollectionCycleTimeFilterModel} filter? Optional paramter for filter data
   */
  public getRMViewCycleTimeReportRM(filter?: CollectionCycleTimeFilterModel) {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.LIST_CYCLE_TIME_REPORT_RM, {}, { headers });
    let data = { 'userId': this._loginService.userId };
    // FIXME @Mayur: Remove iteration once filter is made an object
    if (filter) {
      data = this.addFilterFlatData(data, filter);
    }
    return this._http.post(this.baseUrl + DashboardURL.RM_VIEW_LIST_CYCLE_TIME_REPORT_RM, data);
  }

  /**
  * This method is use to get Cycle Time Report FFE
   * @param  {string} rmId: RM id of selected RM
   * @param  {CollectionCycleTimeFilterModel} filter? Optional paramter for filter data
  */
  public getRMViewCycleTimeReportFFE(rmId: string, filter?: CollectionCycleTimeFilterModel) {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.LIST_CYCLE_TIME_REPORT_FFE, { rmId: rmId }, { headers });
    let data = { rmId: rmId, 'userId': this._loginService.userId };
    // FIXME @Mayur: Remove iteration once filter is made an object
    if (filter) {
      data = this.addFilterFlatData(data, filter);
    }
    return this._http.post(this.baseUrl + DashboardURL.RM_VIEW_LIST_CYCLE_TIME_REPORT_FFE, data);
  }

  /**
  * This method is use to get Cycle Time Report Company
   * @param  {string} rmId: RM id of selected RM
   * @param  {string} ffeId: FFE id of the selected RM
   * @param  {CollectionCycleTimeFilterModel} filter? Optional paramter for filter data
  */
  public getRMViewCycleTimeReportCompany(rmId: string, ffeId: string, filter?: CollectionCycleTimeFilterModel) {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.LIST_CYCLE_TIME_REPORT_COMPANY, { rmId: rmId, ffeId: ffeId }, { headers });
    let data = { rmId: rmId, ffeId: ffeId, 'userId': this._loginService.userId };
    // FIXME @Mayur: Remove iteration once filter is made an object
    if (filter) {
      data = this.addFilterFlatData(data, filter);
    }
    return this._http.post(this.baseUrl + DashboardURL.RM_VIEW_LIST_CYCLE_TIME_REPORT_COMPANY, data);
  }

  /**
  * This method is use to get Cycle Time Report Company
   * @param  {CollectionCycleTimeFilterModel} filter? Optional paramter for filter data
  */
  public getCustomerViewCycleTimeReportCompany(filter?: CollectionCycleTimeFilterModel, isToPay?: boolean) {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.LIST_CYCLE_TIME_REPORT_COMPANY, { rmId: rmId, ffeId: ffeId }, { headers });
    let data = { 'userId': this._loginService.userId };
    // FIXME @Mayur: Remove iteration once filter is made an object
    if (filter) {
      data = this.addFilterFlatData(data, filter);
    }
    if (isToPay) {
      data['loadType'] = 'to_pay';
    }
    return this._http.post(this.baseUrl + DashboardURL.CUSTOMER_VIEW_LIST_CYCLE_TIME_REPORT_COMPANY, data);
  }

  /**
   * This method is use to get Cycle Time Report RM
   * @param  {string} companyId: Company id of selected Company
   * @param  {CollectionCycleTimeFilterModel} filter? Optional paramter for filter data
   */
  public getCustomerViewCycleTimeReportRM(companyId: string, filter?: CollectionCycleTimeFilterModel, isToPay?: boolean) {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.LIST_CYCLE_TIME_REPORT_RM, {}, { headers });
    let data = { companyId: companyId, 'userId': this._loginService.userId };
    // FIXME @Mayur: Remove iteration once filter is made an object
    if (filter) {
      data = this.addFilterFlatData(data, filter);
    }
    if (isToPay) {
      data['loadType'] = 'to_pay';
    }
    return this._http.post(this.baseUrl + DashboardURL.CUSTOMER_VIEW_LIST_CYCLE_TIME_REPORT_RM, data);
  }

  /**
  * This method is use to get Cycle Time Report FFE
   * @param  {string} companyId: Company id of selected Company
   * @param  {string} rmId: RM id of the selected FFE
   * @param  {CollectionCycleTimeFilterModel} filter? Optional paramter for filter data
  */
  public getCustomerViewCycleTimeReportFFE(companyId: string, rmId: string, filter?: CollectionCycleTimeFilterModel, isToPay?: boolean) {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.LIST_CYCLE_TIME_REPORT_FFE, { rmId: rmId }, { headers });
    let data = { companyId: companyId, rmId: rmId, 'userId': this._loginService.userId };
    // FIXME @Mayur: Remove iteration once filter is made an object
    if (filter) {
      data = this.addFilterFlatData(data, filter);
    }
    if (isToPay === true) {
      data['loadType'] = 'to_pay';
    }
    return this._http.post(this.baseUrl + DashboardURL.CUSTOMER_VIEW_LIST_CYCLE_TIME_REPORT_FFE, data);
  }

  /**
   * This function is used to get filtered trip ids
   * @param  {number} rmId: RM ID of the selected user
   * @param  {string} uiFlag: UI flag for the selected column
   * @param  {CollectionCycleTimeFilterModel} filter: applied Filter
   * @param  {number} ffeId?: Optional, FFE ID of the selected user
   */
  public getFilteredTripIDList(rmId: number, uiFlag: string, filter: CollectionCycleTimeFilterModel, ffeId?: number, companyId?: number) {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.FILTER_RM_LIST, { }, { headers });
    let data = { 'userId': this._loginService.userId, rmId: rmId, uiFlag: uiFlag, ffeId: ffeId, companyId: companyId };
    // FIXME @Mayur: Remove iteration once filter is made an object
    if (filter) {
      data = this.addFilterFlatData(data, filter);
    }
    return this._http.post(this.baseUrl + DashboardURL.FILTERED_TRIP_ID_LIST, data);
  }

  /**
  * This method is use to get Filter RM List
  */
  public getFilterRMList() {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.FILTER_RM_LIST, { }, { headers });
    return this._http.post(this.baseUrl + DashboardURL.FILTER_RM_LIST, { 'userId': this._loginService.userId });
  }

  /**
  * This method is use to get Filter CM List
  */
  public getFilterCMList() {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.FILTER_RM_LIST, { }, { headers });
    return this._http.post(this.baseUrl + DashboardURL.FILTER_CM_LIST, { 'userId': this._loginService.userId });
  }

  /**
   * This method is use to get Filter Companies List
   */
  public getFilterCompaniesList() {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.FILTER_RM_LIST, { }, { headers });
    return this._http.post(this.baseUrl + DashboardURL.FILTER_COMPANIES_LIST, { 'userId': this._loginService.userId });
  }

  /**
   * This method is use to get Filter SM List
   * 
   */
  public getFilterSMList() {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.FILTER_RM_LIST, { }, { headers });
    return this._http.post(this.baseUrl + DashboardURL.FILTER_SM_LIST, { 'userId': this._loginService.userId });
  }

}