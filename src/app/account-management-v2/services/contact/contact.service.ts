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

@Injectable()
export class ContactService {
  public reloadContacts = new EventEmitter();
  private baseUrl = environment.baseUrl + environment.baseAccountManagementPath;

  constructor(private http: HttpClient) { }

  /**
   * Return observable for Contact List data
   * @param  {number} companyId: Selected company id
   */
  public getContactList(companyId: number): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_CONTACT_LIST_URL + companyId);
  }

  /**
   * Return observable for Contact data
   * @param  {any} contactId: Selected company
   */
  public viewContact(contactId: any): Observable<any> {
    return this.http.get(this.baseUrl + AccountManagementURL.AM_CONTACT_VIEW_URL + contactId);
  }

  /**
   * Return observable for creating a contact.
   * @param  {any} value: all value of contact form.
   */
  public createContact(value: any): Observable<any> {
    return this.http.post(this.baseUrl + AccountManagementURL.AM_CONTACT_CREATE_URL, value);
  }

  /**
   * Return observable for geting locations for contact.
   */
  public getLocationList(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl + AccountManagementURL.AM_GET_LOCATION_LIST);
  }

  /**
   * Delete contact entry.
   * @param  {} deleteContact
   */
  public deleteContact(deleteContact): Observable<any> {
    deleteContact.contactStatus = 'inactive';
    return this.http.put(this.baseUrl + AccountManagementURL.AM_CONTACT_DELETE_URL, deleteContact);
  }

  /**
   * Update contact
   * @param  {} updateContact: contact data
   * @returns Observable
   */
  public updateContact(updateContact): Observable<any> {
    return this.http.put(this.baseUrl + AccountManagementURL.AM_CONTACT_UPDATE_URL, updateContact);
  }
}
