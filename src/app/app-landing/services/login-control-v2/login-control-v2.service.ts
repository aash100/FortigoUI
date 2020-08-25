/*
 * Created on Thu Feb 28 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';

import { environment } from 'src/environments/environment';

import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { AccessDetailRequestPayload } from '../../model/access-detail-request-payload.model';
import { AccessDetailResponsePayload } from '../../model/access-detail-response-payload.model';
import { AppLandingURL } from '../../constants/AppLandingURL';

const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable()
export class LoginControlV2Service {

  env = environment.name;
  baseUrl = environment.baseUrl;
  baseUrlPHP = environment.baseUrlPHP;
  baseSessionManagementPath = environment.baseSessionManagementPath;

  loginUrl: string;
  userManagementBaseUrl = environment.baseUrlUserJava;

  userId: string;
  encodedUserId: string;
  roleId: number;
  userType: string;
  username: string;
  name: string;
  accessToken: string;
  childUsers: string;
  childUsersLoaded: any;
  public isReadOnlyUser = false;

  isUserLoggedIn: boolean;

  private loginSubject = new Subject<any>();

  constructor(private http: HttpClient) {
    this.loginUrl = this.baseUrl + this.baseSessionManagementPath + '/user';
  }

  public setLoggedIn() {
    this.loginSubject.next();
  }

  public getLoginStatus(): Observable<any> {
    return this.loginSubject.asObservable();
  }

  public verifyLogin(userId: string): Observable<any> {
    const headers = new HttpHeaders().set(InterceptorSkipHeader, '');
    return this.http.get<any>(this.loginUrl + '?userid=' + userId + '&' + FortigoConstant.CHANNEL_TYPE_HEADER_NAME + '=' + FortigoConstant.CHANNEL_TYPE_HEADER_VALUE, { headers });
  }

  public getAccessDetails(requestPayload: AccessDetailRequestPayload): Observable<AccessDetailResponsePayload> {
    const headers = new HttpHeaders().set('Authorization', 'Basic NHRpZ286UGFzc3cwcmRAMTIz');
    return this.http.post<AccessDetailResponsePayload>(this.userManagementBaseUrl + AppLandingURL.ACCESS_DETAILS, requestPayload, { headers });
  }

  public filteredMenuList(roleId: number) {
    return this.http.get(this.baseUrlPHP + '?action=getElementsByRoleFFA&bpId=Xghdt7i0945&role_id=' + roleId + '&page_name=angular');
  }

  loadChildren(userId: string) {
    const url: string =
      this.baseUrlPHP + '?action=getUserHierarchyAPI&userId=' +
      userId +
      '&bpId=Xghdt7i0945';
    let json: JSON;
    this.http.get<any>(url).subscribe(resp => {
      json = resp;
      const temp: JSON = json['results'];
      this.parseChildren(temp['children']);
      this.childUsers += userId;
      this.childUsersLoaded.emit();
    });
  }

  parseChildren(json: JSON): string {
    const obj: any = json;
    for (let i = 0; i < obj.length; i++) {
      if (obj[i]['children'] !== undefined) {
        this.parseChildren(obj[i]['children']);
      }
      this.childUsers += obj[i]['userid'] + ',';
    }
    return this.childUsers;
  }
  public checkIfUserIsReadOnly() {
    return this.http.get(this.baseUrl + environment.baseAccountManagementPath + '/user/checkIfReadOnly/' + this.userId);
  }

}
