import { Component, OnInit } from '@angular/core';
import { Column, DataType, DataFormat, CSS } from 'src/app/shared/models/column.model';
import { GridConfiguration, GridActionIcon } from 'src/app/shared/models/grid-configuration.model';
import { SupportService } from '../services/support/support.service';
import { JobTxnHistoryComponent } from './job-txn-history/job-txn-history.component';
import { MatDialogRef, MatDialog } from '@angular/material';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit {

  columnsData: Array<Column>;
  jobsList: any[];
  public isLoading: boolean;
  public jobsGridconfiguration: GridConfiguration = new GridConfiguration();
  private jobTxnHistoryModalReference: MatDialogRef<JobTxnHistoryComponent>;

  constructor(private _supportService: SupportService,
    private _dialog: MatDialog) { }

  ngOnInit() {
    this.getGridConfiguration();

    this.setColumnData();
    this.getJobsList();
  }
  public getJobsList() {
    this.isLoading = true;
    this._supportService.getJobsList().subscribe((resp) => {
      this.isLoading = false;;
      this.jobsList = resp['result'];
    });
  }

  private getGridConfiguration() {
    this.jobsGridconfiguration.isSortingEnabled = true;
    this.jobsGridconfiguration.isFilterEnabled = false;
    this.jobsGridconfiguration.isPaginaionEnabled = true;
    this.jobsGridconfiguration.isActionButtonEnabled = true;
    this.jobsGridconfiguration.actionIconList.length = 0;
    this.jobsGridconfiguration.actionIconList.push(new GridActionIcon('assignment', 'View History Runs'));
 //   this.jobsGridconfiguration.actionIconList.push(new GridActionIcon('directions_run', 'Execute Job'));
    this.jobsGridconfiguration.defaultPageSize = 50;
    this.jobsGridconfiguration.css.tableRowHeight = '25px';
  }

  private setColumnData() {
    this.columnsData = [
      { columnDef: 'jobCode', headerName: 'Job Code', dataType: DataType.String },
      { columnDef: 'functionalItem', headerName: 'Description', dataType: DataType.String },
      { columnDef: 'frequencyCron', headerName: 'Frequency Cron', dataType: DataType.String },
      { columnDef: 'frequency', headerName: 'Frequency', dataType: DataType.String },
      { columnDef: 'startDate', headerName: 'Start Time', dataType: DataType.Date, dataFormat: DataFormat.DateAndTimeInSec, css: { horizontalAlign: 'left' } },
      { columnDef: 'endDate', headerName: 'End Time', dataType: DataType.Date, dataFormat: DataFormat.DateAndTimeInSec, css: { horizontalAlign: 'left' } },
      { columnDef: 'status', headerName: 'Status', dataType: DataType.String }
    ];
  }

  public onActionClick(data: any) {
    if (data.index === 0) {
      this.jobTxnHistoryModalReference = this._dialog.open(JobTxnHistoryComponent, {
        data: {
          mode: FortigoConstant.FORM_VIEW_MODE,
          job: data.data
        }
      });
    }
    if (data.index === 1) {

      if (data.data['jobCode'] === 'JR001') {
        this.isLoading = true;
        this._supportService.triggerRevenueReportJob().subscribe( (resp) => {
          this.isLoading = false;
          if (resp) {
              alert('request failed, internal server error');
          } else {
            alert('successfully executed job:' + data.data['jobCode']);
          }
        });
      } else {
        alert('funtionality not added yet');
      }
    }
  }
}
