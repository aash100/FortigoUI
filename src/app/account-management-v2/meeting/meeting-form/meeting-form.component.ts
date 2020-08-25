/*
 * Created on Tue Aug 13 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';

import Swal from 'sweetalert2';

import { LoginControlService } from 'src/app/app-landing/services/login-control.service';
import { AccountService } from '../../services/account/account.service';
import { MetadataService } from '../../services/metadata/metadata.service';
import { MeetingService } from '../../services/meeting/meeting.service';
import { SelectOption, TextInputField, SelectInputField, DateInputField, TextAreaInputField, HiddenInputField, MultiSelectSearchableInputField, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { MeetingDropDown } from '../../models/meeting-dropdown.model';
import { Tab } from 'src/app/shared/models/tab.model';
import { FortigoValidators } from 'src/app/shared/models/fortigo-validators.model';
import { Util } from 'src/app/core/abstracts/util';
// import { element } from '@angular/core/src/render3/instructions';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { AccountManagementConstant } from '../../constants/AccountManagementConstant';
import { AccountManagementURL } from '../../constants/AccountManagementURL';

@Component({
  selector: 'app-meeting-form',
  templateUrl: './meeting-form.component.html',
  styleUrls: ['./meeting-form.component.css'],
  providers: [DatePipe]
})
export class MeetingFormComponent implements OnInit {
  companyId: string;
  participantId: number;
  meetingLocationId: number;
  locationList: any[];
  companyList: any[];
  companyFormFields: any[];
  internalParticipantList: any;
  externalParticipamtList: any;
  selectedParticipants: any[];
  selectedCompany: any;
  selectedLocation: any;
  internalParticipantIds: any;
  externalParticipantIds: any;
  customerContactIds: any;
  public isLoading: boolean;
  public isCompanySelected: boolean;
  public isReadOnly: boolean;
  public selectedTab: number;
  meetingFormFields = Array<any>();
  public companies: Array<string>;
  public meetingTabList: Array<Tab>;
  public meeting: any;
  meetingType: any;
  public meetingStartTime: string;
  public meetingEndTime: string;
  public nextActionItemDate: Date;
  MILLI_SECOND_IN_A_DAY = 1000 * 60 * 60 * 24;
  public meetingStatus: Array<MeetingDropDown> = new Array<MeetingDropDown>();
  public participantMeetingMode: Array<MeetingDropDown> = new Array<MeetingDropDown>();
  public participantStatus: Array<MeetingDropDown> = new Array<MeetingDropDown>();
  private MEETINGS = 'MEETINGS';
  public _isCreateModeOff: boolean;
  public modalHeader;
  private NEW_MEETING = 'New Meeting';
  private EDIT_MEETING = 'Edit Meeting';
  private VIEW_MEETING = 'View Meeting';

  constructor(
    public _meetingService: MeetingService,
    private _router: Router,
    private _dialog: MatDialog,
    private _metadataService: MetadataService,
    private _accountService: AccountService,
    public _datepipe: DatePipe,
    private _loginControlV2Service: LoginControlV2Service,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedTab = 0;
    this.meetingStatus.push(new MeetingDropDown('scheduled', 'Scheduled'));
    this.meetingStatus.push(new MeetingDropDown('attended', 'Attended'));
    this.meetingStatus.push(new MeetingDropDown('cancelled', 'Cancelled'));
    this.meetingStatus.push(new MeetingDropDown('postponed', 'Postponed'));
    this.meetingStatus.push(new MeetingDropDown('others', 'Others'));

    this.participantMeetingMode.push(new MeetingDropDown('in_person', 'In Person'));
    this.participantMeetingMode.push(new MeetingDropDown('telephonic', 'Telephonic'));
    this.participantMeetingMode.push(new MeetingDropDown('video_conference', 'Video Conference'));

    this.participantStatus.push(new MeetingDropDown('meeting_yet_to_begin', 'Status not yet known'));
    this.participantStatus.push(new MeetingDropDown('attended', 'Attended'));
    this.participantStatus.push(new MeetingDropDown('absent', 'Absent'));

    this._metadataService.loadMetadata();
  }

  ngOnInit() {
    //  Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    this.isReadOnly = false;
    this.meetingType = this._metadataService.meetingType;
    this.companyList = this._metadataService.companyDropdownList;
    this.meetingTabList = [{ label: 'Meetings' }, { label: 'Participant' }]

    switch (this.data.mode) {
      case FortigoConstant.FORM_CREATE_MODE:
        this.modalHeader = this.NEW_MEETING;
        this._isCreateModeOff = false;
        if (this.data.defaultData) {
          this.companyId = this.data.defaultData.companyStringId;
          this.meeting = {};
          this.meeting['companyId'] = this.companyId;
          this.getParticipantList();
        }

        this.getMeetingTabFields();
        break;
      case FortigoConstant.FORM_VIEW_MODE:
        this.isReadOnly = true;
        this._isCreateModeOff = true;
        this.modalHeader = this.VIEW_MEETING;
        this._meetingService.viewMeeting(this.data.meetingId).subscribe((response) => {
          this.meeting = response;
          this.companyId = this.meeting.companyId;
          this.meeting.internalParticipantIds = [];
          this.meeting.externalParticipantIds = [];
          response.participantListJson.forEach(element => {
            if (element['participantType'] === 'customer_contact') {
              this.meeting.externalParticipantIds.push( element['participantId'])
            } else if (element['participantType'] === 'internal_user') {
              this.meeting.internalParticipantIds.push( element['participantId'])
            }
          });
          this.getParticipantList();
          this.getMeetingTabFields();

        });
        break;
      case FortigoConstant.FORM_EDIT_MODE:
        this._isCreateModeOff = true;
        this.modalHeader = this.EDIT_MEETING;
        this._meetingService.viewMeeting(this.data.meetingId).subscribe((response) => {
          this.meeting = response;
          this.companyId = this.meeting.companyId;
          this.meeting.companyId = this.companyId;
          this.meeting.internalParticipantIds = [];
          this.meeting.externalParticipantIds = [];
          response.participantListJson.forEach(element => {
            if (element['participantType'] === 'customer_contact') {
              this.meeting.externalParticipantIds.push(parseInt(element['participantId'].trim()));
            } else if (element['participantType'] === 'internal_user') {
              this.meeting.internalParticipantIds.push(parseInt(element['participantId'].trim()));

            }
          });
          this.getParticipantList();
          this.getMeetingTabFields();
        });
        this.isReadOnly = false;

        break;
      default:
        break;
    }
  }
  /**
   * sets the fields for Meeting
   */
  private getMeetingTabFields() {
    const meetingTitle = new TextInputField('Purpose', 'meetingTitle', undefined, false, [], 0);
    const meetingTypeDropDown = new SelectOption('meetingTypeAlias', 'meetingTypeName', this.meetingType);
    const meetingType = new SelectInputField('Type', 'meetingType', meetingTypeDropDown, undefined, false, new FortigoValidators(undefined, undefined, true), 0, this.meetingType[0].meetingTypeName);
    const meetingStartDate = new DateInputField('Please choose a Start Date', 'meetingStartTime', undefined, false, [], 0, 1, new Date());
    const meetingEndDate = new HiddenInputField('Please choose a End Date', 'meetingEndTime', undefined, false, [], 0, 1, new Date().toISOString());
    const meetingStatusDropdown = new SelectOption('alias', 'name', this.meetingStatus);
    const meetingStatus = new SelectInputField('Status', 'meetingStatus', meetingStatusDropdown, undefined, false, new FortigoValidators(undefined, undefined, true), 0, 1, this.meetingStatus[1].name);
    const meetingSetupRemarks = new TextAreaInputField('What Transpired', 'meetingSetupRemarks', undefined, false, undefined, 0);
    const postMeetingRemarks = new TextAreaInputField('Next Steps', 'postMeetingRemarks', undefined, false, undefined, 0);
    const newDate = new Date();
    const nextActionItemDate = new DateInputField('By When', 'nextActionItemDate', undefined, false, [], 0, 1, new Date(newDate.setDate(newDate.getDate() + 2)));
    // Add two days in the current date
    const nextActionStartDate = new DateInputField('Please choose a Start Date', 'nextActionStartDate', undefined, false, new FortigoValidators(undefined, undefined, true), 0, 1, new Date());
    // participant tab fields
    const selectedCompany = new SelectOption('companyName', 'companyStringId', this._metadataService.companyDropdownList);
    const companyId = new SearchableSelectInputField('Company Name', 'companyId', selectedCompany, undefined, undefined, (this.companyId) ? true : false, new FortigoValidators(undefined, undefined, true), 0, undefined, (this.meeting) ? this.meeting['companyId'].toString() : undefined);
    const internalMeetingParticipants = new SelectOption('participantName', 'participantId', this.internalParticipantList);
    const internalParticipantIds = new SearchableSelectInputField('Internal articipant', 'internalParticipantIds', internalMeetingParticipants, 6, true, undefined, new FortigoValidators(undefined, undefined, true), 1, 3);
    const externalMeetingParticipants = new SelectOption('participantName', 'participantId', this.externalParticipamtList);
    const externalParticipantIds = new SearchableSelectInputField('External Participant', 'externalParticipantIds', externalMeetingParticipants, 6, true, undefined, new FortigoValidators(undefined, undefined, true), 1, 3);
    const participantMeetingModeDropdown = new SelectOption('alias', 'name', this.participantMeetingMode);
    const participantMeetingMode = new SelectInputField('Participant Mode', 'participantMeetingMode', participantMeetingModeDropdown, undefined, false, new FortigoValidators(undefined, undefined, true), 1, 1, this.participantMeetingMode[0].name);
    const participantStatusTypeDropdown = new SelectOption('alias', 'name', this.participantStatus);
    const participantStatus = new SelectInputField('Participant Status', 'participantStatus', participantStatusTypeDropdown, undefined, false, new FortigoValidators(undefined, undefined, true), 1, 1, this.participantStatus[1].name);
    const participantRole = new TextAreaInputField('Participant Role', 'participantRole', 12, false, undefined, 1);
    const locationOption = new SelectOption('locationName', 'locationId', this._metadataService.locationList);
    const location = new SearchableSelectInputField('Location', 'meetingLocationId', locationOption, undefined, false, undefined, new FortigoValidators(undefined, undefined, true), 1, undefined, undefined, undefined, true);
    const formattedMeetingStartDate = this._datepipe.transform(meetingStartDate.defaultValue.toISOString(), 'yyyy-MM-dd');
    const formattedMeetingStartTime = '10:00';
    const formattedMeetingEndDate = this._datepipe.transform(meetingEndDate.defaultValue, 'yyyy-MM-dd');
    const formattedMeetingEndTime = '10:30';
    let meetingSetupByUserName;
    const meetingSetupByField = new HiddenInputField('Setup By', 'meetingSetupBy', undefined, undefined, undefined, undefined, undefined, (this.meeting) ? this.meeting.meetingSetupBy : this._loginControlV2Service.userId);
    if (!this._isCreateModeOff) {
      meetingSetupByUserName = new HiddenInputField('Setup By', 'meetingSetupByUserName', undefined, undefined, undefined, undefined, undefined, (this.meeting) ? this.meeting.meetingSetupByUserName : this._loginControlV2Service.username);

    } else {
      meetingSetupByUserName = new TextInputField('Setup By', 'meetingSetupByUserName', undefined, true, undefined, 0, undefined, (this.meeting) ? this.meeting.meetingSetupByUserName : undefined);

    }


    if (meetingStartDate && formattedMeetingStartDate && formattedMeetingStartTime) {
      this.meetingStartTime = formattedMeetingStartDate + ' ' + formattedMeetingStartTime;
    }
    if (meetingEndDate && formattedMeetingEndDate && formattedMeetingEndTime) {
      this.meetingEndTime = formattedMeetingEndDate + ' ' + formattedMeetingEndTime;
    }

    this.meetingFormFields = [
      companyId,
      meetingTitle,
      meetingType,
      this.meetingStartTime,
      this.meetingEndTime,
      meetingSetupByField,
      nextActionStartDate,
      meetingStatus,
      meetingSetupByUserName,
      meetingSetupRemarks,
      postMeetingRemarks,
      nextActionItemDate,
      internalParticipantIds,
      externalParticipantIds,
      location,
      participantMeetingMode,
      participantStatus,
      participantRole
    ];
  }

  /**
   *  This method closes the modal
   * @param  {} data
   */
  public modalClose(data: any) {
    this._dialog.closeAll();

  }
  public onSubmitMeetingForm(meeting: any) {
    switch (this.data.mode) {
      case FortigoConstant.FORM_CREATE_MODE:
        meeting.participantStatus = 'absent';
        const requestPayload = meeting;
        requestPayload['participantId'] = meeting.internalParticipantIds[0];
        requestPayload['externalParticipantIds'] = meeting.externalParticipantIds.toString();
        requestPayload['internalParticipantIds'] = meeting.internalParticipantIds.toString();
        requestPayload['meetingStartTime'] = this.meetingStartTime;
        requestPayload['meetingEndTime'] = this.meetingEndTime;
        delete requestPayload['undefined'];
        this._meetingService.createMeeting(requestPayload).subscribe(response => {
          if (response['response'] === 'success') {
            this.modalClose('success');
            Swal.fire('Success', 'Meeting created successfully', 'success');
            localStorage.setItem(AccountManagementConstant.AM_OPERATION_KEY, this.MEETINGS);
            this._router.navigate([AccountManagementURL.AM_LANDING_URL, requestPayload['companyId']]);
          }
        });
        break;
      case FortigoConstant.FORM_EDIT_MODE:
        const requestPayloadForUpdate = meeting;
          requestPayloadForUpdate['meetingId'] = this.meeting.meetingId;

        this._meetingService.updateMeeting(meeting).subscribe((response) => {
          if (response['response'] === 'success') {
            this.modalClose('success');
            this._meetingService.reloadMeetings.next();
            Swal.fire('Success', 'Meeting updated successfully', 'success');
          }
        });
        break;

    }

  }

  /**
   * Generated the internal and external participants;
   */
  private getParticipantList() {
    console.log('Meeting', this.meeting);
    this._meetingService.getParticipantList(this.companyId).subscribe((response) => {
      if (response) {
        this.internalParticipantList = response.filter(internalParticipant => internalParticipant['participantType'] === 'internal_user');
        this.externalParticipamtList = response.filter(externalParticipant => externalParticipant['participantType'] === 'customer_contact');
      }
      const meetingParticipants = new SelectOption('participantName', 'participantId', this.internalParticipantList);
      const participantIds = new SearchableSelectInputField('Internal Participant', 'internalParticipantIds', meetingParticipants, 6, true, undefined, new FortigoValidators(undefined, undefined, true), 1, 3, (this.meeting) ? this.meeting.internalParticipantIds : undefined);
      const externalMeetingParticipants = new SelectOption('participantName', 'participantId', this.externalParticipamtList);
      const externalParticipantIds = new SearchableSelectInputField('External Participant', 'externalParticipantIds', externalMeetingParticipants, 6, true, undefined, new FortigoValidators(undefined, undefined, true), 1, 3, (this.meeting) ? this.meeting.externalParticipantIds : undefined);
      this.setPartcipantFields(12, participantIds);
      this.setPartcipantFields(13, externalParticipantIds);
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
      Swal.fire('Error', 'Failed to load participant.', 'error');
    });
  }
  /**
   * on select change
   * @param  {any} selectedCompany
   */
  onSelectChanges(selectedCompany: any) {
    if (selectedCompany['name'] === 'companyId') {
      this.companyId = selectedCompany.value;
      this.internalParticipantList = null;
      this.isLoading = true;
      this.getParticipantList();

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
   * This will set the Forms based on the position and element
   * @param  {} position
   * @param  {} domElement
   */
  private setPartcipantFields(position, domElement) {

    this.meetingFormFields.splice(position, 1, domElement);
    const tempFields = Util.getObjectCopy(this.meetingFormFields);
    this.meetingFormFields = [];
    this.meetingFormFields = <Array<any>>tempFields;

  }

  private setParticipantIds() {
    this.selectedParticipants.forEach((selectedParticipant) => {
      switch (selectedParticipant.participantType) {
        case 'internal_user':
          if (this.internalParticipantIds === undefined) {
            this.internalParticipantIds = selectedParticipant.participantId;
          } else {
            this.internalParticipantIds += ',' + selectedParticipant.participantId;
          }
          break;
        case 'external_user':
          if (this.externalParticipantIds === undefined) {
            this.externalParticipantIds = selectedParticipant.participantId;
          } else {
            this.externalParticipantIds += ',' + selectedParticipant.participantId;
          }
          break;
        case 'customer_contact':
          if (this.customerContactIds === undefined) {
            this.customerContactIds = selectedParticipant.participantId;
          } else {
            this.customerContactIds += ',' + selectedParticipant.participantId;
          }
          break;
        default:
          break;
      }
    });
  }
}
