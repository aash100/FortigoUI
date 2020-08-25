import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { NgForm, FormControl } from '@angular/forms';
import { Subscription, ReplaySubject, Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomerService } from '../../services/customer.service';
import { Account } from '../../models/account.model';
import { ContactService } from '../../services/contact.service';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { LocationTypeName } from '../../models/location-type-name.model';
import { DataRange } from '../../models/data-range.model';
import { DropdownData } from '../../models/dropdown-data.model';
import { AccountDashboard } from '../../models/account-dashboard-model';
import { Contact } from '../../contacts/contact';
import { ContactStatus } from '../../models/contact-status.model';
import { ContactCategory } from '../../models/contact-category.model';
import { ContactOrientation } from '../../models/contact-orientation.model';
import { ContactRole } from '../../models/contact-role.model';
import { ContactLocationMapStatus } from '../../models/contact-locationmap-status.model';
import { AutoUnsubscribe } from 'src/app/shared/decorators/auto-unsubscribe.decorator';
import { takeUntil } from 'rxjs/operators';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';

@Component({

  selector: 'app-account-add-edit',
  templateUrl: './account-add-edit.component.html',
  styleUrls: ['./account-add-edit.component.css'],
  encapsulation: ViewEncapsulation.None
})
// @AutoUnsubscribe
export class AccountAddEditComponent implements OnInit, OnDestroy {
  _onDestroy = new Subject();
  @ViewChild('openM',{static: false}) openM;
  @ViewChild('status',{static: false}) status;
  @ViewChild('f',{static: false}) form: NgForm;
  // manager form control
  mgrSelectCtrl = new FormControl();
  mgrSelectFilterCtrl = new FormControl();
  mgrFilteredData = new ReplaySubject(1);
  // company form control
  cmpSelectCtrl = new FormControl();
  cmpSelectFilterCtrl = new FormControl();
  cmpFilteredData = new ReplaySubject(1);
  // routes operate form control
  routesSelectCtrl = new FormControl();
  routesSelectFilterCtrl = new FormControl();
  routesFilteredData = new ReplaySubject(1);
  account = new Account();
  now = new Date();
  contact: Contact = {
    contactId: undefined,
    userId: undefined,
    companyId: undefined,
    companyStringId: undefined,
    contactFirstName: undefined,
    contactMiddleName: undefined,
    contactLastName: undefined,
    contactMobileNumber: undefined,
    contactPhoneNumber: undefined,
    contactMobileAltNumber: undefined,
    contactPhoneAltNumber: undefined,
    contactEmail: undefined,
    contactDesignation: undefined,
    locationId: undefined,
    createdOn: null,
    contactPersonalEmail: undefined,
    contactAlias: undefined,
    contactStatus: 'active',
    contactCategory: '#',
    contactOrientation: '#',
    contactDepartment: undefined,
    contactRole: '#',
    contactRoleAdditionalDetails: undefined,
    contactLocationMapStatus: 'active',
    postalAddress: undefined,
    googleAddress: undefined,
    otherAddressDetails: undefined,
    pinCode: undefined,
    contactLocationRole: undefined
  };
  loading: boolean;

  editSubscription: Subscription;
  addSubscription: Subscription;
  displaySubscription: Subscription;

  closeResult: string;
  isReadOnly: boolean;
  editMode = false;
  customerTypes: any;
  legalTypes: any;
  companyCategory: any;
  industryType: any;
  commodities: any;
  title: string;
  customerForm: FormControl;
  selectedTabIndex: number;
  selectedLocation: any;
  routeSelectedLocation: any;
  selectedLocationType: any;
  selectedState: any = null;
  selectedCity: any = null;
  locationList: any[] = [];
  locationTypeList: any[] = [];
  stateList: any[] = [];
  accountLocationTypeNameList: Array<LocationTypeName> = new Array<LocationTypeName>();
  isLocationSelected = false;
  isLocationTypeSelected = false;
  parentCompanyId: any;
  parentCompanyList: Array<any>;
  nationalManagerList: Array<any>;
  selectedParentCompany: any;
  accountAnnualRevenueList: Array<DataRange> = new Array<DataRange>();
  accountAnnualLogisticSpentList: Array<DataRange> = new Array<DataRange>();
  accountLTLList: Array<DataRange> = new Array<DataRange>();
  accountFTLList: Array<DataRange> = new Array<DataRange>();
  accountParcelList: Array<DataRange> = new Array<DataRange>();
  accountAddressableFreightValueList: Array<DataRange> = new Array<DataRange>();
  accountAddressableFTLList: Array<DataRange> = new Array<DataRange>();
  accountExpectedMonthlyBusinessList: Array<DataRange> = new Array<DataRange>();

