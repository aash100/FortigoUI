import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Meeting } from '../meeting.model';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MatTabGroup } from '@angular/material';
import { MeetingService } from '../../services/meeting.service';
import { DatePipe } from '@angular/common';
import { MetadataService } from '../../services/metadata.service';
import { MeetingStatus } from '../../models/meeting-status.model';
import { ParticipantMeetingMode } from '../../models/participant-meeting-mode.model';
import { ParticipantStatus } from '../../models/participant-status.model';
import { CustomerService } from '../../services/customer.service';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { LoginControlService } from 'src/app/app-landing/services/login-control.service';
import Swal from 'sweetalert2';
import { Company } from '../../models/company.model';
import { Router } from '@angular/router';
import { TruncateTextPipe } from 'src/app/shared/pipes/truncate-text/truncate-text.pipe';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { ContactsItemComponent } from '../../contacts/contacts-item/contacts-item.component';
import { DocUploadService } from '../../services/doc-upload.service';
import { Document } from '../../models/document.model';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-meeting-item',
  templateUrl: './meeting-item.component.html',
  styleUrls: ['./meeting-item.component.css'],
  providers: [DatePipe, MetadataService]
})
export class MeetingItemComponent implements OnInit {
  @ViewChild('matTabGroup',{static:false}) matTabGroup: MatTabGroup;
  myControl = new FormControl();
  MILLI_SECOND_IN_A_DAY = 1000 * 60 * 60 * 24;
  mode = '';
  readOnlyMeeting = false;
  selectedCompanyId: any;
  data: any;
  title: any;
  MeetingType: any;
  meetingStatus: Array<MeetingStatus> = new Array<MeetingStatus>();
  participantMeetingMode: Array<ParticipantMeetingMode> = new Array<ParticipantMeetingMode>();
  participantStatus: Array<ParticipantStatus> = new Array<ParticipantStatus>();
  companyId: string;
  participantId: number;
  meetingLocationId: number;
  locationList: any[] = [];
  participantList: any[];
  internalParticipantList: any[];
  externalParticipantList: any[];

  companyList: any[];
  selectedParticipants: any[] = null;
  selectedInternalParticipants: any[] = null;
  selectedExternalParticipants: any[] = null;

  selectedCompany: any = null;
  selectedLocation: any = null;
  mET: string = null;
  mST: string = null;
  filteredOptions: Observable<string[]>;
  options: string[];
  public meetingStartDate: Date;
  public meetingStartTime: string;
  public meetingEndDate: Date;
  public meetingEndTime: string;
  public date = new Date();

  public defaultStartTime: string;
  public defaultEndTime: string;

  public isCompanySelected: boolean;
  public isParticipantSelected: boolean;
  public isLocationSelected: boolean;
  public isCompanySelectDisabled: boolean;

  public isLoading: boolean;

  ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  meeting: Meeting = {
    meetingId: undefined,
    meetingType: '#',
    meetingStartTime: undefined,
    meetingEndTime: undefined,
    meetingSetupBy: undefined,
    meetingSetupByName: undefined,
    meetingTitle: undefined,
    meetingSetupRemarks: undefined,
    postMeetingRemarks: undefined,
    nextActionItemDate: undefined,
    nextMeetingId: undefined,
    participantId: undefined,
    meetingStatus: '#',
    internalParticipantIds: undefined,
    externalParticipantIds: undefined,
    customerContactIds: undefined,
    participantList: undefined,
    participantListJson: undefined,
    participantMeetingMode: '#',
    participantRole: undefined,
    participantStatus: '#',
    companyId: undefined,
    meetingLocationId: undefined,
    internalParticipants: undefined,
    externalParticipants: undefined,
    customerContacts: undefined
  };
  editMeeting: Meeting;
  mstUTC: Date;
  metUTC: Date;
  mstIST: string;
  metIST: string;

  companyDropdownConfiguration = {
    displayKey: 'companyName',
    search: true,
    height: '200px',
    // limitTo: 10,
    placeholder: 'Please select a company.',
    noResultsFound: 'No Company found',
    searchPlaceholder: 'Please enter the company name',
    searchOnKey: 'companyName'
  };

