import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InvoiceData } from '../../models/invoice-data.model';
import { environment } from 'src/environments/environment';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { InvoiceManagementURL } from '../../constants/InvoiceManagementURL';
import { TripManagementURL } from 'src/app/trip-management/constants/TripManagementURL';
import { InvoiceFilter } from '../../models/invoice-filter';
import { InvoiceListResponsePayload } from '../../models/invoice-list-response-payload.model';
import { Observable } from 'rxjs';
import { InvoiceListRequestPayload } from '../../models/invoice-list-request-payload.model';
import { InvoiceListByTab } from '../../models/invoice-list-by-tab.model';

@Injectable()
export class InvoiceService {

  private invoiceBaseUrl = environment.baseUrl + environment.baseInvoiceManagementPath;
  private sessionManagementBaseUrl = environment.baseUrl + environment.baseSessionManagementPath;

  // for reloading the invoice data as per user changes.
  public invoiceDataReload = new EventEmitter();

  // Storing trip data for all the tabs on module load.
  public invoiceListByTab: InvoiceListByTab;

  // Storing filter data
  public invoiceFilter = new InvoiceFilter();

  // Storing dropdown data for invoice submission
  public submittedByList: Array<any>;

  constructor(private _http: HttpClient) {
    this.invoiceListByTab = new InvoiceListByTab();
  }

  /**
   * @returns HttpHeaders
   * To append the roleID and userId in the header.
   */
  private getUserRoleHeader(): HttpHeaders {
    const headers = new HttpHeaders().set(FortigoConstant.MODULE_INTERCEPTOR_HEADER_KEY, FortigoConstant.INVOICE_MANAGEMENT_MODULE);
    return headers;
  }

  /**
   * To fetch the invoice list.
   * @param  {InvoiceListRequestPayload} data
   */
  public getInvoiceList(data: InvoiceListRequestPayload): Observable<InvoiceListResponsePayload> {
    const headers = this.getUserRoleHeader();
    return this._http.post<InvoiceListResponsePayload>(this.invoiceBaseUrl + InvoiceManagementURL.INVOICE_LIST, data, { headers });
  }

  /**
   * To get the list of items as per  given invoiceNumber.
   * @param  {string} invoiceNumber
   * @param  {string} filter
   */
  getItemsList(invoiceNumber: string, filter: string) {
    return this._http.get<Array<any>>(this.invoiceBaseUrl + InvoiceManagementURL.GET_ITEM_DETAILS + invoiceNumber + InvoiceManagementURL.FILTER + filter);
  }

