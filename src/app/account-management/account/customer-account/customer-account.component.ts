import { DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, NgModule, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { FortigoButton } from 'src/app/shared/abstracts/button.model';
import { DateInputField, SearchableSelectInputField, SelectOption, TextInputField, SelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { AutoUnsubscribe } from 'src/app/shared/decorators/auto-unsubscribe.decorator';
import Swal from 'sweetalert2';
import { LoginControlService } from '../../../app-landing/services/login-control.service';
import { ContactsItemComponent } from '../../contacts/contacts-item/contacts-item.component';
import { DocUploadModalComponent } from '../../doc-upload/doc-upload-modal/doc-upload-modal.component';
import { MeetingItemComponent } from '../../meeting/meeting-item/meeting-item.component';
import { AccountDashboard } from '../../models/account-dashboard-model';
import { AccountFilterCriteria } from '../../models/account-filter-model';
import { Document } from '../../models/document.model';
import { HeaderCalculationRequest, HeaderCalculationResponse } from '../../models/header-calculation.model';
import { CustomerService } from '../../services/customer.service';
import { DocUploadService } from '../../services/doc-upload.service';
import { MetadataService } from '../../services/metadata.service';
import { MeetingService } from '../../services/meeting.service';
import { ContactService } from '../../services/contact.service';
import { Tab } from 'src/app/shared/models/tab.model';
import { Util } from 'src/app/core/abstracts/util';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
@Component({
  selector: 'app-customer-account',
  templateUrl: './customer-account.component.html',
  styleUrls: ['./customer-account.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe]
})
@NgModule({
  providers: [LoginControlService]
})
@AutoUnsubscribe()
export class CustomerAccountComponent implements OnInit, OnChanges {
  headButtonList;
  // search text to input search text in component
  searchText: any;
  // for sales view
  searchSalesIndividual = '';
  searchRM = '';
  searchRMWithHierarchy = '';
  // for meeting view
  searchMeeting = '';
  selectedTab = 0;
  customerSearchSubscription: Subscription;
  headerCalculationSubscription: Subscription;
  cycleTimeCalculationSubscription: Subscription;
  customerDetails: Array<AccountDashboard>; // for the list of accounts to display in dashboard
  customerDetail: AccountDashboard = null; // for a particular customer/account
  rmDetails: Array<AccountDashboard>; // for the list of rm's specific to a company
  enableFilter = false;
  closeResult: string;
  colToFilter: string;
  columnName: string;
  displayFilter: boolean;
  loading: boolean;
  loadingManager: boolean;
  loadingCustomer: boolean;
  loadingMeeting: boolean;

  calcTableHeight: any;
  ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  searchValue = '';
  isBelowSearchMinLen = false;
  totalRow: number;
  multiSortMeta;
  public isFilterApplied: boolean;
  filterApplied = new EventEmitter();
  removedFilter: string;
  isPaginating: boolean;
  filterFields;
  accountManager: any[];
  salesCustomerName: any[];
  contactPersonFilter: any;
  accMgrFilter: any;
  whenFilter: Date;
  rmMgrFilter: any;
  rManager: any;
  searchManager = '';
  salesCustomer: any;
  hierarchyMgrFilter: any[];
  to: Date;
  toFilter: Date;
  previousValue: any;
  previousValueData: AccountDashboard[];
  showData: any = 'asSM';
  tabList: Array<Tab>;
  public group: Array<any>;

  constructor(
    public customerService: CustomerService,
    private router: Router,
    private _toastrService: ToastrService,
    private modalService: NgbModal,
    private docService: DocUploadService,
    private _loginControlService: LoginControlService,
    private _datePipe: DatePipe,
    private _title: Title,
    private _activatedRoute: ActivatedRoute,
    private _metaDataService: MetadataService,
    private _meetingService: MeetingService,
    private _contactService: ContactService
  ) {
    this.multiSortMeta = [];
    this.multiSortMeta.push({ field: 'actualAnnualRevenue', order: -1 });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.calcTableHeight = window.innerHeight - 290;
    this.calcTableHeight = this.calcTableHeight + 'px';
  }

  ngOnInit() {

    let isManagerSMDataLoaded = false;
    let isManagerNAMDataLoaded = false;
    this.customerService.isManagerDataLoaded.subscribe((data) => {
      switch (data.event) {
        case 'smLoaded':
          isManagerSMDataLoaded = true;
          break;
        case 'namLoaded':
          isManagerNAMDataLoaded = true;
          break;
        default:
          break;
      }
      this.customerService.managerViewData = data.data;
      if (isManagerSMDataLoaded && isManagerNAMDataLoaded) {
        this.applyFilterOnManagerTab({ accountNationalManagerName: '', showData: 'asSM' });
      }
    });

    this._metaDataService.loadMetadata();
    this.headButtonList = [
      new FortigoButton('ACCOUNT'),
      new FortigoButton('MEETING'),
      new FortigoButton('CONTACT'),
      new FortigoButton('DOCUMENT'),
      new FortigoButton('TARGET')
    ];
    this.tabList = [
      { label: 'Manager View', hideBadge: true, hideToolTipText: true },
      { label: 'Customer View', hideBadge: true, hideToolTipText: true },
      { label: 'Meeting View', hideBadge: true, hideToolTipText: true }
    ];
    // this.configureFilter();
    this._title.setTitle(this._activatedRoute.snapshot.data['title']);
    this.onResize();
    // this.loading = true;
    this.displayFilter = false;
    this.loadData();

    this._meetingService.meetingReload.subscribe(() => { this.loadData(true); });
    this._contactService.contactReload.subscribe(() => { this.loadData(true); });

    this.customerService.refreshAccount.subscribe((action: string) => {
      if (action === 'delete') {
        Swal.fire('Account has been set to Inactive', '', 'success');
      }
      if (action === 'update') {
        this.updateData(this.customerService.updateAccountId);
        Swal.fire('Account updated successfully.', '', 'success');

      }
      if (action === 'add') {
        Swal.fire('Account added successfully.', '', 'success');
      }
      this.searchText = '';

      this.loadData(true);
    });

    this.customerService.accountFilter.subscribe(() => {
      this.customerDetails = this.customerService.accountFilteredData;
      this.validateData();
      this.isPaginating = false;
      this.loading = false;
    });
    this.customerService.customerReload.subscribe(() => {
      this.loadData();
      this.loading = false;
    });

    this.customerService.searchFilterToggler.subscribe((data: string) => {
      switch (data) {
        case 'filter':
          this.refreshSearch();
          break;
        default:
          break;
      }
    });
    // Used inside filter to group fields
    this.group = [{ id: 1, title: '' }];
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.searchValue) {
      this.searchValue = changes.searchValue.currentValue;
      this.loading = true;
      this.loadData();
    }
  }

  public onFilterClick(value) {
    console.log('filter is clicked ', value);

    if (this.filterFields) {
      this.filterFields.length = 0;
    }

    switch (this.selectedTab) {
      case 0:
        this.configureFilterManagerView();
        break;
      case 1:
        this.configureFilterCustomerView();
        break;
      case 2:
        this.configureFilterMeetingView();
        break;
      case 3:
        break;
      default:
        break;
    }

  }

  private configureFilterCustomerView() {
    this.accountManager = this.customerService.nationalManagerList;
    const contactPerson = new TextInputField('Contact Person', 'contactPerson', undefined, false, {}, -1, 0, this.contactPersonFilter, 1);
    const accountManagerOption = new SelectOption('accountNationalManagerName', 'accountNationalManagerStringID', this.accountManager);
    const accountManagerName = new SearchableSelectInputField('Account Manager', 'accountNationalManagerName', accountManagerOption, undefined, false, false, {}, -1, 0, this.accMgrFilter, undefined, undefined, 1);
    this.filterFields = [contactPerson, accountManagerName];
  }

  private configureFilterManagerView() {
    let showDataList = [];
    showDataList = [
      { key: 'As SM', value: 'asSM' },
      { key: 'As NAM', value: 'asNAM' },
      { key: 'As Both(SM & NAM)', value: 'asBoth' }
    ];
    this.accountManager = this.customerService.rmList;
    const accountManagerOption = new SelectOption('rmName', 'rmUserId', this.accountManager);
    const accountManagerName = new SearchableSelectInputField('Account Manager', 'accountNationalManagerName', accountManagerOption, undefined, false, false, {}, -1, 0, this.hierarchyMgrFilter, undefined, undefined, 1);
    const showDataOption = new SelectOption('key', 'value', showDataList);
    const showData = new SelectInputField('Show Data', 'showData', showDataOption, undefined, false, {}, -1, 0, this.showData, 1);

    this.filterFields = [accountManagerName, showData];
  }

  private configureFilterMeetingView() {
    this.whenFilter = this.customerService.meetingViewFrom ? this.customerService.meetingViewFrom : this.whenFilter;
    this.toFilter = this.customerService.meetingViewTo ? this.customerService.meetingViewTo : this.toFilter;

    this.salesCustomer = this.customerService.salesCustomerList;
    const salesCustomerOption = new SelectOption('salesManagerName', 'salesManagerId', this.salesCustomer);
    const salesCustomerName = new SearchableSelectInputField('Sales Person', 'accountNationalManagerName', salesCustomerOption, undefined, false, false, {}, -1, 0, this.salesCustomerName, undefined, undefined, 1);
    const from = new DateInputField('From Date', 'from', 6, false, {}, -1, 0, this.whenFilter, 1);
    const to = new DateInputField('To Date', 'to', 6, false, {}, -1, 0, this.toFilter, 1);

    this.filterFields = [salesCustomerName, from, to];
  }

  public onHeaderButtonClick(event) {
    switch (event) {
      case 'ACCOUNT': this.openAddModal();
        break;
      case 'MEETING': this.openAddMeetingModal();
        break;
      case 'CONTACT': this.openAddContactModal();
        break;
      case 'DOCUMENT': this.openAddDocumentModal();
        break;
      case 'TARGET': this.openTargetComponent();
        break;
      default: console.log('button clicked : ', event);
        break;
    }
  }
  private openTargetComponent() {
    this.router.navigateByUrl('/customer/target');
  }
  private updateData(accId: any) {
    this.customerService
      .getDetailsFromTemp(accId)
      .subscribe((data: AccountDashboard) => {
        const updateCustomerArray = this.customerDetails.filter(company => {
          return company.companyId === accId;
        });
        updateCustomerArray[0] = data;
        Swal.fire('Account updated successfully.', '', 'success');
      });
  }

  private async loadData(fetchFromDb?: boolean) {
    this.loading = false;
    // fetch data from db
    if (fetchFromDb) {
      this._loginControlService.checkIfUserIsReadOnly().subscribe((result) => {
        this._loginControlService.isReadOnlyUser = result;
        if (result) {
          this._loginControlService.loadCompanies(true).subscribe((data) => {
            this._loginControlService.companyList = data;
            this.customerDetails = <Array<AccountDashboard>>Util.getObjectCopy(this._loginControlService.companyList);
            this.validateData();
            this.isPaginating = true;
            if (!this.customerService.isTargetCalculated) {
              this.loadTargetData();
            }
            this.populateHeader();
            this._loginControlService.parseCompanyIdAndCompanyName(data);
            // this.checkLoadingStatus();
          });
        } else {
          this._loginControlService.getCompanyIds(this._loginControlService.userId).subscribe((data) => {
            const temp: JSON = data['results'];
            let companyIds = '';
            if (temp['nationalCompanyIds']) {
              companyIds += temp['nationalCompanyIds'];
            }
            if (temp['regionalCompanyIds']) {
              if (temp['nationalCompanyIds'] !== null) {
                companyIds += ',';
              }
              companyIds += temp['regionalCompanyIds'];
            }
            this._loginControlService.hierarchyCompanyIds = companyIds;
            // FIXME: Implement user hierarchy
            const companyListAndUserId = { 'companyIds': companyIds, 'userIds': this._loginControlService.userId.toString() };
            this._loginControlService.HierarchyCompanies = companyListAndUserId;
            this._loginControlService.loadCompanies(false, companyListAndUserId).subscribe((response) => {
              this._loginControlService.companyList = response;
              this._loginControlService.parseCompanyIdAndCompanyName(response);
              // this.checkLoadingStatus();
            });
          });
        }
        // this.checkLoadingStatus();
      });
    } else {
      this.customerDetails = <Array<AccountDashboard>>Util.getObjectCopy(this._loginControlService.companyList);
      this.validateData();
      this.isPaginating = true;

      if (!this.customerService.isTargetCalculated) {
        this.loadTargetData();
      }
    }

  }

  private listRMOnAccountClick(selectedCompany: any) {
    this.previousValue = selectedCompany;
    this.customerService.getRMsForCompany(selectedCompany).subscribe((response: Array<AccountDashboard>) => {
      this.rmDetails = response;
      this.customerService.loadingCustomer = false;
      this.previousValueData = this.rmDetails.slice();
    }, (error) => {
      this.customerService.loadingCustomer = false;

    });
  }
  private populateHeader() {
    const headerCalculationRequests: Array<HeaderCalculationRequest> = new Array<HeaderCalculationRequest>();
    headerCalculationRequests.push(new HeaderCalculationRequest('company_name', 'count'));
    headerCalculationRequests.push(new HeaderCalculationRequest('primary_contact_name', 'count'));
    headerCalculationRequests.push(new HeaderCalculationRequest('primary_contact_number', 'count'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_annual_expected_revenue', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_annual_expected_margin', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_annual_revenue', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_revenue_mtd', 'sum', 'targetRevenueMTD'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_margin_mtd', 'sum', 'targetMarginMTD'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_revenue_m2', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_margin_m2', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_revenue_m1', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_margin_m1', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_revenue_q2', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_margin_q2', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_revenue_q1', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_margin_q1', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_r2', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_m2', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_r1', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_m1', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_mtd', 'sum', 'actualMTD'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_rtd', 'sum', 'actualRTD'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_revenue_q2', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_revenue_q1', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('billed', 'sum', 'actualBilled'));
    headerCalculationRequests.push(new HeaderCalculationRequest('collection', 'sum', 'actualCollection'));
    headerCalculationRequests.push(new HeaderCalculationRequest('due', 'sum', 'actualDue'));
    headerCalculationRequests.push(new HeaderCalculationRequest('overdue', 'sum', 'actualOverdue'));
    headerCalculationRequests.push(new HeaderCalculationRequest('total_outstanding', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('post_meeting_remarks', 'count'));

    this.customerService.headerCalculatedValues = new Array<HeaderCalculationResponse>();
    this.headerCalculationSubscription =
      this.customerService.getGridHeaderValues(headerCalculationRequests).subscribe(
        (data: Array<HeaderCalculationResponse>) => {

          this.customerService.headerCalculatedValues = this.customerService.headerCalculatedValues.concat(data);
          // this.checkLoadingStatus();
        }
      );
    this.cycleTimeCalculationSubscription =
      this.customerService.getSummaryCycleTime().subscribe(
        (data) => {
          this.customerService.headerCalculatedValues.push(new HeaderCalculationResponse('cycle_time', 'weightedAverage', data['cycleTime']));
          // this.checkLoadingStatus();
        }
      );
  }
  private validateData() {
    this.customerDetails.forEach((customerDetail: AccountDashboard) => {
      customerDetail.byWhen = new Date(customerDetail.nextActionItemDate);
      // trim the blank spaces in company name hence it affects in sorting
      customerDetail.companyName = customerDetail.companyName.trim();
      customerDetail.companyStatus = customerDetail.companyStatus.trim();
      Object.keys(customerDetail).forEach((eachKey) => {
        if (typeof (customerDetail[eachKey]) === 'string') {
          customerDetail[eachKey] = customerDetail[eachKey].trim();
        }
      });
      switch (customerDetail.companyStatus.toLowerCase()) {
        case 'prospecting':
          customerDetail['companyStatusClass'] = 'prospecting-text';
          break;
        case 'dropped':
          customerDetail['companyStatusClass'] = 'dropped-text';
          break;
        case 'suspended':
          customerDetail['companyStatusClass'] = 'suspended-text';
          break;
        case 'active':
          customerDetail['companyStatusClass'] = 'active-text';
          break;
        case 'inactive':
          customerDetail['companyStatusClass'] = 'inactive-text';
          break;
        case 'others':
          customerDetail['companyStatusClass'] = 'others-text';
          break;
        default:
          break;
      }
    });
  }
  private loadTargetData() {
    this.customerService.isTargetCalculated = true;

    this.customerService
      .getTargetRevenueAndMargin()
      .subscribe((response: Array<any>) => {
        for (let index = 0; index < this.customerDetails.length; index++) {
          const element = this.customerDetails[index];
          response.forEach(target => {
            if (element.companyId === target.companyId) {
              const month = this._datePipe.transform(target.month_year, 'MM');
              if (month === '01') {
                element['currentMonthMargin'] = target.margin;
                element['currentMonthRevenue'] = target.revenue;
              }
              if (element['annualMargin'] === undefined) {
                element['annualMargin'] = target.margin;
                element['annualRevenue'] = target.revenue;
              } else {
                element['annualMargin'] += target.margin;
                element['annualRevenue'] += target.revenue;
              }
            }
          });

          if (!element['currentMonthMargin']) {
            element['currentMonthMargin'] = 0;
          }
          if (!element['currentMonthRevenue']) {
            element['currentMonthRevenue'] = 0;
          }
          if (!element['annualMargin']) {
            element['annualMargin'] = 0;
          }
          if (!element['annualRevenue']) {
            element['annualRevenue'] = 0;
          }
        }
      });
  }
  public onSearch(queryValue: string) {
    this.clearFilter();
    this.searchText = queryValue;
    queryValue = queryValue.trim();
    if (queryValue.length < 3) {
      this.isBelowSearchMinLen = true;
      // if selected tab is customer view
      if (queryValue.length === 0) {
        // if selected tab is RM view
        if (this.selectedTab === 0) {
          this.searchManager = '';
        } else if (this.selectedTab === 1) {
          // this.searchRM = '';
        } else
          // if selected tab is Sales view
          if (this.selectedTab === 2) {
            // this.searchSalesIndividual = '';
            this.searchMeeting = '';
          } else
            // if selected tab is meeting view
            if (this.selectedTab === 3) {
              // this.searchMeeting = '';
            }
        this.loading = true;
        this.loadData();
        this.isBelowSearchMinLen = false;
      }
      return;
    } else {
      this.customerService.loadingCustomer = true;
      this.isBelowSearchMinLen = false;
      this.customerService.isSearchApplied = true;
      this.customerService.searchFilterToggler.next('search');
      if (this._loginControlService.isReadOnlyUser) {
        // customer view search
        if (this.selectedTab === 0) {
          // for hierarchy rm view
          this.searchManager = queryValue;
        } else
          // rm view search
          if (this.selectedTab === 1) {
            // this.searchRM = queryValue;
            this.customerSearchSubscription = this.customerService
              .searchCustomer(queryValue)
              .subscribe((data: Array<AccountDashboard>) => {
                this.customerDetails = data;
                this.validateData();
                this.isPaginating = false;
                if (!this.customerService.isTargetCalculated) {
                  this.loadTargetData();
                }
                this.customerService.loadingCustomer = false;

              });
          } else
            // sales view search
            if (this.selectedTab === 2) {
              // this.searchSalesIndividual = queryValue;
              this.searchMeeting = queryValue;
            }
        // meeting view search
        if (this.selectedTab === 3) {
          // this.searchMeeting = queryValue;
        }
      } else {
        const companyListAndUserId = {
          companyIds: this._loginControlService.hierarchyCompanyIds,
          userIds: this._loginControlService.userId.toString(),
          search: queryValue
        };

        this.customerSearchSubscription = this.customerService
          .searchAccountWithHierarchy(companyListAndUserId)
          .subscribe((data: Array<AccountDashboard>) => {
            this.customerDetails = data;
            this.validateData();
            this.isPaginating = false;
            if (!this.customerService.isTargetCalculated) {
              this.loadTargetData();
            }
            this.customerService.loadingCustomer = false;

          });
      }
    }
  }
  public refreshSearch() {
    this.clearFilter();
    // this.isFilterApplied = false;
    this.searchText = '';
    this.searchValue = '';
    if (this.selectedTab === 0) {
      this.searchManager = '';
      this.customerService.managerReload.next();

    }
    if (this.selectedTab === 1) {
      // this.searchRM = '';
    } else
      if (this.selectedTab === 2) {
        this.searchMeeting = '';
        this.customerService.meetingReload.next();
        this.isFilterApplied = true;
      } else
        if (this.selectedTab === 3) {
          // this.searchMeeting = '';

        }
    this.isBelowSearchMinLen = false;

    this.loading = true;
    this.loadData();
    this.customerService.isSearchApplied = false;
    this.customerService.searchFilterToggler.next('search');
  }
  public openAddModal() {
    this.customerService.openAddModal.next();
  }
  openAddDocumentModal() {
    this.docService.setDoc(new Document());
    const modalRef = this.modalService.open(
      DocUploadModalComponent,
      this.ngbModalOptions
    );
    modalRef.componentInstance.title = 'Upload Document';
    modalRef.componentInstance.mode = 'direct';
  }
  openEditModal(customer: AccountDashboard) {
    this.customerDetail = customer;
    this.customerService.openEditModal.next(this.customerDetail);
  }
  viewCompanyClicked(customer: AccountDashboard) {
    this.customerService.customerDetail = customer;
    this.customerService.selectedCompanyId = customer.companyStringId + '';
    this.customerService.selectedCompanyName = customer.companyName;
    this.customerService.filterSelectedField = new Array<AccountFilterCriteria>();
    this.router.navigate([
      '/customer/company/accsummary',
      customer.companyStringId
    ]);
  }
  openAddMeetingModal() {
    const modalRef = this.modalService.open(
      MeetingItemComponent,
      this.ngbModalOptions
    );
    modalRef.componentInstance.title = 'NEW MEETING';
    modalRef.componentInstance.mode = 'create';
  }
  openAddContactModal() {
    this.docService.setDoc(new Document());
    const modalRef = this.modalService.open(
      ContactsItemComponent,
      this.ngbModalOptions
    );
    modalRef.componentInstance.title = 'NEW CONTACT';
    modalRef.componentInstance.mode = 'create';
  }

  viewDetail(event) {
    this.router.navigate(['/customer/company/accsummary']);
  }

  deleteCustomer(customer: AccountDashboard) {
    Swal.fire({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
      cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.value) {
        this.loading = true;
        this.customerService
          .deleteCustomer(customer.companyStringId)
          .subscribe(
            () => {
              const deleteCustomerArray = this.customerDetails.filter(company => {
                return company.companyStringId === customer.companyStringId;
              });
              deleteCustomerArray[0].companyStatus = 'Inactive';
              this.customerService.refreshAccount.next('delete');
            },
            (error) => {
              Swal.fire('Faied to delete account', '', 'error');

            },
            () => {
              this.loading = false;
            });
      }
    });
  }
  public backClicked() {
    this.displayFilter = false;
  }
  public getHeaderCalc(action: string, key: string) {
    if ((this.customerService.filterSelectedField && this.customerService.filterSelectedField.length > 0) || this.customerService.isSearchApplied) {
      if (this.customerDetails) {
        switch (action.trim()) {
          case 'count':
            const count = this.customerDetails
              .map(t => t[key])
              .reduce(function (acc, total): number {
                return (
                  acc + (total !== '' && total !== null && total !== undefined ? 1 : 0)
                );
              }, 0);
            return count;
          case 'sum':
            const sum = this.customerDetails
              .map(t => t[key])
              .reduce(function (acc, total): number {
                return acc + total;
              }, 0);
            return sum;
          case 'weightedAverage':
            const weightedTimeSum = this.customerDetails
              .map(t => t['weightedTime'])
              .reduce(function (acc, total): number {
                return acc + total;
              }, 0);
            const tripCompletedRevenueSum = this.customerDetails
              .map(t => t['tripCompletedRevenue'])
              .reduce(function (acc, total): number {
                return acc + total;
              }, 0);
            return isNaN(weightedTimeSum / tripCompletedRevenueSum) === true ? 0 : (weightedTimeSum / tripCompletedRevenueSum);
          default:
            break;
        }
        return 0;
      }
    } else {
      return this.getHeaderCalculation(action, key) !== undefined ? this.getHeaderCalculation(action, key).result : 0;
    }
  }
  public getHeaderCalculation(action: string, key: string) {
    return this.customerService.headerCalculatedValues.filter((headerCalculationResponse: HeaderCalculationResponse) => {
      return headerCalculationResponse.uiKey === key && headerCalculationResponse.method === action;
    })[0];
  }

  public onFilterApply(data) {
    console.log('filter applied: ', data);
    if (this.selectedTab === 0) {
      if (data !== undefined) {
        this.isFilterApplied = data;
        if (data) {
          this.loadingManager = true;
        }
      }
    } else if (this.selectedTab === 1) {
      this.customerService.loadingCustomer = false;
    }
    this.removedFilter = undefined;
  }
  tabChanged(value) {
    // on tab change clear the search bar
    this.searchValue = '';
    this.searchText = '';
    this.searchManager = '';
    this.searchMeeting = '';
    this.selectedTab = value;
    // on tab change clear the applied filter (eg: filter color, mat chip)
    this.isFilterApplied = false;
    this.customerService.filterSelectedField.length = 0;
    this.clearFilter();
    this.customerService.loadingCustomer = false;

    switch (this.selectedTab) {
      case 0:
        this.applyFilterOnManagerTab({ accountNationalManagerName: '', showData: 'asSM' });
        break;
      case 2:
        this.isFilterApplied = true;
        break;
      default:
        break;
    }
  }

  expandRow(value) {
    if (this.rmDetails) {
      this.rmDetails.length = 0;
    }
    // turn loader on whenever row expand icon is clicked
    this.customerService.loadingCustomer = true;
    // keep track of row expanded or not
    if (this.previousValue === value) {
      this.rmDetails = this.previousValueData.slice();
      this.customerService.loadingCustomer = false;
    } else {
      this.listRMOnAccountClick(value);

    }
  }
  // on filter submit (componenet based)
  onFilterSubmit(value) {
    this.refreshSearch();
    this.isFilterApplied = true;
    console.log('filter is submitted: ', value);
    this.applyFilter(value);
  }
  public applyFilter(formValue) {
    switch (this.selectedTab) {
      case 0:
        this.customerService.loadingManager = true;
        this.applyFilterOnManagerTab(formValue);
        break;
      case 1:
        this.customerService.loadingCustomer = true;
        this.applyFilterOnCustomerTab(formValue);
        break;
      case 2:
        this.customerService.loadingMeeting = true;
        this.applyFilterOnMeetingViewTab(formValue);
        break;
      default:
        break;
    }
  }
  applyFilterOnManagerTab(formValue) {
    // if (formValue && (formValue.accountNationalManagerName && formValue.accountNationalManagerName.length !== 0)) {
    //   this.isFilterApplied = true;
    //   this.filterApplied.emit(true);
    //   this._toastrService.success('Filter applied successfully');
    // } else {
    //   this.customerService.managerReload.next();
    //   this.isFilterApplied = false;
    // }
    // if (formValue.accountNationalManagerName) {
    //   this.isFilterApplied = true;
    //   this.hierarchyMgrFilter = formValue.accountNationalManagerName;
    //   this.customerService.managerFilter.next(formValue.accountNationalManagerName);
    // }
    if (formValue) {
      if (formValue.accountNationalManagerName) {
        this.hierarchyMgrFilter = formValue.accountNationalManagerName;
      }
      if (formValue.showData) {
        this.showData = formValue.showData;
      }
      this.isFilterApplied = true;
      this.showData = formValue.showData;
      this.customerService.managerFilter.next(formValue);
    }
  }
  applyFilterOnCustomerTab(formValue) {
    this.customerService.loadingCustomer = true;
    this.customerService.customerReload.next();
    this.filterApplied.emit(false);
    if (formValue && (formValue.contactPerson && formValue.contactPerson.length !== 0) || (formValue.accountNationalManagerName && formValue.accountNationalManagerName.length !== 0)) {
      this.filterApplied.emit(true);
      this._toastrService.success('Filter applied successfully');
      this.isFilterApplied = true;
    } else {
      this.customerService.customerReload.next();
      this.isFilterApplied = false;
    }
    if (formValue.contactPerson) {
      this.isFilterApplied = true;

      this.filterApplied.emit(true);

      this.customerService.filterSelectedField.push(new AccountFilterCriteria('contactPerson', formValue.contactPerson, 'Contact Person'));
    }
    if (formValue.contactPerson && !formValue.accountNationalManagerName) {
      let request: any;
      this.filterApplied.emit(true);
      if (this._loginControlService.isReadOnlyUser) {
        request = this.customerService.applyAccountFilter({ contactPerson: formValue.contactPerson });
        this.contactPersonFilter = formValue.contactPerson;

      } else {
        request = this.customerService.applyAccountFilterWithHierarchy(formValue.contactPerson);
        this.contactPersonFilter = formValue.contactPerson;

      }

      request.subscribe((res) => {
        this.customerService.accountFilteredData = res;
        this.customerService.accountFilter.next();
        this.customerService.loadingCustomer = false;

      },
        () => {
          this.customerService.loadingCustomer = false;

        });

    }
    if (formValue.accountNationalManagerName) {
      const accMgrName = this.accountManager.filter(
        e => e.accountNationalManagerStringID === formValue.accountNationalManagerName)[0].accountNationalManagerName;
      this.accMgrFilter = formValue.accountNationalManagerName;
      this.customerService.filterSelectedField.push(new AccountFilterCriteria('accountManager', accMgrName, 'Account Manager'));
      this._loginControlService.getCompanyIds(formValue.accountNationalManagerName).subscribe((data) => {
        const temp: JSON = data['results'];
        let companyIds = '';
        if (temp['nationalCompanyIds']) {
          companyIds += temp['nationalCompanyIds'];
        }

        // FIXME: Implement user hierarchy
        console.log('company ids:' + companyIds);
        this.contactPersonFilter = formValue.contactPerson;
        const companyListAndUserId = { 'companyIds': companyIds, 'userIds': formValue.accountNationalManagerName, 'search': formValue.contactPerson };

        this._loginControlService.loadCompanies(false, companyListAndUserId).subscribe((response) => {
          this.customerService.accountFilteredData = response;
          this.customerService.accountFilter.next();
          console.log('filtered company:' + response);
          this.customerService.loadingCustomer = false;
        },
          () => {
            this.customerService.loadingCustomer = false;

          });

      },
        () => {
          // this.customerService.loadingCustomer = false;

        });
    }
  }

  applyFilterOnRMVIewTab(formValue) {
    this.customerService.filterSelectedField.length = 0;
    this.filterApplied.emit(false);
    if (formValue && (formValue.rmUserId !== null && formValue.rmUserId !== undefined)) {
      this.filterApplied.emit(true);
      this._toastrService.success('Filter applied successfully');
    } else {
      this.customerService.rmViewReload.next();
    }

    if (formValue.rmUserId) {
      this.rmMgrFilter = formValue.rmUserId;
      this.customerService.rmViewFilter.next(formValue.rmUserId);

    }
  }
  applyFilterOnSalesViewTab(formValue) {
    this.customerService.filterSelectedField.length = 0;
    this.customerService.salesReload.next();
    this.filterApplied.emit(false);
    if (formValue && (formValue.accountNationalManagerName !== null && formValue.accountNationalManagerName !== undefined)) {
      this.filterApplied.emit(true);
      this._toastrService.success('Filter applied successfully');
    } else {
      this.customerService.salesReload.next();
    }

    if (formValue.accountNationalManagerName) {
      this.accMgrFilter = formValue.accountNationalManagerName;
      this.customerService.salesFilter.next(formValue.accountNationalManagerName);

    }
  }

  applyFilterOnMeetingViewTab(formValue) {
    this.customerService.loadingMeeting = true;
    const mgr = formValue.accountNationalManagerName;
    const from = formValue.from;
    const to = formValue.to;
    this.customerService.filterSelectedField.length = 0;
    if (formValue && (formValue.accountNationalManagerName !== null && formValue.accountNationalManagerName !== undefined)) {
      this._toastrService.success('Filter applied successfully');
    } else {
      this.customerService.meetingReload.next();
    }

    if (formValue) {
      this.salesCustomerName = formValue.accountNationalManagerName;
      this.customerService.meetingFilter.next({ manager: mgr, fromDate: from, toDate: to });
    }

  }
  public clearFilter() {
    this.accMgrFilter = undefined;
    this.contactPersonFilter = '';
    this.rmMgrFilter = undefined;
    this.hierarchyMgrFilter = undefined;
    this.whenFilter = undefined;
    this.toFilter = undefined;
    this.hierarchyMgrFilter = undefined;
    this.showData = undefined;


    // this.customerService.managerFilter.next({ accountNationalManagerName: '', showData: 'asSM' });
    // {accountNationalManagerName: "", showData: "asSM"}

    // this.showData = 'asSM';
    // this.showData = undefined;

    if (this.selectedTab !== 2) {
      this.isFilterApplied = false;
    } else {
      this.isFilterApplied = true;
    }

    this.salesCustomerName = undefined;
  }
}