  ParticipantFilterConfiguration = {
    displayKey: 'participantName',
    search: true,
    height: '200px',
    limitTo: 10,
    placeholder: 'Please select a participant',
    noResultsFound: 'No Participant found',
    searchPlaceholder: 'Please enter the participant name',
    searchOnKey: 'participantName'
  };

  LocationFilterConfiguration = {
    displayKey: 'locationName',
    search: true,
    height: '200px',
    limitTo: 10,
    placeholder: 'Please select a location',
    noResultsFound: 'No Location found',
    searchPlaceholder: 'Please enter the location name',
    searchOnKey: 'locationName'
  };

  public customTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: '#fff',
      buttonColor: '#E66006'
    },
    dial: {
      dialBackgroundColor: '#0A50A1',
    },
    clockFace: {
      clockFaceBackgroundColor: '#f2f2f6',
      clockHandColor: '#0A50A1',
      clockFaceTimeInactiveColor: '#6c6c6c'
    }
  };
  msTime: string;
  me: string;
  constructor(
    private modalService: NgbModal,
    private docService: DocUploadService,
    public activeModal: NgbActiveModal,
    private meetingservice: MeetingService,
    public datepipe: DatePipe,
    private router: Router,
    private _customerService: CustomerService,
    private _loginControlService: LoginControlService,
    private _contactService: ContactService,
    private _truncateTextPipe: TruncateTextPipe
  ) {
    this.meetingStatus.push(new MeetingStatus('scheduled', 'Scheduled'));
    this.meetingStatus.push(new MeetingStatus('attended', 'Attended'));
    this.meetingStatus.push(new MeetingStatus('cancelled', 'Cancelled'));
    this.meetingStatus.push(new MeetingStatus('postponed', 'Postponed'));
    this.meetingStatus.push(new MeetingStatus('others', 'Others'));

    this.participantMeetingMode.push(new ParticipantMeetingMode('in_person', 'In Person'));
    this.participantMeetingMode.push(new ParticipantMeetingMode('telephonic', 'Telephonic'));
    this.participantMeetingMode.push(new ParticipantMeetingMode('video_conference', 'Video Conference'));

    this.participantStatus.push(new ParticipantStatus('meeting_yet_to_begin', 'Status not yet known'));
    this.participantStatus.push(new ParticipantStatus('attended', 'Attended'));
    this.participantStatus.push(new ParticipantStatus('absent', 'Absent'));
  }

  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.MeetingType = this.meetingservice.meetingType;
    this.getCompaniesList();
    this.getLocationList();
    if (this.mode === 'create') {
      this.editMeeting = this.meeting;
      if (this.selectedCompanyId) {
        this.isCompanySelected = true;
        this.isCompanySelectDisabled = true;
      }
      this.setDefaultValues();
    } else if (this.mode === 'edit') {
      this.editMeetingDetails();
      this.isCompanySelected = true;
      this.isCompanySelectDisabled = true;
      this.isLocationSelected = true;
      this.isParticipantSelected = true;
    } else if (this.mode === 'view') {
      this.editMeetingDetails();
      this.isCompanySelected = true;
      this.isLocationSelected = true;
      this.isParticipantSelected = true;
      this.readOnlyMeeting = true;
    }
  }

  private setDefaultValues() {
    this.meetingStartDate = new Date();
    this.meetingEndDate = new Date();
    this.editMeeting.nextActionItemDate = new Date(this.meetingStartDate.getTime() + this.MILLI_SECOND_IN_A_DAY * 2);
    this.editMeeting.meetingType = this.MeetingType[0].meetingTypeName;
    this.editMeeting.meetingStatus = this.meetingStatus[1].name;
    this.editMeeting.participantMeetingMode = this.participantMeetingMode[0].name;
    this.editMeeting.participantStatus = this.participantStatus[1].name;
  }

  selectCompany(selectedCompany: Company) {
    if (selectedCompany) {
      this.companyId = selectedCompany.companyStringId;
      this.participantList = null;
      this.internalParticipantList = null;
      this.externalParticipantList = null;
      // when company changes we are just cleaning the selected external users
      this.selectedExternalParticipants = [];
      this.isLoading = true;
      this.meetingservice.getParticipantList(this.companyId).subscribe((data) => {
        this.participantList = data;
        this.seggregateParticipantList(this.participantList);
        this.isLoading = false;
      }, (error) => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to load participant.', 'error');
      });
    } else {
      this.selectedCompany = '';
    }

    if (this.selectedCompany) {
      this.isCompanySelected = true;
    } else {
      this.isCompanySelected = false;
    }
  }

  /**
   * Seggregate participant list
   * @param list 
   */
  private seggregateParticipantList(list: any) {
    this.internalParticipantList = list.filter(each => each['participantType'].trim() === 'internal_user');
    this.externalParticipantList = list.filter((eachParticipant) => (eachParticipant.participantType === 'external_user' || eachParticipant.participantType === 'customer_contact'))
  }

  editMeetingDetails() {
    this.editMeeting = this.meetingservice.getEditMeetingDetails();
    this.getUserName(this.editMeeting.meetingSetupBy);
    this.meetingStartDate = new Date(moment(this.editMeeting.meetingStartTime, 'YYYY,MM,DD,HH,mm').format('YYYY-MM-DD'));
    this.meetingEndDate = new Date(moment(this.editMeeting.meetingEndTime, 'YYYY,MM,DD,HH,mm').format('YYYY-MM-DD'));
    this.mstUTC = new Date(moment(this.editMeeting.meetingStartTime, 'YYYY,MM,DD,HH,mm').format('YYYY-MM-DD HH:mm'));
    this.metUTC = new Date(moment(this.editMeeting.meetingEndTime, 'YYYY,MM,DD,HH,mm').format('YYYY-MM-DD HH:mm'));
    this.mstIST = moment(this.mstUTC).local().format();
    this.metIST = moment(this.metUTC).local().format();
    this.meetingStartTime = this.formatMeetingEditTime(this.mstUTC);
    this.meetingEndTime = this.formatMeetingEditTime(this.metUTC);
  }

  getUserName(userId: number) {
    this.isLoading = true;
    this._customerService.getUserName(userId).subscribe((response) => {
      this.isLoading = false;
      this.editMeeting.meetingSetupByName = response;
    });
  }

  formatMeetingEditTime(datetime: Date) {
    let hours: number = datetime.getHours();
    hours = datetime.getHours() >= 12 ? hours - 12 : hours;
    let time = hours + ':' + datetime.getMinutes();
    time = (datetime.getHours() >= 12 ? time + ' pm' : time + ' am');
    return time;
  }

  addParticipant(participantData: any[]) {
    if (participantData && participantData.length > 0) {
      this.participantId = participantData[0].participantId;
      this.isParticipantSelected = true;
    } else {
      this.isParticipantSelected = false;
    }
    // if (type === 'internal') {
    //   this.selectedInternalParticipants = par
    // } else if (type === 'external') {

    // }
  }

  onSubmit() {

    const formattedMeetingStartDate = this.datepipe.transform(this.meetingStartDate, 'yyyy-MM-dd');
    // const formattedMeetingStartTime = this.formatTime(this.meetingStartTime);
    const formattedMeetingStartTime = '10:00';

    const formattedMeetingEndDate = this.datepipe.transform(this.meetingEndDate, 'yyyy-MM-dd');
    // const formattedMeetingEndTime = this.formatTime(this.meetingEndTime);
    const formattedMeetingEndTime = '10:30';

    if (this.editMeeting && formattedMeetingStartDate && formattedMeetingStartTime) {
      this.editMeeting.meetingStartTime = formattedMeetingStartDate + ' ' + formattedMeetingStartTime;
    }
    if (this.editMeeting && formattedMeetingEndDate && formattedMeetingEndTime) {
      this.editMeeting.meetingEndTime = formattedMeetingEndDate + ' ' + formattedMeetingEndTime;
    }

    if (this.validateMeetingForm()) {
      this.setParticipantIds();
      this.editMeeting.companyId = this.selectedCompany.companyStringId;
      this.editMeeting.participantId = this.selectedInternalParticipants[0].participantId;
      this.editMeeting.meetingLocationId = this.selectedLocation.locationId;
      // Pass value to second screen
      this._customerService.selectedCompanyId = this.selectedCompany.companyStringId;
      this._customerService.selectedCompanyName = this.selectedCompany.companyName;

      this.editMeeting.meetingSetupBy = Number.parseInt(this._loginControlService.userId);

      this.meetingData(
        this.editMeeting,
        this.editMeeting.companyId,
        this.mode
      );
      this.activeModal.dismiss('Submit');
      this._customerService.refreshAccount.next('');
      this.router.navigate(['/customer/company/meetings/' + this.editMeeting.companyId]);
    }
  }

  public meetingData(value: any, companyId: string, mode: string) {
    if (mode === 'create') {
      this.meetingservice.meetingLoading = true;
      this.meetingservice.createMeeting(value).subscribe(
        (data) => {
          if (data['response'].toLowerCase() === FortigoConstant.SUCCESS_RESPONSE.toLowerCase()) {
            Swal.fire('Meeting created successfully.', '', 'success');
          } else {
            Swal.fire('Failed to create meeting.', '', 'error');
          }
          this.meetingservice.meetingReload.next();
        },
        (error) => {
          Swal.fire('Failed to create meeting.', '', 'error');
          this.meetingservice.meetingLoading = false;
        }
      );
    } else if (mode === 'edit') {
      this.meetingservice.meetingLoading = true;
      this.meetingservice.updateMeeting(value).subscribe(
        (data) => {
          if(data['response'] == 'failure'){
            Swal.fire('Failed to update meeting', '', 'error');
          }else{
            Swal.fire('Meeting updated successfully.', '', 'success');
            this.meetingservice.meetingReload.next();
          }
        },
        (error) => {
          Swal.fire('Please check your internet connection or Login again', '', 'error');
          this.meetingservice.meetingLoading = false;
        });
    } else if (mode === 'delete') {
      this.meetingservice.meetingLoading = true;
      value.meetingStatus = 'cancelled';
      this.meetingservice.deleteMeeting(value, companyId).subscribe(
        (data) => {
          Swal.fire('Meeting deleted successfully.', '', 'success');
          this.meetingservice.meetingReload.next();
        },
        (error) => {
          Swal.fire('Please check your internet connection or Login again', '', 'error');
          this.meetingservice.meetingLoading = false;
        });
    } else {
      alert(' Selected mode is not a valid one');
    }
  }

  private setParticipantIds() {
    this.selectedInternalParticipants.forEach(
      (eachInternalParticipant) => {
        if (!this.editMeeting.internalParticipantIds) {
          this.editMeeting.internalParticipantIds = '';
        }
        this.editMeeting.internalParticipantIds +=  eachInternalParticipant.participantId + ',';

      }
    );
    this.editMeeting.internalParticipantIds=this.editMeeting.internalParticipantIds.slice(0, -1);

    this.selectedExternalParticipants.forEach(
      (eachExternalParticipant) => {
        if (!this.editMeeting.externalParticipantIds) {
          this.editMeeting.externalParticipantIds = '';
        }
        this.editMeeting.externalParticipantIds +=  eachExternalParticipant.participantId + ',';
      }
    );
    this.editMeeting.externalParticipantIds=this.editMeeting.externalParticipantIds.slice(0, -1);

    // this.selectedParticipants.forEach((selectedParticipant) => {
    //   switch (selectedParticipant.participantType) {
    //     case 'internal_user':
    //       if (this.editMeeting.internalParticipantIds === undefined) {
    //         this.editMeeting.internalParticipantIds = selectedParticipant.participantId;
    //       } else {
    //         this.editMeeting.internalParticipantIds += ',' + selectedParticipant.participantId;
    //       }
    //       break;
    //     case 'external_user':
    //       if (this.editMeeting.externalParticipantIds === undefined) {
    //         this.editMeeting.externalParticipantIds = selectedParticipant.participantId;
    //       } else {
    //         this.editMeeting.externalParticipantIds += ',' + selectedParticipant.participantId;
    //       }
    //       break;
    //     case 'customer_contact':
    //       if (this.editMeeting.customerContactIds === undefined) {
    //         this.editMeeting.customerContactIds = selectedParticipant.participantId;
    //       } else {
    //         this.editMeeting.customerContactIds += ',' + selectedParticipant.participantId;
    //       }
    //       break;
    //     default:
    //       break;
    //   }
    // });
  }


  formatTime(time: string) {
    if (time.length < 8) {
      const temp = time;
      time = '';
      if (temp.split(':')[0].length < 2) {
        time = '0' + temp.split(':')[0];
      }
      time += ':';
      if (temp.split(':')[1].length < 5) {
        time += '0' + temp.split(':')[1];
      }
    }

    if (time.includes('AM')) {
      time.replace('AM', 'am');
    }
    if (time.includes('PM')) {
      time.replace('PM', 'pm');
    }

    // tslint:disable-next-line:radix
    let tempTime: number = Number.parseInt(time.substring(0, 2));
    let tempTimeString: string;
    if (time.includes('pm')) {
      if (tempTime !== 12) {
        tempTime = tempTime + 12;
        tempTime %= 24;
      } else {
        tempTime = 0;
      }
    }

    tempTimeString = tempTime + '';
    if (tempTimeString.length === 1) {
      tempTimeString = '0' + tempTimeString;
    }
    time = tempTimeString + time.substring(2, time.length - 3);

    return time;
  }

  public setDefaultStartTime() {
    const now: Date = new Date();
    if (now.getMinutes() > 0 && now.getMinutes() < 30) {
      now.setMinutes(now.getMinutes() + (30 - now.getMinutes()));
    } else {
      now.setMinutes(now.getMinutes() + (60 - now.getMinutes()));
    }
    this.defaultStartTime = this.datepipe.transform(now, 'hh:mm a');
  }

  public setDefaultEndTime() {
    this.defaultEndTime = moment(this.meetingStartTime, 'hh:mm a').add(1, 'hour').format('hh:mm a');
    this.meetingEndTime = this.defaultEndTime;
  }

  public setMeetingEndDate() {
    this.meetingEndDate = this.meetingStartDate;
  }

  public selectLocation(locationDetails: any) {
    if (locationDetails) {
      this.meetingLocationId = locationDetails.locationId;
      this.isLocationSelected = true;
    } else {
      this.isLocationSelected = false;
    }
  }

  public getCompaniesList(): void {
    this.meetingservice.getCompanyList().subscribe(data => {
      this.companyList = data;
      if (this.editMeeting && this.mode === 'create' && this.selectedCompanyId) {
        // tslint:disable-next-line:radix
        const selectedCompanyId = this.selectedCompanyId;
        const selectCompanyObject = _.find(this.companyList, function (company) {
          return company.companyStringId === selectedCompanyId;
        });
        this.selectedCompany = [];
        this.selectedCompany.push(selectCompanyObject);
        this.participantList = null;
        this.meetingservice.getParticipantList(selectedCompanyId).subscribe(response => {
          this.participantList = response;
          this.seggregateParticipantList(this.participantList);
        });
      }

      if (this.editMeeting && (this.mode === 'edit' || this.mode === 'view')) {
        const companyId = this.editMeeting.companyId;
        const selectedCompanyObj = _.find(this.companyList, function (company) {
          return company.companyStringId === companyId;
        });
        this.selectedCompany = [];
        this.selectedCompany.push(selectedCompanyObj);
        this.participantList = null;
        this.meetingservice.getParticipantList(companyId).subscribe(response => {
          this.participantList = response; // get the all participant so that filter can be applied on the selected participants
          this.seggregateParticipantList(this.participantList)
          // this.editParticipantList(this.editMeeting.participantList);
          this.selectParticipants(this.editMeeting.participantListJson);
        });
      }
    });
  }

  // public editParticipantList(participantlist: any) {
  //   this.selectedParticipants = [];
  //   const editParticipantlist = participantlist.split(';');
  //   editParticipantlist.forEach((plist) => {
  //     plist = plist.replace('{', '');
  //     plist = plist.replace('}', '');
  //     plist = plist.trim();
  //     const eachParticipant = { 'participantId': plist.split(',')[0], 'participantName': plist.split(',')[1], 'participantType': plist.split(',')[2] };
  //     eachParticipant.participantId = Number.parseInt(eachParticipant.participantId);
  //     if (eachParticipant.participantId) {
  //       this.participantList.filter((participant) => {
  //         if (participant.participantId === eachParticipant.participantId) {
  //           this.selectedParticipants.push(participant);
  //         }
  //       });
  //     }
  //   });
  // }

