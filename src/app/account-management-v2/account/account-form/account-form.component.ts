/*
 * Created on Tue Aug 13 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Input, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material';
import { DatePipe } from '@angular/common';

import Swal from 'sweetalert2';

import { AccountService } from '../../services/account/account.service';
import { TextInputField, HiddenInputField, SelectInputField, NumberInputField, EmailInputField, TextAreaInputField, SelectOption, SearchableSelectInputField, DateInputField } from 'src/app/shared/abstracts/field-type.model';
import { MetadataService } from '../../services/metadata/metadata.service';
import { DropdownData } from '../../models/dropdown-data.model';
import { DataRange } from '../../models/data-range.model';
import { ContactCategory } from '../../models/contact-category.model';
import { ContactOrientation } from '../../models/contact-orientation.model';
import { ContactRole } from '../../models/contact-role.model';
import { ContactLocationMapStatus } from '../../models/contact-locationmap-status.model';
import { ContactStatus } from '../../models/contact-status.model';
import { Tab } from 'src/app/shared/models/tab.model';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { ContactService } from '../../services/contact/contact.service';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { FortigoValidators } from 'src/app/shared/models/fortigo-validators.model';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.css'],
  providers: [DatePipe]
})
export class AccountFormComponent implements OnInit {
  @Input() mode: any;
  public isSavingData: boolean;
  private companyId: string;

  // Dropdown fields
  private accountStatusList = new Array<DropdownData>();
  private accountGradeList = new Array<DropdownData>();
  private accountGeographicScopeList = new Array<DropdownData>();
  private accountAnnualRevenueList = new Array<DataRange>();
  private accountAnnualLogisticSpentList = new Array<DataRange>();
  private accountLTLList = new Array<DataRange>();
  private accountFTLList = new Array<DataRange>();
  private accountParcelList = new Array<DataRange>();
  private accountAddressableFTLValueList = new Array<DataRange>();
  private accountExpectedMonthlyBusinessList = new Array<DataRange>();
  // Truck type for account
  private accountTruckTypeList = new Array<DataRange>();
  private contactStatus = new Array<ContactStatus>();
  private contactCategory = new Array<ContactCategory>();
  private contactOrientation: Array<ContactOrientation> = new Array<ContactOrientation>();
  private contactRole: Array<ContactRole> = new Array<ContactRole>();
  private contactLocationMapStatus: Array<ContactLocationMapStatus> = new Array<ContactLocationMapStatus>();
  public tabList: Array<Tab>;
  public account: any;
  public accountFields: Array<any>;

  constructor(private _activatedRoute: ActivatedRoute,
    private _accountService: AccountService,
    private _loginService: LoginControlV2Service,
    private _metadataService: MetadataService,
    private _contactService: ContactService,
    @Inject(MAT_DIALOG_DATA) public _popupData: any
  ) { }

  ngOnInit() {
    // used to get url params
    this._activatedRoute.params.subscribe((params) => {
      if (params['companyId']) {
        this.companyId = params['companyId'];
      }
    });
    console.log('THe Coap' , this.companyId);
    this.getFields();

    // sets tabs component data
    this.tabList = [{ label: 'Profile' }, { label: 'Contact' }, { label: 'Address' }];
    if (this._popupData.mode === FortigoConstant.FORM_EDIT_MODE) {
      this.companyId = this._popupData.companyId;
      // used to get account data
      this._accountService.viewAccount(this.companyId).subscribe((response) => {
        this.account = response;
        this.setListToLowerRange(this.accountAnnualRevenueList, 'accountAnnualRevenue', this.account);
        this.setListToUpperRange(this.accountAnnualRevenueList, 'accountAnnualRevenue', this.account);
        this.setListToLowerRange(this.accountAnnualLogisticSpentList, 'accountAnnualLogisticSpent', this.account);
        this.setListToUpperRange(this.accountAnnualLogisticSpentList, 'accountAnnualLogisticSpent', this.account);
        this.setListToLowerRange(this.accountLTLList, 'accountLTL', this.account);
        this.setListToUpperRange(this.accountLTLList, 'accountLTL', this.account);
        this.setListToLowerRange(this.accountFTLList, 'accountFTL', this.account);
        this.setListToUpperRange(this.accountFTLList, 'accountFTL', this.account);
        this.setListToLowerRange(this.accountParcelList, 'accountParcel', this.account);
        this.setListToUpperRange(this.accountParcelList, 'accountParcel', this.account);
        this.setListToLowerRange(this.accountAddressableFTLValueList, 'accountAddressableFTLValue', this.account);
        this.setListToUpperRange(this.accountAddressableFTLValueList, 'accountAddressableFTLValue', this.account);
        this.setListToLowerRange(this.accountExpectedMonthlyBusinessList, 'accountExpectedMonthlyBusiness', this.account);
        this.setListToUpperRange(this.accountExpectedMonthlyBusinessList, 'accountExpectedMonthlyBusiness', this.account);
      });
    } else {
      this.account = {};
    }
  }

  /**
   * // ANCHOR : to be implemented
   * @param  {any} event
   */
  public onButtonClick(event: any) {
    //
  }

  /**
   * Set account status
   */
  private setAccountStatus() {
    this.accountStatusList.push(new DropdownData('active', 'Active'));
    this.accountStatusList.push(new DropdownData('prospecting', 'Prospecting', true));
    this.accountStatusList.push(new DropdownData('dropped', 'Dropped'));
    this.accountStatusList.push(new DropdownData('suspended', 'Suspended'));
    this.accountStatusList.push(new DropdownData('inactive', 'Inactive'));
    this.accountStatusList.push(new DropdownData('others', 'Others'));
  }

  /**
   * Set account grade
   */
  private setAccountGrade() {
    this.accountGradeList.push(new DropdownData('named_account', 'Named Account'));
    this.accountGradeList.push(new DropdownData('national_key_account', 'National Key Account'));
    this.accountGradeList.push(new DropdownData('key_account', 'Key Account'));
    this.accountGradeList.push(new DropdownData('others', 'Others'));
  }

  /**
   * Set account geographic scope
   */
  private setAccountGeographicScope() {
    this.accountGeographicScopeList.push(new DropdownData('single_geography', 'Single Geography'));
    this.accountGeographicScopeList.push(new DropdownData('multiple_geography', 'Multiple Geography'));
  }

  /**
   * Set account contact
   */
  private setContact() {
    this.contactStatus.push(new ContactStatus('active', 'Active', true));
    this.contactStatus.push(new ContactStatus('inactive', 'Inactive'));
    this.contactStatus.push(new ContactStatus('other', 'Others'));

    this.contactCategory.push(new ContactCategory('primary', 'Primary', true));
    this.contactCategory.push(new ContactCategory('secondary', 'Secondary'));
    this.contactCategory.push(new ContactCategory('escalation', 'Escalation'));
    this.contactCategory.push(new ContactCategory('unknown', 'Unknown'));

    this.contactOrientation.push(new ContactOrientation('positive', 'Positive'));
    this.contactOrientation.push(new ContactOrientation('negative', 'Negative'));
    this.contactOrientation.push(new ContactOrientation('neutral', 'Neutral', true));
    this.contactOrientation.push(new ContactOrientation('unknown', 'Unknown'));

    this.contactRole.push(new ContactRole('decision_maker', 'Decision Maker'));
    this.contactRole.push(new ContactRole('decision_influencer', 'Decision Influencer'));
    this.contactRole.push(new ContactRole('process_owner', 'Process Owner'));
    this.contactRole.push(new ContactRole('end_user', 'End User', true));

    this.contactLocationMapStatus.push(new ContactLocationMapStatus('active', 'Active', true));
    this.contactLocationMapStatus.push(new ContactLocationMapStatus('inactive', 'Inactive'));
  }

  /**
   * Set account range
   */
  private setRangeValues() {
    this.accountAnnualRevenueList.push(new DataRange('not_available', 'Not Available', 0, 0));
    this.accountAnnualRevenueList.push(new DataRange('less_than_50cr', 'Less than ₹50 CR', 0, 500000000));
    this.accountAnnualRevenueList.push(new DataRange('50_to_100cr', '₹50 to 100 CR', 500000001, 1000000000));
    this.accountAnnualRevenueList.push(new DataRange('100_to_500cr', '₹100 to 500 CR', 1000000001, 5000000000));
    this.accountAnnualRevenueList.push(new DataRange('greater_than_500cr', 'Greater than ₹500 CR', 5000000001, 99999999999));

    this.accountAnnualLogisticSpentList.push(new DataRange('not_available', 'Not Available', 0, 0));
    this.accountAnnualLogisticSpentList.push(new DataRange('less_than_5cr', 'Less than ₹5 CR', 0, 50000000));
    this.accountAnnualLogisticSpentList.push(new DataRange('5_to_10cr', '₹5 to 10 CR', 50000001, 100000000));
    this.accountAnnualLogisticSpentList.push(new DataRange('10_to_50cr', '₹10 to 50 CR', 100000001, 500000000));
    this.accountAnnualLogisticSpentList.push(new DataRange('greater_than_50cr', 'Greater than ₹50 CR', 500000001, 99999999999));

    this.accountLTLList.push(new DataRange('not_available', 'Not Available', 0, 0));
    this.accountLTLList.push(new DataRange('less_than_5cr', 'Less than ₹5 CR', 0, 50000000));
    this.accountLTLList.push(new DataRange('5_to_10cr', '₹5 to 10 CR', 50000001, 100000000));
    this.accountLTLList.push(new DataRange('10_to_50cr', '₹10 to 50 CR', 100000001, 500000000));
    this.accountLTLList.push(new DataRange('greater_than_50cr', 'Greater than ₹50 CR', 500000001, 99999999999));

    this.accountFTLList.push(new DataRange('not_available', 'Not Available', 0, 0));
    this.accountFTLList.push(new DataRange('less_than_5cr', 'Less than ₹5 CR', 0, 50000000));
    this.accountFTLList.push(new DataRange('5_to_10cr', '₹5 to 10 CR', 50000001, 100000000));
    this.accountFTLList.push(new DataRange('10_to_50cr', '₹10 to 50 CR', 100000001, 500000000));
    this.accountFTLList.push(new DataRange('greater_than_50cr', 'Greater than ₹50 CR', 500000001, 99999999999));

    this.accountParcelList.push(new DataRange('not_available', 'Not Available', 0, 0));
    this.accountParcelList.push(new DataRange('less_than_5cr', 'Less than ₹5 CR', 0, 50000000));
    this.accountParcelList.push(new DataRange('5_to_10cr', '₹5 to 10 CR', 50000001, 100000000));
    this.accountParcelList.push(new DataRange('10_to_50cr', '₹10 to 50 CR', 100000001, 500000000));
    this.accountParcelList.push(new DataRange('greater_than_50cr', 'Greater than ₹50 CR', 500000001, 99999999999));

    this.accountAddressableFTLValueList.push(new DataRange('not_available', 'Not Available', 0, 0));
    this.accountAddressableFTLValueList.push(new DataRange('less_than_.1cr', 'Less than ₹0.1 CR', 0, 1000000));
    this.accountAddressableFTLValueList.push(new DataRange('.1_to_.5cr', '₹0.1 CR to ₹0.5 CR', 1000001, 5000000));
    this.accountAddressableFTLValueList.push(new DataRange('.6_to_1cr', '₹0.6 CR to ₹1 CR', 5000001, 10000000));
    this.accountAddressableFTLValueList.push(new DataRange('greater_than_1cr', 'Greater than ₹1 CR', 10000001, 99999999999));

    this.accountTruckTypeList.push(new DataRange('open_tonnage', 'Open Tonnage', 1, 1));
    this.accountTruckTypeList.push(new DataRange('close_tonnage', 'Close Tonnage', 1, 1));
    this.accountTruckTypeList.push(new DataRange('not_available', 'Not Available', 1, 1));

    this.accountExpectedMonthlyBusinessList.push(new DataRange('not_available', 'Not Available', 0, 0));
    this.accountExpectedMonthlyBusinessList.push(new DataRange('less_than_.1cr', 'Less than ₹0.1 CR', 0, 1000000));
    this.accountExpectedMonthlyBusinessList.push(new DataRange('.1_to_.5cr', '₹0.1 CR to ₹0.5 CR', 1000001, 5000000));
    this.accountExpectedMonthlyBusinessList.push(new DataRange('.6_to_1cr', '₹0.6 CR to ₹1 CR', 5000001, 10000000));
    this.accountExpectedMonthlyBusinessList.push(new DataRange('greater_than_1cr', 'Greater than ₹1 CR', 10000001, 99999999999));
  }

  /**
   * Set form fields
   */
  private getFields() {
    this.setAccountStatus();
    this.setAccountGrade();
    this.setAccountGeographicScope();
    this.setRangeValues();
    this.setContact();
    const accountId = new HiddenInputField('accountId', 'accountId', undefined, false, new FortigoValidators(undefined, undefined, true), 0, 1, '123');
    const accountName = new TextInputField('Name', 'accountName', undefined, false, new FortigoValidators(undefined, undefined, true), 0);
    const accountAlias = new TextInputField('Alias', 'accountAlias', undefined, false, 0);
    const parentOption = new SelectOption('companyName', 'companyStringId', this._metadataService.companyDropdownList);
    const parentCompany = new SearchableSelectInputField('Parent Company', 'accountParentId', parentOption, undefined, false, undefined, undefined, 0, undefined, undefined, undefined, true);
    const accountManager = this._metadataService.nationalAMList;
    const accountManagerOption = new SelectOption('accountNationalManagerID', 'accountNationalManagerID', accountManager);
    const accountNationalManagerName = new SearchableSelectInputField('Account Manager', 'accountNationalManagerID', accountManagerOption, undefined, false, false, new FortigoValidators(undefined, undefined, true), 0);
    const expectedDateOfBusinessCommencement = new DateInputField('Exp.Dt.Of Business Comm.', 'expectedDateOfBusinessCommencement', undefined, false, undefined, 0);
    const biddingDate = new DateInputField('Bidding Date', 'biddingDate', undefined, false, new FortigoValidators(undefined, undefined, true), 0);

    // Account Legal Entity Type
    const accountlegalOption = new SelectOption('legalEntityTypeAlias', 'legalEntityTypeName', this._metadataService.legalType);
    const accountLegalEntityType = new SelectInputField('Entity Type', 'accountLegalEntityType', accountlegalOption, undefined, false, new FortigoValidators(undefined, undefined, true), 0);
    // Account Grade
    const accountGradeOption = new SelectOption('displayName', 'key', this.accountGradeList);
    const accountGrade = new SelectInputField('Grade', 'accountGrade', accountGradeOption, undefined, false, new FortigoValidators(undefined, undefined, true), 0);
    // Geographic Scope
    const accountGeographicScopeOption = new SelectOption('displayName', 'key', this.accountGeographicScopeList);
    const accountGeographicScope = new SelectInputField('Geographic Scope', 'accountGeographicScope', accountGeographicScopeOption, undefined, false, new FortigoValidators(undefined, undefined, true), 0);
    // Category
    const accountCategoryNameOption = new SelectOption('accountCategoryAlias', 'accountCategoryName', this._metadataService.companyCategory);
    const accountCategoryName = new SelectInputField('Group', 'accountCategoryName', accountCategoryNameOption, undefined, false, new FortigoValidators(undefined, undefined, true), 0);
    // Industry
    const accountIndustryTypeoption = new SelectOption('industryTypeAlias', 'industryTypeName', this._metadataService.industryType);
    const accountIndustryType = new SearchableSelectInputField('Industry', 'accountIndustryType', accountIndustryTypeoption, undefined, false, undefined, new FortigoValidators(undefined, undefined, true), 0, undefined, undefined, undefined, true);
    // Commodities
    const accountCommodityTypeOption = new SelectOption('commodityTypeAlias', 'commodityTypeName', this._metadataService.commodities);
    const accountCommodityType = new SearchableSelectInputField('Commodities', 'accountCommodityType', accountCommodityTypeOption, undefined, false, undefined, new FortigoValidators(undefined, undefined, true), 0, undefined, undefined, undefined, true);
    // Annual Revenue
    const accountAnnualRevenueOption = new SelectOption('displayName', 'key', this.accountAnnualRevenueList);
    const accountAnnualRevenue = new SelectInputField('Annual Revenue', 'accountAnnualRevenue', accountAnnualRevenueOption, undefined, false, new FortigoValidators(undefined, undefined, true), 0);
    // Routes Operated
    const accountRoutesOperatedOptions = new SelectOption('locationName', 'locationId', this._metadataService.routesOperatedData);
    const accountRoutesOperated = new SearchableSelectInputField('Routes Operated', 'routesOperated', accountRoutesOperatedOptions, undefined, true, false, new FortigoValidators(undefined, undefined, true), 0);
    // Addressable FTLs
    const accountAddressableFTLValueOption = new SelectOption('displayName', 'key', this.accountAddressableFTLValueList);
    const accountAddressableFTLValue = new SelectInputField('Addressable FTL', 'accountAddressableFTL', accountAddressableFTLValueOption, undefined, false, new FortigoValidators(undefined, undefined, true), 0);
    // Truck Type
    const accountTruckTypeValueOption = new SelectOption('displayName', 'key', this.accountTruckTypeList);
    const accountTruckTypetValue = new SelectInputField('Truck Type', 'accountTruckType', accountTruckTypeValueOption, undefined, false, new FortigoValidators(undefined, undefined, true), 0);
    // Exp. Monthly Business
    const accountExpectedMonthlyBusinessOption = new SelectOption('displayName', 'key', this.accountExpectedMonthlyBusinessList);
    const accountExpectedMonthlyBusiness = new SelectInputField('Exp. Monthly Business', 'accountExpectedMonthlyBusiness', accountExpectedMonthlyBusinessOption, undefined, false, new FortigoValidators(undefined, undefined, true), 0);
    // FTL Annual Spend
    const accountFTLOption = new SelectOption('displayName', 'key', this.accountFTLList);
    const accountFTL = new SelectInputField('FTL Annual Spend', 'accountFTL', accountFTLOption, undefined, false, new FortigoValidators(undefined, undefined, true), 0);
    // contact Details
    const contactFirstName = new TextInputField('First Name', 'contactFirstName', undefined, false, new FortigoValidators(undefined, undefined, true), 1);
    const contactMiddleName = new TextInputField('Middle Name', 'contactMiddleName', undefined, false, [], 1);
    const contactLastName = new TextInputField('Last Name', 'contactLastName', undefined, false, [], 1);
    const contactMobileNumber = new NumberInputField('Mobile Number', 'contactMobileNumber', undefined, false, [], 1);
    const contactPhoneNumber = new TextInputField('Phone Number', 'contactPhoneAltNumber', undefined, false, [], 1);
    const contactEmail = new EmailInputField('Email Address', 'contactPersonalEmail', undefined, false, [], 1);
    const contactAlias = new TextInputField('Alias', 'contactAlias', undefined, false, [], 1);
    const contactDepartment = new TextInputField('Department', 'contactDepartment', undefined, false, [], 1);
    const contactDesignation = new TextInputField('Designation', 'contactDesignation', undefined, false, [], 1);

    // Category
    const contactCategoryOption = new SelectOption('alias', 'name', this.contactCategory);
    const contactCategory = new SelectInputField('Category', 'contactCategory', contactCategoryOption, undefined, false, new FortigoValidators(undefined, undefined, true), 1);
    // Role
    const contactRoleOption = new SelectOption('alias', 'name', this.contactRole);
    const contactRole = new SelectInputField('Role', 'contactRole', contactRoleOption, undefined, false, new FortigoValidators(undefined, undefined, true), 1);
    // Role-Additional details
    const contactOrientationOption = new SelectOption('alias', 'name', this.contactOrientation);
    const contactOrientation = new SelectInputField('Orientation', 'contactOrientation', contactOrientationOption, undefined, false, new FortigoValidators(undefined, undefined, true), 1);
    const contactRoleAdditionalDetails = new TextInputField('Role-Additional details', 'contactRoleAdditionalDetails', undefined, false, [], 1);

    // pass location
    const locationOption = new SelectOption('locationName', 'locationId', this._metadataService.locationList);
    const location = new SearchableSelectInputField('Location', 'accountLocationId', locationOption, undefined, false, undefined, new FortigoValidators(undefined, undefined, true), 2, undefined, undefined, undefined, true);
    // pass location type
    const locationTypeOption = new SelectOption('accountLocationTypeAlias', 'accountLocationTypeName', this._metadataService.locationType);
    const locationType = new SelectInputField('Location Type', 'accountLocationTypeName', locationTypeOption, undefined, false, new FortigoValidators(undefined, undefined, true), 2);

    const accountLocationGSTIN = new TextInputField('GSTIN', 'accountLocationGSTIN', undefined, false, [], 2);
    const accountPostalAddress = new TextAreaInputField('Postal Address', 'accountPostalAddress', undefined, false, new FortigoValidators(undefined, undefined, true), 2);
    const otherAddressDetails = new TextInputField('Other Address Detail', 'otherAddressDetails', undefined, false, [], 2);
    const accountPinCode = new TextInputField('Pin Code', 'accountPinCode', undefined, false, [], 2);

    this.accountFields = [
      accountId,
      accountName,
      accountAlias,
      accountNationalManagerName,
      parentCompany,
      accountLegalEntityType,
      accountGrade,
      accountCategoryName,
      accountIndustryType,
      accountCommodityType,
      accountAnnualRevenue,
      accountFTL,
      accountAddressableFTLValue,
      accountGeographicScope,
      accountTruckTypetValue,
      accountRoutesOperated,
      expectedDateOfBusinessCommencement,
      biddingDate,
      accountExpectedMonthlyBusiness,
      contactFirstName,
      contactMiddleName,
      contactLastName,
      contactMobileNumber,
      contactPhoneNumber,
      contactEmail,
      contactAlias,
      contactDepartment,
      contactDesignation,
      contactCategory,
      contactRole,
      contactOrientation,
      contactRoleAdditionalDetails,
      location,
      locationType,
      accountLocationGSTIN,
      accountPostalAddress,
      otherAddressDetails,
      accountPinCode,
    ];
  }

  /**
   * This function is use to save the account and contact information of the form..
   * @param  {} value: All value of the account form.
   */
  public onSubmit(value: any) {
    value.accountAnnualRevenueLowerRange = this.setListToLowerRange(this.accountAnnualRevenueList, 'accountAnnualRevenue', value);
    value.accountAnnualRevenueUpperRange = this.setListToUpperRange(this.accountAnnualRevenueList, 'accountAnnualRevenue', value);
    value.accountFTLLowerRange = this.setListToLowerRange(this.accountFTLList, 'accountFTL', value);
    value.accountFTLUpperRange = this.setListToUpperRange(this.accountFTLList, 'accountFTL', value);
    value.accountAddressableFTLLowerRange = this.setListToLowerRange(this.accountAddressableFTLValueList, 'accountAddressableFTL', value);
    value.accountAddressableFTLUpperRange = this.setListToUpperRange(this.accountAddressableFTLValueList, 'accountAddressableFTL', value);
    value.accountExpectedMonthlyBusinessLowerRange = this.setListToLowerRange(this.accountExpectedMonthlyBusinessList, 'accountExpectedMonthlyBusiness', value);
    value.accountExpectedMonthlyBusinessUpperRange = this.setListToUpperRange(this.accountExpectedMonthlyBusinessList, 'accountExpectedMonthlyBusiness', value);
    value.accountLTL = 'not_available';
    value.accountParcel = 'not_available';
    value.accountcustomerTypeName = 'end_customer';
    value.accountStatus = 'prospecting';
    value.routesOperated = value.routesOperated.toString();
    value.userId = Number.parseInt(this._loginService.userId);
    value.googleAddress = value.accountGoogleAddress;
    value.postalAddress = value.accountPostalAddress;
    value.contactLocationMapStatus = 'active';
    value.contactStatus = 'active';
    value.locationId = value.accountLocationId;
    value.pinCode = value.accountPinCode;
    // Validate the enter properties in account form.
    if (this._popupData.mode === FortigoConstant.FORM_EDIT_MODE) {
      this._accountService.updateCustomer(value).subscribe(response => {
      });
    } else {
      // Save account to the DB
      this._accountService.createCustomer(value).subscribe(response => {
        value.companyId = response['companyId']; // Get latest account id

        value.userId = 0; // system user in case of no user exists for the given company

        // Save contact inforamation to the DB
        this._contactService.createContact(value).subscribe((contactResponse) => {
          Swal.fire('Success', 'Account created successfully', 'success');
        });
      });
    }
  }
  /**
   * This function return Lower range the selected dropdown
   * @param  {Array<any>} list: List of range
   * @param  {string} key: Proprty of the dropdown field
   * @param  {any} account: All Values of the Account form
   * @returns string
   */
  private setListToLowerRange(list: Array<any>, key: string, account: any): string {
    const filteredList = list.filter((data) => {
      return (account[key] === data.key);
    });
    if (filteredList && filteredList.length > 0) {
      return filteredList[0].lowerRange;
    }
  }

  /**
   * This function return Upper range the selected dropdown
   * @param  {Array<any>} list: List of range
   * @param  {string} key: Proprty of the dropdown field
   * @param  {any} account: All Values of the Account form
   * @returns string
   */
  private setListToUpperRange(list: Array<any>, key: string, account: any): string {
    const filteredList = list.filter((data) => {
      return (account[key] === data.key);
    });
    if (filteredList && filteredList.length > 0) {
      return filteredList[0].upperRange;
    }
  }
}
