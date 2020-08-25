import { Component, OnInit, Inject } from '@angular/core';
import { SelectOption, SelectInputField, TextInputField, TextAreaInputField, DateInputField, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { MetadataService } from '../services/metadata/metadata.service';
import { Issue } from '../models/issue.model';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { SupportService } from '../services/support/support.service';
import Swal from 'sweetalert2';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';

@Component({
  selector: 'app-create-issue',
  templateUrl: './create-issue.component.html',
  styleUrls: ['./create-issue.component.css']
})
export class CreateIssueComponent implements OnInit {

  public fields: Array<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private _metadataService: MetadataService,
    private _supportService: SupportService,
    private _loginControlV2Service: LoginControlV2Service,
    private _dialog: MatDialog) {
    this.getFields();
  }

  ngOnInit() { }

  private getFields() {
    const issueTypeList = this._metadataService.issueTypeList;
    const issueTypeListOptions = new SelectOption('description', 'id', issueTypeList);
    const issueList = new SearchableSelectInputField('Select Issue Type', 'selectedIssueTypeId', issueTypeListOptions, undefined, false);
    const issueDescription = new TextAreaInputField('Description', 'issueDescription');

    this.fields = [];
    this.fields =
      [
        issueList,
        issueDescription
      ];
  }

  public createIssue(value: any) {
    const issue = new Issue();
    issue.description = value.issueDescription;
    issue.issueType = value.selectedIssueTypeId;
    issue.createdBy = Number.parseInt(this._loginControlV2Service.userId);
    this._supportService.createIssue(issue).subscribe((response) => {
      Swal.fire('Issue added successfully.', '', 'success');
      this._supportService.issueListReloadEvent.next('fetchData');
      this._dialog.closeAll();
    });
  }

}
