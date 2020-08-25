/*
 * Created on Wed Jun 12 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { DataType, Column } from 'src/app/shared/models/column.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';

@Component({
  selector: 'app-view-reserve-invoice-modal',
  templateUrl: './view-reserve-invoice-modal.component.html',
  styleUrls: ['./view-reserve-invoice-modal.component.css']
})
export class ViewReserveInvoiceModalComponent implements OnInit {
  public columnData: Array<Column> = [];
  public rowsData: Array<any> = [];
  public gridConfiguration = new GridConfiguration();
  constructor(public _dialogRef: MatDialogRef<ViewReserveInvoiceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public _data: any) {
  }

  ngOnInit() {
    this.getColumnData();
    this.getRowsData();
    this.gridConfiguration.isPaginaionEnabled = false;
    this.gridConfiguration.css.tableFont = FortigoConstant.FONT_MEDIUM + 'px';
    this.gridConfiguration.css.fixedTableHeight = '80px';
    this.gridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
  }

  /**
   * To get Rowdata like Inv. No, etc.
   */
  private getRowsData() {
    this._data.reserveInvoiceData.forEach((eachData) => {
      eachData.tripId = this._data.viewReserveInvoiceData.service_ref_id;
    });
    this.rowsData = this._data.reserveInvoiceData;
  }

  /**
   *To get Column Data.
   */
  private getColumnData() {
    this.columnData = [
      { columnDef: 'invoiceNumber', headerName: 'Invoice Number', dataType: DataType.String, innerCells: 1, width: '120px', css: { userSelect: 'text' } },
      { columnDef: 'invoiceNumberDate', headerName: 'Invoice Date', dataType: DataType.String, innerCells: 1, width: '100px' },
      { columnDef: 'tripId', headerName: 'Trip ID', dataType: DataType.String, innerCells: 1, width: '130px', css: { userSelect: 'text' } }
    ];
  }

}