  accountStatusList: Array<DropdownData> = new Array<DropdownData>();
  accountGradeList: Array<DropdownData> = new Array<DropdownData>();
  accountGeographicScopeList: Array<DropdownData> = new Array<DropdownData>();
  accountTruckTypeList: Array<DropdownData> = new Array<DropdownData>();

  ContactStatus: Array<ContactStatus> = new Array<ContactStatus>();
  ContactCategory: Array<ContactCategory> = new Array<ContactCategory>();
  ContactOrientation: Array<ContactOrientation> = new Array<ContactOrientation>();
  ContactRole: Array<ContactRole> = new Array<ContactRole>();
  ContactLocationMapStatus: Array<ContactLocationMapStatus> = new Array<ContactLocationMapStatus>();

  LocationFilter = {
    displayKey: 'locationName',
    search: true,
    height: 'auto',
    limitTo: 10,
    placeholder: 'Please select a location name',
    noResultsFound: 'No Location found',
    searchPlaceholder: 'Search',
  };
  locationTypeFilter = {
    displayKey: 'accountLocationTypeAlias',
    search: true,
    height: 'auto',
    limitTo: 10,
    placeholder: 'Select a location type name',
    noResultsFound: 'No Location found',
    searchPlaceholder: 'Search'
  };

  constructor(
    private modalService: NgbModal,
    private customerService: CustomerService,
    private contactService: ContactService,
  ) { }

