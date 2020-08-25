import { Component, OnInit } from '@angular/core';
import { GridConfiguration, GridActionIcon } from 'src/app/shared/models/grid-configuration.model';
import { Column, DataType, DataFormat } from 'src/app/shared/models/column.model';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { SupportService } from '../services/support/support.service';
import { FortigoButton } from 'src/app/shared/abstracts/button.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { MetadataService } from '../services/metadata/metadata.service';
import { CreateIssueComponent } from '../create-issue/create-issue.component';
import { Tab } from 'src/app/shared/models/tab.model';

@Component({
  selector: 'app-support-dashboard',
  templateUrl: './support-dashboard.component.html',
  styleUrls: ['./support-dashboard.component.css']
})
export class SupportDashboardComponent implements OnInit {

  public pageTitle: string;
  public supportGridconfiguration: GridConfiguration = new GridConfiguration();
  public columnsData: Array<Column> = [
    { columnDef: 'id', headerName: 'Issue Id', dataType: DataType.String },
    { columnDef: 'issueType', headerName: 'Issue Type', dataType: DataType.String },
    { columnDef: 'description', headerName: 'Description', dataType: DataType.String },
    { columnDef: 'createdBy', headerName: 'Created By', dataType: DataType.String },
    { columnDef: 'status', headerName: 'Status', dataType: DataType.String, dataFormat: DataFormat.Title, rowToolTipTextFormat: DataFormat.Title },
    { columnDef: 'createdOn', headerName: 'Created On', dataType: DataType.String },
    { columnDef: 'closedOn', headerName: 'Closed On', dataType: DataType.String }
  ];
  public rowsData: any[];
  public tabList: Array<Tab>;
  public headButtonList: Array<FortigoButton>;

  private createIssueFormModalReference: MatDialogRef<CreateIssueComponent>;

  public selectedTab = 0;

  constructor(
    private _title: Title,
    private _activatedRoute: ActivatedRoute,
    private _supportService: SupportService,
    private _metadataService: MetadataService,
    private _router: Router,
    private _dialog: MatDialog) { }

  ngOnInit() {
    this.pageTitle = this._activatedRoute.snapshot.data['title'];
    this._title.setTitle(this._activatedRoute.snapshot.data['title']);

    this.tabList = [{ label: 'Issues' }, { label: 'Investigation' }, { label: 'Health Check' }, { label: 'Jobs' }, { label: 'Support Contacts' }];

    this.tabChanged(0);

    this.getGridConfiguration();
    this.getGridData();

    this._supportService.issueListReloadEvent.subscribe((response) => {
      if (response === 'reload') {
        this.getGridData();
      }
    });
  }

  public onSearch(action: string): void {
    console.log('search value : ', action);
  }

  private getGridConfiguration() {
    this.supportGridconfiguration.isSortingEnabled = true;
    this.supportGridconfiguration.isFilterEnabled = false;
    this.supportGridconfiguration.isPaginaionEnabled = true;
    this.supportGridconfiguration.isActionButtonEnabled = true;
    this.supportGridconfiguration.actionIconList.push(new GridActionIcon('assignment', 'Work on Issue'));
  }

  private getGridData() {
    this.rowsData = this._metadataService.issueList;
  }

  public onHeaderButtonClick(data: string) {
    switch (data) {
      case this.headButtonList[0].placeholder:
        this.createIssueFormModalReference = this._dialog.open(CreateIssueComponent, {
          data: {
            mode: FortigoConstant.FORM_CREATE_MODE
          }
        });
        break;
      default:
        break;
    }
  }

  public onActionExtraButtonClick(data: any) {
    switch (data.index) {
      case 0:
        this._router.navigate(['/support/work/' + data.data.id]);
        break;
      default:
        break;
    }
  }

  public tabChanged(tabIndex) {
    this.selectedTab = tabIndex;

    this.headButtonList = new Array<FortigoButton>();

    switch (tabIndex) {
      case 0:
        this.headButtonList = [
          new FortigoButton('New Issue')
        ];
        break;
      default:
        break;
    }
  }

}
