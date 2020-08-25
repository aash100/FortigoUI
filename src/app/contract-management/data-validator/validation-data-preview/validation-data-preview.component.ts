/*
 * Created on Wed Oct 16 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';

import Swal from 'sweetalert2';

import { Util } from 'src/app/core/abstracts/util';
import { FieldTypes, UploadInputField } from 'src/app/shared/abstracts/field-type.model';
import { SaveDataModel } from '../../models/save-data.model';
import { Column } from 'src/app/shared/models/column.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { ValidationService } from '../../services/validation/validation.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { SaveResponseDataModel } from '../../models/save-response-data.model';
import { ContractManagementConstant } from '../../constants/ContractManagementConstant';

@Component({
  selector: 'app-validation-data-preview',
  templateUrl: './validation-data-preview.component.html',
  styleUrls: ['./validation-data-preview.component.css']
})
export class ValidationDataPreviewComponent implements OnInit, OnChanges {

  @Input() data: Array<any>;
  @Output() dataSave = new EventEmitter<SaveResponseDataModel>();

  public columnsData: Array<Column>;
  public rowsData: Array<any>;
  public gridConfiguration: GridConfiguration;
  public uploadFields: Array<any>;
  public dataLoaded: boolean;
  public pageTitle: string;
  public buttons: Array<any>;
  public isLoadingData: boolean;

  private tempRowsData: Array<any>;
  private roleId: number;

  constructor(
    private _validationService: ValidationService,
    private _loginControlV2Service: LoginControlV2Service) { }

  ngOnInit() {
    this.roleId = Number.parseInt(this._loginControlV2Service.roleId.toString());
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.

    this.initializeMetadata();
    this.uploadFields = [new UploadInputField('Upload', 'upload', 2)];

    if (changes.data && changes.data.currentValue) {
      this.data = changes.data.currentValue;
      this.loadGridWithErrorData(this.data);
    }
  }

  private initializeMetadata() {
    this.columnsData = new Array<Column>();
    this.gridConfiguration = new GridConfiguration();
    this.buttons = new Array<any>();
  }

  /**
   * To upload document.
   * @param  {any} $event
   */
  public uploadDocument($event: any) {
    this.isLoadingData = true;
    const excelType = ContractManagementConstant.RATE_EXCEL_TYPE_KEY;
    this._validationService.validateDocumentWithData($event[0], { fileType: excelType, filePath: '' }).subscribe((response) => {
      this.isLoadingData = false;
      if (response && response.errCode && response.errCode === '0') {
        this.dataLoaded = true;
        if (response.Data && response.Data.platform_response && response.Data.platform_response.grid) {
          this.loadGrid(response.Data.platform_response.grid);
        }
      } else {
        Swal.fire('Error', 'Unable to load data', 'error');
      }
    });
  }

  private loadGrid(rows: Array<any>) {
    this.getColumnsData();
    this.getGridConfiguration();
    this.getButtons();

    this.rowsData = new Array<any>();
    let rowIndex = 1;
    while (rows[rowIndex]) {
      const eachRow = new Object();
      this.columnsData.forEach((eachColumn, index) => {
        eachRow[eachColumn.columnDef] = rows[rowIndex][index + 1]['data'];
      });
      this.rowsData.push(eachRow);
      rowIndex++;
    }
    this.tempRowsData = <Array<any>>Util.getObjectCopy(this.rowsData);
  }

  private loadGridWithErrorData(rows: Array<any>) {
    this.dataLoaded = true;
    this.getColumnsData();
    this.getGridConfiguration();
    this.getButtons();
    this.rowsData = rows;
    // hiding upload button
    this.uploadFields = [];
  }

  /**
   * Method for creating columns for Trip Invoicing Screen.
   */
  private getColumnsData() {
    this.columnsData = [
      { columnDef: 'customerName', headerName: 'Customer Name', action: 'edit', editFieldType: FieldTypes.TextInput, width: '10px' },
      { columnDef: 'sourceTown', headerName: 'Source - Town', action: 'edit', editFieldType: FieldTypes.TextInput, width: '10px' },
      { columnDef: 'destinationTown', headerName: 'Destination - Town', action: 'edit', editFieldType: FieldTypes.TextInput, width: '10px' },
      { columnDef: 'truckType', headerName: 'Truck Type', action: 'edit', editFieldType: FieldTypes.TextInput, width: '10px' },
      { columnDef: 'tonnage', headerName: 'Tonnage', action: 'edit', editFieldType: FieldTypes.TextInput, width: '10px' },
      { columnDef: 'rateType', headerName: 'Rate Type', action: 'edit', editFieldType: FieldTypes.TextInput, width: '10px' },
      { columnDef: 'contractRate', headerName: 'Contract Rate', action: 'edit', editFieldType: FieldTypes.TextInput, width: '10px' },
      { columnDef: 'fromDate', headerName: 'From Date', action: 'edit', editFieldType: FieldTypes.TextInput, width: '10px' },
      { columnDef: 'toDate', headerName: 'To Date', action: 'edit', editFieldType: FieldTypes.TextInput, width: '10px' },
    ];
  }

  /**
  * Method used to create the configuration of grid.
  */
  private getGridConfiguration() {
    this.gridConfiguration.isPaginaionEnabled = false;
    this.gridConfiguration.css.fixedTableHeight = '400px';
    this.gridConfiguration.css.tableOverflowX = 'hidden';
    this.gridConfiguration.css.tableOverflowY = 'auto';
    this.gridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfiguration.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.editableFormConfiguration.css.containerMaxWidth = '120px';
  }

  /**
   * This function adds buttons element
   */
  private getButtons() {
    this.buttons.push({ name: 'Save', key: 'save', icon: 'save' });
    this.buttons.push({ name: 'Discard', key: 'discard', icon: 'not_interested' });
  }

  /**
   * This function handles button click event
   * @param  {string} button: key of button clicked
   */
  public onClick(button: string) {
    switch (button) {
      case 'save':
        this.saveData();
        break;
      case 'discard':
        this.rowsData = <Array<any>>Util.getObjectCopy(this.tempRowsData);
        break;
      default:
        break;
    }
  }

  /**
   * This saves data through API
   */
  private saveData() {
    const data: SaveDataModel = new SaveDataModel();
    data.data = this.formatData();
    data.excelType = ContractManagementConstant.RATE_EXCEL_TYPE_KEY;
    data.userId = this._loginControlV2Service.userId;
    this.isLoadingData = true;
    this._validationService.saveDocData(data).subscribe((response) => {
      if (response && response.errCode && response.errCode === '0') {
        this.isLoadingData = false;
        const saveResponseDataModel = new SaveResponseDataModel();
        saveResponseDataModel.rowData = data.data;
        saveResponseDataModel.response = response.platform_response;
        this.dataSave.emit(saveResponseDataModel);
      } else {
        this.isLoadingData = false;
        if (response.errMessage && response.errMessage === 'Error Fetching data') {
          Swal.fire('Warning', 'No Valid data found', 'warning');
          // resetting form
          this.uploadFields = [new UploadInputField('Upload', 'upload', 2)];
        } else {
          Swal.fire('Error', response.errMessage, 'error');
        }
      }
    });
  }

  /**
   * This function formats the data according to request payload
   * @returns Array: Array of objects for request
   */
  private formatData(): Array<any> {
    const formattedData = [];
    this.rowsData.forEach((eachRowData, rowIndex) => {
      formattedData[rowIndex] = {};
      this.columnsData.forEach((eachColumnData, columnIndex) => {
        const index = (columnIndex + 1).toString();
        formattedData[rowIndex][index] = eachRowData[eachColumnData.columnDef];
      });
    });
    return formattedData;
  }
}
