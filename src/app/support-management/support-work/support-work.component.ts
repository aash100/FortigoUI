import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Issue } from '../models/issue.model';
import { SupportService } from '../services/support/support.service';
import { Diagnosis } from '../models/diagnosis.model';
import { IssueRemark } from '../models/issue-remark.model';
import { MetadataService } from '../services/metadata/metadata.service';
import { SelectOption, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { FortigoButton } from 'src/app/shared/abstracts/button.model';
import { MatDialogRef, MatDialog } from '@angular/material';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { CreateRemarkComponent } from '../create-remark/create-remark.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-support-work',
  templateUrl: './support-work.component.html',
  styleUrls: ['./support-work.component.css']
})
export class SupportWorkComponent implements OnInit {

  private selectedIssueId: number;

  public customerId: string;
  public selectedIssue: Issue;
  public addedRemark: string;
  public diagnosisList: Array<Diagnosis>;
  public savedRemarks: Array<IssueRemark>;
  public issueTypeMap: any;

  public fields: Array<any>;
  public issueType: string;
  public issueDescription: string;

  private createRemarkFormModalReference: MatDialogRef<CreateRemarkComponent>;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _supportService: SupportService,
    private _metadataService: MetadataService,
    private _router: Router,
    private _dialog: MatDialog
  ) {
    this.getFields();
  }

  ngOnInit() {
    this._activatedRoute.params.subscribe(params => {
      this.selectedIssueId = params['id'];
      this.getIssueById(this.selectedIssueId);
      this.getSavedRemarks(this.selectedIssueId);
      this.issueTypeMap = this._metadataService.issueTypeMap;
    });

    this._supportService.remarkListReloadEvent.subscribe((response) => {
      if (response === 'fetchData') {
        this.getSavedRemarks(this.selectedIssue.id);
      }
    });
  }

  private getFields() {
    const companyList = this._metadataService.companyDropdownList;
    const companyListOptions = new SelectOption('name', 'id', companyList);
    const issueList = new SearchableSelectInputField('Select Company', 'selectedCompanyId', companyListOptions, undefined, false, false, undefined, undefined, undefined, undefined, 100);

    this.fields = [];
    this.fields =
      [
        issueList
      ];
  }

  private getSavedRemarks(issueId: number): void {
    this._supportService.getSavedRemarks(issueId).subscribe((result) => {
      this.savedRemarks = result['result'];
    });
  }

  private getDiagnosis(id: number): void {
    this._supportService.getDiagnosisByIssueType(id).subscribe((data) => {
      this.diagnosisList = data['result'];
      if (this.diagnosisList) {
        this.diagnosisList.forEach((eachDiagnosis) => {
          this._supportService.runDiagnosis(this.customerId, eachDiagnosis.id).subscribe((response) => {
            eachDiagnosis.result = response['result'];
          });
        });
      } else {
        this.diagnosisList = new Array<Diagnosis>();
      }
    });
  }

  private getIssueById(id: number): void {
    this._supportService.getIssueById(id).subscribe((data) => {
      data = data['result'];
      this.selectedIssue = data;

      this.issueType = this.issueTypeMap.get(this.selectedIssue.issueType);
      if (this.selectedIssue.description && this.selectedIssue.description !== '') {
        this.issueDescription = ' - ' + this.selectedIssue.description;
      }
    });
  }

  public runDiagnosis(data?, isOnSelectChange?: boolean): void {
    if (isOnSelectChange) {
      if (data.name === 'selectedCompanyId') {
        this.customerId = data.value;
      }
    } else {
      this.customerId = data.selectedCompanyId;
    }
    this.getDiagnosis(this.selectedIssue.issueType);
  }

  public closeIssue(): void {
    alert('Colse issue with id ' + this.selectedIssueId + ' ?');
    this._supportService.closeIssueById(this.selectedIssueId).subscribe((data) => {
      Swal.fire('Issue closed successfully.', '', 'success');
      this._supportService.issueListReloadEvent.next('fetchData');
      this._router.navigate(['/support/']);
    });
  }

  public newRemark() {
    this.createRemarkFormModalReference = this._dialog.open(CreateRemarkComponent, {
      data: {
        mode: FortigoConstant.FORM_CREATE_MODE,
        issueId: this.selectedIssue.id
      }
    });
  }

}
