/*
 * Created on Fri Jul 05 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { TripManagementURL } from '../../constants/TripManagementURL';
import { EditImageData } from 'src/app/shared/models/edit-image-data.model';
import { TripInvoicingFilter } from '../../models/trip-invoicing-filter';
import { TripInvoicingListByTab } from '../../models/trip-invoicing-list-by-tab.model';
import { TripInvoicingListResponsePayload } from '../../models/trip-invoicing-list-response-payload.model';

@Injectable()
export class TripService {

  private tripInvoicingBaseUrl = environment.baseUrl + environment.baseTripInvoicingPath;

  private sessionManagementBaseUrl = environment.baseUrl + environment.baseSessionManagementPath;
  private invoiceBaseUrl = environment.baseUrl + environment.baseInvoiceManagementPath;

  // for reloading the trip data as per user changes.
  public refresh = new Subject<void>();
  public generateInvoiceReload = new EventEmitter();

  // Storing trip data for all the tabs on module load.
  public tripInvoicingListByTab: TripInvoicingListByTab;

  // Storing filter data
  public tripFilter = new TripInvoicingFilter();

  constructor(private _http: HttpClient) {
    this.tripInvoicingListByTab = new TripInvoicingListByTab();
  }

  /**
   * Method used to create headers consisting role_id and user_id.
   * @returns HttpHeaders : containing role_id and user_id.
   */
  private getUserRoleHeader(): HttpHeaders {
    const headers = new HttpHeaders().set(FortigoConstant.MODULE_INTERCEPTOR_HEADER_KEY, FortigoConstant.TRIP_MANAGEMENT_MODULE);
    return headers;
  }

  /**
   * Method used to list down all the trips as per user fiter tab.
   * @param  {any} data : requestPayload
   */
  public getTripInvoicingList(data: any): Observable<TripInvoicingListResponsePayload> {
    const headers = this.getUserRoleHeader();
    return this._http.post<TripInvoicingListResponsePayload>(this.tripInvoicingBaseUrl + TripManagementURL.LIST_TRIP, data, { headers });
  }

  /**
   * Method used to get data for REQUEST FOR VALIDATION screen.
   * @param  {any} data : requestPayload
   * @returns any
   */
  public requestForTripValidation(data: any): any {
    const headers = this.getUserRoleHeader();
    return this._http.post<any>(this.tripInvoicingBaseUrl + TripManagementURL.VIEW_TRIP_VALIDATION, data, { headers });
  }

  /**
  * Method used to download invoice data in excel sheet.
  * @param  {Array<string>} tripIdList : selected trip Ids
  * @returns Observable
  */
  public downloadInvoiceData(tripIdList: Array<string>, tab_filter: string): Observable<any> {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_DOWNLOAD_HEADER_VALUE);
    const requestPayload = {
      service_ref_ids: tripIdList,
      tab_filter: tab_filter
    };
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.DOWNLOAD_TRIP_INVOICING_REPORT, requestPayload, { observe: 'response', responseType: 'blob', headers: headers });
  }
  /**
   * Method to get State Code List
   */
  public getAllStateCodes() {
    return this._http.get(this.tripInvoicingBaseUrl + TripManagementURL.GET_ALL_STATECODES);
  }

  /**
   * Method used to view Reserve Invoice Data.
   * @param  {any} data : requestPayload
   */
  public viewReserveInvoice(data: any) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.VIEW_RESERVED_INVOICE, data, { headers });
  }

  /**
   * Method used to reserve the invoice no.
   * @param  {any} data : requestPayload
   */
  public reserveInvoice(data: any) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.RESERVE_INVOICE, data, { headers });
  }

  /**
   * Method used to update bulk billing details
   * @param  {any} data
   */
  public bulkUpdateBillingDetails(data: any) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.BULK_UPDATE_BILLING_DETAILS, data, { headers });
  }

  /**
   * Method used to submit the REQUEST FOR VALIDATION form.
   * @param  {any} data : requestPayload
   */
  public submitSentTripValidation(data: any) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.SUBMIT_AFTER_UPDATE, data, { headers });
  }

  /**
   * Method used to approve the validation.
   * @param  {any} data : requestPayload
   */
  public approveSentTripValidation(data: any) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.APPROVE_TRIP, data, { headers });
  }

  /**
   * Method used to reject the validation.
     * @param  {any} data : requestPayload
     */
  public rejectSentTripValidation(data: any) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.REJECT_TRIP, data, { headers });
  }

  /**
   * Method used to generate invoice.
   * @param  {any} data : requestPayload
   */
  public generateInvoice(data: any) {
    // const headers = this.getInterceptorSkipHeader();
    const headers = this.getUserRoleHeader();
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.GENERATE_INVOICE, data, { headers });
  }

  /**
   * Method to fetch all the tripIds as per user login.
   */
  public getTripIds() {
    return this._http.get(this.sessionManagementBaseUrl + TripManagementURL.GET_USER_TRIPS);
  }

  /**
   * Method to fetch all the tripIds as per user login.
   */
  public getFilteredTrips(data: any) {
    return this._http.post(this.sessionManagementBaseUrl + TripManagementURL.GET_FILTERED_TRIPS, data);
  }

  /**
   * Function getLocationList
   *
   * This function get list of Location for Filter
   */
  getLocationList() {
    return this._http.get(this.tripInvoicingBaseUrl + TripManagementURL.GET_LOCATION_LIST);
  }

  /**
   * Function getCompanyLoactionList
   *
   * This function gets list of shipment locations
   * @param  {any} companyId: company id of the selected company
   */
  getCompanyLoactionList(companyId: any) {
    const requestPayload = {
      location_category: 'shipment',
      company_id: companyId
    };
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.GET_COMPANY_LOCATIONS, requestPayload);
  }

  /**
   * Function listCollectionManager
   *
   * This function get list of Collection Manager for Filter
   */
  public listCollectionManager() {
    return this._http.get(this.tripInvoicingBaseUrl + TripManagementURL.LIST_COLLECTION_MANAGER);
  }

  /**
   * Function listInternalCustomerName
   *
   * This function get list of Internal Customer for Filter
   */
  public listInternalCustomerName() {
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.LIST_CUSTOMER, { 'is_internal': 1 });
  }

  /**
   * Function listEndCustomerName
   *
   * This function get list of End Customer for Filter
   */
  public listEndCustomerName() {
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.LIST_CUSTOMER, { 'is_internal': 0 });
  }

  /**
   * To get list of invoicing status.
   */
  public getInvoicngStatus() {
    return this._http.get(this.tripInvoicingBaseUrl + TripManagementURL.INVOICING_STATUS);
  }

  /**
   * To view generate invoice data.
   * @param  {any} data
   */
  public viewGenerateInvoice(data: any) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.VIEW_GENERATE_INVOICE, data, { headers });
  }

  /**
   * For submitting Manual Invoice purpose.
   * @param  {any} data :Request Payload
   */
  public submitManualDocument(data: any) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.SUBMIT_MANUAL_DOCUMENT, data, { headers });
  }

  /**
   * To Upload Document from doc view.
   * @param  {any} data
   */
  public submitDocument(data: any) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.UPLOAD_DOCUMENT, data, { headers });
  }

  /**
   * For submitting Manual Invoice with Doc.
   * @param  {any} file :file to upload
   * @param  {any} data :Request Payload for submitManualDocument
   */
  public submitManualDocumentWithDocument(file: File, data: any) {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_UPLOAD_HEADER_VALUE);
    const uploadData = new FormData();
    uploadData.append('file', file);
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.ADD_DOCUMENT_FILE, uploadData, { headers }).pipe(
      mergeMap((response) => {
        if (Object.getOwnPropertyNames(data).includes('document_id')) {
          data.document_path = JSON.parse(response['text']).file_path;
          return this.submitDocument(data);
        } else {
          data.file_path = JSON.parse(response['text']).file_path;
          return this.submitManualDocument(data);
        }
      }));
  }

  public getImage(tripId: string) {
    const urlDoc = 'https://www.4tigo.com/app/index.php?action=fetchTripMultiDocs&confirmationid=' + tripId + '&st=8&utype=' + '&bpId=Xghdt7i0945';
    return this._http.get(urlDoc);
  }

  /**
   * This function clears the data of filter tab
   */
  public clearFilterTabData() {
    this.tripInvoicingListByTab = new TripInvoicingListByTab();
  }

  public saveImage(data: EditImageData) {
    return this._http.post('https://www.4tigo.com/app/index.php?action=saveImageAfterRotate' + '&bpId=Xghdt7i0945', data);
  }

  /**
   * To fetch the EC Attribute Data.
   * @param  {any} data: requestPayload
   */
  public getECAttributes(data: any) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.GET_CUSTOMER_ATTRIBUTE, data, { headers });
  }

  /**
   * To download the Invoice PDF.
   * @param  {string} invoiceNumber
   */
  public downloadInvoicePDF(invoiceNumber: string) {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_DOWNLOAD_HEADER_VALUE);
    return this._http.get(this.invoiceBaseUrl + TripManagementURL.DOWNLOAD_INVOICE_PDF + invoiceNumber, { observe: 'response', responseType: 'blob', headers: headers });
  }

  /**
   * To fetch the trip Adjustements Details.
   * @param  {any} data: requestPayload
   */
  public getTripAdjustmentDetails(data: any) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.tripInvoicingBaseUrl + TripManagementURL.GET_TRIP_ADJUSTMENTS_DETAILS, data, { headers });
  }
}
