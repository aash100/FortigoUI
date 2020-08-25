/*
 * Created on Wed Feb 27 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AccountManagementURL } from '../../constants/AccountManagementURL';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class DocumentService {
  public reloadDocument = new EventEmitter();
  private baseUrl = environment.baseUrl + environment.baseAccountManagementPath;

  constructor(private http: HttpClient) { }

  // getAllDocumentList(companyId: number) {
  //   this.http.get(this.baseUrl + 'document/getAllActiveDocuments');
  // }

  public downloadDocument(docId: any): Observable<any> {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_DOWNLOAD_HEADER_VALUE);
    return this.http.get(this.baseUrl + AccountManagementURL.AM_DOCUMENT_DOWNLOAD + docId, { observe: 'response', responseType: 'blob', headers: headers });
  }

  /**
   * Return observable for document
   * @param  {number} companyId
   */
  public getAllDocuments(companyId: number): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_GET_DOCUMENT + companyId);
  }

  /**
   * returns the observable for filtered documents
   * @param  {any} docTypeId
   * @param  {any} companyId
   */

  public getFilteredDocuments(docTypeId: any, companyId: any): Observable<any> {
    return this.http.post(this.baseUrl + AccountManagementURL.AM_GET_FILTERED_DOCUMENTS, { docType: docTypeId, companyId: companyId.toString() });
  }

  /**
   * Return observable for document type
   */
  public getDocumentType(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_DOUCUMENT_TYPE);
  }

  /**
   *Return observable for document status
   */
  public getDocumentStatus(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_GET_DOCUMENT_STATUS);
  }

  /**
   * Return observable for document internal company
   */
  public getDocumentInternalCompany(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_DOCUMENT_INTERNAL_COMPANY);
  }

  /**
   * Delete document
   * @param  {number} docId: Document id
   * @returns Observable
   */
  public removeDocument(docId: number): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_DELETE_DOC + '?docId=' + docId);
  }

  /**
   * This method uploads the file to server and loads the data to Database
  /**
   * @param  {File} file
   * @param  {any} doc
   * @param  {string} userId
   */
  public addDocument(file: File, doc: any, userId: string) {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_UPLOAD_HEADER_VALUE);
    const uploadData = new FormData();
    uploadData.append('file', file);

    return this.http.post(this.baseUrl + AccountManagementURL.AM_ADD_DOC_FILE, uploadData, { headers }).pipe(
      mergeMap((response) => {
        return this.addDocumentData(doc, JSON.parse(response['text']).filePath, userId);
      })
    );
  }

  /**
   * This method is used to save the Document data to Database
   * @param  {any} doc
   * @param  {string} fileName
   * @param  {string} userId
   */
  public addDocumentData(doc: any, fileName: string, userId: string) {
    const requestPayload = {
      document: doc,
      filePath: fileName.toString(),
      companyId: doc.companyStringId,
      userId: userId

    };
    return this.http.post(this.baseUrl + AccountManagementURL.AM_ADD_DOC_OBJ, requestPayload);
  }
  /**
   * This Method updates the document in Database
   * @param  {any} doc
   * @param  {string} userId
   */
  public updateDocumentData(doc: any, userId: string) {
    const requestPayload = {
      document: doc,
      userId: userId
    };
    return this.http.post(this.baseUrl + AccountManagementURL.AM_ADD_DOC_UPDATE, requestPayload);

  }
}
