/*
 * Created on Thu Sep 05 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { FortigoButton } from 'src/app/shared/abstracts/button.model';
import { DocumentFormComponent } from '../document/document-form/document-form.component';
import { ContactFormComponent } from '../contact/contact-form/contact-form.component';
import { MeetingFormComponent } from '../meeting/meeting-form/meeting-form.component';
import { TargetFormComponent } from '../target/target-form/target-form.component';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { Tab } from 'src/app/shared/models/tab.model';
import { AccountService } from '../services/account/account.service';
import { DateInputField, SelectOption, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { AccountManagementConstant } from '../constants/AccountManagementConstant';
import { MetadataService } from '../services/metadata/metadata.service';
import { DocumentService } from '../services/document/document.service';
import { ContactService } from '../services/contact/contact.service';
import { MeetingService } from '../services/meeting/meeting.service';

@Component({
  selector: 'app-account-landing',
  templateUrl: './account-landing.component.html',
  styleUrls: ['./account-landing.component.css']
})
export class AccountLandingComponent implements OnInit {
  public filterTabList: Array<Tab>;
  public selectedTab = 0;
  public buttons: Array<FortigoButton>;
  public filterFields = [];
  public data;
  public accountInformation: Array<any>;
  public accountFields: Array<any>;
  public isSearchVisible: boolean;
  public isRefreshVisible: boolean;
  public isFilterVisible: boolean;
  public pageTitle: string;
  public pageSubTitle: string;
  public companyStringId: any;
  public searchText: string;

  constructor(private _dialog: MatDialog, private _metadataService: MetadataService, private _router: Router, private _activatedRoute: ActivatedRoute, private _documentService: DocumentService, private _contactService: ContactService, private _meetingService: MeetingService) { }

  ngOnInit() {
    this.searchText = '';
    this.companyStringId = this._activatedRoute.snapshot.paramMap.get('companyId');
    this.pageSubTitle = this._metadataService.companyDropdownList.find(item => item.companyStringId === this.companyStringId)['companyName'];
    this.filterTabList = [{ label: 'ACCOUNT SUMMARY', hideBadge: true, hideToolTipText: true }, { label: 'MEETINGS', hideBadge: true, hideToolTipText: true }, { label: 'DOCUMENTS', hideBadge: true, hideToolTipText: true }, { label: 'CONTACTS', hideBadge: true, hideToolTipText: true }, { label: 'TARGET', hideBadge: true, hideToolTipText: true }];
    this.buttons = [];
    this.pageTitle = 'ACCOUNT NAME';
    const valueFromLocalStorage = localStorage.getItem(AccountManagementConstant.AM_OPERATION_KEY);
    if (valueFromLocalStorage) {
      localStorage.removeItem(AccountManagementConstant.AM_OPERATION_KEY);
      const index = this.filterTabList.findIndex(item => item.label === valueFromLocalStorage);
      this.onTabClicked((index >= 0) ? index : 0);
    }

  }
  /**
   * configures filter for each tab 
   * @param  {number} selectedTab
   */
  public configureFilter(selectedTab: number) {
    switch (selectedTab) {
      case 2:
        const docTypeOptions = new SelectOption('type', 'id', this._metadataService.documentType);
        const docType = new SearchableSelectInputField('Document Type', 'docTypeId', docTypeOptions);
        this.filterFields = [docType];
        break;
      default:
        const fromDate = new DateInputField('From Date', 'fromDate');
        const toDate = new DateInputField('To Date', 'toDate');
        this.filterFields = [fromDate, toDate];
        break;

    }

  }

  /**
   * Trigger on head button click
   * @param  {string} buttonName: type of button click
   */
  public onHeaderButtonClick(buttonName: string) {
    switch (buttonName.toLowerCase()) {
      case AccountManagementConstant.MEETINGS.toLowerCase():
        this._dialog.open(MeetingFormComponent, {
          data: {
            mode: FortigoConstant.FORM_CREATE_MODE,
            defaultData: {
              companyStringId: this.companyStringId
            }
          }
        });
        break;
      case AccountManagementConstant.DOCUMENTS.toLowerCase():
        this._dialog.open(DocumentFormComponent, {
          data: {
            mode: FortigoConstant.FORM_CREATE_MODE,
            defaultData: {
              companyStringId: this.companyStringId
            }
          }
        });
        break;
      case AccountManagementConstant.CONTACTS.toLowerCase():
        this._dialog.open(ContactFormComponent, {
          data: {
            mode: FortigoConstant.FORM_CREATE_MODE,
            defaultData: {
              companyStringId: this.companyStringId
            }
          }
        });
        break;
      case AccountManagementConstant.TARGET.toLowerCase():
        this._router.navigate(['account/target']);
        break;
      default:
        break;
    }
  }

  /**
   * Trigger on tab click
   * @param  {number} tabIndex
   */
  onTabClicked(tabIndex: number) {
    this.selectedTab = tabIndex;
    this.searchText = '';
    this.configureFilter(this.selectedTab);
    this.buttons.length = 0;
    switch (this.selectedTab) {
      case 0:
        this.buttons.length = 0;
        this.isFilterVisible = false;
        this.isRefreshVisible = false;
        this.isSearchVisible = false;
        break;
      case 1:
        this.buttons = [new FortigoButton(AccountManagementConstant.MEETINGS)];
        this.isFilterVisible = true;
        this.isRefreshVisible = true;
        this.isSearchVisible = true;
        break;
      case 2:
        this.buttons = [new FortigoButton(AccountManagementConstant.DOCUMENTS)];
        this.isFilterVisible = true;
        this.isRefreshVisible = true;
        this.isSearchVisible = true;
        break;
      case 3:
        this.buttons = [new FortigoButton(AccountManagementConstant.CONTACTS)];
        this.isFilterVisible = true;
        this.isRefreshVisible = true;
        this.isSearchVisible = true;
        break;
      case 4:
        this.buttons = [new FortigoButton(AccountManagementConstant.TARGET)];
        this.isFilterVisible = true;
        this.isRefreshVisible = true;
        this.isSearchVisible = true;
        break;
      default:
        break;
    }
  }

  /**
   * This used to search existing data
   * @param  {string} searchText
   */
  public onSearchClick(searchText: string) {
    this.searchText = searchText;
    switch (this.selectedTab) {
      case 1:
        this._meetingService.reloadMeetings.next({
          ACTION: AccountManagementConstant.SEARCH,
          data: this.searchText
        });
        break;

      case 2:
        this._documentService.reloadDocument.next({
          ACTION: AccountManagementConstant.SEARCH,
          data: this.searchText
        });
        break;
      case 3:

        this._contactService.reloadContacts.next({
          ACTION: AccountManagementConstant.SEARCH,
          data: this.searchText
        });
        break;
      default:
        break;
    }
  }

  /**
   * This method trigger on click head button
   * @param  {string} event
   */
  public onFortigoHeadButtonClicked(event: string) {
    switch (event) {
      case AccountManagementConstant.MEETINGS:
        break;
      case AccountManagementConstant.DOCUMENTS:
        break;
      case AccountManagementConstant.CONTACTS:
        break;
    }
  }

  /**
   * Referesh table.
   */
  public onRefreshClick(data: any) {
    this.configureFilter(this.selectedTab);
    switch (this.selectedTab) {
      case 1:
        this._meetingService.reloadMeetings.next();
        break;

      case 2:
        this._documentService.reloadDocument.next();
        break;
      case 3:
        this._contactService.reloadContacts.next();
        break;
      default:
        break;
    }
  }
  /**
   * To clear the Filter form
   */
  public clearClicked(data: any) {
    this.onRefreshClick(data);

  }

  /**
   * This trigger on submit filter
   * @param  {object} filterData
   */
  public onFilterSubmit(filterData: object) {
    this.searchText = '';
    switch (this.selectedTab) {
      case 1:
        this._meetingService.reloadMeetings.next({
          ACTION: AccountManagementConstant.FILTER,
          data: filterData
        });
        break;

      case 2:
        this._documentService.reloadDocument.next({
          ACTION: AccountManagementConstant.FILTER,
          data: filterData
        });
        break;
      case 3:
        this._contactService.reloadContacts.next({
          ACTION: AccountManagementConstant.FILTER,
          data: filterData
        });
        break;
      default:
        break;

    }
  }
}
