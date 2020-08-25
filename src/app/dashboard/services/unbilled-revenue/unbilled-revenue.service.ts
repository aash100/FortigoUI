/*
 * Created on Sun Aug 18 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { DashboardURL } from '../../constants/DashboardURL';
import { UnbilledRevenueFilterModel } from '../../models/unbilled-revenue-filter.model';

@Injectable()
export class UnbilledRevenueService {

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
   * @param  {UnbilledRevenueFilterModel} filter? Optional paramter for filter data
   * @returns any: payload after adding extracted keys
   */
  private addFilterFlatData(data: any, filter: UnbilledRevenueFilterModel): any {
    const filterKeys = Object.getOwnPropertyNames(filter);
    filterKeys.forEach((eachkey) => {
      data[eachkey] = filter[eachkey];
    });
    return data;
  }

  /**
   * This function is used to get filtered trip ids
   * @param  {number} rmId: RM ID of the selected user
   * @param  {string} uiFlag: UI flag for the selected column
   * @param  {UnbilledRevenueFilterModel} filter: applied Filter
   * @param  {number} ffeId?: Optional, FFE ID of the selected user
   * @param  {number} companyId?: Optional, Company ID of the selected user
   */
  public getFilteredTripIDList(rmId: number, uiFlag: string, filter: UnbilledRevenueFilterModel, ffeId?: number, companyId?: number) {
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
  public getFilterTripSMList() {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.FILTER_RM_LIST, { }, { headers });
    return this._http.post(this.baseUrl + DashboardURL.FILTER_TRIP_SM_LIST, { 'userId': this._loginService.userId });
  }

  /**
   * This method is use to get Unbilled Report RM
   * @param  {UnbilledRevenueFilterModel} filter? Optional paramter for filter data
   */
  public getUnbilledReportRM(filter?: UnbilledRevenueFilterModel) {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.LIST_UNBILLED_REPORT_RM, {}, { headers });
    let data = { 'userId': this._loginService.userId };
    // FIXME @Mayur: Remove iteration once filter is made an object
    if (filter) {
      data = this.addFilterFlatData(data, filter);
    }
    return this._http.post(this.baseUrl + DashboardURL.LIST_UNBILLED_REPORT_RM, data);
  }

  /**
  * This method is use to get Unbilled Report RM
   * @param  {UnbilledRevenueFilterModel} filter? Optional paramter for filter data
  */
  public getUnbilledReportFFE(rmId: string, filter?: UnbilledRevenueFilterModel) {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.LIST_UNBILLED_REPORT_FFE, { rmId: rmId }, { headers });
    let data = { rmId: rmId, 'userId': this._loginService.userId };
    // FIXME @Mayur: Remove iteration once filter is made an object
    if (filter) {
      data = this.addFilterFlatData(data, filter);
    }
    return this._http.post(this.baseUrl + DashboardURL.LIST_UNBILLED_REPORT_FFE, data);
  }

  /**
  * This method is use to get Unbilled Report RM
  */
  public getUnbilledReportCompany(rmId: string, ffeId: string, filter?: UnbilledRevenueFilterModel) {
    // const headers = this.getModuleHeader();
    // return this.http.post(this.baseUrl + DashboardURL.LIST_UNBILLED_REPORT_COMPANY, { rmId: rmId, ffeId: ffeId }, { headers });
    let data = { rmId: rmId, ffeId: ffeId, 'userId': this._loginService.userId };
    // FIXME @Mayur: Remove iteration once filter is made an object
    if (filter) {
      data = this.addFilterFlatData(data, filter);
    }
    return this._http.post(this.baseUrl + DashboardURL.LIST_UNBILLED_REPORT_COMPANY, data);
  }
}
