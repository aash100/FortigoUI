import { Component, OnInit,EventEmitter, Output, ViewChild } from '@angular/core';
import { DocType } from '../../models/doc-type.model';
import { DocUploadService } from '../../services/doc-upload.service';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-doc-filter',
  templateUrl: './doc-filter.component.html',
  styleUrls: ['./doc-filter.component.css']
})
export class DocFilterComponent implements OnInit {

  constructor(public docService: DocUploadService) { }
  @ViewChild('meetingFilter',{static:false}) form: NgForm;
  public docTypes: DocType[];
  public selectedDocType: DocType;
  @Output() isFilterApplied = new EventEmitter<boolean>();
  ngOnInit() {
    this.docTypes = this.docService.docTypes;
  }

  applyDocFilter() {
    console.log('doc filter on ' + this.selectedDocType.type);
    this.docService.setFilterInDoc(this.selectedDocType.id);
    this.isFilterApplied.emit(true);
    this.closeDocFilter();
  }
  closeDocFilter() {
    this.docService.closeDocFilter.next();
  }

  clearForm() {
    this.form.reset();
    this.form.value['docTypes'] = undefined;
    this.selectedDocType = undefined;
  }
}
