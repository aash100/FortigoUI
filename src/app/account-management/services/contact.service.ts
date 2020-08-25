import { Injectable } from '@angular/core';
import { Contact } from '../contacts/contact';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Company } from '../models/company.model';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ContactService {
    contactList: Contact[];
    locationList: any;
    contactLoading = false;

    baseUrl = environment.baseUrl + environment.baseAccountManagementPath;
    restGetCompanyUrl = this.baseUrl + '/contact/list/companies'; // list all the registered company in fortigo
    restUserUrl = this.baseUrl + '/contact/list/user/';
    restListContact = this.baseUrl + '/contact/list/';
    restCreateContact = this.baseUrl + '/contact/create';
    restContactDetail = this.baseUrl + '/contact/view/';
    restGetLocationUrl = this.baseUrl + '/contact/list/locations';
    restTempUrl = null;
    private intervalId: any = null;
    private editContactDetails: Contact;

    filterApplied = false;
    contactReload = new Subject<any>();
    contactFilterApplied = new Subject<any>();
    closeContactFilter = new Subject();
    contactFilteredData: any;
    meetingModalParticipantReload = new Subject();

    constructor(private http: HttpClient, private router: Router) { }

    public getEditContactDetails(): Contact {
        return this.editContactDetails;
    }
    public setEditContactDetails(value: Contact) {
        this.editContactDetails = value;
    }

    getContactsList(companyId: number) {
        return this.http.get<Contact[]>(this.restListContact + companyId);
    }

    getLocationList() {
        return this.http.get<any[]>(this.restGetLocationUrl);

    }
    getCompaniesList() {
        return this.http.get<Company[]>(this.restGetCompanyUrl);
    }

    getUserList(CompanyId: any) {
        this.restTempUrl = null;
        this.restTempUrl = this.restUserUrl.concat(CompanyId);
        return this.http.get<any[]>(this.restTempUrl);
    }

    createContact(value: any) {
        return this.http.post<Contact>(this.restCreateContact, value);
    }
    editContact(contactId: any) {
        this.restTempUrl = null;
        this.restTempUrl = this.restContactDetail.concat(contactId);
        return this.http.get<Contact>(this.restTempUrl);
    }
    deleteContact(deleteContact: Contact) {
        deleteContact.contactStatus = 'inactive';
        return this.http.put<Contact>(this.baseUrl + '/contact/delete', deleteContact);
    }
    viewContact(contactId: any) {
        this.restTempUrl = null;
        this.restTempUrl = this.restContactDetail.concat(contactId);
        return this.http.get<Contact>(this.restTempUrl);
    }
    updateContact(updateContact: Contact) {
        return this.http.put<Contact>(this.baseUrl + '/contact/update', updateContact);
    }

    refresh(companyId: string): void {
        this.router.navigate(['/customer/company/contacts/' + companyId]);
    }
}
