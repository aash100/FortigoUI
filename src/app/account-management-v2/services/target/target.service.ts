/*
 * Created on Thu Sep 05 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AccountManagementURL } from '../../constants/AccountManagementURL';
import { Target } from '../../models/target.model';

@Injectable()
export class TargetService {

  private baseUrl = environment.baseUrl + environment.baseAccountManagementPath;

  constructor(private http: HttpClient) { }

  /**
   * This method is used to get target list
   * @param  {string} compId: Compnay id
   * @param  {} fromDate: start
   * @param  {} toDate: End date
   */
  public getTargetList(compId: string, fromDate: string, toDate: string): Observable<any> {
    return this.http.post(this.baseUrl + AccountManagementURL.AM_TARGET_LIST, { companyId: compId, fromDate: fromDate, toDate: toDate });
  }

  /**
   * Delete selected target
   * @param  {string} targetId: selected target id
   * @returns Observable
   */
  public deleteTarget(targetId: string): Observable<any> {
    return this.http.put(this.baseUrl + AccountManagementURL.AM_TARGET_LIST, {});
  }

  /**
   * Get user name by user id
   * @param  {} id: user id
   * @returns Observable
   */
  public getUserName(id: string): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_TARGET_USER_NAME + id, { responseType: 'text' });
  }

  /**
   * Save target to the DB
   * @param  {Array<Target>} data
   */
  public saveTarget(data: Array<Target>) {
    return this.http.post(this.baseUrl + AccountManagementURL.AM_CREATE_TARGET_URL, data);
  }

  /**
   * This function return Observable to get salesManager list
   * @returns Observable
   */
  public getSalesManagerList(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_GET_SALES_LIST);
  }
}
