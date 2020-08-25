/*
 * Created on Thu Aug 08 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

import { Column, CalculationDataType, DataFormat, DataType, DataCalculationFormat } from 'src/app/shared/models/column.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { CollectionCycleTimeService } from '../services/collection-cycle-time/collection-cycle-time.service';
import { ExtraRowsData } from 'src/app/shared/models/extra-rows-data.model';
import { Note } from 'src/app/shared/models/note.model';
import { CellData } from 'src/app/shared/models/cell-data.model';
import { DateInputField, SelectOption, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { DashboardConstant } from '../constants/DashboardConstant';
import { CollectionCycleTimeFilterModel } from '../models/collection-cycle-time-filter.model';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { Util } from 'src/app/core/abstracts/util';
import { FortigoButton } from 'src/app/shared/abstracts/button.model';

@Component({
  selector: 'app-collection-cycle-time-report',
  templateUrl: './collection-cycle-time-report.component.html',
  styleUrls: ['./collection-cycle-time-report.component.css'],
  providers: [DatePipe]
})
export class CollectionCycleTimeReportComponent implements OnInit {

  public pageTitle = 'Collection Cycle Time Report';
  // Variables for Header
  public searchText = 'Search';
  public miniNotes: Array<Note>;
  // environment variables
  private environmentName = environment.name;
  private baseUIUrl = environment.baseUIUrl;
  // Variables for Grid
  public gridConfigurationData: GridConfiguration;
  public rowsData: Array<any>;
  public rmViewRowsData: Array<any>;
  public customerViewRowsData: Array<any>;
  public customerViewToPayRowsData: Array<any>;
  public extraRows: ExtraRowsData;
  // Filter
  public filterFields: Array<any>;
  public appliedFilter: { tab0: CollectionCycleTimeFilterModel, tab1: CollectionCycleTimeFilterModel };
  public showSearch: boolean;
  public searchRegexPattern = DashboardConstant.SEARCH_REGEX_PATTERN;
  public groups: Array<Object>;
  headButtonList: FortigoButton[];


  private selectedTabIndex = 0;
  // Columns for grid
  public columnsData: Array<Column> = [
    { columnDef: 'rmName', headerName: 'Regional Manager', action: 'data-expand-collapse', css: { horizontalAlign: 'left' }, isExpandableRow: true, width: '10px', showExpandedCount: true },
    { columnDef: 'collectionFfeName', headerName: 'Collection Manager ', action: 'data-expand-collapse', css: { horizontalAlign: 'left' }, isExpandableRow: true, width: '10px' },
    { columnDef: 'companyName', headerName: 'Account', width: '10px', dataType: DataType.String, css: { horizontalAlign: 'left' } },
    { columnDef: 'invoiceAmount', headerName: 'Total Amount', width: '10px', dataType: DataType.String, headerCalculatedDataType: CalculationDataType.Sum, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'receivedAmount', headerName: 'Collected', width: '10px', dataType: DataType.String, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, headerCalculatedDataType: CalculationDataType.Sum, dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'unbilledAmount', headerName: 'Unbilled', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Name: 'Amount', headerCalculatedDataType: CalculationDataType.Sum, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'unbilledPerc', headerName: '', subHeader1Name: 'Total Amo. % | W. Day', width: '10px', dataType: DataType.String, isSortingDisabled: true },
    { columnDef: 'dueAmount', headerName: 'Not Due', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'duePerc', headerName: '', subHeader1Name: 'Total Amo. % | W. Day', width: '10px', dataType: DataType.String, isSortingDisabled: true },
    { columnDef: 'overdueAmount', headerName: 'Overdue', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'overduePerc', headerName: '', subHeader1Name: 'Total Amo. % | W. Day', width: '10px', dataType: DataType.String, isSortingDisabled: true },
    { columnDef: 'firstOverdueAmount', headerName: 'DPD (0-7)', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, css: { textColor: 'red-shade-1' }, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'firstOverduePerc', headerName: '', subHeader1Name: 'Overdue %', width: '10px', dataType: DataType.String, css: { textColor: 'red-shade-1' }, isSortingDisabled: true },
    { columnDef: 'secondOverdueAmount', headerName: 'DPD (7-30)', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, css: { textColor: 'red-shade-2' }, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'secondOverduePerc', headerName: '', subHeader1Name: 'Overdue %', width: '10px', dataType: DataType.String, css: { textColor: 'red-shade-2' }, isSortingDisabled: true },
    { columnDef: 'thirdOverdueAmount', headerName: 'DPD (30-60)', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, css: { textColor: 'red-shade-3' }, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'thirdOverduePerc', headerName: '', subHeader1Name: 'Overdue %', width: '10px', dataType: DataType.String, css: { textColor: 'red-shade-3' }, isSortingDisabled: true },
    { columnDef: 'fourthOverdueAmount', headerName: 'DPD (60-90)', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, css: { textColor: 'red-shade-4' }, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'fourthOverduePerc', headerName: '', subHeader1Name: 'Overdue %', width: '10px', dataType: DataType.String, css: { textColor: 'red-shade-4' }, isSortingDisabled: true },
    { columnDef: 'fifthOverdueAmount', headerName: 'DPD (90+)', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, css: { textColor: 'red-shade-5' }, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'fifthOverduePerc', headerName: '', subHeader1Name: 'Overdue %', width: '10px', dataType: DataType.String, css: { textColor: 'red-shade-5' }, isSortingDisabled: true },
  ];

  constructor(private _title: Title,
    private _activatedRoute: ActivatedRoute,
    private _datePipe: DatePipe,
    private _collectionCycleTimeService: CollectionCycleTimeService,
    private _loginControlV2Service: LoginControlV2Service) { }

  ngOnInit() {
    if (environment.name !== 'prod') {
      this.showSearch = true; // enable it when in non-prod env.
    }
    this.setFilterFields();
    this._title.setTitle(this._activatedRoute.snapshot.data['title']);

    this.setRMViewColumnData();

    this.gridConfigurationData = new GridConfiguration();
    this.gridConfigurationData.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfigurationData.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfigurationData.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfigurationData.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfigurationData.css.tableHeaderBackgroundStyle = '#E4E4E4';
    this.gridConfigurationData.css.tableSubHeader1BackgroundStyle = '#D5D5D5';
    this.gridConfigurationData.css.tableCalculatedHeaderBackgroundStyle = '#D5D5D5';
    this.gridConfigurationData.css.tableFont = FortigoConstant.FONT_SMALL.toString() + 'px';
    this.gridConfigurationData.isSortingEnabled = false;
    this.gridConfigurationData.rowExpansionIcon = 'remove_circle';
    this.gridConfigurationData.rowCollapseIcon = 'add_circle';
    this.gridConfigurationData.disableRowToolTipText = false;
    this.gridConfigurationData.subHeader1Position = 'after';
    this.gridConfigurationData.isFilterTabEnabled = true;
    this.gridConfigurationData.defaultPageSize = 25;

    this.gridConfigurationData.filterTabList = [
      { label: DashboardConstant.COLLECTION_CYCLE_TIME_DASHBOARD_RM_VIEW_VALUE, key: DashboardConstant.COLLECTION_CYCLE_TIME_DASHBOARD_RM_VIEW_KEY, hideBadge: true, hideToolTipText: true },
      { label: DashboardConstant.COLLECTION_CYCLE_TIME_DASHBOARD_CUSTOMER_VIEW_VALUE, key: DashboardConstant.COLLECTION_CYCLE_TIME_DASHBOARD_CUSTOMER_VIEW_KEY, hideBadge: true, hideToolTipText: true },
      { label: DashboardConstant.COLLECTION_CYCLE_TIME_DASHBOARD_CUSTOMER_VIEW_TO_PAY_VALUE, key: DashboardConstant.COLLECTION_CYCLE_TIME_DASHBOARD_CUSTOMER_VIEW_TO_PAY_KEY, hideBadge: true, hideToolTipText: true },
    ];
    this.setRMViewGridConfigurationData();
    this.getRMViewCycleTimeReportRM();

    // setting mini notes
    this.miniNotes = [
      { horizontalAlign: 'left', text: '* All amounts are in lakhs' }
    ];

    this.appliedFilter = { tab0: null, tab1: null };
  }

  /**
   * This funciton refresh the data grid
   */
  public onRefresh() {
    this.rowsData = null;
    // Get collection Cycle Time RM
    this.getRMViewCycleTimeReportRM();
  }

  private setRMViewColumnData() {
    this.columnsData[0].columnDef = 'rmName';
    this.columnsData[0].headerName = 'Regional Manager';
    this.columnsData[0].action = 'data-expand-collapse';
    this.columnsData[1].columnDef = 'collectionFfeName';
    this.columnsData[1].headerName = 'Collection Manager';
    this.columnsData[1].action = 'data-expand-collapse';
    this.columnsData[2].columnDef = 'companyName';
    this.columnsData[2].headerName = 'Account';
    delete this.columnsData[2].action;
  }

  private setCustomerViewColumnData() {
    this.columnsData[0].columnDef = 'cvCompanyName';
    this.columnsData[0].headerName = 'Account';
    this.columnsData[0].action = 'data-expand-collapse';
    this.columnsData[1].columnDef = 'cvRMName';
    this.columnsData[1].headerName = 'Regional Manager';
    this.columnsData[1].action = 'data-expand-collapse';
    this.columnsData[2].columnDef = 'cvCollectionFfeName';
    this.columnsData[2].headerName = 'Collection Manager';
    delete this.columnsData[2].action;
  }

  private setRMViewGridConfigurationData() {
    this.gridConfigurationData.uniqueColumnName = 'rmId';
    this.gridConfigurationData.uniqueLevel1RowExpansionColumnName = 'rmId';
    this.gridConfigurationData.uniqueLevel2RowExpansionColumnName = 'collectionFfeId';
    this.gridConfigurationData.isPaginaionEnabled = false;
  }

  private setCustomerViewGridConfigurationData() {
    this.gridConfigurationData.uniqueColumnName = 'cvCompanyId';
    this.gridConfigurationData.uniqueLevel1RowExpansionColumnName = 'cvCompanyId';
    this.gridConfigurationData.uniqueLevel2RowExpansionColumnName = 'cvRMId';
    this.gridConfigurationData.isPaginaionEnabled = true;
    setTimeout(() => {
      this.gridConfigurationData.showLoader = false;
    }, 2000);
  }

  /**
   * Function getRMViewCycleTimeReportRM:
   *
   * This function calls cycle time report RM API and process data
   * @param  {CollectionCycleTimeFilterModel} filter? Optional paramter for filter data
   */
  private getRMViewCycleTimeReportRM(filter?: CollectionCycleTimeFilterModel) {
    this._collectionCycleTimeService.getRMViewCycleTimeReportRM(filter).subscribe((response: Array<any>) => {
      response = this.processData(response);
      this.rowsData = response;
      this.rmViewRowsData = <Array<any>>Util.getObjectCopy(response);
    });
  }

  /**
   * Function getRMViewCycleTimeReportFFE:
   *
   * This function calls cycle time report FFE API and process data
   * @param  {string} rmId: RM id of selected RM
   * @param  {any} rowData: row data of expanded row
   * @param  {number} rowExpansionLevel: expansion level for row
   * @param  {CollectionCycleTimeFilterModel} filter? Optional paramter for filter data
   */
  private getRMViewCycleTimeReportFFE(rmId: string, rowData: any, rowExpansionLevel: number, filter?: CollectionCycleTimeFilterModel) {
    this._collectionCycleTimeService.getRMViewCycleTimeReportFFE(rmId, filter).subscribe((response: Array<any>) => {
      response = this.processData(response);
      this.extraRows = new ExtraRowsData(rowData, response, 'rmName', rowExpansionLevel);
    });
  }

  /**
   * Function getRMViewCycleTimeReportCompany:
   *
   * This function calls cycle time report Company API and process data
   * @param  {string} rmId: RM id of selected RM
   * @param  {string} ffeId: FFE id of the selected RM
   * @param  {any} rowData: row data of expanded row
   * @param  {number} rowExpansionLevel: expansion level for row
   * @param  {CollectionCycleTimeFilterModel} filter? Optional paramter for filter data
   */
  private getRMViewCycleTimeReportCompany(rmId: string, ffeId: string, rowData: any, rowExpansionLevel: number, filter?: CollectionCycleTimeFilterModel) {
    this._collectionCycleTimeService.getRMViewCycleTimeReportCompany(rmId, ffeId, filter).subscribe((response: Array<any>) => {
      response = this.processData(response);
      this.extraRows = new ExtraRowsData(rowData, response, 'collectionFfeName', rowExpansionLevel);
    });
  }


  /**
   * Function getCustomerViewCycleTimeReportCompany:
   *
   * This function calls cycle time report Company API and process data
   * @param  {CollectionCycleTimeFilterModel} filter? Optional paramter for filter data
   */
  private getCustomerViewCycleTimeReportCompany(filter?: CollectionCycleTimeFilterModel, isToPay?: boolean) {
    this._collectionCycleTimeService.getCustomerViewCycleTimeReportCompany(filter, isToPay).subscribe((response: Array<any>) => {
      response = this.processData(response, 'customerView');
      this.rowsData = response;
      if (!isToPay) {
        this.customerViewRowsData = <Array<any>>Util.getObjectCopy(response);
      } else {
        this.customerViewToPayRowsData = <Array<any>>Util.getObjectCopy(response);
      }
    });
  }

  /**
   * Function getCustomerViewCycleTimeReportRM:
   *
   * This function calls cycle time report RM API and process data
   * @param  {string} companyId: Company id of selected Company
   * @param  {any} rowData: row data of expanded row
   * @param  {number} rowExpansionLevel: expansion level for row
   * @param  {CollectionCycleTimeFilterModel} filter? Optional paramter for filter data
   */
  private getCustomerViewCycleTimeReportRM(companyId: string, rowData: any, rowExpansionLevel: number, filter?: CollectionCycleTimeFilterModel) {
    switch (this.selectedTabIndex) {
      case 1:
        this._collectionCycleTimeService.getCustomerViewCycleTimeReportRM(companyId, filter).subscribe((response: Array<any>) => {
          response = this.processData(response, 'customerView');
          this.extraRows = new ExtraRowsData(rowData, response, 'cvCompanyName', rowExpansionLevel);
        });
        break;
      case 2:
        this._collectionCycleTimeService.getCustomerViewCycleTimeReportRM(companyId, filter, true).subscribe((response: Array<any>) => {
          response = this.processData(response, 'customerView');
          this.extraRows = new ExtraRowsData(rowData, response, 'cvCompanyName', rowExpansionLevel);
        });
        break;
      default:
        break;
    }

  }

  /**
   * Function getCustomerViewCycleTimeReportFFE:
   *
   * This function calls cycle time report FFE API and process data
   * @param  {string} companyId: Company id of selected RM
   * @param  {string} rmId: RM id of the selected FFE
   * @param  {any} rowData: row data of expanded row
   * @param  {number} rowExpansionLevel: expansion level for row
   * @param  {CollectionCycleTimeFilterModel} filter? Optional paramter for filter data
   */
  private getCustomerViewCycleTimeReportFFE(companyId: string, rmId: string, rowData: any, rowExpansionLevel: number, filter?: CollectionCycleTimeFilterModel) {
    switch (this.selectedTabIndex) {
      case 1:
        this._collectionCycleTimeService.getCustomerViewCycleTimeReportFFE(companyId, rmId, filter).subscribe((response: Array<any>) => {
          response = this.processData(response, 'customerView');
          this.extraRows = new ExtraRowsData(rowData, response, 'cvRMName', rowExpansionLevel);
        });
        break;
      case 2:
        this._collectionCycleTimeService.getCustomerViewCycleTimeReportFFE(companyId, rmId, filter, true).subscribe((response: Array<any>) => {
          response = this.processData(response, 'customerView');
          this.extraRows = new ExtraRowsData(rowData, response, 'cvRMName', rowExpansionLevel);
        });
        break;
      default:
        break;
    }
  }

  /**
   * Function processData:
   *
   * This function process response data and returns the formatted/processed data
   * @param  {Array<any>} data: Response data to be processed
   * @returns Array: Processed response data
   */
  private processData(data: Array<any>, viewName?: string): Array<any> {
    data.forEach((eachResponse) => {
      eachResponse.unbilledPerc = eachResponse.unbilledPerc ? eachResponse.unbilledPerc.toString() + ' | ' + eachResponse.unbilledDays.toString() : '';
      eachResponse.duePerc = eachResponse.duePerc ? eachResponse.duePerc.toString() + ' | ' + eachResponse.dueDays.toString() : '';
      eachResponse.overduePerc = eachResponse.overduePerc ? eachResponse.overduePerc.toString() + ' | ' + eachResponse.overdueDays.toString() : '';
      if (viewName === 'customerView') {
        eachResponse.cvRMId = eachResponse.rmId;
        delete eachResponse.rmId;
        eachResponse.cvRMName = eachResponse.rmName;
        delete eachResponse.rmName;

        eachResponse.cvCompanyId = eachResponse.companyId;
        delete eachResponse.companyId;
        eachResponse.cvCompanyName = eachResponse.companyName;
        delete eachResponse.companyName;

        eachResponse.cvCollectionFfeId = eachResponse.collectionFfeId;
        delete eachResponse.collectionFfeId;
        eachResponse.cvCollectionFfeName = eachResponse.collectionFfeName;
        delete eachResponse.collectionFfeName;
      }
    });
    return data;
  }

  /**
   * Funciton onCellClick:
   *
   * This function handles event of cell click
   * @param  {CellData} event: Event of the Cell Click
   */
  public onCellClick(event: CellData) {
    switch (event.action.toLowerCase()) {
      case 'data-expand-collapse'.toLowerCase():
        if (event.isForExtraData) {
          this.getExpandedRowData(event);
        }
        break;
      case 'click'.toLowerCase():
        this.openLink(event);
        break;
      default:
        break;
    }
  }

  /**
   * This function is used to get expanded data for clicked row item.
   *
   * @param  {CellData} event: Cell Data of clicked row
   */
  private getExpandedRowData(event: CellData) {
    switch (event.columnName.toString().toLowerCase()) {
      case 'cvCompanyName'.toLowerCase():
        this.getCustomerViewCycleTimeReportRM(event.rowData.cvCompanyId, event.rowData, event.rowExpansionLevel, this.appliedFilter.tab1);
        break;
      case 'rmName'.toLowerCase():
        this.getRMViewCycleTimeReportFFE(event.rowData.rmId, event.rowData, event.rowExpansionLevel, this.appliedFilter.tab0);
        break;
      case 'cvRMName'.toLowerCase():
        this.getCustomerViewCycleTimeReportFFE(event.rowData.cvCompanyId, event.rowData.cvRMId, event.rowData, event.rowExpansionLevel, this.appliedFilter.tab1);
        break;
      case 'collectionFfeName'.toLowerCase():
        this.getRMViewCycleTimeReportCompany(event.rowData.rmId, event.rowData.collectionFfeId, event.rowData, event.rowExpansionLevel, this.appliedFilter.tab0);
        break;
      default:
        break;
    }
  }

  /**
   * This function opens external link for clicked cell.
   * @param  {CellData} event: Cell Data of clicked row
   */
  private openLink(event: CellData) {

    if (event.rowData[event.columnName] === null || event.rowData[event.columnName] === '') {
      Swal.fire('Warning', 'No data to show, please select another record.', 'warning');
      return;
    }

    let uiFlag = '';
    let moduleRoute = '';
    let tabName = '';

    switch (this.selectedTabIndex) {
      case 0:
      case 1:
      case 2:
        switch (event.columnName) {
          case 'unbilledAmount':
            moduleRoute = '/unbilled-revenue';
            break;
          case 'dueAmount':
            uiFlag = 'notDue';
            moduleRoute = '/invoice';
            tabName = 'submitted';
            break;
          case 'overdueAmount':
            uiFlag = 'overDue';
            moduleRoute = '/invoice';
            tabName = 'submitted';
            break;
          case 'firstOverdueAmount':
            uiFlag = 'overDue0-7';
            moduleRoute = '/invoice';
            tabName = 'submitted';
            break;
          case 'secondOverdueAmount':
            uiFlag = 'overDue7-30';
            moduleRoute = '/invoice';
            tabName = 'submitted';
            break;
          case 'thirdOverdueAmount':
            uiFlag = 'overDue30-60';
            moduleRoute = '/invoice';
            tabName = 'submitted';
            break;
          case 'fourthOverdueAmount':
            uiFlag = 'overDue60-90';
            moduleRoute = '/invoice';
            tabName = 'submitted';
            break;
          case 'fifthOverdueAmount':
            uiFlag = 'overDue90+';
            moduleRoute = '/invoice';
            tabName = 'submitted';
            break;
          default:
            break;
        }

        switch (moduleRoute) {
          case '/unbilled-revenue':
            switch (this.selectedTabIndex) {
              case 0:
                localStorage.setItem('filter', JSON.stringify({ 'collectionCTD': { 'rmId': event.rowData.rmId, 'ffeId': event.rowData.collectionFfeId, 'companyId': event.rowData.companyId, filter: this.appliedFilter.tab0 } }));
                break;
              case 1:
              case 2:
                localStorage.setItem('filter', JSON.stringify({ 'collectionCTD': { 'rmId': event.rowData.cvRMId, 'ffeId': event.rowData.cvCollectionFfeId, 'companyId': event.rowData.cvCompanyId, filter: this.appliedFilter.tab1 } }));
                break;
            }

            if (this.environmentName === 'localhost') {
              window.open(this.baseUIUrl + '/landing' + moduleRoute + '/' + this._loginControlV2Service.encodedUserId, '_blank');
            } else {
              window.open(this.baseUIUrl + '/web/landing' + moduleRoute + '/' + this._loginControlV2Service.encodedUserId, '_blank');
            }
            break;
          case '/trip':
          case '/invoice':
            let rmId: number;
            let collectionFfeId: number;
            let companyId: number;
            let filter: any;

            switch (this.selectedTabIndex) {
              case 0:
                rmId = event.rowData.rmId === 0 ? null : event.rowData.rmId;
                collectionFfeId = event.rowData.collectionFfeId === 0 ? null : event.rowData.collectionFfeId;
                companyId = event.rowData.companyId === 0 ? null : event.rowData.companyId;
                filter = this.appliedFilter.tab0;
                break;
              case 1:
              case 2:
                rmId = event.rowData.cvRMId === 0 ? null : event.rowData.cvRMId;
                collectionFfeId = event.rowData.cvCollectionFfeId === 0 ? null : event.rowData.cvCollectionFfeId;
                companyId = event.rowData.cvCompanyId === 0 ? null : event.rowData.cvCompanyId;
                filter = this.appliedFilter.tab1;
                break;
            }

            this._collectionCycleTimeService.getFilteredTripIDList(rmId, uiFlag, filter, collectionFfeId, companyId).subscribe((response: Array<any>) => {
              localStorage.setItem('filter', JSON.stringify({ 'unbilledRevenue': { 'tripIds': response.map(eachId => eachId.id.toString()), 'tabName': tabName } }));
              if (this.environmentName === 'localhost') {
                window.open(this.baseUIUrl + '/landing' + moduleRoute + '/' + this._loginControlV2Service.encodedUserId, '_blank');
              } else {
                window.open(this.baseUIUrl + '/web/landing' + moduleRoute + '/' + this._loginControlV2Service.encodedUserId, '_blank');
              }
            });
            break;
          default:
            break;
        }

        break;
      default:
        break;
    }
  }

  /**
   * Method used for Filter Tab Selection purpose
   * @param  {number} tabIndex
   */
  public onGridFilterTabSelection(tabIndex: number) {

    this.rowsData = null;
    this.extraRows = undefined;
    this.searchText = '';

    this.selectedTabIndex = tabIndex;

    switch (tabIndex) {
      case 0:
        // load rm view
        this.setRMViewColumnData();
        this.setRMViewGridConfigurationData();
        if (this.rmViewRowsData) {
          this.rowsData = this.rmViewRowsData;
        } else {
          this.getRMViewCycleTimeReportRM();
        }
        break;
      case 1:
        // load customer view
        this.setCustomerViewColumnData();
        this.setCustomerViewGridConfigurationData();
        if (this.customerViewRowsData) {
          this.rowsData = this.customerViewRowsData;
        } else {
          this.getCustomerViewCycleTimeReportCompany();
        }
        break;
      case 2:
        // load customer view - to pay data
        this.setCustomerViewColumnData();
        this.setCustomerViewGridConfigurationData();
        if (this.customerViewToPayRowsData) {
          this.rowsData = this.customerViewToPayRowsData;
        } else {
          this.getCustomerViewCycleTimeReportCompany(undefined, true);
        }
        break;
    }
  }

  /**
   * Function refresh
   *
   * This funtion is use for clear Search and filter results.
   * @param  {any} event: Event for clearing Search and filter results.
   */
  public refresh(event: any) {
    console.log(event);
  }

  /**
   * Function onSearch
   *
   * This function is use for searching table entry by user inputs.
   * @param  {any} event: Searching event.
   */
  public onSearch(event: any) {
    console.log(event);
  }

  /**
   * Function setFilterFields
   *
   * This function sets search fields
   */
  private setFilterFields() {
    // specifies from and to date type
    const fromToType = [
      { id: DashboardConstant.COLLECTION_SUBMISSION_DATE_KEY, text: DashboardConstant.COLLECTION_SUBMISSION_DATE_VALUE },
      { id: DashboardConstant.COLLECTION_TRIP_DATE_KEY, text: DashboardConstant.COLLECTION_TRIP_DATE_VALUE }
    ];
    this.groups = [{ id: 1, title: 'Date Filter' }, { id: 2, title: '' }];
    this.filterFields = [];
    const selectType = new SelectOption('text', 'id', fromToType);
    const dateFlag = new SearchableSelectInputField('Type', 'dateFlag', selectType, undefined, false, false, undefined, -1, 0, 1, null, null, 1);
    const startDateFilter = new DateInputField('From', 'startDate', undefined, false, undefined, -1, 8, undefined, 1);
    const endDateFilter = new DateInputField('To', 'endDate', undefined, false, undefined, -1, 8, undefined, 1);
    const rmFilterOptions = new SelectOption('text', 'id', this._collectionCycleTimeService.regionalManager);
    const cmFilterOption = new SelectOption('text', 'id', this._collectionCycleTimeService.collectionManager);
    const companyFilterOption = new SelectOption('text', 'id', this._collectionCycleTimeService.customerName);

    const rmFilter = new SearchableSelectInputField('Regional Manager', 'rmIds', rmFilterOptions, undefined, true, false, undefined, -1, 0, undefined, undefined, undefined, 2);
    const cmFilter = new SearchableSelectInputField('Collection Manager', 'collectionFfeIds', cmFilterOption, undefined, true, false, undefined, -1, 0, undefined, undefined, undefined, 2);
    const companyFilter = new SearchableSelectInputField('Account', 'companyIds', companyFilterOption, undefined, true, false, undefined, -1, 0, undefined, undefined, undefined, 2);

    this.filterFields = [dateFlag, startDateFilter, endDateFilter, rmFilter, cmFilter, companyFilter];
  }

  /**
   * Function used to perform submission of filter.
   * @param  {any} filterForm : data corresponding to each filter field i.e. to be submited.
   */
  public submitFilterForm(filterForm: any) {
    // Used to change date format to dd-MM-yyyy
    const formData = <any>Util.getObjectCopy(filterForm);
    formData['startDate'] = this._datePipe.transform(formData['startDate'], 'dd-MM-yyyy');
    formData['endDate'] = this._datePipe.transform(formData['endDate'], 'dd-MM-yyyy');
    this.rowsData = undefined;
    this.createFilterData(formData);
    switch (this.selectedTabIndex) {
      case 0:
        this.appliedFilter.tab0 = formData;
        this.getRMViewCycleTimeReportRM(formData);
        break;
      case 1:
        this.appliedFilter.tab1 = formData;
        this.getCustomerViewCycleTimeReportCompany(formData);
        break;
      case 2:
        this.appliedFilter.tab1 = formData;
        this.getCustomerViewCycleTimeReportCompany(formData, true);
        break;
      default:
        break;
    }
  }

  /**
   * To create filter data familiar to request payload of filter.
   * @param  {any} filterForm : data corresponding to each filter field i.e. to be submited.
   */
  private createFilterData(filterForm: any) {
    const filterKeys = Object.getOwnPropertyNames(filterForm);
    filterKeys.forEach((eachkey) => {
      filterForm[eachkey] = filterForm[eachkey] === '' ? null : filterForm[eachkey];
      if (['fromDate', 'toDate'].toString().includes(eachkey) && filterForm[eachkey]) {
        filterForm[eachkey] = filterForm[eachkey].format(FortigoConstant.FILTER_DATE_FORMAT);
      }
      if (['rmIds', 'collectionFfeIds', 'companyIds'].toString().includes(eachkey) && filterForm[eachkey] && Array.isArray(filterForm[eachkey])) {
        filterForm[eachkey] = filterForm[eachkey].map(eachId => eachId.toString());
      }
    });
  }
}
