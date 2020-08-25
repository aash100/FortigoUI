/*
 * Created on Thu Jan 02 2020
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { mergeMap } from 'rxjs/operators';

import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { MediaManagementURL } from '../../constants/MediaManagementURL';
import { environment } from 'src/environments/environment';

@Injectable()
export class MediaService {

  private mediaBaseUrl = environment.baseUrl + environment.baseMediaManagementPath;
  private notificationBaseUrl = environment.baseUrl + environment.baseNotifactionManagementPath;

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * To append the roleID and userId in the header.
   * @returns HttpHeaders
   */
  private getUserRoleHeader(): HttpHeaders {
    const headers = new HttpHeaders().set(FortigoConstant.MODULE_INTERCEPTOR_HEADER_KEY, FortigoConstant.MEDIA_MANAGEMENT_MODULE);
    return headers;
  }

  /**
   * For submitting Manual Invoice with Doc.
   * @param  {any} file :file to upload
   * @param  {any} data :Request Payload for submitManualDocument
   */
  public addMarketingContentWithDocument(file: File, data: any) {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_UPLOAD_HEADER_VALUE);
    const uploadData = new FormData();
    uploadData.append('file', file);
    return this._http.post(this.mediaBaseUrl + MediaManagementURL.NEWS_ADD_DOCUMENT_FILE, uploadData, { headers }).pipe(
      mergeMap((response) => {
        data.filePath = JSON.parse(response['text']).file_path;
        return this.addMarketingContent(data);
      }));
  }

  /**
   * This method return observable to add publishing content.
   * @param  {} payload
   */
  public addMarketingContent(payload) {
    const headers = this.getUserRoleHeader();
    return this._http.post(this.mediaBaseUrl + MediaManagementURL.NEWS_ADD_CONTENT, payload, { headers });
  }

  /**
   * This method return observable to send notification.
   * @param  {} payload
   */
  public sendNotification(payload) {
    return this._http.post(this.notificationBaseUrl + MediaManagementURL.PUSH_NOTIFICATION, payload);
  }
}
