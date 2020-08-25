import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { SupportService } from '../../services/support/support.service';
import { Column, DataType, DataFormat } from 'src/app/shared/models/column.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';

@Component({
  selector: 'app-job-txn-history',
  templateUrl: './job-txn-history.component.html',
  styleUrls: ['./job-txn-history.component.css']
})
export class JobTxnHistoryComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    private _supportService: SupportService) { }

  public jobCode: string;
  public jobDesc: string;
  public jobTxns: any[];
  public columnsData: Array<Column>;
  public jobTxnsGridconfiguration: GridConfiguration = new GridConfiguration();
  ngOnInit() {
    this.jobCode = this.data.job['jobCode'];
    this.jobDesc = this.data.job['name'];
    this.setColumnData();
    this.getJobTxnsGridConfiguration();
    this.getJobTxns(this.jobCode);
  }
  private getJobTxnsGridConfiguration() {
    this.jobTxnsGridconfiguration.isSortingEnabled = true;
    this.jobTxnsGridconfiguration.isFilterEnabled = false;
    this.jobTxnsGridconfiguration.isPaginaionEnabled = true;
    this.jobTxnsGridconfiguration.defaultPageSize = 30;
    this.jobTxnsGridconfiguration.css.tableRowHeight = '25px';
  }
  private setColumnData() {
    this.columnsData = [
      { columnDef: 'startDate', headerName: 'Start Time', dataType: DataType.Date, dataFormat: DataFormat.DateAndTimeInSec, css: { horizontalAlign: 'left' } },
      { columnDef: 'endDate', headerName: 'End Time', dataType: DataType.Date, dataFormat: DataFormat.DateAndTimeInSec, css: { horizontalAlign: 'left' } },
      { columnDef: 'status', headerName: 'Status', dataType: DataType.String }
    ];
  }
  private getJobTxns(jobCode: string) {
    this._supportService.getJobTxns(jobCode).subscribe((resp) => {
      this.jobTxns = resp['result'];
    });
  }

}
