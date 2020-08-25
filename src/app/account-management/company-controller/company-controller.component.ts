import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalOptions, NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DocUploadModalComponent } from '../doc-upload/doc-upload-modal/doc-upload-modal.component';
import { ContactsItemComponent } from '../contacts/contacts-item/contacts-item.component';
import { DocUploadService } from '../services/doc-upload.service';
import { CustomerService } from '../services/customer.service';
import { Document } from '../models/document.model';
import { CompanyControllerService } from '../services/company-controller.service';
import { MeetingItemComponent } from '../meeting/meeting-item/meeting-item.component';
import { ContactsListComponent } from '../contacts/contacts-list/contacts-list.component';
import { MeetingService } from '../services/meeting.service';
import { ContactService } from '../services/contact.service';
import { AccountDashboard } from '../models/account-dashboard-model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-company-controller',
  templateUrl: './company-controller.component.html',
  styleUrls: ['./company-controller.component.css'],
  providers: [ContactsListComponent]
})
export class CompanyControllerComponent implements OnInit {

  searchValue = '';
  displayChip = true;
  isBelowSearchMinLen = false;
  selectedCompanyId: any;
  selectedCompanyName: any;
  isFilterApplied: boolean;
  isClearApplied: boolean;
  isFilterCleared: boolean;
  // filter fields data
  filterFieldsData: any;
  // filter fields key
  filterFieldsKey = [];

  constructor(
    private router: Router,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private docService: DocUploadService,
    private customerService: CustomerService,
    private companyControllerService: CompanyControllerService,
    private meetingService: MeetingService,
    private contactService: ContactService,
    private location: Location
  ) { }
  // company_id: number;
  @Input() displayFilter: boolean;
  selectedTab = 'ACCOUNT OVERVIEW';
  navLinks: any[];
  customerDetail: AccountDashboard;

  ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  openSelectedModal() {
    if (this.selectedTab === 'DOCUMENTS') {
      this.router.navigateByUrl('/customer/company/documents/' + this.selectedCompanyId);
      this.docService.setDoc(new Document());
      const modalRef = this.modalService.open(DocUploadModalComponent, this.ngbModalOptions);
      modalRef.componentInstance.title = 'Upload Document';
      modalRef.componentInstance.mode = 'value';
    }
    if (this.selectedTab === 'CONTACTS') {
      this.router.navigateByUrl('/customer/company/contacts/' + this.selectedCompanyId);
      const modalRef = this.modalService.open(ContactsItemComponent, this.ngbModalOptions);
      modalRef.componentInstance.title = 'NEW CONTACT';
      modalRef.componentInstance.mode = 'create';
      modalRef.componentInstance.selectedCompanyId = this.selectedCompanyId;
    }
    if (this.selectedTab === 'MEETINGS') {
      this.router.navigateByUrl('/customer/company/meetings/' + this.selectedCompanyId);
      const modalRef = this.modalService.open(MeetingItemComponent, this.ngbModalOptions);
      modalRef.componentInstance.title = 'NEW MEETING';
      modalRef.componentInstance.mode = 'create';
      modalRef.componentInstance.selectedCompanyId = this.selectedCompanyId;
    }
    if (this.selectedTab === 'TARGETS') {
      this.router.navigateByUrl('/customer/target/' + this.selectedCompanyId);
    }
  }

  tabClicked(value: string) {
    if (value === this.selectedTab) {
      this.displayChip = true;
    } else {
      this.selectedTab = value;
      this.filterFieldsData = '';
      this.filterFieldsKey = [];
      this.isFilterApplied = false;
    }
  }
  filterClicked() {
    this.displayFilter = true;
  }

  onSearch(value: string) {
    value = value.trim();
    if (value.length < 3 && value.length !== 0) {
      this.isBelowSearchMinLen = true;
      return;
    } else {
      this.isBelowSearchMinLen = false;
    }

    if (this.selectedTab === 'DOCUMENTS') {
      this.router.navigateByUrl('/customer/company/documents/' + this.selectedCompanyId);
      this.companyControllerService.searchDocuments.next(value);
    }
    if (this.selectedTab === 'CONTACTS') {
      this.router.navigateByUrl('/customer/company/contacts/' + this.selectedCompanyId);
      this.companyControllerService.searchContacts.next(value);
    }
    if (this.selectedTab === 'MEETINGS') {
      this.router.navigateByUrl('/customer/company/meetings/' + this.selectedCompanyId);
      this.companyControllerService.searchMeetings.next(value);
      this.companyControllerService.searchDocuments.next(value);
    }
    if (this.selectedTab === 'TARGETS') {
      this.router.navigateByUrl('/customer/company/targets/' + this.selectedCompanyId);
      this.companyControllerService.searchTarget.next(value);
    }
  }

