import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Observable } from 'rxjs';
import { Company } from 'src/app/account-management/models/company.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';

const InterceptorSkipHeader = 'X-Skip-Interceptor';
@Injectable({
  providedIn: 'root'
})
export class LoginControlService {

  env = environment.name;
  baseUrl = environment.baseUrl + environment.baseAccountManagementPath;
  baseUrlPHP = environment.baseUrlPHP;
  baseSessionUrl = environment.baseUrl + environment.baseSessionManagementPath;

  accessToken: string;
  userId: string;
  encodedUserId: string;
  roleId: string;

  hierarchyCompanyIds: string;
  hierarchyUserIds: string;

  isLoggedIn = false;
  verifyLoginUrl: string;
  childUsers = '';
  public isReadOnlyUser = false;
  public companyList: any;
  public RMCustomerList: any;
  public RMcompanyList: any;
  // for sales view
  public SalesCustomerList: any;
  public meetingListView: any;
  public SalesCompanyList: any;
  public HierarchyCompanies: any;
  public companyIdAndCompanyNameList: Company[] = new Array<Company>();
  meetingListViewFilter: Object;
  childUsersLoaded = new EventEmitter();
  constructor(private http: HttpClient) {
    this.verifyLoginUrl = this.baseSessionUrl + '/user';
  }

  verifyLogin(userId: string): Observable<any> {
    const headers = new HttpHeaders().set(InterceptorSkipHeader, '');
    return this.http.get<any>(this.verifyLoginUrl + '?userid=' + userId + '&' + FortigoConstant.CHANNEL_TYPE_HEADER_NAME + '=' + FortigoConstant.CHANNEL_TYPE_HEADER_VALUE, { headers });
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

  public getCompanyIds(userId: string) {
    const url: string =
      this.baseUrlPHP + '?action=getUserHierarchyAPI&userId=' +
      userId +
      '&bpId=Xghdt7i0945';
    return this.http.get<any>(url);
  }

  getChildren(): string {
    return this.childUsers;
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

  checkIfUserIsReadOnly(): Observable<boolean> {
    return this.http.get<boolean>(this.baseUrl + '/user/checkIfReadOnly/' + this.userId);
  }

  loadCompanies(listAll: boolean, data?: Object) {
    if (listAll) {
      return this.http.get(this.baseUrl + '/account/list');
    } else {
      return this.http.post(this.baseUrl + '/account/listByHierarchy', data);
    }
  }

  parseCompanyIdAndCompanyName(list: any) {
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      if (element['companyId'] && element['companyName']) {
        const obj: Company = new Company(element['companyid'], element['companyName'], element['companyStringId']);
        this.companyIdAndCompanyNameList.push(obj);
      }
    }
  }

}
