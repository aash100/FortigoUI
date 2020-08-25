/*
* Created on Tue Aug 20 2019
* Created by - 1214: Sachin Sehgal
*
* Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Subject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { CollectionManagementURL } from '../../constants/CollectionManagementURL';
import { CollectionManagementConstant } from '../../constants/CollectionManagementConstant';
import { CollectionListRequestPayload } from '../../models/collection-list-request-payload.model';
import { CollectionListByTab } from '../../models/collection-list-by-tab.model';
import { CollectionListResponsePayload } from '../../models/collection-list-response-payload.model';
import { CollectionFilter } from '../../models/collection-filter';

@Injectable()
export class CollectionService {
  private basePHPUrl = environment.baseUrlPHP;
  private collectionBaseUrl = environment.baseUrl + environment.baseCollectionManagementPath;
  private reportsBaseUrl = environment.baseUrl + environment.baseReportsPath;

  public collectionDetails: any[];
  // Storing colleciton data for all the tabs on module load.
  public collectionListByTab: CollectionListByTab;

  // Storing filter data
  public collectionFilter = new CollectionFilter();

  public collectionIds: Array<string>;


  public reloadCollectionDashboard = new Subject<void>();
  public refresh = new Subject<void>();

  constructor(private _http: HttpClient) {
    this.collectionListByTab = new CollectionListByTab();
  }

  private getUserRoleHeader(): HttpHeaders {
    const headers = new HttpHeaders().set(FortigoConstant.MODULE_INTERCEPTOR_HEADER_KEY, FortigoConstant.COLLECTION_MANAGEMENT_MODULE);
    return headers;
  }

  /**
   * Return obervable for collection list.
   * @param  {CollectionListRequestPayload} data: payload
   */
  public getCollectionList(data: CollectionListRequestPayload): Observable<CollectionListResponsePayload> {
    const headers = this.getUserRoleHeader();
    return this._http.post<CollectionListResponsePayload>(this.collectionBaseUrl + CollectionManagementURL.LIST_COLLECTION, data, { headers });
  }

  /**
   * Return obervable for location list
   * @returns location list
   */
  public listLocation() {
    return this._http.get(this.collectionBaseUrl + CollectionManagementURL.GET_LOCATION_LIST);
  }

  /**
   * Gets companies list
   * @returns  companies list
   */
  public getCompaniesList(userId: string) {
    return this._http.get(this.basePHPUrl + '?action=getUserCollections&userId=' + userId + '&bpId=Xghdt7i0945');
  }

  /**
   * Function listInternalCustomerName
   *
   * This function get list of Internal Customer for Filter
   */
  public listInternalCustomerName() {
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.COLLECTION_COMPANIES_LIST, { 'is_internal': true });
  }

  /**
   * Function listEndCustomerName
   *
   * This function get list of End Customer for Filter
   */
  public listEndCustomerName() {
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.COLLECTION_COMPANIES_LIST, { 'is_internal': false });
  }

  /**
  * Gets collection manager list
  * @returns collection manager list
  */
  public listCollectionManager() {
    return this._http.get(this.collectionBaseUrl + CollectionManagementURL.COLLECTION_MANAGER_LIST);
  }

  /**
   * This function clears the data of filter tab
   */
  public clearFilterTabData() {
    this.collectionListByTab = new CollectionListByTab();
  }

  /**
   * Adds collection
   * @param data
   * @returns
   */
  public addCollection(data) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.ADD_COLLECTION, data, { headers });
  }
  /**
 * Adds collection
 * @param data
 * @returns
 */
  public updateCollection(data) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.UPDATE_COLLECTION, data, { headers });
  }

  /**
   * Gets collection id detail
   * @param collectionId
   * @returns
   */
  public getCollectionIdDetail(collectionId, dataSource) {
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.COLLECTION_ID_DETAIL, { collection_id: collectionId, datasource: dataSource });
  }

  /**
   * To fetch the appropriation list.
   * @param  {} collectionId collectionId
   */
  public listAppropriation(collectionId) {
    return this._http.get(this.collectionBaseUrl + CollectionManagementURL.GET_APPROPRIATION_LIST + collectionId);
  }

  /**
   * Get the Company list.
   */
  public getCompanyCategories() {
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.GET_CATEGORY, { 'is_internal': 1 });
  }

  /**
   * This function using for geting getting location payment.
   * @param  {any} id: Company Id
   */
  public getPaymentLocation(companyId: any) {
    return this._http.get(this.collectionBaseUrl + CollectionManagementURL.GET_PAYMENT_LOCATION + companyId);
  }

  /**
   * Return obervable for Collection Bank list
   */
  public getBankLists() {
    return this._http.get(this.collectionBaseUrl + CollectionManagementURL.GET_BANK_LIST);
  }

  /**
   * Return obervable for deleting collection receipt.
   * @param  {number} collecitonId
   */
  public deleteCollection(collecitonId: number) {
    const headers = this.getUserRoleHeader();
    return this._http.delete(this.collectionBaseUrl + CollectionManagementURL.DELETE_COLLECTION, { headers });
  }

  /**
   * Return obervable to get fortigo users.
   */
  public getFortigoSubmittedByUsers() {
    return this._http.get(this.collectionBaseUrl + CollectionManagementURL.GET_FORTIGO_USERS);
  }

  /**
   * Return obervable to download collection report.
   * @param  {any} payload: seleteted collection's rows.
   */
  public downloadReport(payload: any) {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_DOWNLOAD_HEADER_VALUE);
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.GET_DOWNLOAD_REPORT, payload, { observe: 'response', responseType: 'blob', headers: headers });
  }

  /**
   * Return obervable to get Appropriation Data.
   * @param  {any} payload: payload data
   */
  public getAppropriationData(payload: any) {
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.APPROPRIATION_GET_DATA, payload);
  }

  /**
   * Return obervable to delete collection receipt.
   * @param  {any} payload: Data required to delete collection receipt
   */
  public deleteReceipt(payload: any) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.DELETE_RECEIPT_URL, payload, { headers });
  }

  /**
   * Return obervable to create add hard appropriation
   * @param  {} payload: hard appropriation payload
   */
  public addHardAppropriation(payload) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.ADD_HARD_APPROPRIATION, payload, { headers });
  }

  /**
   * Return obervable to create add claimed appropriation
   * @param  {} payload: claimed appropriation payload
   */
  public addClaimedAppropriation(payload) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.ADD_CLAIMED_APPROPRIATION, payload, { headers });
  }

  /**
   * Return obervable to get Invoice Data
   * @param  {} payload: receipt id payload
   */
  public getInvoiceData(payload): Observable<any> {
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.GET_INVOICE_DATA, payload);
  }

  /**
  * This method is use to generate ec receipt suspense report
  *
  */
  public generateECReceiptSuspenseReport(userId: string): Observable<any> {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_DOWNLOAD_HEADER_VALUE);
    headers.append('userId', userId);
    headers.append('prevMonthFlag', '0');
    return this._http.post(this.reportsBaseUrl + CollectionManagementConstant.EC_RECIPT_SUSPENSE_REPORT, { 'userId': userId, 'prevMonthFlag': 0 }, { responseType: 'blob', observe: 'response', headers: headers });
  }

  /**
   * Return obervable to delete appropriation Data
   * @param  {} payload: appropriation payload
   */
  public deleteAppropriation(payload) {
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.DELETE_APPROPRIATION, payload);
  }

  /**
   * Return obervable to delete claimed appropriation Data
   * @param  {} payload: claimed appropriation payload
   */
  public deleteClaimed(payload) {
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.DELETE_CLAIMED_APPROPRIATION, payload);
  }

  /**
   * Return obervable to get customer summary
   */
  public getCustomerSummary(payload) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.collectionBaseUrl + CollectionManagementURL.GET_CUSTOMER_SUMMARY, payload, { headers });
  }
}
