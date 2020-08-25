import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import Swal from 'sweetalert2';
import { DataRange } from '../models/data-range.model';
import { Account } from '../models/account.model';
import { DropdownData } from '../models/dropdown-data.model';
import { ContactService } from '../services/contact.service';

@Component({
  selector: 'app-account-summary',
  templateUrl: './account-summary.component.html',
  styleUrls: ['./account-summary.component.css']
})
export class AccountSummaryComponent implements OnInit, OnChanges {

  customerDetail: Account;
  companyId: string;
  loading = true;
  accountAnnualRevenueList: Array<DataRange> = new Array<DataRange>();
  accountAnnualLogisticSpentList: Array<DataRange> = new Array<DataRange>();
  accountLTLList: Array<DataRange> = new Array<DataRange>();
  accountFTLList: Array<DataRange> = new Array<DataRange>();
  accountParcelList: Array<DataRange> = new Array<DataRange>();
  accountAddressableFreightValueList: Array<DataRange> = new Array<DataRange>();
  accountStatusList: Array<DropdownData> = new Array<DropdownData>();
  accountGradeList: Array<DropdownData> = new Array<DropdownData>();
  accountGeographicScopeList: Array<DropdownData> = new Array<DropdownData>();
  locationTypeList: any[];
  locationList: any;
  accountAddressableFTLList = new Array<DataRange>();
  accountExpectedMonthlyBusinessList = new Array<DataRange>();
  accountTruckTypeList = new Array<DropdownData>();
  groupList: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private customerService: CustomerService,
    private contactService: ContactService) { }

  ngOnInit() {
    this.groupList = this.customerService.companyCategory;
    this.loading = this.customerService.accSummLoading;
    this.activatedRoute.paramMap.subscribe(
      (data) => {
        this.companyId = data.get('id').toString();
        this.loadAccountSummary();
      }
    );
    this.setRangeValues();
    this.setAccountGrade();
    this.setAccountStatus();
    this.setAccountGeographicScope();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes detected: ', changes);
  }

  openEditModal() {
    this.customerService.openEditModal.next(this.customerDetail);
  }

  public getlocationTypeList(value) {
    if (value === null) {
      this.customerDetail.accountLocationTypeName = 'Not Available';
    } else {
      this.locationTypeList = this.customerService.locationTypeList;
      if (this.locationTypeList) {
        this.customerDetail.accountLocationTypeName = this.locationTypeList.filter((data) => {
          return data.accountLocationTypeName === value;
        })[0].accountLocationTypeAlias;
      }
    }
  }

  public getlocationList(value) {
    if (value === null || value === 0) {
      this.customerDetail.accountLocationName = 'Not Available';
    } else {
      this.locationList = this.contactService.locationList;
      this.customerDetail.accountLocationName = this.locationList.filter((data) => {
        return data.locationId === value;
      })[0].locationName;
    }
  }

  public getRoutesOperated(value) {
    if (value === null || value === 0 || value.trim().length === 0) {
      this.customerDetail.routesOperated = 'Not Available';
    } else {
      this.locationList = this.contactService.locationList;
      if (this.locationList) {
        const routeSelectedLocation = this.locationList.filter(e => this.customerDetail.routesOperated.includes(e.locationId));
        this.customerDetail.routesOperated = routeSelectedLocation.map(e => e.locationName).toString();
      }
    }
  }

  private loadAccountSummary() {
    this.loading = true;
    if (localStorage.getItem('accountSummary') && (JSON.parse(localStorage.getItem('accountSummary'))).accountStringId && (JSON.parse(localStorage.getItem('accountSummary')).accountStringId.toString() === this.companyId)) {
      this.customerDetail = JSON.parse(localStorage.getItem('accountSummary'));
      this.loading = false;
    } else {
      this.customerService.getAccountDetails(this.companyId).subscribe(
        (data: Account) => {
          this.customerDetail = data;
          this.getlocationTypeList(data.accountLocationTypeName);
          this.getlocationList(data.accountLocationId);
          this.getRoutesOperated(data.routesOperated);
          this.getIndustryType(this.customerService.industryType, 'accountIndustryType', 'industryTypeName');
          this.getCommodityType(this.customerService.commodities, 'accountCommodityType', 'commodityTypeName');
          this.getRangeToList(this.accountAnnualRevenueList, 'accountAnnualRevenue', 'accountAnnualRevenueLowerRange', 'accountAnnualRevenueUpperRange');
          this.getRangeToList(this.accountAnnualLogisticSpentList, 'accountAnnualLogisticSpent', 'accountAnnualLogisticSpentLowerRange', 'accountAnnualLogisticSpentUpperRange');
          this.getRangeToList(this.accountLTLList, 'accountLTL', 'accountLTLLowerRange', 'accountLTLUpperRange');
          this.getRangeToList(this.accountFTLList, 'accountFTL', 'accountFTLLowerRange', 'accountFTLUpperRange');
          this.getRangeToList(this.accountParcelList, 'accountParcel', 'accountParcelLowerRange', 'accountParcelUpperRange');
          this.getRangeToList(this.accountAddressableFreightValueList, 'accountAddressableFreightValue', 'accountAddressableFreightValueLowerRange', 'accountAddressableFreightValueUpperRange');
          this.getDropDownToName(this.accountGradeList, 'accountGrade');
          this.getDropDownToName(this.accountGeographicScopeList, 'accountGeographicScope');
          this.getRangeToList(this.accountAddressableFreightValueList, 'accountAddressableFreightValue', 'accountAddressableFreightValueLowerRange', 'accountAddressableFreightValueUpperRange');
          this.getRangeToList(this.accountAddressableFTLList, 'accountAddressableFTL', 'accountAddressableFTLLowerRange', 'accountAddressableFTLUpperRange');
          this.getRangeToList(this.accountExpectedMonthlyBusinessList, 'accountExpectedMonthlyBusiness', 'accountExpectedMonthlyBusinessLowerRange', 'accountExpectedMonthlyBusinessUpperRange');
          this.getDropDownToName(this.accountTruckTypeList, 'accountTruckType');
          this.getGroup();
          localStorage.setItem('accountSummary', JSON.stringify(data));
        },
        (error) => {
          Swal.fire('Error', 'Failed to get company details.', 'error');
        },
        () => {
          this.loading = false;
          this.customerService.accSummLoading = false;
        }
      );
    }
  }

  private getGroup() {
    if (this.customerDetail.accountCategoryName && this.groupList) {
      this.customerDetail.accountCategoryName = this.groupList.filter(e => e.accountCategoryName.trim() === this.customerDetail.accountCategoryName.trim())[0].accountCategoryAlias;
    }
  }

  private getRangeToList(list: Array<any>, key: string, startRangeKey: string, endRangeKey: string) {
    const filteredList = list.filter((data) => {
      return (this.customerDetail[startRangeKey] === data.lowerRange && this.customerDetail[endRangeKey] === data.upperRange);
    });
    this.customerDetail[key] = filteredList[0].displayName;
  }

  private getDropDownToName(list: Array<any>, key: string) {
    const filteredList = list.filter((data) => {
      return (this.customerDetail[key] === data.key);
    });
    if (filteredList[0]) {
      this.customerDetail[key] = filteredList[0].displayName;
    }
  }

  private getCommodityType(list: Array<any>, keyCustomerDetail: string, keyCommodityType: string) {

    const filteredList = list.filter((data) => {
      if (this.customerDetail[keyCustomerDetail]) {
        console.log(this.customerDetail[keyCustomerDetail], data[keyCommodityType]);
        return (this.customerDetail[keyCustomerDetail] === data[keyCommodityType]);
      }
    }
    );
    if (filteredList[0]) {
      this.customerDetail[keyCustomerDetail] = filteredList[0].commodityTypeAlias;
    } else {
      this.customerDetail[keyCustomerDetail] = 'No commodity found';
    }
  }

  private getIndustryType(list: Array<any>, keyCustomerDetail: string, keyCommodityType: string) {
    const filteredList = list.filter((data) => {
      if (this.customerDetail[keyCustomerDetail]) {
        console.log(this.customerDetail[keyCustomerDetail], data[keyCommodityType]);
        return (this.customerDetail[keyCustomerDetail] === data[keyCommodityType]);
      }
    }
    );
    if (filteredList[0]) {
      this.customerDetail[keyCustomerDetail] = filteredList[0].industryTypeAlias;
    } else {
      this.customerDetail[keyCustomerDetail] = 'No industry found';
    }
  }

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

    this.accountAddressableFreightValueList.push(new DataRange('not_available', 'Not Available', 0, 0));
    this.accountAddressableFreightValueList.push(new DataRange('less_than_.1cr', 'Less than ₹0.1 CR', 0, 1000000));
    this.accountAddressableFreightValueList.push(new DataRange('.1_to_.5cr', '₹0.1 CR to ₹0.5 CR', 1000001, 5000000));
    this.accountAddressableFreightValueList.push(new DataRange('.6_to_1cr', '₹0.6 CR to ₹1 CR', 5000001, 10000000));
    this.accountAddressableFreightValueList.push(new DataRange('greater_than_1cr', 'Greater than ₹1 CR', 10000001, 99999999999));

    this.accountAddressableFTLList.push(new DataRange('not_available', 'Not Available', 0, 0));
    this.accountAddressableFTLList.push(new DataRange('less_than_.1cr', 'Less than ₹0.1 CR', 0, 1000000));
    this.accountAddressableFTLList.push(new DataRange('.1_to_.5cr', '₹0.1 CR to ₹0.5 CR', 1000001, 5000000));
    this.accountAddressableFTLList.push(new DataRange('.6_to_1cr', '₹0.6 CR to ₹1 CR', 5000001, 10000000));
    this.accountAddressableFTLList.push(new DataRange('greater_than_1cr', 'Greater than ₹1 CR', 10000001, 99999999999));

    this.accountExpectedMonthlyBusinessList.push(new DataRange('not_available', 'Not Available', 0, 0));
    this.accountExpectedMonthlyBusinessList.push(new DataRange('less_than_.1cr', 'Less than ₹0.1 CR', 0, 1000000));
    this.accountExpectedMonthlyBusinessList.push(new DataRange('.1_to_.5cr', '₹0.1 CR to ₹0.5 CR', 1000001, 5000000));
    this.accountExpectedMonthlyBusinessList.push(new DataRange('.6_to_1cr', '₹0.6 CR to ₹1 CR', 5000001, 10000000));
    this.accountExpectedMonthlyBusinessList.push(new DataRange('greater_than_1cr', 'Greater than ₹1 CR', 10000001, 99999999999));

    this.accountTruckTypeList.push(new DropdownData('open_tonnage', 'Open Tonnage'));
    this.accountTruckTypeList.push(new DropdownData('close_tonnage', 'Close Tonnage'));
    this.accountTruckTypeList.push(new DropdownData('not_available', 'Not Available'));
  }

  private setAccountGrade() {
    this.accountGradeList.push(new DropdownData('named_account', 'Named Account'));
    this.accountGradeList.push(new DropdownData('national_key_account', 'National Key Account'));
    this.accountGradeList.push(new DropdownData('key_account', 'Key Account'));
    this.accountGradeList.push(new DropdownData('others', 'Others'));
    this.accountGradeList.push(new DropdownData('not_available', 'Not Available'));
  }

  private setAccountStatus() {
    this.accountStatusList.push(new DropdownData('active', 'Active'));
    this.accountStatusList.push(new DropdownData('prospecting', 'Prospecting'));
    this.accountStatusList.push(new DropdownData('dropped', 'Dropped'));
    this.accountStatusList.push(new DropdownData('suspended', 'Suspended'));
    this.accountStatusList.push(new DropdownData('inactive', 'In-Active'));
    this.accountStatusList.push(new DropdownData('others', 'Others'));
  }

  private setAccountGeographicScope() {
    this.accountGeographicScopeList.push(new DropdownData('single_geography', 'Single Geography'));
    this.accountGeographicScopeList.push(new DropdownData('multiple_geography', 'Multiple Geography'));
    this.accountGeographicScopeList.push(new DropdownData('not_available', 'Not Available'));
  }

}