  /**
   * uploads document to server
   * @param  {any} file
   */
  uploadDocument(file: any) {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_UPLOAD_HEADER_VALUE);
    const uploadData = new FormData();
    uploadData.append('file', file);
    // FIXME  @Vinayak K S change the tripbaseurl to invoicebaseurl
    const tripInvoicingBaseUrl = environment.baseUrl + environment.baseTripInvoicingPath;
    return this._http.post(tripInvoicingBaseUrl + TripManagementURL.ADD_DOCUMENT_FILE, uploadData, { headers });
  }

  /**
   * uploads invoice ACK Data to database
   * @param  {any} data
   */
  uploadInvoiceAckData(data: any) {
    return this._http.post(this.invoiceBaseUrl + InvoiceManagementURL.INVOICE_ACKNOWLEDGEMENT_DOCUMENT_UPLOAD_DATA, data);
  }
  /**
   * @param  {any} discardInvoiceData
   * To discard the invoice number.
   */
  discardInvoiceNumber(discardInvoiceData: any) {
    const headers = this.getUserRoleHeader();

    return this._http.post(this.invoiceBaseUrl + InvoiceManagementURL.DISCARD_INVOICE_NO, discardInvoiceData, { headers });
  }

  /**
   * @param  {any} cancelInvoiceData
   * To cancel the invoice.
   */
  cancelInvoice(cancelInvoiceData: any) {
    const headers = this.getUserRoleHeader();

    return this._http.post(this.invoiceBaseUrl + InvoiceManagementURL.CANCEL_INVOICE, cancelInvoiceData, { headers });
  }

  /**
   * To download the Invoice Document.
   * @param  {string} invoiceNumber
   * @param  {string} source
   */
  public downloadInvoiceDocument(invoiceIdList: Array<string>, filter: string) {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_DOWNLOAD_HEADER_VALUE);
    const requestPayload = {
      invoice_numbers: invoiceIdList,
      filter: filter
    };
    return this._http.post(this.invoiceBaseUrl + InvoiceManagementURL.DOWNLOAD_INVOICE_DETAILS, requestPayload, { observe: 'response', responseType: 'blob', headers: headers });
  }

  /**
   * To download the Invoice PDF.
   * @param  {string} invoiceNumber
   */
  public downloadInvoicePDF(invoiceNumber: string) {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_DOWNLOAD_HEADER_VALUE);
    return this._http.get(this.invoiceBaseUrl + InvoiceManagementURL.DOWNLOAD_INVOICE_PDF + invoiceNumber, { observe: 'response', responseType: 'blob', headers: headers });
  }

  /**
   * To download the Invoice Acknowledgement PDF.
   * @param  {string} invoiceNumber
   */
  public downloadInvoiceAcknowledgementPDF(invoiceNumber: string, filter: string) {
    const requestPayload = { document_type: 'invoice_acknowledgement' };
    requestPayload['invoice_number'] = invoiceNumber;
    requestPayload['filter'] = filter;
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_DOWNLOAD_HEADER_VALUE);
    return this._http.post(this.invoiceBaseUrl + InvoiceManagementURL.INVOICE_ACKNOWLEDGEMENT_DOCUMENT_DOWNLOAD, requestPayload, { observe: 'response', responseType: 'blob', headers: headers });
  }

  /**
   * Function getLocationList
   *
   * This function get list of Location for Filter
   */
  getLocationList() {
    return this._http.get(this.invoiceBaseUrl + InvoiceManagementURL.GET_LOCATION_LIST);
  }

  /**
   * Function listInternalCustomerName
   *
   * This function get list of Internal Customer for Filter
   */
  public listInternalCustomerName() {
    return this._http.post(this.invoiceBaseUrl + InvoiceManagementURL.LIST_CUSTOMER, { 'isInternal': 1 });
  }

  /**
   * Function listCollectionManager
   *
   * This function get list of Collection Manager for Filter
   */
  listCollectionManager() {
    return this._http.get(this.invoiceBaseUrl + InvoiceManagementURL.LIST_COLLECTION_MANAGER);
  }

  /**
   * Function listAccountManagerName
   *
   * This function get list of Account Manager for Filter
   */
  listAccountManagerName() {
    return this._http.get(this.invoiceBaseUrl + InvoiceManagementURL.LIST_ACCOUNT_MANAGER);
  }

  /**
   * Function listSubmittedBy
   *
   * This function get list of invoice submitted by for Filter
   */
  listInvoiceSubmittedBy() {
    return this._http.get(this.invoiceBaseUrl + InvoiceManagementURL.LIST_INVOICE_SUBMITTED_BY);
  }

  /**
   * Function listEndCustomerName
   *
   * This function get list of End Customer for Filter
   */
  listEndCustomerName() {
    return this._http.post(this.invoiceBaseUrl + InvoiceManagementURL.LIST_CUSTOMER, { 'isInternal': 0 });
  }

  /**
   * To capture invoice submission details.
   * @param  {any} data: submission data.
   */
  public captureInvoiceSubmissionData(data: any) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.invoiceBaseUrl + InvoiceManagementURL.INVOICE_SUBMISSION, data, { headers });
  }

  /**
   * Method to fetch all the tripIds as per user login.
   */
  public getTripIds() {
    return this._http.get(this.sessionManagementBaseUrl + InvoiceManagementURL.GET_USER_TRIPS);
  }

  /**
   * Method to fetch all the tripIds as per user login.
   */
  public getFilteredTrips(data: any) {
    return this._http.post(this.sessionManagementBaseUrl + InvoiceManagementURL.GET_FILTERED_TRIPS, data);
  }

  /**
   * Method to fetch all the tripIds as per user login.
   */
  public getInvoiceDetails(data: any) {
    return this._http.post(this.invoiceBaseUrl + InvoiceManagementURL.GET_INVOICE_DETAILS, data);
  }

  /**
   * To view cancel invoice Data.
   * @param  {any} data
   */
  public viewCancelInvoice(data: any) {
    const headers = this.getUserRoleHeader();

    return this._http.post(this.invoiceBaseUrl + InvoiceManagementURL.GET_SERVICE_REFERENCE_DETAILS, data, { headers });
  }

  /**
   * To get all the invoicing status.
   */
  public getInvoicingStatus() {
    return this._http.get(this.invoiceBaseUrl + InvoiceManagementURL.GET_INVOICING_STATUS);
  }

  /**
   * To list account manager details
   */
  public accountManagerDetail() {
    return this._http.get(this.invoiceBaseUrl + InvoiceManagementURL.ACCOUNT_MANAGER_DETAILS);
  }

  /**
   * This function clears the data of filter tab
   */
  public clearFilterTabData() {
    this.invoiceListByTab = new InvoiceListByTab();
  }

  /**
   * To download the Reserved Invoice Number Report.
   */
  public downloadReservedInvoiceNumberReport(data: any) {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_DOWNLOAD_HEADER_VALUE);
    return this._http.post(this.invoiceBaseUrl + InvoiceManagementURL.DOWNLOAD_RESERVED_INVOICE_REPORT, data, { observe: 'response', responseType: 'blob', headers: headers });
  }
}
