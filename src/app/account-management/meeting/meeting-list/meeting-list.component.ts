import { Component, OnInit } from '@angular/core';
import {
  NgbModal,
  NgbActiveModal,
  NgbModalOptions
} from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { Meeting } from '../meeting.model';
import { MeetingItemComponent } from '../meeting-item/meeting-item.component';
import { LocalDataSource } from 'ng2-smart-table';
import { ActivatedRoute } from '@angular/router';
import { MeetingService } from '../../services/meeting.service';
import { CompanyControllerService } from '../../services/company-controller.service';
import Swal from 'sweetalert2';
import { TruncateTextPipe } from 'src/app/shared/pipes/truncate-text/truncate-text.pipe';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';

@Component({
  selector: 'app-meeting-list',
  templateUrl: './meeting-list.component.html',
  styleUrls: ['./meeting-list.component.css']
})
export class MeetingListComponent implements OnInit {
  searchText = '';
  meetingList: Meeting[];
  meetingData: Meeting;
  tempDate: string;
  source: LocalDataSource;
  navigationSubscription;
  companyId: string;
  startRangeMS: number;
  endRangeMS: number;
  meetingMS: number;
  fromDateRange: Date;
  toDateRange: Date;

  settings = {
    mode: 'external',
    hideSubHeader: 'true',
    pager: {
      display: true,
      perPage: 13
    },
    actions: {
      add: false,
      edit: false,
      delete: false,
      position: 'right',
      custom: [
        {
          title:
            '<i class="fa fa-tv mr-1" style="margin-right:30px" title="view"></i>',
          name: 'view'
        },
        {
          title:
            '<i class="fa fa-edit mr-1" style="margin-right:30px" title="edit"></i>',
          name: 'edit'
        },
        {
          title: '<i class="fa fa-trash mr-1" title="delete"></i>',
          name: 'delete'
        }
      ]
    },
    columns: {
      meetingStartTime: {
        title: 'When',
        valuePrepareFunction: value =>
          new DatePipe('en-US').transform(value, 'yyyy-MM-dd')
      },
      locationName: {
        title: 'Place Met'
      },
      meetingTitle: {
        title: 'Purpose'
      },
      meetingStatus: {
        title: 'Status'
      },
      internalParticipants: {
        title: '4tigo Contacts',
        type: 'html'
      },
      externalParticipants: {
        title: 'Customer Contacts'
      },
      meetingSetupRemarks: {
        title: 'What Transpired'
      },
      postMeetingRemarks: {
        title: 'Next Steps'
      },
      nextActionItemDate: {
        title: 'By When',
        valuePrepareFunction: value =>
          new DatePipe('en-US').transform(value, 'yyyy-MM-dd')
      },
      meetingType: {
        title: 'Meeting Type'
      }
    }
  };

  ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };

  constructor(
    public meetingservice: MeetingService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private route: ActivatedRoute,
    private companyControllerService: CompanyControllerService,
    private _truncateTextPipe: TruncateTextPipe
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.companyId = params['id'];
    });
    this.getMeetingList(this.companyId);
    this.companyControllerService.searchMeetings.subscribe(data => {
      this.onSearch(data);
    });
    this.meetingservice.meetingFilterApplied.subscribe(data => {
      this.source = new LocalDataSource(this.getFilteredMeetings(data.value));
    });
    this.meetingservice.meetingReload.subscribe(response => {
      this.getMeetingList(this.companyId);
    });
  }

  getMeetingList(companyId: string): void {
    this.meetingservice.meetingLoading = true;
    this.meetingservice.getMeetingList(companyId).subscribe(data => {
      this.meetingList = data;
      if (this.meetingList) {
        this.meetingList.forEach((eachMeeting) => {
          eachMeeting.meetingTitle = this._truncateTextPipe.transform(eachMeeting.meetingTitle, '20');
          eachMeeting.meetingSetupRemarks = this._truncateTextPipe.transform(eachMeeting.meetingSetupRemarks, '20');
          eachMeeting.postMeetingRemarks = this._truncateTextPipe.transform(eachMeeting.postMeetingRemarks, '20');
          eachMeeting.internalParticipants = this._truncateTextPipe.transform(this.removeLastComma(eachMeeting.internalParticipants), '20');
          eachMeeting.customerContacts = this._truncateTextPipe.transform(this.removeLastComma(eachMeeting.customerContacts), '20');
        });
        this.getNameByKey();

      }
      this.source = new LocalDataSource(data);
      this.meetingservice.meetingLoading = false;
    },
      (error) => {
        this.meetingservice.meetingLoading = false;
        Swal.fire('Please check your internet connection or Login again', '', 'error');
      });
  }

  removeLastComma(data: string): string {
    return data.trim().replace(/.$/, '');
  }

  getNameByKey() {
    this.meetingList.forEach(meeting => {
      meeting.meetingType = this.meetingservice.meetingType.filter(
        eachMeetingType => {
          if (eachMeetingType.meetingTypeName === meeting.meetingType) {
            return true;
          }
        }
      )[0].meetingTypeAlias;
    });
  }

  openFormModal(value: any) {
    const modalRef = this.modalService.open(
      MeetingItemComponent,
      this.ngbModalOptions
    );
    modalRef.componentInstance.title = 'NEW MEETING';
    modalRef.componentInstance.mode = value;
  }

  onCustom(meetingdata: Meeting, meetingaction: string) {
    if (meetingaction === 'view') {
      this.editMeetingDetails(meetingdata, meetingaction);
    } else if (meetingaction === 'edit') {
      this.editMeetingDetails(meetingdata, meetingaction);

    } else if (meetingaction === 'delete') {

      Swal.fire({
        title: 'Are you sure?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
        cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
        confirmButtonText: 'Yes, delete it!'
      }).then(result => {
        if (result.value) {
          this.meetingDataFunc(
            meetingdata,
            meetingdata.companyId,
            meetingaction
          );
        }
      });
    } else {
      alert(' Please enter a valid option');
    }

  }

  public meetingDataFunc(value: Meeting, companyId: string, mode: string) {
    if (mode === 'create') {
      this.meetingservice.createMeeting(value).subscribe(data => {
        this.meetingservice.meetingReload.next();
      });
    } else if (mode === 'edit') {
      this.meetingservice.meetingLoading = true;
      this.meetingservice.updateMeeting(value).subscribe(data => {
        this.meetingservice.meetingReload.next();
      });
    } else if (mode === 'delete') {
      this.meetingservice.meetingLoading = true;
      value.meetingStatus = 'cancelled';
      value.companyId = this.companyId; // assigning the companyId to soft delete the meeting from DB for this company
      this.meetingservice.deleteMeeting(value.companyId, value.meetingId).subscribe(data => {
        this.meetingservice.meetingReload.next();
      },
        () => {
          Swal.fire('Please check your internet connection or Login again', '', 'error');
          this.meetingservice.meetingLoading = false;
        });
    } else {
      alert(' Selected mode is not a valid one');
    }
  }

  editMeetingDetails(selectedMeeting: Meeting, meetingaction: string) {
    if (selectedMeeting) {
      this.meetingservice.meetingLoading = true;
      this.meetingservice
        .editMeeting(selectedMeeting.meetingId)
        .subscribe(data => {
          this.meetingData = data;
          this.meetingData.companyId = this.companyId; // assigning the companyId to avoid the JS unexpected behaviour
          this.meetingData.meetingId = selectedMeeting.meetingId;
          if (this.meetingData.meetingStartTime) {
            this.tempDate = this.meetingData.meetingStartTime.toString();
            this.meetingData.meetingStartTime = this.tempDate;
          }
          if (this.meetingData.meetingEndTime) {
            this.tempDate = this.meetingData.meetingEndTime.toString();
            this.meetingData.meetingEndTime = this.tempDate;
          }
          if (this.meetingData.nextActionItemDate) {
            this.meetingData.nextActionItemDate = new Date(this.meetingData.nextActionItemDate);
          }
          this.meetingservice.setEditMeetingDetails(this.meetingData);
          this.meetingservice.meetingLoading = false;
          const modalRef = this.modalService.open(
            MeetingItemComponent,
            this.ngbModalOptions
          );
          if (meetingaction === 'edit') {
            modalRef.componentInstance.title = 'EDIT MEETING';
            modalRef.componentInstance.mode = 'edit';
          } else if (meetingaction === 'view') {
            modalRef.componentInstance.title = 'MEETING DETAILS';
            modalRef.componentInstance.mode = 'view';
          }
        },
          () => {
            // console.log('failed');
            Swal.fire('Please check your internet connection or Login again', '', 'error');
            this.meetingservice.meetingLoading = false;

          },
          () => {
            this.meetingservice.meetingLoading = false;
          }
        );
    }
  }

  public compareDatesInRange(
    fromDate: Date,
    toDate: Date,
    meetingDate: string
  ): boolean {
    let include = false;

    this.startRangeMS = fromDate ? fromDate.getTime() : undefined;
    this.endRangeMS = toDate ? toDate.getTime() + 86400000 : undefined; // added extra 86400000(no. of milliseconds in a day) to get all the meetings of the end date..
    this.meetingMS = moment(meetingDate)
      .toDate()
      .getTime();

    if (
      fromDate &&
      toDate &&
      this.startRangeMS <= this.meetingMS &&
      this.meetingMS <= this.endRangeMS
    ) {
      include = true;
    } else if (fromDate && !toDate && this.startRangeMS <= this.meetingMS) {
      include = true;
    } else if (!fromDate && toDate && this.meetingMS <= this.endRangeMS) {
      include = true;
    }
    return include;
  }

  public getFilteredMeetings(filteredColumn: any): any[] {
    console.log('filteredcolumn  data : ', filteredColumn);
    const output = [];
    for (let i = 0; i < this.meetingList.length; i++) {
      if (
        filteredColumn['meetingStartDate'] ||
        filteredColumn['meetingEndDate']
      ) {
        if (
          this.compareDatesInRange(
            filteredColumn['meetingStartDate'],
            filteredColumn['meetingEndDate'],
            this.meetingList[i].meetingStartTime
          )
        ) {
          output.push(this.meetingList[i]);
        }
      }
    }
    return output;
  }

  onSearch(query: string = '') {
    if (query.trim().length === 0) {
      this.source = new LocalDataSource(this.meetingList);
    } else {
      this.source.setFilter(
        [
          {
            field: 'locationName',
            search: query
          },
          {
            field: 'meetingSetupRemarks',
            search: query
          },
          {
            field: 'meetingTitle',
            search: query
          },
          {
            field: 'meetingStatus',
            search: query
          },
          {
            field: 'meetingSetupBy',
            search: query
          },
          {
            field: 'meetingStartTime',
            search: query
          },
          {
            field: 'meetingEndTime',
            search: query
          },
          {
            field: 'meetingType',
            search: query
          },
          {
            field: 'postMeetingRemarks',
            search: query
          }
        ],
        false
      );
    }
  }
}