/**
 * Used to get internal and external participants 
 * @param participantlist 
 */
  public selectParticipants(participantlist: any) {
    this.selectedInternalParticipants = [];
    this.selectedExternalParticipants = [];

    participantlist.forEach(element => {
      if(element.participantType === 'internal_user'){
        this.selectedInternalParticipants.push(element);
      }else{
        this.selectedExternalParticipants.push(element);
      }
    });

    // editParticipantlist.forEach((plist) => {
    //   plist = plist.replace('{', '');
    //   plist = plist.replace('}', '');
    //   plist = plist.trim();
    //   const eachParticipant = { 'participantId': plist.split(',')[0], 'participantName': plist.split(',')[1], 'participantType': plist.split(',')[2] };
    //   eachParticipant.participantId = Number.parseInt(eachParticipant.participantId);
    //   if (eachParticipant.participantId) {
    //     this.participantList.filter((participant) => {
    //       if (participant.participantId === eachParticipant.participantId) {
    //         this.selectedParticipants.push(participant);
    //       }
    //     });
    //   }
    // });
  }


  public getLocationList() {
    this.meetingservice.getLocationList().subscribe(data => {
      this.locationList = data;
      if (this.editMeeting && (this.mode === 'edit' || this.mode === 'view')) {
        const meetingLocationId = this.editMeeting.meetingLocationId;
        const selectedLocationObj = _.find(this.locationList, function (
          location
        ) {
          return location.locationId === meetingLocationId;
        });
        this.selectedLocation = [];
        this.selectedLocation.push(selectedLocationObj);
      }
    });
  }

  public nextTab() {
    this.matTabGroup.selectedIndex = 1;
  }

  public previousTab() {
    this.matTabGroup.selectedIndex = 0;
  }
  public validateMeetingForm(): boolean {
    if (!this.validateMeetingTab()) {
      return false;
    }
    if (!this.validateParticipantTab()) {
      return false;
    }
    return true;
  }

  public validateMeetingTab(): boolean {
    if (this.editMeeting.meetingTitle === undefined || this.editMeeting.meetingTitle === '') {
      Swal.fire('Please enter the meeting title.');
      return false;
    }
    return true;
  }

  public validateParticipantTab(): boolean {
    if (!this.isCompanySelected) {
      Swal.fire('Please select a company.');
      return false;
    } else if (!this.isParticipantSelected) {
      Swal.fire('Please select the meeting participants.');
      return false;
    } else if (!this.isLocationSelected) {
      Swal.fire('Please select a meeting location.');
      return false;
    }
    return true;
  }
  public openAddContactModal() {
    this.docService.setDoc(new Document());
    const modalRef = this.modalService.open(
      ContactsItemComponent,
      this.ngbModalOptions
    );
    this._contactService.meetingModalParticipantReload.subscribe((data) => {
      console.log('triggered from contact submit: ', this.selectedCompany.companyStringId);
      if (this.selectedCompany['companyStringId'] && this.selectedCompany['companyStringId'].trim().length !== 0) {
        console.log('calling company list');
        this.selectCompany(this.selectedCompany);
      }
    });
    modalRef.componentInstance.title = 'NEW CONTACT';
    modalRef.componentInstance.mode = 'create';
    modalRef.componentInstance.isCallback = true;
  }
}
