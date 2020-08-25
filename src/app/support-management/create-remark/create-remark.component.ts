import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { SupportService } from '../services/support/support.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { TextAreaInputField } from 'src/app/shared/abstracts/field-type.model';
import Swal from 'sweetalert2';
import { IssueRemark } from '../models/issue-remark.model';

@Component({
  selector: 'app-create-remark',
  templateUrl: './create-remark.component.html',
  styleUrls: ['./create-remark.component.css']
})
export class CreateRemarkComponent implements OnInit {

  public fields: Array<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private _supportService: SupportService,
    private _loginControlV2Service: LoginControlV2Service,
    private _dialog: MatDialog) {
    this.getFields();
  }

  ngOnInit() { }

  private getFields() {
    const remark = new TextAreaInputField('Remark', 'remark');

    this.fields = [];
    this.fields =
      [
        remark
      ];
  }

  public saveRemark(value: any): void {
    const issueRemark = new IssueRemark();
    issueRemark.remark = value.remark;
    issueRemark.issueId = this.data.issueId;
    issueRemark.createdBy = Number.parseInt(this._loginControlV2Service.userId);
    this._supportService.saveRemark(issueRemark).subscribe((response) => {
      Swal.fire('Remark added successfully.', '', 'success');
      this._supportService.remarkListReloadEvent.next('fetchData');
      this._dialog.closeAll();
    });
  }
}
