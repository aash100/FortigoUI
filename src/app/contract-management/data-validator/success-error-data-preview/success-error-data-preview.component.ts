/*
 * Created on Wed Oct 16 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';

import { Column } from 'src/app/shared/models/column.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { SaveResponseDataModel } from '../../models/save-response-data.model';
import { Card } from 'src/app/shared/models/card-data.model';
import { CardConfiguration } from 'src/app/shared/models/card-configuration.model';

@Component({
  selector: 'app-success-error-data-preview',
  templateUrl: './success-error-data-preview.component.html',
  styleUrls: ['./success-error-data-preview.component.css']
})
export class SuccessErrorDataPreviewComponent implements OnChanges {

  @Input() data: SaveResponseDataModel;

  @Output() failedData = new EventEmitter<any>();

  public columnsData1: Array<Column>;
  public rowsData1: Array<any>;
  public gridConfiguration1: GridConfiguration;
  public gridCard1: Card;
  public gridCardConfiguration1: CardConfiguration;

  public columnsData2: Array<Column>;
  public rowsData2: Array<any>;
  public gridConfiguration2: GridConfiguration;
  public gridCard2: Card;
  public gridCardConfiguration2: CardConfiguration;

  public buttons: Array<any>;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.

    if (changes.data) {
      this.data = changes.data.currentValue;
      console.log(this.data);
      this.initializeMetadata();
      this.processSuccessFailureData();
    }
  }

  /**
   * This function sets grid metadata
   */
  private initializeMetadata() {
    this.columnsData1 = new Array<Column>();
    this.getColumnsData1();
    this.gridConfiguration1 = new GridConfiguration();
    this.getGridConfiguration1();
    this.rowsData1 = null;
    this.gridCard1 = new Card();
    this.gridCard1.data = { id: 1, title: 'Success' };
    this.gridCardConfiguration1 = new CardConfiguration();
    this.gridCardConfiguration1.css.fontSize = '14px';

    this.columnsData2 = new Array<Column>();
    this.getColumnsData2();
    this.gridConfiguration2 = new GridConfiguration();
    this.getGridConfiguration2();
    this.rowsData2 = null;
    this.gridCard2 = new Card();
    this.gridCard2.data = { id: 1, title: 'Failure' };
    this.gridCardConfiguration2 = new CardConfiguration();
    this.gridCardConfiguration2.css.fontSize = '14px';

    this.buttons = new Array<any>();
    this.getButtons();
  }



  /**
   * This function adds buttons element
   */
  private getButtons() {
    this.buttons.push({ name: 'Edit', key: 'edit', icon: 'edit' });
  }

  /**
   * This function handles button click event
   * @param  {string} button: key of button clicked
   */
  public onClick(button: string) {
    switch (button) {
      case 'edit':
        this.removeGridExtraData();
        this.failedData.emit(this.rowsData2);
        break;
      default:
        break;
    }
  }

  /**
   * This function removed grid extra data
   */
  private removeGridExtraData() {
    this.rowsData2.forEach((eachRow) => {
      this.removeGridInternalKeys(eachRow);
    });
  }

  /**
   * To remove internal keys from row data.
   */
  private removeGridInternalKeys(row: any): any {
    const gridInternalKeys = [
      '_icon',
      '_isExpanded'
    ];

    const dataKeys = Object.getOwnPropertyNames(row);
    dataKeys.forEach((eachDataKey: string) => {
      if (eachDataKey.includes('_') && gridInternalKeys.includes('_' + eachDataKey.split('_')[1])) {
        delete row[eachDataKey];
      }
    });
    return row;
  }

  /**
   * This function process data for success and error grid
   */
  private processSuccessFailureData() {
    if (this.data && this.data.response) {
      let responseIndex = 0;

      const tempRowsData1 = new Array<any>();
      const tempRowsData2 = new Array<any>();
      const errorMessages = new Array<string>();
      while (this.data.response[responseIndex]) {
        switch (this.data.response[responseIndex]) {
          case 'success':
            tempRowsData1.push(this.data.rowData[responseIndex]);
            break;
          case 'Invalid data':
          default:
            tempRowsData2.push(this.data.rowData[responseIndex]);
            errorMessages.push(this.data.response[responseIndex]);
            break;
        }
        responseIndex++;
      }

      // For success grid
      this.rowsData1 = new Array<any>();
      this.rowsData1 = this.processGridData(tempRowsData1, this.columnsData1, this.rowsData1);

      // For failure grid
      this.rowsData2 = new Array<any>();
      this.rowsData2 = this.processGridData(tempRowsData2, this.columnsData2, this.rowsData2, errorMessages);
    }
  }

  private processGridData(tempRowsData: Array<any>, columnsData: Array<Column>, rowsData: Array<any>, errorMessages?: Array<string>): Array<any> {

    tempRowsData.forEach((eachTempRowData, rowIndex) => {
      const eachRow = new Object();
      columnsData.forEach((eachColumn, columnIndex) => {
        if (errorMessages) {
          eachRow[eachColumn.columnDef] = eachTempRowData[columnIndex];
        } else {
          eachRow[eachColumn.columnDef] = eachTempRowData[columnIndex + 1];
        }
      });
      if (errorMessages && Array.isArray(errorMessages)) {
        eachRow['errorMessage'] = errorMessages[rowIndex];
      }
      rowsData.push(eachRow);
    });
    return rowsData;
  }

  /**
   * Method for creating columns for Trip Invoicing Screen.
   */
  private getColumnsData1() {
    this.columnsData1 = [
      { columnDef: 'customerName', headerName: 'Customer Name' },
      { columnDef: 'sourceTown', headerName: 'Source - Town' },
      { columnDef: 'destinationTown', headerName: 'Destination - Town' },
      { columnDef: 'truckType', headerName: 'Truck Type' },
      { columnDef: 'tonnage', headerName: 'Tonnage' },
      { columnDef: 'rateType', headerName: 'Rate Type' },
      { columnDef: 'contractRate', headerName: 'Contract Rate' },
      { columnDef: 'fromDate', headerName: 'From Date' },
      { columnDef: 'toDate', headerName: 'To Date' },
    ];
  }

  /**
  * Method used to create the configuration of grid.
  */
  private getGridConfiguration1() {
    this.gridConfiguration1.isPaginaionEnabled = false;
    this.gridConfiguration1.css.fixedTableHeight = '400px';
    this.gridConfiguration1.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfiguration1.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
    this.gridConfiguration1.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    this.gridConfiguration1.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration1.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration1.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration1.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
  }

  /**
   * Method for creating columns for Trip Invoicing Screen.
   */
  private getColumnsData2() {
    this.columnsData2 = [
      { columnDef: 'errorMessage', headerName: 'Error', css: { textColor: 'red' } },
      { columnDef: 'customerName', headerName: 'Customer Name' },
      { columnDef: 'sourceTown', headerName: 'Source - Town' },
      { columnDef: 'destinationTown', headerName: 'Destination - Town' },
      { columnDef: 'truckType', headerName: 'Truck Type' },
      { columnDef: 'tonnage', headerName: 'Tonnage' },
      { columnDef: 'rateType', headerName: 'Rate Type' },
      { columnDef: 'contractRate', headerName: 'Contract Rate' },
      { columnDef: 'fromDate', headerName: 'From Date' },
      { columnDef: 'toDate', headerName: 'To Date' },
    ];
  }

  /**
  * Method used to create the configuration of grid.
  */
  private getGridConfiguration2() {
    this.gridConfiguration2.isPaginaionEnabled = false;
    this.gridConfiguration2.css.fixedTableHeight = '400px';
    this.gridConfiguration2.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfiguration2.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
    this.gridConfiguration2.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    this.gridConfiguration2.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration2.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration2.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration2.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
  }

}
