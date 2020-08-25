import { Injectable } from '@angular/core';
import { Meeting } from '../meeting/meeting.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Company } from '../models/company.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  baseUrl = environment.baseUrl + environment.baseAccountManagementPath;
  restParticipantsUrl = this.baseUrl + '/meeting/list/participant/';
  restListMeeting = this.baseUrl + '/meeting/list/';
  restCreateMeeting = this.baseUrl + '/meeting/create';
  restEditMeeting = this.baseUrl + '/meeting/view/';
  restgetMeetingLocationUrl = this.baseUrl + '/contact/list/locations';
  meetingLoading = false;
  restTempUrl = null;
  editMeetingDetails: Meeting;
  filterApplied = false;
  meetingReload = new Subject<any>();
  meetingFilterApplied = new Subject<any>();
  closeMeetingFilter = new Subject();
  meetingFilteredData: any;
  meetingType: any;

  constructor(private http: HttpClient, private router: Router) { }

  public getEditMeetingDetails(): Meeting {
    return this.editMeetingDetails;
  }
  public setEditMeetingDetails(value: Meeting) {
    this.editMeetingDetails = value;
  }

  public getMeetingList(companyId: string) {
    return this.http.get<Meeting[]>(this.restListMeeting + companyId);
  }

  public getCompanyList() {
    return this.http.get<Company[]>(this.baseUrl + '/meeting/list/companies');
  }

  getLocationList() {
    return this.http.get<Company[]>(this.restgetMeetingLocationUrl);
  }

  public getParticipantList(CompanyId: any) {
    this.restTempUrl = null;
    this.restTempUrl = this.restParticipantsUrl.concat(CompanyId);
    return this.http.get<any[]>(this.restTempUrl);
  }

  public createMeeting(value: any) {
    return this.http.post<Meeting>(this.restCreateMeeting, value);
  }

  public updateMeeting(updatedMeeting: Meeting) {
    return this.http.put<Meeting>(this.baseUrl + '/meeting/update', updatedMeeting);
  }

  public deleteMeeting(companyId: any, meetingId: any) {
    return this.http.get(this.baseUrl + '/meeting/delete/' + companyId + '/' + meetingId);
  }

  public editMeeting(meetingId: any) {
    this.restTempUrl = null;
    this.restTempUrl = this.restEditMeeting.concat(meetingId);
    return this.http.get<Meeting>(this.restTempUrl);
  }

  public getMeetingsInRange(dateRange: any) {
    return this.http.get(this.baseUrl + '/meeting/meetingFilter', { params: dateRange });
  }

}