  refresh() {
    this.searchValue = '';
    this.isFilterApplied = false;
    if (this.selectedTab === 'DOCUMENTS') {
      this.router.navigateByUrl('/customer/company/documents/' + this.selectedCompanyId);
      this.companyControllerService.searchDocuments.next('');
    }
    if (this.selectedTab === 'CONTACTS') {
      this.router.navigateByUrl('/customer/company/contacts/' + this.selectedCompanyId);
      this.companyControllerService.searchContacts.next('');
    }
    if (this.selectedTab === 'MEETINGS') {
      this.router.navigateByUrl('/customer/company/meetings/' + this.selectedCompanyId);
      this.companyControllerService.searchMeetings.next('');
      // this.companyControllerService.searchDocuments.next('');
    }
    if (this.selectedTab === 'TARGETS') {
      this.router.navigateByUrl('/customer/company/targets/' + this.selectedCompanyId);
      this.companyControllerService.searchTarget.next('');
    }
    this.isBelowSearchMinLen = false;
  }
  ngOnInit() {
    this.meetingService.closeMeetingFilter.subscribe(
      () => {
        this.displayFilter = false;
      }
    );
    this.docService.closeDocFilter.subscribe(
      () => {
        this.displayFilter = false;
      }
    );
    this.contactService.closeContactFilter.subscribe(
      () => {
        this.displayFilter = false;
      }
    );
    // this.customerDetail = this.customerService.customerDetail;
    this.selectedCompanyId = this.customerService.selectedCompanyId;
    this.selectedCompanyName = this.customerService.selectedCompanyName;
    this.setSelectedTab();
    // this.selectedTab = 'ACCOUNT SUMMARY';

    this.navLinks = [
      {
        label: 'ACCOUNT SUMMARY',
        path: '/customer/company/accsummary/' + this.selectedCompanyId
      },
      {
        label: 'MEETINGS',
        path: '/customer/company/meetings/' + this.selectedCompanyId
      },
      {
        label: 'DOCUMENTS',
        path: '/customer/company/documents/' + this.selectedCompanyId
      },
      {
        label: 'CONTACTS',
        path: '/customer/company/contacts/' + this.selectedCompanyId
      },
      {
        label: 'TARGETS',
        path: '/customer/company/targets/' + this.selectedCompanyId
      }
    ];
    // listen to the data of meeting filter ( userd to populated mat chips)
    this.meetingService.meetingFilterApplied.subscribe(data => {
      this.filterFieldsData = data;
      this.filterFieldsKey = Object.keys(data.value);
    });
    this.contactService.contactFilterApplied.subscribe(
      (data) => {
        this.filterFieldsData = data;
        this.filterFieldsKey = Object.keys(data.value);
      }
    );
  }
  setSelectedTab() {
    const aciveUrl = this.router.url;
    if (aciveUrl.includes('company/accsummary')) {
      this.selectedTab = 'ACCOUNT SUMMARY';
    } else if (aciveUrl.includes('company/meetings')) {
      this.selectedTab = 'MEETINGS';
    } else if (aciveUrl.includes('company/documents')) {
      this.selectedTab = 'DOCUMENTS';
    } else if (aciveUrl.includes('company/contacts')) {
      this.selectedTab = 'CONTACTS';
    } else if (aciveUrl.includes('company/targets')) {
      this.selectedTab = 'TARGETS';
    }
  }
  back() {
    const aciveUrl = this.router.url;
    // checks if the tab is account summary then redirect it to home screen
    if (aciveUrl.includes('company/accsummary')) {
      this.selectedTab = 'ACCOUNT SUMMARY';
      this.router.navigate(['/']);
    } else {
      const back = this.location.back();
      console.log(back);
      setTimeout(() => {
        this.setSelectedTab();
      }, 200);
    }
  }
}