  ngOnInit() {
    this.clearForm();
    this.getCompaniesList();
    this.getLocationList();
    this.getlocationTypeList();
    this.getNationalManagerList();
    this.setRangeValues();
    this.setAccountGrade();
    this.setAccountStatus();
    this.setAccountGeographicScope();
    this.setAccountTruckType();
    this.addSubscription = this.customerService.openAddModal.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.clearForm();
      this.editMode = false;
      this.isReadOnly = false;
      this.title = 'NEW ACCOUNT';
      this.setDefautValues();
      this.loadModal();
      this.openModal(this.openM);
    });
    this.editSubscription = this.customerService.openEditModal.pipe(takeUntil(this._onDestroy)).subscribe(
      (response: AccountDashboard) => {
        this.editMode = true;
        this.clearForm();
        this.isLocationSelected = true;
        this.isLocationTypeSelected = true;
        this.isReadOnly = false;
        this.title = 'EDIT ACCOUNT';

        this.loadModal();

        this.loading = true;
        this.customerService
          .getAccountDetails(response.companyStringId)
          .subscribe((data: Account) => {
            this.loading = false;
            this.account = data;
            this.account.expectedDateOfBusinessCommencement =
              this.account.expectedDateOfBusinessCommencement ? new Date(this.account.expectedDateOfBusinessCommencement) : undefined;
            this.account.biddingDate = this.account.biddingDate ? new Date(this.account.biddingDate) : undefined;

            this.parentCompanyId = this.account.accountParentId;
            const companyId = this.account.accountParentId;
            const nationalManagerId = this.account.accountNationalManagerID;
            this.cmpSelectCtrl.patchValue(companyId.toString());
            this.mgrSelectCtrl.patchValue(nationalManagerId.toString());
            const locationId = this.account.accountLocationId;
            const locationTypeName = this.account.accountLocationTypeName;
            const selectedLocationObj = _.find(this.locationList,
              function (location) {
                return location.locationId === locationId;
              });
            const selectedLocationTypeObj = _.find(this.locationTypeList,
              function (location) {
                return location.accountLocationTypeName === locationTypeName;
              });
            if (this.account.routesOperated) {
              this.routesSelectCtrl.patchValue(this.account.routesOperated.split(',').map(Number));
            } else {
              this.routesSelectCtrl.patchValue('');
            }
            this.selectedLocation = '';
            if (selectedLocationObj === undefined) {
              this.selectedLocation = { 'locationId': null, 'locationName': 'None' };
            } else {
              this.selectedLocation = selectedLocationObj;
            }
            this.selectedLocationType = '';
            if (selectedLocationTypeObj === undefined) {
              this.selectedLocationType = { 'accountLocationTypeName': null, 'accountLocationTypeAlias': 'None' };
            } else {
              this.selectedLocationType = selectedLocationTypeObj;
            }
            this.getRangeToList(this.accountAnnualRevenueList, 'accountAnnualRevenue', 'accountAnnualRevenueLowerRange', 'accountAnnualRevenueUpperRange');
            this.getRangeToList(this.accountAnnualLogisticSpentList, 'accountAnnualLogisticSpent', 'accountAnnualLogisticSpentLowerRange', 'accountAnnualLogisticSpentUpperRange');
            this.getRangeToList(this.accountLTLList, 'accountLTL', 'accountLTLLowerRange', 'accountLTLUpperRange');
            this.getRangeToList(this.accountFTLList, 'accountFTL', 'accountFTLLowerRange', 'accountFTLUpperRange');
            this.getRangeToList(this.accountParcelList, 'accountParcel', 'accountParcelLowerRange', 'accountParcelUpperRange');
            this.getRangeToList(this.accountAddressableFreightValueList, 'accountAddressableFreightValue', 'accountAddressableFreightValueLowerRange', 'accountAddressableFreightValueUpperRange');
            this.getRangeToList(this.accountAddressableFTLList, 'accountAddressableFTL', 'accountAddressableFTLLowerRange', 'accountAddressableFTLUpperRange');
            this.getRangeToList(this.accountExpectedMonthlyBusinessList, 'accountExpectedMonthlyBusiness', 'accountExpectedMonthlyBusinessLowerRange', 'accountExpectedMonthlyBusinessUpperRange');
          }, (error) => {
            this.loading = false;
            this.closeModal();
            Swal.fire('Failed', 'Unable to load data', 'error');
          });
        this.openModal(this.openM);
      }
    );
    this.displaySubscription = this.customerService.openViewModal.subscribe(
      (customerData: Account) => {
        this.editMode = true;
        this.isReadOnly = true;
        this.title = 'View customer';
        this.account = customerData;
        this.openModal(this.openM);
      }
    );

    this.selectedTabIndex = 0;

    this.accountLocationTypeNameList.push(new LocationTypeName('head_office', 'Head Office'));

    this.ContactStatus.push(new ContactStatus('active', 'Active', true));
    this.ContactStatus.push(new ContactStatus('inactive', 'Inactive'));
    this.ContactStatus.push(new ContactStatus('other', 'Others'));

    this.ContactCategory.push(new ContactCategory('primary', 'Primary', true));
    this.ContactCategory.push(new ContactCategory('secondary', 'Secondary'));
    this.ContactCategory.push(new ContactCategory('escalation', 'Escalation'));
    this.ContactCategory.push(new ContactCategory('unknown', 'Unknown'));

    this.ContactOrientation.push(new ContactOrientation('positive', 'Positive'));
    this.ContactOrientation.push(new ContactOrientation('negative', 'Negative'));
    this.ContactOrientation.push(new ContactOrientation('neutral', 'Neutral', true));
    this.ContactOrientation.push(new ContactOrientation('unknown', 'Unknown'));

    this.ContactRole.push(new ContactRole('decision_maker', 'Decision Maker'));
    this.ContactRole.push(new ContactRole('decision_influencer', 'Decision Influencer'));
    this.ContactRole.push(new ContactRole('process_owner', 'Process Owner'));
    this.ContactRole.push(new ContactRole('end_user', 'End User', true));

    this.ContactLocationMapStatus.push(new ContactLocationMapStatus('active', 'Active', true));
    this.ContactLocationMapStatus.push(new ContactLocationMapStatus('inactive', 'Inactive'));

  }

  private configureManagerDropDown() {
    if (this.nationalManagerList) {
      this.mgrFilteredData.next(this.nationalManagerList.slice());
    }
    // set initial value in drop down
    this.mgrSelectFilterCtrl.valueChanges.subscribe(
      () => {
        this.filterTheData(this.nationalManagerList, 'salesManagerName', 'salesManagerId', this.mgrSelectFilterCtrl, this.mgrFilteredData);
      }
    );
  }
  private configureCompanyDropDown() {
    if (this.parentCompanyList) {
      this.cmpFilteredData.next(this.parentCompanyList.slice());
    }
    // set initial value in drop down
    this.cmpSelectFilterCtrl.valueChanges.subscribe(
      () => {
        this.filterTheData(this.parentCompanyList, 'companyName', 'companyStringId', this.cmpSelectFilterCtrl, this.cmpFilteredData);
      }
    );
  }
  private configureRoutesDropDown() {
    if (this.locationList) {
      this.routesFilteredData.next(this.locationList.slice());
    }
    // set initial value in drop down
    this.mgrSelectFilterCtrl.valueChanges.subscribe(
      () => {
        this.filterTheData(this.locationList, 'locationName', 'locationId', this.routesSelectFilterCtrl, this.routesFilteredData);
        // this.routeSelectedLocation = this.locationList.filter(e => this.account.routesOperated.includes(e.locationId));
      }
    );
  }
  private filterTheData(data, dataKey, dataValue, filterCtrl, filteredData) {
    if (!data) {
      return;
    }
    let search = filterCtrl.value;
    if (!search && search.trim().length !== 0) {
      filteredData.next(data.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    filteredData.next(
      data.filter(eachData => {
        if (typeof eachData[dataValue] === 'number') {
          eachData[dataValue] = eachData[dataValue].toString();
        }
        if (typeof eachData[dataKey] === 'number') {
          eachData[dataKey] = eachData[dataKey].toString();
        }
        return eachData[dataKey].toLowerCase().includes(search);
      })
    );
  }
  // ngOnDestroy(): void {
  // this.editSubscription.unsubscribe();
  // this.addSubscription.unsubscribe();
  // this.displaySubscription.unsubscribe();
  // this._onDestroy.next();
  // this._onDestroy.complete();
  // }

  private openModal(content) {
    this.modalService.open(content, { size: 'lg', backdrop: 'static' });
  }

  private closeModal() {
    this.modalService.dismissAll();
  }

  async onSubmit() {
    this.account.accountcustomerTypeName = 'end_customer';
    this.account.accountNationalManagerID = this.mgrSelectCtrl.value;
    this.account.routesOperated = this.routesSelectCtrl.value.toString();
    this.account.accountParentId = this.cmpSelectCtrl.value;
    if (this.validateForm()) {
      // this.close.nativeElement.click();
      this.account.accountAnnualLogisticSpent = this.accountAnnualLogisticSpentList[0].key;
      this.account.accountAddressableFreightValue = this.accountAddressableFreightValueList[0].key;
      this.account.accountLTL = this.accountLTLList[0].key;
      this.account.accountParcel = this.accountParcelList[0].key;

      // to do later ... remove the below line
      // this.account.routesOperated = '';
      this.closeModal();
      this.setListToRange(this.accountAnnualRevenueList, 'accountAnnualRevenue', 'accountAnnualRevenueLowerRange', 'accountAnnualRevenueUpperRange');
      this.setListToRange(this.accountAnnualLogisticSpentList, 'accountAnnualLogisticSpent', '0', '0');
      this.setListToRange(this.accountLTLList, 'accountLTL', '0', '0');
      this.setListToRange(this.accountFTLList, 'accountFTL', 'accountFTLLowerRange', 'accountFTLUpperRange');
      this.setListToRange(this.accountParcelList, 'accountParcel', '0', '0');
      this.setListToRange(this.accountAddressableFreightValueList, 'accountAddressableFreightValue', '0', '0');
      this.setListToRange(this.accountAddressableFTLList, 'accountAddressableFTL', 'accountAddressableFTLLowerRange', 'accountAddressableFTLUpperRange');
      this.setListToRange(this.accountExpectedMonthlyBusinessList, 'accountExpectedMonthlyBusiness', 'accountExpectedMonthlyBusinessLowerRange', 'accountExpectedMonthlyBusinessUpperRange');

      if (this.editMode === true) {
        this.customerService.updateCustomer(this.account).subscribe(
          () => {
            this.customerService.updateAccountId = this.account.accountStringId;
            this.customerService.refreshAccount.next('update');
          }
        );
      } else {
        this.account.userId = Number.parseInt(this.customerService.userId);
        this.customerService.createCustomer(this.account).subscribe(
          (response: Response) => {
            if (response['response'].toLowerCase() === FortigoConstant.SUCCESS_RESPONSE.toLowerCase()) {
              console.log('response for query : ', response);
              console.log('contact created for companyId : ', response['companyId']);
              this.contact.companyId = response['companyId'];
              this.contact.locationId = this.account.accountLocationId;
              this.contact.pinCode = this.account.accountPinCode;
              this.contact.userId = 0; // system user in case of no user exists for the given company
              this.contact.googleAddress = this.account.accountGoogleAddress;
              this.contact.postalAddress = this.account.accountPostalAddress;
              this.contact.otherAddressDetails = this.account.otherAddressDetails;
              // creating a contact at time of creating an account
              this.contactService.createContact(this.contact).subscribe((contactResponse) => {
                console.log('contact created for companyId : ', this.contact.companyId, 'contactResponse = ', contactResponse);
              });
              Swal.fire('Account created successfully.', '', 'success');
            }
          },
          ((error: Error) => {
            Swal.fire('Failed to create account', error.message, 'error');
          })
        );
      }
      this.customerService.refreshAccount.next();
    }


  }
  private validateForm() {
    if (!this.account.accountName || this.account.accountName === '') {
      Swal.fire('Please enter the company name');
      return false;
    } else if (!this.account.accountNationalManagerID) {
      Swal.fire('Please select a national manager');
      return false;
    } else if (!this.account.accountLegalEntityType || this.account.accountLegalEntityType === '') {
      Swal.fire('Please select an account legal entity type');
      return false;
    } else if (!this.account.accountGrade || this.account.accountGrade === '') {
      Swal.fire('Please select the account grade');
      return false;
    } else if (!this.account.accountGeographicScope || this.account.accountGeographicScope === '') {
      Swal.fire('Please select a geographic scope');
      return false;
    } else if (!this.account.accountCategoryName || this.account.accountCategoryName === '') {
      Swal.fire('Please select a group type');
      return false;
    } else if (!this.account.accountIndustryType || this.account.accountIndustryType === '') {
      Swal.fire('Please select an industry type');
      return false;
    } else if (!this.account.accountCommodityType || this.account.accountCommodityType === '') {
      Swal.fire('Please select a commodity type');
      return false;
    } else if (!this.account.accountAnnualRevenue || this.account.accountAnnualRevenue === '') {
      Swal.fire('Please select an annual revenue');
      return false;
    } else if (!this.account.routesOperated || this.account.routesOperated === '') {
      Swal.fire('Please select an routes operated');
      return false;
    } else if (!this.account.accountExpectedMonthlyBusiness || this.account.accountExpectedMonthlyBusiness === '') {
      Swal.fire('Please select an expected monthly business');
      return false;
    } else if (!this.account.accountTruckType || this.account.accountTruckType === '') {
      Swal.fire('Please select the account truck type');
      return false;
    } else if (!this.account.accountAddressableFTL || this.account.accountAddressableFTL === '') {
      Swal.fire('Please select the account addressable FTL');
      return false;
    } else if ((!this.account.expectedDateOfBusinessCommencement || this.account.expectedDateOfBusinessCommencement === null) && !this.editMode) {
      Swal.fire('Please select the expected date of business commencement');
      return false;
    } else if ((!this.account.biddingDate || this.account.biddingDate === null) && !this.editMode) {
      Swal.fire('Please select the bidding date');
      return false;
    } else if ((!this.contact.contactFirstName || this.contact.contactFirstName === '') && !this.editMode) {
      Swal.fire('Please enter the contact first name');
      return false;
    } else if (!this.account.accountLocationId) {
      Swal.fire('Please select the account location');
      return false;
    } else if (!this.account.accountLocationTypeName) {
      Swal.fire('Please select the account location type');
      return false;
    } else if (!this.account.accountPostalAddress || this.account.accountPostalAddress === '') {
      Swal.fire('Please enter the postal address');
      return false;
    } else {
      return true;
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

  }

  getCompaniesList() {
    this.parentCompanyList = new Array<any>();
    this.parentCompanyList.push({ 'companyStringId': '0', 'companyName': 'None' });

    this.contactService.getCompaniesList().subscribe((data) => {
      this.parentCompanyList = this.parentCompanyList.concat(data);

      if (this.editMode) {
        const companyId = this.account.accountParentId;
        const selectedCompanyObj = _.find(this.parentCompanyList, function (company) {
          return company.companyId === companyId;
        });
        this.selectedParentCompany = [];
        this.selectedParentCompany.push(selectedCompanyObj);
      }
      this.configureCompanyDropDown();
    });
  }

  private setAccountGrade() {
    this.accountGradeList.push(new DropdownData('named_account', 'Named Account'));
    this.accountGradeList.push(new DropdownData('national_key_account', 'National Key Account'));
    this.accountGradeList.push(new DropdownData('key_account', 'Key Account'));
    this.accountGradeList.push(new DropdownData('others', 'Others'));
    this.accountGradeList.push(new DropdownData('not_available', 'Not Available'));
  }

  private setAccountTruckType() {
    this.accountTruckTypeList.push(new DropdownData('open_tonnage', 'Open Tonnage', true));
    this.accountTruckTypeList.push(new DropdownData('close_tonnage', 'Close Tonnage'));
    this.accountTruckTypeList.push(new DropdownData('not_available', 'Not Available'));
  }
  private setAccountStatus() {
    this.accountStatusList.push(new DropdownData('active', 'Active'));
    this.accountStatusList.push(new DropdownData('prospecting', 'Prospecting', true));
    this.accountStatusList.push(new DropdownData('dropped', 'Dropped'));
    this.accountStatusList.push(new DropdownData('suspended', 'Suspended'));
    this.accountStatusList.push(new DropdownData('inactive', 'Inactive'));
    this.accountStatusList.push(new DropdownData('others', 'Others'));
  }

  private setListToRange(list: Array<any>, key: string, startRangeKey: string, endRangeKey: string) {
    const filteredList = list.filter((data) => {
      return (this.account[key] === data.key);
    });
    this.account[startRangeKey] = filteredList[0].lowerRange;
    this.account[endRangeKey] = filteredList[0].upperRange;
  }

  private getRangeToList(list: Array<any>, key: string, startRangeKey: string, endRangeKey: string) {
    const filteredList = list.filter((data) => {
      return (this.account[startRangeKey] === data.lowerRange && this.account[endRangeKey] === data.upperRange);
    });
    this.account[key] = filteredList[0].key;
  }

  private setAccountGeographicScope() {
    this.accountGeographicScopeList.push(new DropdownData('single_geography', 'Single Geography'));
    this.accountGeographicScopeList.push(new DropdownData('multiple_geography', 'Multiple Geography'));
    this.accountGeographicScopeList.push(new DropdownData('not_available', 'Not Available'));
  }

  public getNationalManagerList() {
    this.customerService.getSalesManagerList().subscribe(
      (response: any[]) => {
        this.nationalManagerList = response;
        this.configureManagerDropDown();
      },
      (error) => {
        Swal.fire('Error', error, 'error');
      });
  }

  public getlocationTypeList() {
    this.customerService.getLocationTypeList().subscribe(
      (response: any[]) => {
        this.locationTypeList = response;
      },
      (error) => {
        Swal.fire('Error', error, 'error');
      });
  }

  loadModal() {
    this.customerTypes = this.customerService.customerType;
    this.legalTypes = this.customerService.legalType;
    this.companyCategory = this.customerService.companyCategory;
    this.industryType = this.customerService.industryType;
    this.commodities = this.customerService.commodities;
    this.selectedTabIndex = 0;
  }

  public nextTab() {
    this.selectedTabIndex++;
  }

  public previousTab() {
    this.selectedTabIndex--;
  }

  public setSelectedIndex(selectedIndex: number) {
    this.selectedTabIndex = selectedIndex;
  }

  public getLocationList() {
    this.contactService.getLocationList().subscribe(data => {
      this.locationList = data;
      for (let i = 0; i < data.length; i++) {
        if (data[i].locationTypeId === 3) {
          this.stateList.push(data[i]);
        }
      }
      if (this.editMode) {
        const locationId = this.account.accountLocationId;
        const selectedLocationObj = _.find(this.locationList,
          function (location) {
            return location.locationId === locationId;
          });
        this.selectedLocation = selectedLocationObj;

        const cityId = this.account.accountLocationId;
        const selectedCityObj = _.find(this.locationList, function (city) {
          return city.locationId === cityId;
        });
        this.selectedCity = [];
        this.selectedCity.push(selectedCityObj);

        const stateId = this.account.accountLocationId;
        const selectedStateObj = _.find(this.locationList, function (state) {
          return state.locationId === stateId;
        });
        this.selectedState = [];
        this.selectedState.push(selectedStateObj);
      }
      this.configureRoutesDropDown();
    });
  }

  public selectLocation(locationDetails) {
    if (locationDetails) {
      this.isLocationSelected = true;
      this.account.accountLocationId = locationDetails.locationId;
    } else {
      this.isLocationSelected = false;
      this.selectedLocation = '';
    }
  }

  public selectLocationType(locationTypeDetails) {
    if (locationTypeDetails) {
      this.isLocationTypeSelected = true;
      this.account.accountLocationTypeName = locationTypeDetails.accountLocationTypeName;
    } else {
      this.isLocationTypeSelected = false;
      this.selectedLocationType = '';
    }
  }

  public clearForm() {
    this.account = new Account();
    this.contact = {
      contactId: undefined,
      userId: undefined,
      companyId: undefined,
      companyStringId: undefined,
      contactFirstName: undefined,
      contactMiddleName: undefined,
      contactLastName: undefined,
      contactMobileNumber: undefined,
      contactPhoneNumber: undefined,
      contactMobileAltNumber: undefined,
      contactPhoneAltNumber: undefined,
      contactEmail: undefined,
      contactDesignation: undefined,
      locationId: undefined,
      createdOn: null,
      contactPersonalEmail: undefined,
      contactAlias: undefined,
      contactStatus: 'active',
      contactCategory: '#',
      contactOrientation: '#',
      contactDepartment: undefined,
      contactRole: '#',
      contactRoleAdditionalDetails: undefined,
      contactLocationMapStatus: 'active',
      postalAddress: undefined,
      googleAddress: undefined,
      otherAddressDetails: undefined,
      pinCode: undefined,
      contactLocationRole: undefined
    };

    this.selectedLocation = '';
    this.selectedLocationType = '';
    this.selectedParentCompany = '';
    this.parentCompanyId = '';
    this.cmpSelectCtrl.patchValue('');
    this.mgrSelectCtrl.patchValue('');
    this.routesSelectCtrl.patchValue('');
  }

  private setDefautValues() {
    this.contact.contactLocationMapStatus = this.ContactLocationMapStatus.filter((eachStatus) => {
      if (eachStatus.isDefault) {
        return true;
      }
    })[0].name;
    this.contact.contactStatus = this.ContactStatus.filter((eachStatus) => {
      if (eachStatus.isDefault) {
        return true;
      }
    })[0].name;
    this.contact.contactOrientation = this.ContactOrientation.filter((eachStatus) => {
      if (eachStatus.isDefault) {
        return true;
      }
    })[0].name;
    this.contact.contactCategory = this.ContactCategory.filter((eachStatus) => {
      if (eachStatus.isDefault) {
        return true;
      }
    })[0].name;
    this.contact.contactRole = this.ContactRole.filter((eachStatus) => {
      if (eachStatus.isDefault) {
        return true;
      }
    })[0].name;
    this.account.accountStatus = this.accountStatusList.filter((eachStatus) => {
      if (eachStatus.isDefault) {
        return true;
      }
    })[0].key;
  }
  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

}
