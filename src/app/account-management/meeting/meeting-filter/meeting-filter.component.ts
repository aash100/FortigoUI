import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MeetingService } from '../../services/meeting.service';



@Component({
  selector: 'app-meeting-filter',
  templateUrl: './meeting-filter.component.html',
  styleUrls: ['./meeting-filter.component.css']
})
export class MeetingFilterComponent implements OnInit {


  constructor(private meetingService: MeetingService) { }
  @Output() backIsClicked = new EventEmitter();
  @Output() isFilterApplied = new EventEmitter<boolean>();
  @Output() isFilterCleared = new EventEmitter<boolean>();

  @ViewChild('meetingFilter',{static:false}) form: NgForm;
  // clearFormClicked: boolean;
  meetingEndDate: Date;
  meetingStartDate: Date;
  filterClose = false;
  isClearClicked = false;
  isApplyClicked = false;

  closeMeetingFilter() {
    this.meetingService.closeMeetingFilter.next();
  }


  applyMeetingFilter(meetingFormFilter: NgForm) {
     if ( (meetingFormFilter.value['meetingStartDate'] ===  undefined && meetingFormFilter.value['meetingEndDate'] ===  undefined) || (meetingFormFilter.value['meetingStartDate'] ===  '' && meetingFormFilter.value['meetingEndDate'] ===  '')  ) {
      this.isApplyClicked = false;
      this.isClearClicked = false;
      this.meetingService.meetingReload.next();
      this.isFilterCleared.emit(true);

     } else {
      this.isApplyClicked = this.isClearClicked ? false : true ;
      this.isClearClicked = false;
      this.meetingService.meetingFilterApplied.next({value: meetingFormFilter.value, placeholder: ['From Date', 'To Date']});
      this.isFilterCleared.emit(false);
     }
     this.isFilterApplied.emit(this.isApplyClicked);
     this.backIsClicked.emit();
    }
  clearForm() {
    this.isClearClicked = true;
    this.form.reset();
    this.form.value['meetingStartDate'] = '';
    this.form.value['meetingEndDate'] = '';
  }

  ngOnInit(): void {
  }
}


