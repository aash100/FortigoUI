import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { DateInputField } from 'src/app/shared/abstracts/field-type.model';
import { CustomerService } from '../../services/customer.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-target-filter',
  templateUrl: './target-filter.component.html',
  styleUrls: ['./target-filter.component.css'],
  providers: [DatePipe]
})
export class TargetFilterComponent implements OnInit, OnChanges {

  @Input() clearFilter;

  @Output() backIsClicked = new EventEmitter();
  @Output() isFilterApplied = new EventEmitter<boolean>();
  @Output() isFilterCleared = new EventEmitter<boolean>();

  @ViewChild('contactFilter',{static:false}) form: NgForm;

  contactCreatedOnEndDate: Date;
  contactCreatedOnStartDate: Date;
  isClearClicked = false;
  isApplyClicked = false;
  filterFields: any;
  whenFilter: any;
  toFilter: any;
  fromDate: string;
  toDate: string;
  
  constructor(
    private contactService: ContactService,
    private customerService: CustomerService,
    private _datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.configureFilter();
    if (this.clearFilter) {
      this.clearForm();
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.clearFilter) {
      this.clearFilter = changes.clearFilter.currentValue;
      if (this.clearFilter) {
        this.clearForm();
      }
    }
  }
  private configureFilter() {
    const from = new DateInputField('From When', 'from', 6, false, {}, -1, 0, this.whenFilter);
    const to = new DateInputField('To When', 'to', 6, false, {}, -1, 0, this.toFilter);

    this.filterFields = [from, to];
  }
  closeContactFilter() {
    this.contactService.closeContactFilter.next();
  }
  clearForm() {
    this.isClearClicked = true;
    this.whenFilter = undefined;
    this.toFilter = undefined;
    this.configureFilter();
    this.closeContactFilter();
    this.isFilterApplied.emit(false);
    this.customerService.refreshTarget.next();
  }
  onSubmit(value) {
    console.log('filter submitted ', value);
    this.fromDate = value.from;
    this.toDate = value.to;
    this.customerService.targetFilterApplied.emit(value);
    this.isFilterApplied.emit(true);
    this.closeContactFilter();
  }
}
