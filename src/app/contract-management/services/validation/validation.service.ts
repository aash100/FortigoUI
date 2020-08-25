/*
 * Created on Sun Oct 13 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { SaveDataModel } from '../../models/save-data.model';
import { ContractManagementURL } from '../../constants/ContractManagementURL';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class ValidationService {

  private validationBaseUrl = environment.baseUrl + environment.baseContractManagementPath;

  constructor(private _http: HttpClient) { }

  /**
   * This function validates the Doc data, for the uploaded file - in params
   * @param  {{ filePath: string, fileType: string }} fileData: data for file uploaded
   * @returns Observable: Observable, validated data for doc
   */
  public validateDocData(fileData: { filePath: string, fileType: string }): Observable<any> {
    const requestData = new Object();
    requestData['file_path'] = fileData.filePath;
    requestData['file_type'] = fileData.fileType;

    return this._http.post(this.validationBaseUrl + ContractManagementURL.VALIDATE_DOC, requestData);
  }

  /**
   * This function validates the Doc data, for the uploaded file - in params
   * @param  {File} file: file to validate data
   * @returns Observable: Observable, validated data for doc
   */
  public saveDocData(data: SaveDataModel): Observable<any> {
    const requestData = new Object();
    requestData['data'] = JSON.stringify(data.data);
    requestData['excelType'] = data.excelType;
    requestData['userid'] = data.userId.toString();
    return this._http.post(this.validationBaseUrl + ContractManagementURL.SAVE_DATA, requestData);
  }

  /**
   * For submitting Excel Doc with Data.
   * @param  {any} file :file to upload
   * @param  {any} data :Request Payload for validateDocData
   */
  public validateDocumentWithData(file: File, fileData: { filePath: string, fileType: string }) {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_UPLOAD_HEADER_VALUE);
    const uploadData = new FormData();
    uploadData.append('file', file);
    return this._http.post(this.validationBaseUrl + ContractManagementURL.UPLOAD_DOC, uploadData, { headers }).pipe(
      mergeMap((response) => {
        fileData.filePath = response['text'];
        return this.validateDocData(fileData);
      }));
  }
}
