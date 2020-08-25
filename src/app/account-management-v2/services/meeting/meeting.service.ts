/*
 * Created on Wed Feb 27 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AccountManagementURL } from '../../constants/AccountManagementURL';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';

@Injectable()
export class MeetingService {
  private baseUrl = environment.baseUrl + environment.baseAccountManagementPath;
  public reloadMeetings = new EventEmitter();

  

  constructor(private http: HttpClient, private _loginControlV2Service: LoginControlV2Service) { }

  /**
   * Return observable for Meeting List data
   * @param  {string} companyId: Selected company id
   */
  public getMeetingList(companyId: string): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_MEETING_LIST_URL + '/' + companyId);
  }

  /**
  * Return observable for Meeting Type data
  */
  public getMeetingType(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_MEETING_TYPE_URL);
  }

  /**
   * Return observable for Meeting data
   * @param  {any} meetingId: Selected meeting id
   */
  public viewMeeting(meetingId: any): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_MEETING_VIEW_URL + meetingId);
  }

    /**
   * Return observable for Meeting data
   * @param  {any} meeting: Object to be updated
   */
  public updateMeeting(meeting: any): Observable<any> {
    return this.http.post(this.baseUrl + AccountManagementURL.AM_MEETING_UPDATE_URL, meeting);
  }

  /**
   * Return observable for Location List data
   */
  public getLocationList(): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_CONTACT_LOCATION_LIST_URL);
  }

  /**
   * Return observable for Participant List data
   * @param  {any} companyId: Selected company id
   */
  public getParticipantList(companyId: any): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_MEETING_PARTICIPANT_LIST + companyId);
  }

  /**
   * Return observable for creating a meeting
   * @param  {any} value: Value of meeting form
   */
  public createMeeting(value: any ): Observable<any> {
    return this.http.post(this.baseUrl + AccountManagementURL.AM_MEETING_CREATE_URL, value);
  }

  /**
   * Return observable to delete a meeting
   * @param  {any} companyId: selected meeting's comapny id
   * @param  {any} meetingId: selected meeting id
   */
  public deleteMeeting(companyId: any, meetingId: any): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_MEETING_DELETE_URL + companyId + '/' + meetingId);
  }

 

  /**
   * Return observable to update meeting users
   * @param  {Array<any>} userIds: current users
   * @param  {} from: start date
   * @param  {} to: end date
   */
  public  getMeetingView(userIds: Array<any>, from: string, to: string): Observable<any> {
    return this.http.post(this.baseUrl + AccountManagementURL.AM_MEETING_USERS_URL, { userIds: userIds, isReadOnly: this._loginControlV2Service.isReadOnlyUser, fromDate: from, toDate: to, loginUserId: this._loginControlV2Service.userId.toString() });
  }
}
