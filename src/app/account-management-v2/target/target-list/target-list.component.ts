/*
 * Created on Thu Sep 05 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material';
import { DatePipe } from '@angular/common';

import Swal from 'sweetalert2';

import { TargetService } from 'src/app/account-management-v2/services/target/target.service';
import { Column, DataType } from 'src/app/shared/models/column.model';
import { GridConfiguration, GridActionIcon } from 'src/app/shared/models/grid-configuration.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { MetadataService } from '../../services/metadata/metadata.service';
import { TargetFormComponent } from '../target-form/target-form.component';

@Component({
  selector: 'app-target-list',
  templateUrl: './target-list.component.html',
  styleUrls: ['./target-list.component.css'],
  providers: [DatePipe]
})
export class TargetListComponent implements OnInit {
  private companyId: string;
  private targetFormModalReference: MatDialogRef<TargetFormComponent>;
  private fromDate: string;
  private toDate: string;
  private financialYear: string;
  private userNameMap = new Map();
  public mode: string;
  public gridConfiguration: GridConfiguration = new GridConfiguration();
  public rowsData: Array<any>;
  public columnsData: Array<Column>;
  public formattedData = new Array<any>();

  constructor(private _activatedRoute: ActivatedRoute, private _targetService: TargetService, private _dialog: MatDialog, private _metadataService: MetadataService, private _datePipe: DatePipe) {
    this._activatedRoute.params.subscribe((params) => {
      if (params['companyId']) {
        this.companyId = params['companyId'];
      }
    });
  }

  ngOnInit() {
    // get company id
    this._activatedRoute.paramMap.subscribe(
      (data) => {
        this.companyId = data.get('companyId').toString();
        this.mode = 'default';
        this.getTargetList();
      }
    );
  }

  /**
   * Get target data list
   */
  private getTargetList(value?: Object) {

    if (this.mode === 'filter') {
      this.fromDate = this._datePipe.transform(value['from'], 'yyyy-MM-dd');
      this.toDate = this._datePipe.transform(value['to'], 'yyyy-MM-dd');
    } else {
      // This logic convert the date to 'yyyy-MM-dd'
      const now = new Date();
      const nowMonth = now.getMonth();
      if ([0, 1, 2].includes(nowMonth)) {
        const from = new Date();
        const to = new Date();
        from.setDate(1);
        from.setMonth(3);
        from.setFullYear(from.getFullYear() - 1);

        to.setDate(31);
        to.setMonth(2);
        to.setFullYear(to.getFullYear());
        this.fromDate = this._datePipe.transform(from, 'yyyy-MM-dd');
        this.toDate = this._datePipe.transform(to, 'yyyy-MM-dd');
      } else {
        const from = new Date();
        const to = new Date();
        from.setDate(1);
        from.setMonth(3);
        from.setFullYear(from.getFullYear());

        to.setDate(31);
        to.setMonth(2);
        to.setFullYear(to.getFullYear() + 1);

        this.fromDate = this._datePipe.transform(from, 'yyyy-MM-dd');
        this.toDate = this._datePipe.transform(to, 'yyyy-MM-dd');
      }
    }
    // get target list
    this._targetService.getTargetList(this.companyId, this.fromDate, this.toDate).subscribe((response: Array<any>) => {
      if (response.length !== 0) {
        this.rowsData = response;
        if (response[0]['year'].toString().length === 4) {
          this.financialYear = response[0]['year'] + '-' + (Number.parseInt(response[0]['year'].toString().substring(2, 4)) + 1);
        } else {
          this.financialYear = '-';
        }
        this.formattedData.length = 0;
        this.rowsData.forEach((eachTarget, index) => {
          this._targetService.getUserName(eachTarget.userId).subscribe(
            (userName: string) => {
              if (!this.userNameMap.has(eachTarget.userId)) {
                this.userNameMap.set(eachTarget.userId, userName);
              }
              // Call method for each parameter
              this.formatData(userName, eachTarget, 'targetRevenue');
              this.formatData(userName, eachTarget, 'targetMargin');
              this.formatData(userName, eachTarget, 'estimateRevenue');
              this.formatData(userName, eachTarget, 'estimateMargin');
              if (this.rowsData.length - 1 === index) {
                // add loading logic
              }
              this.getGridConfiguration();
              this.getColumnData();
            });
        });
        // ANCHOR  Add more login here
      }
    });
  }

  /**
   * This method Convert the data according to target and estimated revenue
   * @param  {string} userName
   * @param  {string} data
   * @param  {string} targetName
   */
  private formatData(userName: string, data: string, targetName: string) {
    let count = 0;
    const row = {};
    row[count++] = userName;
    row[count++] = this.financialYear;
    switch (targetName) {
      case 'targetRevenue':
        row[count++] = 'Target - Revenue';
        break;
      case 'targetMargin':
        row[count++] = 'Target - Margin';
        break;
      case 'estimateRevenue':
        row[count++] = 'Estimate - Revenue';
        break;
      case 'estimateMargin':
        row[count++] = 'Estimate - Margin';
        break;
      default:
        break;
    }
    const monthly = data[targetName].monthly.map(eachMonth => eachMonth.data);
    const quarterly = data[targetName].quarterly.map(eachMonth => eachMonth.data);
    const yearly = data[targetName].yearly.map(eachYear => eachYear.data);
    monthly.forEach(
      (eachMonth) => {
        row[count] = eachMonth;
        count++;
      });
    quarterly.forEach(
      (eachQuater, i) => {
        row[count] = eachQuater;
        count++;
      });
    row[count++] = yearly[0];
    this.formattedData.push(row);
  }

  /**
   * Add datatable configuration.
   */
  private getGridConfiguration() {
    this.gridConfiguration.isSortingEnabled = true;
    this.gridConfiguration.isPaginaionEnabled = true;
    this.gridConfiguration.actionIconList.length = 0;
    this.gridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfiguration.actionIconList.push(new GridActionIcon('visibility', 'View'));
    this.gridConfiguration.actionIconList.push(new GridActionIcon('edit', 'Edit'));
  }

  /**
   * Add data table properties
   */
  private getColumnData() {
    this.columnsData = [
      { columnDef: '0', headerName: 'User name', dataType: DataType.String },
      { columnDef: '1', headerName: 'Year', dataType: DataType.String },
      { columnDef: '2', headerName: 'Type', dataType: DataType.String },
      { columnDef: '3', headerName: 'Apr', dataType: DataType.Number },
      { columnDef: '4', headerName: 'May', dataType: DataType.Number },
      { columnDef: '5', headerName: 'Jun', dataType: DataType.Number },
      { columnDef: '6', headerName: 'Jul', dataType: DataType.Number },
      { columnDef: '7', headerName: 'Aug', dataType: DataType.Number },
      { columnDef: '8', headerName: 'Sep', dataType: DataType.Number },
      { columnDef: '9', headerName: 'Oct', dataType: DataType.Number },
      { columnDef: '10', headerName: 'Nov', dataType: DataType.Number },
      { columnDef: '11', headerName: 'Des', dataType: DataType.Number },
      { columnDef: '12', headerName: 'Jan', dataType: DataType.Number },
      { columnDef: '13', headerName: 'Feb', dataType: DataType.Number },
      { columnDef: '14', headerName: 'Mar', dataType: DataType.Number },
      { columnDef: '15', headerName: 'Q1', dataType: DataType.Number },
      { columnDef: '16', headerName: 'Q2', dataType: DataType.Number },
      { columnDef: '17', headerName: 'Q3', dataType: DataType.Number },
      { columnDef: '18', headerName: 'Q4', dataType: DataType.Number },
      { columnDef: '19', headerName: 'y1', dataType: DataType.Number },
    ];
  }

  /**
   * Trigger on click delete button
   * @param  {any} data
   */
  public onActionExtraButtonClick(data: any) {
    console.log('--------', data);
    switch (data.index) {
      case 0:
        this.targetFormModalReference = this._dialog.open(TargetFormComponent, {
          data: {
            mode: FortigoConstant.FORM_VIEW_MODE,
            targetId: data.data.targetId
          }
        });
        break;
      case 1:
        this.targetFormModalReference = this._dialog.open(TargetFormComponent, {
          data: {
            mode: FortigoConstant.FORM_EDIT_MODE,
            targetId: data.data.targetId
          }
        });
        break;
      case 2:
        this.deleteTarget(data['data']['targetId']);
        break;
      default:
        break;
    }
  }

  /**
   * Delete selected target
   * @param  {string} targetId
   */
  private deleteTarget(targetId: string) {
    Swal.fire({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
      cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.value) {
        this._targetService.deleteTarget(targetId)
          .subscribe(response => {
            if (!response['errorCode']) {
              console.log('delete successfully', response);
              Swal.fire('Deleted successfully', '', 'success');
            } else {
              Swal.fire('delete failed', '', 'error');
            }
          });
      }
    });
  }
}
