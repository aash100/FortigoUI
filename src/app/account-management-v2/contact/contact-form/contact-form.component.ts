/*
 * Created on Wed Aug 14 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { TextInputField, SelectOption, SelectInputField, EmailInputField, NumberInputField, TextAreaInputField, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { MetadataService } from '../../services/metadata/metadata.service';
import { AccountDropdownItem } from '../../models/account-dropdown-item.model';
import { ContactService } from '../../services/contact/contact.service';
import { Tab } from 'src/app/shared/models/tab.model';
import { FortigoValidators } from 'src/app/shared/models/fortigo-validators.model';
import { AccountManagementConstant } from '../../constants/AccountManagementConstant';
import { AccountManagementURL } from '../../constants/AccountManagementURL';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css']
})
export class ContactFormComponent implements OnInit {

  public isReadOnly: boolean;
  public fields: Array<any>;
  public companyField: Array<any>;
  public selectedTab: number;
  public contactTabList: Array<Tab>;
  public companies: Array<AccountDropdownItem>;
  public contact: any;
  public company: any;
  public isSubmitButtonEnabled: boolean;
  public modalHeader: any;

  private NEW_CONTACT = 'New Contact';
  private EDIT_CONTACT = 'Edit Contact';
  private VIEW_CONTACT = 'View Contact';
  private _CONTACTS = 'CONTACTS';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _metadataService: MetadataService,
    private _contactService: ContactService,
    private _route: Router,
    private _dialog: MatDialog
  ) {
    // loads all the meta data required for contact form
    this._metadataService.loadMetadata();
    this.companies = this._metadataService.companyDropdownList;
    this.fields = new Array<any>();
    this.companyField = new Array<any>();
  }

  ngOnInit() {
    this.isReadOnly = false;
    this.isSubmitButtonEnabled = true;
    this.contactTabList = [{ label: 'Contacts' }, { label: 'Address' }];

    // switch on view/create/edit
    switch (this.data.mode) {
      case FortigoConstant.FORM_CREATE_MODE:
        this.getContactFields(this.data['defaultData']);
        this.modalHeader = this.NEW_CONTACT;
        break;
      case FortigoConstant.FORM_VIEW_MODE:
        this._contactService.viewContact(this.data['defaultData'].contactId).subscribe((response) => {
          this.contact = response;
          this.modalHeader = this.VIEW_CONTACT;
          this.getContactFields(this.company);
        });
        this.isReadOnly = true;
        this.isSubmitButtonEnabled = false;
        break;
      case FortigoConstant.FORM_EDIT_MODE:
        this.modalHeader = this.EDIT_CONTACT;
        this.isReadOnly = false;
        this.isSubmitButtonEnabled = true;
        this._contactService.viewContact(this.data['defaultData'].contactId).subscribe((response) => {
          this.contact = response;
          this.getContactFields(this.contact);
        });
        break;
      default:
        break;
    }
  }
  /**
   * creates list of objects for dropdown fields
   * @param contactDefaultValues : default value
   */

  private getContactFields(contactDefaultValues: any) {
    const contactStatusList = [
      { value: 'active', key: 'Active', extra: 'extra' },
      { value: 'inactive', key: 'Inactive', extra: 'extra' },
      { value: 'other', key: 'Others', extra: 'extra' },
    ];
    const contactCategoryList = [
      { value: 'primary', key: 'Primary', extra: 'extra' },
      { value: 'secondary', key: 'Secondary', extra: 'extra' },
      { value: 'escalation', key: 'Escalation', extra: 'extra' },
      { value: 'unknown', key: 'Unknown', extra: 'extra' },
    ];
    const contactOrientationList = [
      { value: 'positive', key: 'Positive', extra: 'extra' },
      { value: 'negative', key: 'Negative', extra: 'extra' },
      { value: 'neutral', key: 'Neutral', extra: 'extra' },
      { value: 'unknown', key: 'Unknown', extra: 'extra' },
    ];
    const contactRoleList = [
      { value: 'decision_maker', key: 'Decision Maker', extra: 'extra' },
      { value: 'decision_influencer', key: 'Decision Influencer', extra: 'extra' },
      { value: 'process_owner', key: 'Process Owner', extra: 'extra' },
      { value: 'end_user', key: 'End User', extra: 'extra' },
    ];

    const commodity = [
      { name: 'Invoice', action: 'openInvoice', extra: 'extra' },
      { name: 'trips', action: 'openTrips', extra: 'extra' },
      { name: 'acc', action: 'openAcc', extra: 'extra' },
    ];

    const requiredFortigoValidator = new FortigoValidators(undefined, undefined, true);
    const accountDropdownList = this._metadataService.companyDropdownList;

    const accountDropdownOptions = new SelectOption('companyName', 'companyStringId', accountDropdownList);
    const accountDropdown = new SearchableSelectInputField('Company Name', 'companyId', accountDropdownOptions, 12, false, (contactDefaultValues) ? true : false, requiredFortigoValidator, 0, undefined, (contactDefaultValues) ? contactDefaultValues['companyStringId'] : 'undefined');

    const contactFirstName = new TextInputField('First Name', 'contactFirstName', 4, false, requiredFortigoValidator, 0, undefined, (contactDefaultValues) ? contactDefaultValues['contactFirstName'] : undefined);
    const contactMiddleName = new TextInputField('Middle Name', 'contactMiddleName', 4, false, undefined, 0, undefined, (contactDefaultValues) ? contactDefaultValues['contactMiddleName'] : undefined);

    const contactLastName = new TextInputField('Last Name', 'contactLastName', 4, false, undefined, 0, undefined, (contactDefaultValues) ? contactDefaultValues['contactMobileNumber'] : undefined);
    const contactMobileNumber = new TextInputField('Mobile Number', 'contactMobileNumber', 6, false, undefined, 0, undefined, (contactDefaultValues) ? contactDefaultValues[''] : undefined);
    const contactPhoneNumber = new TextInputField('Phone Number', 'contactPhoneNumber', 6, false, undefined, 0, undefined, (contactDefaultValues) ? contactDefaultValues['contactPhoneNumber'] : undefined);
    const contactEmail = new EmailInputField('Email Address', 'contactEmail', 6, false, [], 0, undefined, (contactDefaultValues) ? contactDefaultValues['contactEmail'] : undefined);
    const contactAlias = new TextInputField('Alias', 'contactAlias', 6, false, [], 0, undefined, (contactDefaultValues) ? contactDefaultValues['contactAlias'] : undefined);
    const contactDepartment = new TextInputField('Department', 'contactDepartment', 6, false, [], 0, undefined, (contactDefaultValues) ? contactDefaultValues['contactDepartment'] : undefined);
    const contactDesignation = new TextInputField('Designation', 'contactDesignation', 6, false, [], 0, undefined, (contactDefaultValues) ? contactDefaultValues['contactDesignation'] : undefined);
    const contactStatusOptions = new SelectOption('key', 'value', contactStatusList);
    const contactStatus = new SelectInputField('Status', 'contactStatus', contactStatusOptions, undefined, false, [], 0, undefined, (contactDefaultValues) ? contactDefaultValues['contactStatus'] : undefined);
    const contactCategoryOptions = new SelectOption('key', 'value', contactCategoryList);
    const contactCategory = new SelectInputField('Category', 'contactCategory', contactCategoryOptions, undefined, false, requiredFortigoValidator, 0, undefined, (contactDefaultValues) ? contactDefaultValues['contactCategory'] : undefined);
    const contactRoleOptions = new SelectOption('key', 'value', contactRoleList);
    const contactRole = new SelectInputField('Role', 'contactRole', contactRoleOptions, undefined, false, requiredFortigoValidator, 0, undefined, (contactDefaultValues) ? contactDefaultValues['contactRole'] : undefined);
    const contactOrientationOptions = new SelectOption('key', 'value', contactOrientationList);
    const contactOrientation = new SelectInputField('Orientation', 'contactOrientation', contactOrientationOptions, undefined, false, requiredFortigoValidator, 0, undefined, (contactDefaultValues) ? contactDefaultValues['contactOrientation'] : undefined);
    const roleAdditionalField = new TextInputField('Role-Additional detail', 'contactRoleAdditionalDetails', undefined, false, [], 0, undefined, (contactDefaultValues) ? contactDefaultValues['contactRoleAdditionalDetails'] : undefined);

    const postalAddress = new TextAreaInputField('Postal Address', 'postalAddress', 12, false, requiredFortigoValidator, 1, undefined, (contactDefaultValues) ? contactDefaultValues['postalAddress'] : undefined);
    const otherAddressDetails = new TextAreaInputField('Other Address Detail', 'otherAddressDetails', 12, false, [], 1, undefined, (contactDefaultValues) ? contactDefaultValues['otherAddressDetails'] : undefined);
    const locationOptions = new SelectOption('locationName', 'locationId', this._metadataService.locationList);
    const location = new SearchableSelectInputField('City', 'locationId', locationOptions, 12, false, false, requiredFortigoValidator, 1, undefined, (contactDefaultValues) ? contactDefaultValues['locationId'] : undefined);
    const pinCode = new NumberInputField('Pin Code', 'pinCode', 12, false, [], 1);

    this.fields =
      [
        accountDropdown,
        contactFirstName,
        contactMiddleName,
        contactLastName,
        contactMobileNumber,
        contactPhoneNumber,
        contactAlias,
        contactEmail,
        contactDepartment,
        contactDesignation,
        contactStatusOptions,
        contactCategory,
        contactRole,
        contactOrientation,
        roleAdditionalField,
        location,
        postalAddress,
        otherAddressDetails,
        pinCode
      ];

    this.companyField = [accountDropdown];
  }

  /**
   * This function is use to save new / update the  contact  to the db.
   * @param  {any} contact: Contact detail
   */
  public onSubmitContactForm(contact: any) {

    switch (this.data.mode) {
      case FortigoConstant.FORM_CREATE_MODE:
        this.createContact(contact);
        break;
      case FortigoConstant.FORM_EDIT_MODE:
        this.updateContact(contact);
        break;
      default:
        break;
    }

  }

  /**
   * Used to create contact
   * @param contact : contact 
   */
  private createContact(contact: any) {
    contact.contactLocationMapStatus = 'active';
    contact.contactStatus = 'active';
    contact.userId = 0;

    this._contactService.createContact(contact).subscribe(response => {
      if (response['response'] === 'failure') {
        Swal.fire('Error', 'Contact creation failed.', 'error');
      } else {
        this.modalClose();
        Swal.fire('Success', 'Create contact successfully.', 'success');
        localStorage.setItem(AccountManagementConstant.AM_OPERATION_KEY, this._CONTACTS);
        this._contactService.reloadContacts.next(response);
        this._route.navigate([AccountManagementURL.AM_LANDING_URL, contact.companyId]);
      }
    });
  }

  /**
   * Used to update contact
   * @param data :contact
   */
  private updateContact(contact: any) {
    const editRequestPaylaod = contact;
    editRequestPaylaod['companyId'] = this.contact.companyStringId;
    editRequestPaylaod['addressId'] = this.contact.addressId;
    editRequestPaylaod['contactId'] = this.contact.contactId;
    editRequestPaylaod['contactStatus'] = this.contact.contactStatus;
    editRequestPaylaod['userId'] = this.contact.userId;
    this._contactService.updateContact(editRequestPaylaod).subscribe((response) => {
      if (response['response'] === 'success') {
        this.modalClose();
        Swal.fire('Success', 'Contact Updated Successfully', 'success');
        this._contactService.reloadContacts.next(response);

      } else {
        Swal.fire('Failure', 'Update Failed ', 'error');
      }
    });
  }
  /**
   *  This method closes the modal
   * @param  {} data
   */
  public modalClose() {
    this._dialog.closeAll();

  }
  /**
   * This method fetch the id of selected company.
   * @param  {any} company: selected company id
   */
  public getCompany(company: any) {
    this.company = company.value;
  }

}
