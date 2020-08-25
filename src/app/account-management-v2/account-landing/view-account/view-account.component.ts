/*
 * Created on Wed Sep 04 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { TextInputField, HiddenInputField, SelectInputField, TextAreaInputField, SelectOption, SearchableSelectInputField, DateInputField } from 'src/app/shared/abstracts/field-type.model';
import { AccountService } from '../../services/account/account.service';
import { MetadataService } from '../../services/metadata/metadata.service';
import { DropdownData, } from '../../models/dropdown-data.model';
import { DataRange } from '../../models/data-range.model';
import { ContactCategory } from '../../models/contact-category.model';
import { ContactOrientation } from '../../models/contact-orientation.model';
import { ContactRole } from '../../models/contact-role.model';
import { ContactLocationMapStatus } from '../../models/contact-locationmap-status.model';
import { ContactStatus } from '../../models/contact-status.model';

@Component({
  selector: 'app-view-account',
  templateUrl: './view-account.component.html',
  styleUrls: ['./view-account.component.css']
})
export class ViewAccountComponent implements OnInit {

  @Output() subtitleChange = new EventEmitter<string>();


  // All form properties.
  public accountFields: Array<any>;
  public mode: any;
  public LandingPageData: any;
  public companyId: string;
  public accountGradeList = new Array<DropdownData>();
  public accountGeographicScopeList = new Array<DropdownData>();
  public accountAnnualRevenueList = new Array<DataRange>();
  public accountStatusList = new Array<DropdownData>();
  public accountAnnualLogisticSpentList = new Array<DataRange>();
  public accountRoutesOperatedList = new Array<DataRange>();
  public accountLTLList = new Array<DataRange>();
  public accountFTLList = new Array<DataRange>();
  public accountParcelList = new Array<DataRange>();
  public accountAddressableFTLValueList = new Array<DataRange>();
  public accountExpectedMonthlyBusinessList = new Array<DataRange>();
  public accountTruckTypeList = new Array<DataRange>();

  public contactStatus = new Array<ContactStatus>();
  public contactCategory = new Array<ContactCategory>();
  public contactOrientation: Array<ContactOrientation> = new Array<ContactOrientation>();
  public contactRole: Array<ContactRole> = new Array<ContactRole>();
  public contactLocationMapStatus: Array<ContactLocationMapStatus> = new Array<ContactLocationMapStatus>();

  constructor(private _accountService: AccountService,
    private _metadataService: MetadataService
  ) { }

  ngOnInit() {
    // REVIEW @Mayur: review the url reference
    const url = window.location.href.split('/');
    if (url.length) {
      this._accountService.viewAccount(url[url.length - 1]).subscribe(response => {
        this.getFields(response);
        this.subtitleChange.emit(response['accountName']);
      });
    }
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
   * Set grades for account
   */
  private setAccountGrade() {
    this.accountGradeList.push(new DropdownData('named_account', 'Named Account'));
    this.accountGradeList.push(new DropdownData('national_key_account', 'National Key Account'));
    this.accountGradeList.push(new DropdownData('key_account', 'Key Account'));
    this.accountGradeList.push(new DropdownData('not_available', 'Not Available'));
    this.accountGradeList.push(new DropdownData('others', 'Others'));
  }

  /**
   * set account geographic scope
   */
  private setAccountGeographicScope() {
    this.accountGeographicScopeList.push(new DropdownData('single_geography', 'Single Geography'));
    this.accountGeographicScopeList.push(new DropdownData('multiple_geography', 'Multiple Geography'));
    this.accountGeographicScopeList.push(new DropdownData('not_available', 'Not Available'));

  }

  /**
   * Set contact, Category, roles and contacts
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
   * Set range
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
   * This return range
   * @param  {} lowerRange
   * @param  {} upperRange
   * @returns String
   */
  private getRange(lowerRange: number, upperRange: number): string {
    if (lowerRange === 0 && upperRange === 0) {
      return 'not_available';
    } else if (lowerRange === 0 && upperRange === 500000000) {
      return 'less_than_50cr';
    } else if (lowerRange === 500000001 && upperRange === 1000000000) {
      return '50_to_100cr';
    } else if (lowerRange === 1000000001 && upperRange === 5000000000) {
      return '100_to_500cr';
    } else if (lowerRange === 5000000001 && upperRange === 99999999999) {
      return 'greater_than_500cr';
    } else if (lowerRange === 0 && upperRange === 50000000) {
      return 'less_than_5cr';
    } else if (lowerRange === 50000001 && upperRange === 100000000) {
      return '5_to_10cr';
    } else if (lowerRange === 100000001 && upperRange === 500000000) {
      return '10_to_50cr';
    } else if (lowerRange === 500000001 && upperRange === 99999999999) {
      return 'greater_than_50cr';
    } else if (lowerRange === 0 && upperRange === 1000000) {
      return 'less_than_.1cr';
    } else if (lowerRange === 1000001 && upperRange === 5000000) {
      return '.1_to_.5cr';
    } else if (lowerRange === 5000001 && upperRange === 10000000) {
      return '.6_to_1cr';
    } else if (lowerRange === 10000001 && upperRange === 99999999999) {
      return 'greater_than_1cr';
    }
  }

  /**
   * set account fields
   * @param  {} account
   */
  private getFields(account: any) {
    console.log(account);
    // Set values before load.
    this.setAccountStatus();
    this.setAccountGrade();
    this.setAccountGeographicScope();
    this.setRangeValues();
    this.setContact();

    const parentOption = new SelectOption('companyName', 'companyStringId', this._metadataService.companyDropdownList);
    console.log('company ', this._metadataService.companyDropdownList);
    // pass entity
    const accountlegalOption = new SelectOption('legalEntityTypeAlias', 'legalEntityTypeName', this._metadataService.legalType);
    // pass status
    const accountGradeOption = new SelectOption('displayName', 'key', this.accountGradeList);
    // pass status
    const accountGeographicScopeOption = new SelectOption('displayName', 'key', this.accountGeographicScopeList);
    // pass status
    const accountCategoryNameOption = new SelectOption('accountCategoryAlias', 'accountCategoryName', this._metadataService.companyCategory);
    // pass status
    const accountIndustryTypeoption = new SelectOption('industryTypeAlias', 'industryTypeName', this._metadataService.industryType);
    // pass status
    const accountCommodityTypeOption = new SelectOption('commodityTypeAlias', 'commodityTypeName', this._metadataService.commodities);
    // pass status
    const accountAnnualRevenueOption = new SelectOption('displayName', 'key', this.accountAnnualRevenueList);
    // pass status
    const accountRoutesOperatedOptions = new SelectOption('locationName', 'locationId', this._metadataService.routesOperatedData);
    // pass status
    const accountAddressableFTLValueOption = new SelectOption('displayName', 'key', this.accountAddressableFTLValueList);
    // pass status
    const accountTruckTypeValueOption = new SelectOption('displayName', 'key', this.accountTruckTypeList);
    // pass status
    const accountExpectedMonthlyBusinessOption = new SelectOption('displayName', 'key', this.accountExpectedMonthlyBusinessList);
    // pass status
    const accountFTLOption = new SelectOption('displayName', 'key', this.accountFTLList);
    // pass location
    const locationOption = new SelectOption('locationName', 'locationId', this._metadataService.locationList);
    // pass location type
    const locationTypeOption = new SelectOption('accountLocationTypeAlias', 'accountLocationTypeName', this._metadataService.locationType);

    const accountId = new HiddenInputField('accountId', 'accountId', undefined, false, ['required'], undefined, undefined, '123');
    const accountName = new TextInputField('Name', 'accountName', undefined, false, ['required'], undefined, undefined, account.accountName ? account.accountName : '');
    const accountAlias = new TextInputField('Alias', 'accountAlias', undefined, false, [], undefined, undefined, account.accountAlias ? account.accountAlias : '');
    const parentCompany = new SearchableSelectInputField('Parent Company', 'accountParentId', parentOption, undefined, false, undefined, [], undefined, undefined, account.accountParentId ? '1020180316150723' : '', undefined, true);
    const accountNationalManagerName = new TextInputField('Account Manager', 'accountNationalManagerID', undefined, undefined, undefined, undefined, undefined, account.accountNationalManagerName);
    // const accountNationalManagerName = new SearchableSelectInputField('Account Manager', 'accountNationalManagerID', accountManagerOption, undefined, false, false, ['required'], undefined, undefined, account.accountNationalManagerID ? account.accountNationalManagerID : '');
    const expectedDateOfBusinessCommencement = new DateInputField('Exp.Dt.Of Business Comm.', 'expectedDateOfBusinessCommencement', undefined, false, [], undefined, undefined, account.expectedDateOfBusinessCommencement ? account.expectedDateOfBusinessCommencement : '');
    const biddingDate = new DateInputField('Bidding Date', 'biddingDate', undefined, false, ['required'], undefined, undefined, account.biddingDate ? account.biddingDate : '');

    // pass entity
    const accountLegalEntityType = new SelectInputField('Entity Type', 'accountLegalEntityType', accountlegalOption, undefined, false, ['required'], undefined, undefined, account.accountLegalEntityType ? account.accountLegalEntityType : '');
    // pass Grade
    const accountGrade = new SelectInputField('Grade', 'accountGrade', accountGradeOption, undefined, false, ['required'], undefined, undefined, account.accountGrade ? account.accountGrade : '');
    // Geographic Scope
    const accountGeographicScope = new SearchableSelectInputField('Geographic Scope', 'accountGeographicScope', accountGeographicScopeOption, undefined, undefined, undefined, undefined, undefined, undefined, account.accountGeographicScope);
    // pass Group
    const accountCategoryName = new SelectInputField('Group', 'accountCategoryName', accountCategoryNameOption, undefined, false, ['required'], undefined, undefined, account.accountCategoryName ? account.accountCategoryName : '');
    // pass Industry
    const accountIndustryType = new SearchableSelectInputField('Industry', 'accountIndustryType', accountIndustryTypeoption, undefined, false, undefined, ['required'], undefined, undefined, account.accountIndustryType ? account.accountIndustryType : '', undefined, true);
    // pass Commodities
    const accountCommodityType = new SearchableSelectInputField('Commodities', 'accountCommodityType', accountCommodityTypeOption, undefined, false, undefined, ['required'], undefined, undefined, account.accountCommodityType ? account.accountCommodityType : '', undefined, true);
    // pass Annual Revenue
    const accountAnnualRevenue = new SelectInputField('Annual Revenue', 'accountAnnualRevenue', accountAnnualRevenueOption, undefined, false, ['required'], undefined, undefined, this.getRange(account.accountAnnualRevenueLowerRange, account.accountAnnualRevenueUpperRange));
    // pass Routes Operated
    const accountRoutesOperated = new SearchableSelectInputField('Routes Operated', 'routesOperated', accountRoutesOperatedOptions, undefined, true, false, ['required'], undefined, account.routesOperated ? account.routesOperated : '');
    // pass Addressable FTL
    const accountAddressableFTLValue = new SelectInputField('Addressable FTL', 'accountAddressableFTL', accountAddressableFTLValueOption,undefined,undefined,undefined,undefined,undefined, this.getRange(account.accountAddressableFTLLowerRange , account.accountAddressableFTLUpperRange));
    // pass status
    const accountTruckTypetValue = new SelectInputField('Truck Type', 'accountTruckType', accountTruckTypeValueOption, undefined, false, ['required'], undefined, undefined, account.accountTruckType ? account.accountTruckType : '');
    // pass Truck Type
    const accountExpectedMonthlyBusiness = new SelectInputField('Exp. Monthly Business', 'accountExpectedMonthlyBusiness', accountExpectedMonthlyBusinessOption, undefined, false, ['required'], undefined, undefined, this.getRange(account.accountExpectedMonthlyBusinessLowerRange, account.accountExpectedMonthlyBusinessUpperRange));

    const accountFTL = new SelectInputField('FTL Annual Spend', 'accountFTL', accountFTLOption, undefined, false, ['required'], undefined, undefined, this.getRange(account.accountFTLLowerRange, account.accountFTLUpperRange));

    // pass location
    const location = new SearchableSelectInputField('Location', 'accountLocationId', locationOption, undefined, false, undefined, ['required'], undefined, undefined, account.accountLocationId ? account.accountLocationId : '', undefined, true);
    // pass location type
    const locationType = new SelectInputField('Location Type', 'accountLocationTypeName', locationTypeOption, undefined, false, ['required'], undefined, undefined, account.accountLocationTypeName ? account.accountLocationTypeName : '');

    const accountLocationGSTIN = new TextInputField('GSTIN', 'accountLocationGSTIN', undefined, false, [], undefined, undefined, account.accountLocationGSTIN ? account.accountLocationGSTIN : '');
    const accountPostalAddress = new TextAreaInputField('Postal Address', 'accountPostalAddress', undefined, false, ['required'], undefined, undefined, account.accountPostalAddress ? account.accountPostalAddress : '');
    const otherAddressDetails = new TextInputField('Other Address Detail', 'otherAddressDetails', undefined, false, [], undefined, undefined, account.otherAddressDetails ? account.otherAddressDetails : '');
    const accountPinCode = new TextInputField('Pin Code', 'accountPinCode', undefined, false, [], undefined, undefined, account.accountPinCode ? account.accountPinCode : '');

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
      location,
      locationType,
      accountLocationGSTIN,
      accountPostalAddress,
      otherAddressDetails,
      accountPinCode,
    ];
  }

}
