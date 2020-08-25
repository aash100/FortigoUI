import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact-filter',
  templateUrl: './contact-filter.component.html',
  styleUrls: ['./contact-filter.component.css']
})

export class ContactFilterComponent implements OnInit {
  @Output() backIsClicked = new EventEmitter();
  @Output() isFilterApplied = new EventEmitter<boolean>();
  @Output() isFilterCleared = new EventEmitter<boolean>();

  @ViewChild('contactFilter',{static:false}) form: NgForm;
  // clearFormClicked: boolean;
  contactCreatedOnEndDate: Date;
  contactCreatedOnStartDate: Date;
  // filterClose = false;
  isClearClicked = false;
  isApplyClicked = false;
  constructor(private contactService: ContactService) { }

  ngOnInit() {
  }

  closeContactFilter() {
    this.contactService.closeContactFilter.next();
  }

  applyContactFilter(contactFormFilter: NgForm) {
    console.log('applyContactFilter ', contactFormFilter);
    // this.contactService.filterApplied = this.clearFormClicked ? false : true;
    // this.clearFormClicked = false;
    if ((contactFormFilter.value['contactCreatedOnStartDate'] === undefined && contactFormFilter.value['contactCreatedOnEndDate'] === undefined) || (contactFormFilter.value['contactCreatedOnStartDate'] === '' && contactFormFilter.value['contactCreatedOnEndDate'] === '')) {
      this.isApplyClicked = false;
      this.isClearClicked = false;
      this.contactService.contactReload.next();
      this.isFilterCleared.emit(true);
    } else {
      this.isApplyClicked = this.isClearClicked ? false : true ;
      this.isClearClicked = false;
      this.contactService.contactFilterApplied.next({value: contactFormFilter.value, placeholder: ['From Date', 'To Date']});
      this.isFilterCleared.emit(false);

    }
    this.isFilterApplied.emit(this.isApplyClicked);
    this.backIsClicked.emit();

  }

  clearForm() {
    this.isClearClicked = true;
    this.form.reset();
    this.form.value['contactCreatedOnStartDate'] = '';
    this.form.value['contactCreatedOnEndDate'] = '';
  }

}
