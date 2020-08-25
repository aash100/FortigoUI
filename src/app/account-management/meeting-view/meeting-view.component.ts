import { Component, OnInit, Input, HostListener, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CustomerService } from '../services/customer.service';
import { LoginControlService } from 'src/app/app-landing/services/login-control.service';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { MeetingService } from '../services/meeting.service';

@Component({
  selector: 'app-meeting-view',
  templateUrl: './meeting-view.component.html',
  styleUrls: ['./meeting-view.component.css']
})
export class MeetingViewComponent implements OnInit, OnChanges, OnDestroy {

  _onDestroy = new Subject();
  loadedFromServer = new Subject();
  @Input() search = '';
  paginator: boolean;
  multiSortMeta: any;
  totalRow: number;
  loading: boolean;
  mode: string;
  calcTableHeight: any;
  isPaginating: boolean;
  details: any;
  fortigoContact = new Array();
  fortigoMeeting = new Array();
  // by default this will expand BackOffice (fix this to expand the very first row)
  expandedRows: {} = {};
  salesCustomer: Object;
  // store filter manager field
  mgr: any;
  constructor(
    public _customerService: CustomerService,
    private _loginService: LoginControlService,
    private _datePipe: DatePipe,
    private router: Router,
    private _meetingservice: MeetingService
  ) { }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.calcTableHeight = window.innerHeight - 200;
    this.calcTableHeight = this.calcTableHeight + 'px';
  }
  ngOnInit() {
    this._customerService.loadingMeeting = true;
    this.onResize();
    console.log('childs ', this._loginService.childUsers);
    console.log('user id ', this._loginService.userId);
    this.loadData();
    // this.searchDashboard();
    this._meetingservice.meetingReload.subscribe(
      () => {
        const end = this._datePipe.transform(new Date(), 'yyyy-MM-dd');
        const start = this._datePipe.transform(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd');
        this._customerService.meetingViewFrom = start;
        this._customerService.meetingViewTo = end;
        this.mode = 'server';
        this.loadDataFromServer(start, end);
      }
    );
    this._customerService.meetingReload.subscribe(
      (data) => {
        this.loading = true;
        this.mode = 'server';
        const end = this._datePipe.transform(new Date(), 'yyyy-MM-dd');
        const start = this._datePipe.transform(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd');
        this._customerService.meetingViewFrom = start;
        this._customerService.meetingViewTo = end;
        this.loadData();
      }
    );
    this._customerService.meetingFilter.subscribe(
      (data) => {
        this.mgr = data.manager;
        const from = data.fromDate;
        const to = data.toDate;
        this.mode = 'filter';
        this.applyFilter(this.mgr, from, to);
      }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changed meeting: ', changes);
    if (changes.search) {
      this.search = changes.search.currentValue;
      this.searchDashboard();
    }
  }

  private applyFilter(mgr, from, to) {
    if (mgr && !from && !to) {
      this.filterByManager(mgr);
    }
    if (from || to) {
      from = this._datePipe.transform(from, 'yyyy-MM-dd');
      to = this._datePipe.transform(to, 'yyyy-MM-dd');
      this._customerService.meetingViewFrom = from;
      this._customerService.meetingViewTo = to;

      this.mode = 'filter';
      this.loadDataFromServer(from, to);
      this.loadedFromServer.subscribe(
        () => {
          console.log(this.mgr);
          if (this.mgr && this.mgr.length !== 0) {
            this.filterByManager(this.mgr);
          }
          // setting loading to false
        }
      );

    }
    this.loading = false;
  }

  private loadData() {
    let meeting;
    if (this.mode === 'filter') {
      meeting = this._loginService.meetingListViewFilter;
    }
    if (this.mode === 'server') {
      meeting = this._loginService.meetingListView;
    }
    console.log(meeting);
    if (meeting && meeting.length !== 0) {
      this.details = meeting;
      this.createContact();
    } else {
      const end = this._datePipe.transform(new Date(), 'yyyy-MM-dd');
      const start = this._datePipe.transform(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd');
      this._customerService.meetingViewFrom = start;
      this._customerService.meetingViewTo = end;

      this.mode = 'server';
      this.loadDataFromServer(start, end);
    }
  }

  loadDataFromServer(from?, to?) {
    this._customerService.getMeetingView([this._loginService.userId, this._loginService.childUsers], from, to).subscribe(
      (data) => {
        this.details = data;
        if (this.mode !== 'filter') {
          this._loginService.meetingListView = data;
        }
        if (this.mode === 'filter') {
          this._loginService.meetingListViewFilter = data;
        }
        console.log(data);
        this.createContact();
        this.loadedFromServer.next();
        this._customerService.loadingMeeting = false;
      },
      () => {
        this._customerService.loadingMeeting = false;

      }
    );
  }

  private createContact() {
    let meeting;
    if (this.mode === 'filter') {
      meeting = this._loginService.meetingListViewFilter;
    }
    if (this.mode === 'server') {
      meeting = this._loginService.meetingListView;
    }
    if (meeting && meeting.length !== 0) {
      // clearing fortigoContact for any previous data
      this.sanitizeContact(meeting);
      if (this.mode === 'server') {
        this._customerService.fortigoContacts = this.fortigoContact;
      }
      this.fortigoContact.sort((a, b) => a.fortigo_contact.localeCompare(b.fortigo_contact));

      this.expandedRows = {};
      this.expandedRows[this.fortigoContact[0].fortigo_contact] = 1;
      console.log('expanded rows', this.expandedRows);
      this.loadMeeting({ 'fortigo_contact': this.fortigoContact[0].fortigo_contact });
      this._customerService.loadingMeeting = false;
    }
  }

  private filterByManager(mgr) {
    const meetingSetupByUserName = this._customerService.salesCustomerList.filter((e) => e.salesManagerId === mgr)[0].salesManagerName;
    this.fortigoContact = this._customerService.fortigoContacts.filter(
      (e) => {
        if (e.fortigo_contact.toLowerCase().trim().includes(meetingSetupByUserName.toLowerCase().trim())) {
          return true;
        }
        this.loading = false;
      },
      () => {
        this.loading = false;
      }
    );
  }

  // used to clean and create meeting dataset with contacts
  private sanitizeContact(meeting) {
    this.fortigoContact.length = 0;
    let retriveContact = '';
    let fortigoC: Array<Object>;
    meeting.forEach(
      (eachMeeting: any) => {
        const fc = eachMeeting.internalParticipants;
        if (fc === null || fc === undefined || fc.trim().length === 0) {
          retriveContact += eachMeeting.meetingSetupByUserName.trim() + ',';
        } else {
          retriveContact += fc.trim();
        }
      }
    );
    retriveContact = retriveContact.substring(0, retriveContact.length - 1);
    fortigoC = retriveContact.split(',');
    fortigoC = fortigoC.map((e: string) => e.trim());
    fortigoC = Array.from(new Set(fortigoC));
    fortigoC.forEach((eachContact, index) => {
      this.fortigoContact.push({
        'contact_id': index,
        'fortigo_contact': eachContact
      });
    });
  }

  private searchDashboard() {
    this.loading = true;
    if (this.search.trim() === '') {
      this.mode = 'server';
      this.details = this._loginService.meetingListView;
      this.createContact();
    }
    if (this.fortigoContact && this.search.trim() !== '') {
      this.fortigoContact = this._customerService.fortigoContacts.filter(e => e.fortigo_contact && e.fortigo_contact.toLowerCase().includes(this.search.trim().toLowerCase()));
      this.loading = false;
    }
    this.search = '';
    console.log('inside search: ', this.details);
  }

  private loadMeeting(value) {
    if (this.details) {
      this.fortigoMeeting = this.details.filter(e =>
        this.filterMeetingInternalParticipant(e, value)
      );
      this.fortigoMeeting.sort((a, b) => b.meetingStartTime - a.meetingStartTime);
      this.getNameByKey();

      this.fortigoMeeting = this.fortigoMeeting.slice();
      this.loading = false;
      console.log('loadMeeting value and meeting: ', this.fortigoMeeting);
    }
  }

  // Create split and checks internal contacts which is in csv format
  private filterMeetingInternalParticipant(eachMeeting, value) {
    const fc = eachMeeting.internalParticipants.trim();
    let eachMeetingFC = fc.split(',');
    eachMeetingFC = Array.from(new Set(eachMeetingFC));
    // used to remove empty string
    eachMeetingFC = eachMeetingFC.filter(e => e.trim().length !== 0);
    const existedValue = eachMeetingFC.filter(e => (e.trim().toLowerCase() === value.fortigo_contact.toLowerCase().trim()) || (eachMeeting.meetingSetupByUserName.toLowerCase().trim() === value.fortigo_contact.toLowerCase().trim()))
    if (existedValue.length) {
      return true;
    }
    return false;
  }

  expandRow(value) {
    console.log(value);
    this.loadMeeting(value);
  }

  openCompany(companyId, companyName) {
    this._customerService.selectedCompanyId = companyId;
    this._customerService.selectedCompanyName = companyName;
    this.router.navigate([
      '/customer/company/meetings', companyId
    ]);
  }

  getNameByKey() {
    this.fortigoMeeting.forEach(meeting => {
      meeting.meetingType = this._meetingservice.meetingType.filter(
        eachMeetingType => {
          if (eachMeetingType.meetingTypeName === meeting.meetingType || eachMeetingType.meetingTypeAlias === meeting.meetingType) {
            return true;
          }
        }
      )[0].meetingTypeAlias;
      this.setStatus(meeting);
    });
  }

  private setStatus(meeting) {
    switch (meeting['meetingStatus'].toLowerCase()) {
      case 'scheduled':
        meeting['companyStatusClass'] = 'active-text';
        break;
      case 'attended':
        meeting['companyStatusClass'] = 'dropped-text';
        break;
      case 'cancelled':
        meeting['companyStatusClass'] = 'suspended-text';
        break;
      case 'postponed':
        meeting['companyStatusClass'] = 'prospecting-text';
        break;
      case 'others':
        meeting['companyStatusClass'] = 'inactive-text';
        break;
      default:
        break;
    }
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
