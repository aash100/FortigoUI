/*
 * Created on Sun Aug 18 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

import { Column, CalculationDataType, DataFormat, DataType, DataCalculationFormat } from 'src/app/shared/models/column.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { ExtraRowsData } from 'src/app/shared/models/extra-rows-data.model';
import { Note } from 'src/app/shared/models/note.model';
import { CellData } from 'src/app/shared/models/cell-data.model';
import { UnbilledRevenueService } from '../services/unbilled-revenue/unbilled-revenue.service';
import { DateInputField, SelectOption, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { UnbilledRevenueFilterModel } from '../models/unbilled-revenue-filter.model';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { DashboardConstant } from '../constants/DashboardConstant';
import { Util } from 'src/app/core/abstracts/util';
import { TripManagementConstant } from 'src/app/trip-management/constants/TripManagementConstant';
import { InvoiceManagementConstant } from 'src/app/invoice-management/constants/InvoiceManagementConstant';

@Component({
  selector: 'app-unbilled-revenue-dashboard',
  templateUrl: './unbilled-revenue-dashboard.component.html',
  styleUrls: ['./unbilled-revenue-dashboard.component.css'],
  providers: [DatePipe]
})
export class UnbilledRevenueDashboardComponent implements OnInit {

  public pageTitle = 'Unbilled Revenue Dashboard';
  // Variables for Header
  public searchText = 'Search';
  public miniNotes: Array<Note>;
  // environment variables
  private environmentName = environment.name;
  private baseUIUrl = environment.baseUIUrl;
  // Variables for Grid
  public gridConfigurationData: GridConfiguration;
  public rowsData: Array<any>;
  public extraRows: ExtraRowsData;
  public columnsData: Array<Column> = [
    { columnDef: 'rmName', headerName: 'Regional Manager', action: 'data-expand-collapse', css: { horizontalAlign: 'left' }, isExpandableRow: true, width: '10px', showExpandedCount: true },
    { columnDef: 'sourcingMgrName', headerName: 'Trip Sourcing Manager', action: 'data-expand-collapse', css: { horizontalAlign: 'left' }, isExpandableRow: true, width: '10px' },
    { columnDef: 'companyName', headerName: 'Account', width: '10px', dataType: DataType.String, css: { horizontalAlign: 'left' } },
    { columnDef: 'unbilledAmount', headerName: 'Unbilled Amount', width: '10px', dataType: DataType.String, headerCalculatedDataType: CalculationDataType.Sum, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'nopodAmount', headerName: 'No P-PoD', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Name: 'Amount', headerCalculatedDataType: CalculationDataType.Sum, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'nopod', headerName: '', subHeader1Name: '% of Total | W. Day', width: '10px', dataType: DataType.String, isSortingDisabled: true },
    { columnDef: 'firstNopodAmount', headerName: 'P-PoD Pending (0-7)', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, css: { textColor: 'red-shade-1' }, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'firstNopodPerc', headerName: '', subHeader1Name: '% of Total', width: '10px', dataType: DataType.String, css: { textColor: 'red-shade-1' }, isSortingDisabled: true },
    { columnDef: 'secondNopodAmount', headerName: 'P-PoD Pending (7-14)', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, css: { textColor: 'red-shade-2' }, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'secondNopodPerc', headerName: '', subHeader1Name: '% of Total', width: '10px', dataType: DataType.String, css: { textColor: 'red-shade-2' }, isSortingDisabled: true },
    { columnDef: 'thirdNopodAmount', headerName: 'P-PoD Pending (14-21)', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, css: { textColor: 'red-shade-3' }, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'thirdNopodPerc', headerName: '', subHeader1Name: '% of Total', width: '10px', dataType: DataType.String, css: { textColor: 'red-shade-3' }, isSortingDisabled: true },
    { columnDef: 'fourthNopodAmount', headerName: 'P-PoD Pending (21-30)', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, css: { textColor: 'red-shade-4' }, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'fourthNopodPerc', headerName: '', subHeader1Name: '% of Total', width: '10px', dataType: DataType.String, css: { textColor: 'red-shade-4' }, isSortingDisabled: true },
    { columnDef: 'fifthNopodAmount', headerName: 'P-PoD Pending (30+)', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, css: { textColor: 'red-shade-5' }, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'fifthNopodPerc', headerName: '', subHeader1Name: '% of Total', width: '10px', dataType: DataType.String, css: { textColor: 'red-shade-5' }, isSortingDisabled: true },
    { columnDef: 'nodraftAmount', headerName: 'No Draft', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'nodraft', headerName: '', subHeader1Name: '% of Total | W. Day', width: '10px', dataType: DataType.String, isSortingDisabled: true },
    { columnDef: 'firstNovalidationAmount', headerName: 'Validation Pending (0-3)', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'firstNovalidationPerc', headerName: '', subHeader1Name: '% of Total', width: '10px', dataType: DataType.String, isSortingDisabled: true },
    { columnDef: 'secondNovalidationAmount', headerName: 'Validation Pending (3+)', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, css: { textColor: 'red-shade-5' }, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'secondNovalidationPerc', headerName: '', subHeader1Name: '% of Total', width: '10px', dataType: DataType.String, isSortingDisabled: true, css: { textColor: 'red-shade-5' } },
    { columnDef: 'firstNosubmissionAmount', headerName: 'Submission Pending (0-3)', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'firstNosubmissionPerc', headerName: '', subHeader1Name: '% of Total', width: '10px', dataType: DataType.String, isSortingDisabled: true },
    { columnDef: 'secondNosubmissionAmount', headerName: 'Submission Pending (3+)', subHeader1Name: 'Amount', width: '10px', dataType: DataType.String, innerCells: 2, subHeader1Colspan: 1, headerCalculatedDataType: CalculationDataType.Sum, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, css: { textColor: 'red-shade-5' }, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    { columnDef: 'secondNosubmissionPerc', headerName: '', subHeader1Name: '% of Total', width: '10px', dataType: DataType.String, isSortingDisabled: true, css: { textColor: 'red-shade-5' } },

  ];
  public filterFields: Array<any>;
  public appliedFilter: UnbilledRevenueFilterModel;
  public searchRegexPattern = DashboardConstant.SEARCH_REGEX_PATTERN;
  public showSearch: boolean;
  public groups: Array<Object>;

  constructor(private _title: Title,
    private _activatedRoute: ActivatedRoute,
    private _datePipe: DatePipe,
    private _unbilledRevenueService: UnbilledRevenueService,
    private _loginControlV2Service: LoginControlV2Service) { }

  ngOnInit() {
    if (environment.name !== 'prod') {
      this.showSearch = true; // enable it when in non-prod env.
    }
    this._title.setTitle(this._activatedRoute.snapshot.data['title']);
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
    this.gridConfigurationData.uniqueColumnName = 'rmId';
    this.gridConfigurationData.uniqueLevel1RowExpansionColumnName = 'rmId';
    this.gridConfigurationData.uniqueLevel2RowExpansionColumnName = 'sourcingMgrId';
    this.gridConfigurationData.rowExpansionIcon = 'remove_circle';
    this.gridConfigurationData.rowCollapseIcon = 'add_circle';
    this.gridConfigurationData.disableRowToolTipText = false;
    this.gridConfigurationData.subHeader1Position = 'after';


    // setting filter fields
    this.setFilterFields();

    // setting mini notes
    this.miniNotes = [
      { horizontalAlign: 'left', text: '* All amounts are in lakhs' }
    ];

    this.appliedFilter = new UnbilledRevenueFilterModel();

    if (localStorage.getItem('filter') && localStorage.getItem('filter') !== 'null' && JSON.parse(localStorage.getItem('filter')) && JSON.parse(localStorage.getItem('filter')).collectionCTD) {
      const collectionCTDFilter = JSON.parse(localStorage.getItem('filter')).collectionCTD;

      this.appliedFilter.rmIds = [];
      if (collectionCTDFilter.rmId) {
        this.appliedFilter.rmIds.push(collectionCTDFilter.rmId.toString());
      }

      if (collectionCTDFilter.ffeId !== 0) {
        this.appliedFilter.collectionFfeIds = [];
        if (collectionCTDFilter.ffeId) {
          this.appliedFilter.collectionFfeIds.push(collectionCTDFilter.ffeId.toString());
        }
      }

      if (collectionCTDFilter.companyId !== 0) {
        this.appliedFilter.companyIds = [];
        if (collectionCTDFilter.companyId) {
          this.appliedFilter.companyIds.push(collectionCTDFilter.companyId.toString());
        }
      }

      // Get filtered unbilled report RM
      this.getUnbilledReportRM(this.appliedFilter);
      this.setFilterFields();
    } else {
      // Get unbilled report RM
      this.getUnbilledReportRM();
    }

    // removing filter from local storage
    if (localStorage.getItem('filter')) {
      localStorage.removeItem('filter');
    }
  }

  /**
   * This funciton refresh the data grid
   */
  public onRefresh() {
    this.rowsData = null;
    // Get unbilled report RM
    this.getUnbilledReportRM();
  }

  /**
   * Function getUnbilledReportRM:
   *
   * This function calls cycle time report RM API and process data
   */
  private getUnbilledReportRM(filter?: UnbilledRevenueFilterModel) {
    this._unbilledRevenueService.getUnbilledReportRM(filter).subscribe((response: Array<any>) => {
      response = this.processData(response);
      this.rowsData = response;
    });
  }

  /**
   * Function getCycleTimeReportFFE:
   *
   * This function calls cycle time report FFE API and process data
   * @param  {string} rmId: RM id of selected RM
   * @param  {any} rowData: row data of expanded row
   * @param  {number} rowExpansionLevel: expansion level for row
   */
  private getUnbilledReportFFE(rmId: string, rowData: any, rowExpansionLevel: number, filter?: UnbilledRevenueFilterModel) {
    this._unbilledRevenueService.getUnbilledReportFFE(rmId, filter).subscribe((response: Array<any>) => {
      response = this.processData(response);
      this.extraRows = new ExtraRowsData(rowData, response, 'rmName', rowExpansionLevel);
    });
  }

  /**
   * Function getUnbilledReportCompany:
   *
   * This function calls cycle time report Company API and process data
   * @param  {string} rmId: RM id of selected RM
   * @param  {string} ffeId: FFE id of the selected FFE
   * @param  {any} rowData: row data of expanded row
   * @param  {number} rowExpansionLevel: expansion level for row
   */
  private getUnbilledReportCompany(rmId: string, ffeId: string, rowData: any, rowExpansionLevel: number, filter?: UnbilledRevenueFilterModel) {
    this._unbilledRevenueService.getUnbilledReportCompany(rmId, ffeId, filter).subscribe((response: Array<any>) => {
      response = this.processData(response);
      this.extraRows = new ExtraRowsData(rowData, response, 'sourcingMgrName', rowExpansionLevel);
    });
  }

  /**
   * Function processData:
   *
   * This function process response data and returns the formatted/processed data
   * @param  {Array<any>} data: Response data to be processed
   * @returns Array: Processed response data
   */
  private processData(data: Array<any>): Array<any> {
    data.forEach((eachResponse) => {
      eachResponse.nopod = eachResponse.nopodPerc.toString() + ' | ' + eachResponse.nopodDays.toString();
      eachResponse.nodraft = eachResponse.nodraftPerc.toString() + ' | ' + eachResponse.nodraftDays.toString();
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
      case 'rmName'.toLowerCase():
        this.getUnbilledReportFFE(event.rowData.rmId, event.rowData, event.rowExpansionLevel, this.appliedFilter);
        break;
      case 'sourcingMgrName'.toLowerCase():
        this.getUnbilledReportCompany(event.rowData.rmId, event.rowData.sourcingMgrId, event.rowData, event.rowExpansionLevel, this.appliedFilter);
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

    switch (event.columnName) {
      case 'nopodAmount':
        uiFlag = 'noPod';
        moduleRoute = '/trip';
        tabName = TripManagementConstant.ELIGIBLE_KEY;
        break;
      case 'firstNopodAmount':
        uiFlag = 'noPod0-7';
        moduleRoute = '/trip';
        tabName = TripManagementConstant.ELIGIBLE_KEY;
        break;
      case 'secondNopodAmount':
        uiFlag = 'noPod7-14';
        moduleRoute = '/trip';
        tabName = TripManagementConstant.ELIGIBLE_KEY;
        break;
      case 'thirdNopodAmount':
        uiFlag = 'noPod14-21';
        moduleRoute = '/trip';
        tabName = TripManagementConstant.ELIGIBLE_KEY;
        break;
      case 'fourthNopodAmount':
        uiFlag = 'noPod21-30';
        moduleRoute = '/trip';
        tabName = TripManagementConstant.ELIGIBLE_KEY;
        break;
      case 'fifthNopodAmount':
        uiFlag = 'noPod30+';
        moduleRoute = '/trip';
        tabName = TripManagementConstant.ELIGIBLE_KEY;
        break;
      case 'nodraftAmount':
        uiFlag = 'noDraft';
        moduleRoute = '/trip';
        tabName = TripManagementConstant.ELIGIBLE_KEY;
        break;
      case 'firstNovalidationAmount':
        uiFlag = 'validationPending0-3';
        moduleRoute = '/trip';
        tabName = TripManagementConstant.SENT_FOR_VALIDATION_KEY;
        break;
      case 'secondNovalidationAmount':
        uiFlag = 'validationPending3+';
        moduleRoute = '/trip';
        tabName = TripManagementConstant.SENT_FOR_VALIDATION_KEY;
        break;
      case 'firstNosubmissionAmount':
        uiFlag = 'submissionPending0-3';
        moduleRoute = '/invoice';
        tabName = InvoiceManagementConstant.SUBMISSION_PENDING_KEY;
        break;
      case 'secondNosubmissionAmount':
        uiFlag = 'submissionPending3+';
        moduleRoute = '/invoice';
        tabName = InvoiceManagementConstant.SUBMISSION_PENDING_KEY;
        break;
      default:
        break;
    }

    this._unbilledRevenueService.getFilteredTripIDList(event.rowData.rmId, uiFlag, this.appliedFilter, event.rowData.sourcingMgrId === 0 ? null : event.rowData.sourcingMgrId, event.rowData.companyId === 0 ? null : event.rowData.companyId).subscribe((response: any) => {
      //TODO  Added this to handle redirection route. asked by Sankar
      if (!Array.isArray(response)) {
        if (response.redirectionRoute.trim() === '/invoice') {
          tabName = InvoiceManagementConstant.SUBMISSION_PENDING_KEY;
        } else if (response.redirectionRoute.trim() === '/trip') {
          tabName = TripManagementConstant.READY_FOR_INVOICING_SYSTEM_KEY;
        }
        localStorage.setItem('filter', JSON.stringify({ 'unbilledRevenue': { 'tripIds': response.trips.map(eachId => eachId.id.toString()), 'tabName': tabName } }));
        moduleRoute = response.redirectionRoute;
      } else {
        localStorage.setItem('filter', JSON.stringify({ 'unbilledRevenue': { 'tripIds': response.map(eachId => eachId.id.toString()), 'tabName': tabName } }));
      }
      if (this.environmentName === 'localhost') {
        window.open(this.baseUIUrl + '/landing' + moduleRoute + '/' + this._loginControlV2Service.encodedUserId, '_blank');
      } else {
        window.open(this.baseUIUrl + '/web/landing' + moduleRoute + '/' + this._loginControlV2Service.encodedUserId, '_blank');
      }
    });
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
    this.groups = [{ id: 1, title: 'Date Filter' }, { id: 2, title: '' }];
    this.filterFields = [];

    // specifies from and to date type
    const fromToType = [
      { id: DashboardConstant.UNBILLED_POD_RCVD_DATE_KEY, text: DashboardConstant.UNBILLED_POD_RCVD_DATE_VALUE },
      { id: DashboardConstant.UNBILLED_TRIP_START_KEY, text: DashboardConstant.UNBILLED_TRIP_START_VALUE },
      { id: DashboardConstant.UNBILLED_TRIP_COMP_DATE_KEY, text: DashboardConstant.UNBILLED_TRIP_COMP_DATE_VALUE },
      { id: DashboardConstant.UNBILLED_DRAFT_GEN_DATE_KEY, text: DashboardConstant.UNBILLED_DRAFT_GEN_DATE_VALUE },
      { id: DashboardConstant.UNBILLED_INVOICE_GEN_DATE_KEY, text: DashboardConstant.UNBILLED_INVOICE_GEN_DATE_VALUE }
    ];
    const dateType = new SelectOption('text', 'id', fromToType);
    const dateFlag = new SearchableSelectInputField('Type', 'dateFlag', dateType, undefined, false, false, undefined, -1, 0, 1, null, null, 1);
    const startDateFilter = new DateInputField('From', 'startDate', undefined, false, undefined, -1, 8, null, 1);
    const endDateFilter = new DateInputField('To', 'endDate', undefined, false, undefined, -1, 8, null, 1);

    const rmFilterOptions = new SelectOption('text', 'id', this._unbilledRevenueService.regionalManager);
    const tsmFilterOption = new SelectOption('text', 'id', this._unbilledRevenueService.tripSourcingManager);
    const cmFilterOption = new SelectOption('text', 'id', this._unbilledRevenueService.collectionManager);
    const companyFilterOption = new SelectOption('text', 'id', this._unbilledRevenueService.customerName);

    let defaultRmIds: Array<number>;
    let defaultSourcingMgrIds: Array<number>;
    let defaultCollectionFfeIds: Array<number>;
    let defaultCompanyIds: Array<number>;

    if (this.appliedFilter) {
      if (this.appliedFilter.rmIds) {
        defaultRmIds = this.appliedFilter.rmIds.map(eachRM => Number.parseInt(eachRM));
      }
      if (this.appliedFilter.sourcingMgrIds) {
        defaultSourcingMgrIds = this.appliedFilter.sourcingMgrIds.map(eachSourcingManager => Number.parseInt(eachSourcingManager));
      }
      if (this.appliedFilter.collectionFfeIds) {
        defaultCollectionFfeIds = this.appliedFilter.collectionFfeIds.map(eachCollectionFFE => Number.parseInt(eachCollectionFFE));
      }
      if (this.appliedFilter.companyIds) {
        defaultCompanyIds = this.appliedFilter.companyIds.map(eachCompanyId => Number.parseInt(eachCompanyId));
      }
    }

    const rmFilter = new SearchableSelectInputField('Regional Manager', 'rmIds', rmFilterOptions, undefined, true, false, undefined, -1, 0, defaultRmIds, undefined, undefined, 2);
    const cmFilter = new SearchableSelectInputField('Collection Manager', 'collectionMgrIds', cmFilterOption, undefined, true, false, undefined, -1, 0, defaultCollectionFfeIds, undefined, undefined, 2);
    const tsmFilter = new SearchableSelectInputField('Trip Sourcing Manager', 'sourcingMgrIds', tsmFilterOption, undefined, true, false, undefined, -1, 0, defaultSourcingMgrIds, undefined, undefined, 2);
    const companyFilter = new SearchableSelectInputField('Account', 'companyIds', companyFilterOption, undefined, true, false, undefined, -1, 0, defaultCompanyIds, undefined, undefined, 2);

    this.filterFields = [dateFlag, startDateFilter, endDateFilter, rmFilter, cmFilter, tsmFilter, companyFilter];
  }


  public submitFilterForm(filterForm: any) {
    const formData = <any>Util.getObjectCopy(filterForm);
    formData['startDate'] = this._datePipe.transform(formData['startDate'], 'dd-MM-yyyy');
    formData['endDate'] = this._datePipe.transform(formData['endDate'], 'dd-MM-yyyy');

    this.rowsData = undefined;
    this.createFilterData(formData);
    this.appliedFilter = formData;
    this.getUnbilledReportRM(formData);
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
      if (['rmIds', 'sourcingMgrIds', 'companyIds'].toString().includes(eachkey) && filterForm[eachkey] && Array.isArray(filterForm[eachkey])) {
        filterForm[eachkey] = filterForm[eachkey].map(eachId => eachId.toString());
      }
    });
  }
}
