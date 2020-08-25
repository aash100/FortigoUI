/*
 * Created on Thu Jun 13 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Title } from '@angular/platform-browser';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';

import { ISearchClick } from 'src/app/shared/interfaces/search.interface';
import { AutoUnsubscribe } from 'src/app/shared/decorators/auto-unsubscribe.decorator';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { SelectInputField, SelectOption, DateInputField, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { DataType, DataFormat, Column, CalculationDataType, DataCalculationFormat } from 'src/app/shared/models/column.model';
import { CellData } from 'src/app/shared/models/cell-data.model';
import { RightClickMenu } from 'src/app/shared/models/right-click-menu.model';
import { MetadataService } from '../services/metadata/metadata.service';
import { InvoiceService } from '../services/invoice/invoice.service';
import { InvoicingTripListComponent } from '../modals/invoicing-trip-list/invoicing-trip-list.component';
import { FortigoConstant, RoleId } from 'src/app/core/constants/FortigoConstant';
import { SubmitInvoiceDateModalComponent } from '../modals/submit-invoice-date-modal/submit-invoice-date-modal.component';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { InvoiceManagementConstant } from '../constants/InvoiceManagementConstant';
import { InvoiceListRequestPayload, Filter } from '../models/invoice-list-request-payload.model';
import { CancelInvoiceDetail, InvoiceDetail } from '../models/billing-entity.model';
import { environment } from 'src/environments/environment';
import { Util } from 'src/app/core/abstracts/util';
import { DiscardInvoiceNumberModalComponent } from '../modals/discard-invoice-number-modal/discard-invoice-number-modal.component';
import { FieldGroup } from 'src/app/shared/models/field-group.model';
import { InvoiceListByTab } from '../models/invoice-list-by-tab.model';

type RefreshMode = 'search' | 'filter' | 'all' | 'none';

@Component({
  selector: 'app-invoice-dashboard',
  templateUrl: './invoice-dashboard.component.html',
  styleUrls: ['./invoice-dashboard.component.css']
})
@AutoUnsubscribe()
export class InvoiceDashboardComponent implements OnInit, ISearchClick {

  public pageTitle: string;
  public gridConfiguration: GridConfiguration = new GridConfiguration();
  public columnsData: Array<Column> = [];
  public rowsData: Array<any>;
  public filterFontSize: number;
  public filterFields: Array<any>;

  public reloadSubscription: Subscription;
  public searchText: string;
  public showFilterApplied = false;

  public selectedTabIndex = 0;
  private hasMultiSearch = false;
  private isOpenedFromExt = false;
  public showLoader = false;
  public groups: Array<FieldGroup>;

  public searchRegexPatternInvoice = InvoiceManagementConstant.SEARCH_REGEX_PATTERN;

  private downloadInvoiceDocumentSubscription: Subscription;
  private downloadInvoicePDFSubscription: Subscription;
  private discardInvoiceNumberSubscription: Subscription;
  private getInvoiceListSubscription: Subscription;
  private cancelInvoiceModalReferenceSubscription: Subscription;
  private getItemsListSubscription: Subscription;
  private metadataSubscription: Subscription;
  private filteredTripsSubscription: Subscription;

  private statusFilterList: Array<any>;
  private requestPayload = new InvoiceListRequestPayload();

  private actionItemsDisableConfiguration = {
    isdownloadInvoiceDataDisabled: false,
    isSettleDisabled: false,
    isCaptureInvoiceSubmissionDisabled: false,
    isCancelInvoiceDisabled: false,
    isDiscardInvoiceDisabled: false,
    isDownloadInvoiceAcknowledgementDisabled: false,
    isReservedReportDisabled: false
  };
  private selectedDataRows: Array<any>;
  private isMultiInvoiceSelected = false;
  private isRemoved = false;
  private tempColumns: Array<Column> = [];
  private roleId: number;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _dialog: MatDialog,
    private _title: Title,
    private _loginControlV2Service: LoginControlV2Service,
    private _invoiceService: InvoiceService,
    private _metadataService: MetadataService
  ) {
    this.getRequestPayload();
    this.statusFilterList = new Array<any>();
  }

  ngOnInit() {
    this.pageTitle = this._activatedRoute.snapshot.data['title'];
    this._title.setTitle(this._activatedRoute.snapshot.data['title']);

    this.roleId = Number.parseInt(this._loginControlV2Service.roleId.toString());

    this.filterFontSize = FortigoConstant.FONT_SMALL;
    this.getFilterFields();

    this.getColumnData();
    this.getGridConfiguration();

    if (localStorage.getItem('filter') && localStorage.getItem('filter') !== 'null' && JSON.parse(localStorage.getItem('filter')) && JSON.parse(localStorage.getItem('filter')).unbilledRevenue) {
      const unbilledRevenueTripIds = JSON.parse(localStorage.getItem('filter')).unbilledRevenue.tripIds;
      const tabName = JSON.parse(localStorage.getItem('filter')).unbilledRevenue.tabName;
      this.requestPayload.service_ref_ids = unbilledRevenueTripIds;
      this.requestPayload.tab_filter = tabName;
      const data = <InvoiceListRequestPayload>Util.getObjectCopy(this.requestPayload);
      this.isOpenedFromExt = true;
      switch (tabName) {
        case InvoiceManagementConstant.SUBMISSION_PENDING_KEY:
          this.selectedTabIndex = 0;
          break;
        case InvoiceManagementConstant.SUBMITTED_KEY:
          this.selectedTabIndex = 1;
          break;
        default:
          break;
      }
      this._invoiceService.getInvoiceList(data).subscribe((response) => {
        if (response['errorMessage']) {
          Swal.fire('Error', response['errorMessage'], 'error');
          this.rowsData = [];
        } else {
          this.rowsData = this._metadataService.dataExtractor(response.invoicingList);
          this.setBadgeCount();
        }
        this.isOpenedFromExt = false;
      });
    } else {
      this.setTabData();
    }

    // removing filter from local storage
    if (localStorage.getItem('filter')) {
      localStorage.removeItem('filter');
    }

    this.setBadgeCount();
  }

  private setTabData() {
    this.rowsData = null;

    if (this.selectedTabIndex === 0) {
      this.requestPayload.tab_filter = this.gridConfiguration.filterTabList[this.selectedTabIndex].key;
      if (this._invoiceService.invoiceListByTab[this.gridConfiguration.filterTabList[this.selectedTabIndex].key].data) {
        this.rowsData = this._invoiceService.invoiceListByTab[this.gridConfiguration.filterTabList[this.selectedTabIndex].key].data;
        this.setBadgeCount();
      }
    }

    this._metadataService.filterTabLoaderSubject.subscribe((data: any) => {
      if (this.requestPayload.tab_filter === data.filter) {
        if (this._invoiceService.invoiceListByTab[this.requestPayload.tab_filter === null ? InvoiceManagementConstant.ALL_KEY : this.requestPayload.tab_filter].data) {
          this.rowsData = this._invoiceService.invoiceListByTab[this.requestPayload.tab_filter === null ? InvoiceManagementConstant.ALL_KEY : this.requestPayload.tab_filter].data;
          this.setBadgeCount();
        } else {
          if (this._invoiceService.invoiceListByTab[this.requestPayload.tab_filter === null ? InvoiceManagementConstant.ALL_KEY : this.requestPayload.tab_filter]['errorMessage']) {
            this.gridConfiguration.customFooterMessage = this._invoiceService.invoiceListByTab[this.requestPayload.tab_filter === null ? InvoiceManagementConstant.ALL_KEY : this.requestPayload.tab_filter]['errorMessage'];
            this.rowsData = [];
          }
        }
      }
      // for all tab
      if (this.selectedTabIndex === 8) {
        if (this.hasMultiSearch !== true && !this.requestPayload.search_text && !this.isFilterAppliedOnInvoice(this.requestPayload.filter)) {
          this.gridConfiguration.customFooterMessage = 'Please apply filter to view data';
        }
      }
    });
  }

  private setBadgeCount() {
    if (this.gridConfiguration.filterTabList[InvoiceManagementConstant.INVOICE_TAB_DATA.reserved]) {
      this.gridConfiguration.filterTabList[InvoiceManagementConstant.INVOICE_TAB_DATA.reserved].badge = this._invoiceService.invoiceListByTab.reserved.count;
    }
    if (this.gridConfiguration.filterTabList[InvoiceManagementConstant.INVOICE_TAB_DATA.submission_pending]) {
      this.gridConfiguration.filterTabList[InvoiceManagementConstant.INVOICE_TAB_DATA.submission_pending].badge = this._invoiceService.invoiceListByTab.submission_pending.count;
    }
    if (this.gridConfiguration.filterTabList[InvoiceManagementConstant.INVOICE_TAB_DATA.null]) {
      this.gridConfiguration.filterTabList[InvoiceManagementConstant.INVOICE_TAB_DATA.null].badge = this._invoiceService.invoiceListByTab.all.count;
    }
    if (this.gridConfiguration.filterTabList[InvoiceManagementConstant.INVOICE_TAB_DATA.submitted]) {
      this.gridConfiguration.filterTabList[InvoiceManagementConstant.INVOICE_TAB_DATA.submitted].badge = this._invoiceService.invoiceListByTab.submitted.count;
    }
    if (this.gridConfiguration.filterTabList[InvoiceManagementConstant.INVOICE_TAB_DATA.zero_receivables]) {
      this.gridConfiguration.filterTabList[InvoiceManagementConstant.INVOICE_TAB_DATA.zero_receivables].badge = this._invoiceService.invoiceListByTab.zero_receivables.count;
    }
  }

  /**
   * Method used to perform search operations.
   * @param  {any} searchText i.e. the search text entered by user.
   */
  public onSearch(searchText: string): void {
    this._invoiceService.clearFilterTabData();

    // resetting multiple search
    this.hasMultiSearch = false;
    if (searchText.toString().includes(',')) {
      this.requestPayload.tab_filter = '';
    }

    this.requestPayload.search_text = searchText;
    this.refreshData();
  }

  /**
   * To clear all tabs badge count.
   */
  private clearBadgeCount() {
    this.gridConfiguration.filterTabList.forEach((eachFilterTab) => {
      eachFilterTab.badge = undefined;
    });
  }

  /**
   * Filter Tab Select
   * @param  {number} tabIndex i.e. the index of the tab selected.
   */
  public onGridFilterTabSelection(tabIndex: number) {
    // no tab function if opened from external link
    if (this.isOpenedFromExt) {
      this.isOpenedFromExt = false;
      return;
    }

    this.gridConfiguration.customFooterMessage = undefined;

    this.setActionButton(tabIndex);
    this.rowsData = null;

    this.selectedDataRows = [];

    if (!(RoleId.FORTIGO_FINANCE_ROLES.includes(this.roleId) || RoleId.FORTIGO_READ_ONLY_USER === this.roleId) && tabIndex === 3) {
      tabIndex = 4;
    }

    switch (tabIndex) {
      case 0:
        this.requestPayload.tab_filter = InvoiceManagementConstant.SUBMISSION_PENDING_KEY;
        this.getInvoiceRowData(this._invoiceService.invoiceListByTab.submission_pending.data);
        break;
      case 1:
        this.requestPayload.tab_filter = InvoiceManagementConstant.SUBMITTED_KEY;
        this.getInvoiceRowData(this._invoiceService.invoiceListByTab.submitted.data);
        break;
      case 2:
        this.requestPayload.tab_filter = InvoiceManagementConstant.ZERO_RECEIVABLES_KEY;
        // REVIEW @Mayur: remove for next prod release
        if (environment.name === 'prod' || environment.name === 'localhost') {
          this.rowsData = [];
          this.gridConfiguration.customFooterMessage = 'Please try after some time.';
          return;
        }
        this.getInvoiceRowData(this._invoiceService.invoiceListByTab.zero_receivables.data);
        break;
      case 3:
        this.requestPayload.tab_filter = InvoiceManagementConstant.RESERVED_KEY;
        this.getInvoiceRowData(this._invoiceService.invoiceListByTab.reserved.data);
        break;
      case 4:
        // hide footer message, if search text contains comma
        if (this.hasMultiSearch !== true && !this.requestPayload.search_text && !this.isFilterAppliedOnInvoice(this.requestPayload.filter)) {
          this.rowsData = [];
          this.gridConfiguration.customFooterMessage = 'Please apply filter to view data';
        } else {
          this.getInvoiceRowData(this._invoiceService.invoiceListByTab.all.data);
        }
        break;
      default:
        break;
    }

    if (tabIndex === 3 && !this.isRemoved) {
      for (let i = 0; i < this.columnsData.length; i++) {
        if (this.columnsData[i].columnDef === 'itemsBaseAmount') {
          this.tempColumns = this.columnsData.splice(i, 5);
          this.isRemoved = true;
          break;
        }
      }
    } else if (this.isRemoved) {
      for (let i = 0; i < this.columnsData.length; i++) {
        if (this.columnsData[i].columnDef === 'itemsCount') {
          this.columnsData.splice(i + 1, 0, ...this.tempColumns);
          this.isRemoved = false;
          break;
        }
      }
    }

    if (this._invoiceService.invoiceListByTab[this.requestPayload.tab_filter === null ? InvoiceManagementConstant.ALL_KEY : this.requestPayload.tab_filter].data && tabIndex !== 4) {
      this.rowsData = this._invoiceService.invoiceListByTab[this.requestPayload.tab_filter === null ? InvoiceManagementConstant.ALL_KEY : this.requestPayload.tab_filter].data;
    }
  }

  /** This get the row data on tab click
   * @param  {Array<any>} requestedArray: requested tab array.
   */
  private getInvoiceRowData(requestedArray: Array<any>) {
    if (requestedArray && requestedArray.length) {
      this.rowsData = requestedArray;
    } else {
      this.clearBadgeCount();
      this._metadataService.getTabData(this.requestPayload);
    }
  }

  private isFilterAppliedOnInvoice(filter: Filter): boolean {
    const filterKeys = Object.getOwnPropertyNames(filter);
    for (let i = 0; i < filterKeys.length; i++) {
      if (this.requestPayload.filter[filterKeys[i]] !== '' && this.requestPayload.filter[filterKeys[i]] !== null) {
        return true;
      }
    }
    return false;
  }

  /**
   * To refresh data for corresponding tab.
   */
  private refreshData() {
    this.rowsData = null;
    this._invoiceService.invoiceListByTab = new InvoiceListByTab();
    this.clearBadgeCount();
    this._metadataService.getTabData(this.requestPayload);
  }

  /**
   * Action Items Selected
   * @param  {any} actionData i.e the data of invoice.
   */
  public onActionExtraButtonClick(actionData: any) {
    switch (actionData.index) {
      case 0:
        this.showLoader = true;
        const invoiceIdList: Array<string> = new Array<string>();
        if (!(this.selectedDataRows && Array.isArray(this.selectedDataRows))) {
          this.selectedDataRows = new Array<any>();
          this.selectedDataRows.push(actionData.data);
        }
        this.selectedDataRows.forEach((eachInvoiceData) => {
          invoiceIdList.push(eachInvoiceData.invoiceNumber);
        });
        if (this.requestPayload.tab_filter === InvoiceManagementConstant.RESERVED_KEY) {
          const requestPayloadReservedReport = {
            from_date: null,
            to_date: null
          };
          this.downloadInvoiceDocumentSubscription = this._invoiceService.downloadReservedInvoiceNumberReport(requestPayloadReservedReport).subscribe((response) => {
            if (response) {
              this.showLoader = false;
              if (response['errorMessage']) {
                Swal.fire('Error', response['errorMessage'], 'error');
              } else {
                this.saveToFileSystem(response, 'invoice');
              }
            }
          }, (error) => {
            this.showLoader = false;
          });
        } else {
          this.downloadInvoiceDocumentSubscription = this._invoiceService.downloadInvoiceDocument(invoiceIdList, this.requestPayload.tab_filter).subscribe((response) => {
            if (response) {
              this.showLoader = false;
              this.saveToFileSystem(response, 'invoice');
            }
          }, (error) => {
            this.showLoader = false;
          });
        }
        break;
      case 1:
        break;
      case 2:
        let mode: string;
        if (this.requestPayload.tab_filter === InvoiceManagementConstant.SUBMISSION_PENDING_KEY) {
          mode = FortigoConstant.FORM_CREATE_MODE;
        } else if (this.requestPayload.tab_filter === InvoiceManagementConstant.SUBMITTED_KEY) {
          if (RoleId.FORTIGO_FINANCE_ROLES.includes(this.roleId)) {
            mode = FortigoConstant.FORM_EDIT_MODE;
          } else {
            mode = FortigoConstant.FORM_VIEW_MODE;
          }
        }
        if (!this.isMultiInvoiceSelected) {
          this.selectedDataRows = new Array<any>();
          this.selectedDataRows.push(actionData.data);
        }
        this._dialog.open(SubmitInvoiceDateModalComponent, {
          data: {
            // multiple row selection
            rowsData: this.selectedDataRows,
            mode: mode
          }
        });
        this.reloadSubscription = this._invoiceService.invoiceDataReload.subscribe(() => this.onRefresh('none'));
        break;
      case 3:
        this.cancelInvoice(actionData);
        break;
      case 4:
        const discardInvoiceData = new InvoiceDetail();
        discardInvoiceData.invoice_number = actionData.data.invoiceNumber;
        this._dialog.open(DiscardInvoiceNumberModalComponent, {
          data: {
            invoiceNumber: actionData.data.invoiceNumber,
          }
        });
        this.reloadSubscription = this._invoiceService.invoiceDataReload.subscribe(() => this.onRefresh('none'));
        break;
      case 5:
        this.showLoader = true;
        const invoiceNumber = actionData.data.invoiceNumber;
        this._invoiceService.downloadInvoiceAcknowledgementPDF(invoiceNumber, this.requestPayload.tab_filter).subscribe((response) => {
          this.showLoader = false;
          if (response['errorCode']) {
            Swal.fire({
              title: 'Error',
              type: 'error',
              text: response['errorMessage']
            });
          } else {
            this.saveToFileSystem(response);
          }
        });
        break;
      default:
        break;
    }
  }

  /**
   * For Cancelling Invoice purpose.
   * @param  {any} invoiceData i.e the data of invoice.
   */
  private cancelInvoice(invoiceData: any) {
    this.gridConfiguration.showLoader = true;
    // REVIEW @Aashish: same subscription used for multiple url
    this.getItemsListSubscription = this._invoiceService.viewCancelInvoice({ invoice_number: invoiceData.data.invoiceNumber }).subscribe((response) => {
      if (response) {
        if (response['errorMessage']) {
          Swal.fire('Error', response['errorMessage'], 'error');
        } else {
          this.cancelModalWindow(response, invoiceData.data.invoiceNumber, invoiceData.data.source);
        }
      }
      this.gridConfiguration.showLoader = false;
    });
  }

  /**
   * To perform actions on cell click.
   * @param  {CellData} cellData : the information of cell clicked.
   */
  public onCellClick(cellData: CellData) {
    switch (cellData.action) {
      case 'click':
        this.gridConfiguration.showLoader = true;
        // REVIEW @Aashish: same subscription used for multiple url
        this.getItemsListSubscription = this._invoiceService.getItemsList(cellData.rowData.invoiceNumber, this.requestPayload.tab_filter).subscribe((response) => {
          if (response) {
            if (response['errorMessage']) {
              Swal.fire('Error', response['errorMessage'], 'error');
            } else {
              this.openModalWindow(response, cellData.action);
            }
          }
          this.gridConfiguration.showLoader = false;
        });
        break;
      case 'view':
        // FIXME @Mayur: handle column visibility though grid
        if (this.gridConfiguration.filterTabList[this.selectedTabIndex].key === InvoiceManagementConstant.RESERVED_KEY) {
          Swal.fire('Info', 'No document found', 'info');
          break;
        }
        const encodedInvoiceNumber = btoa(cellData.rowData.invoiceNumber);
        this.downloadInvoicePDFSubscription = this._invoiceService.downloadInvoicePDF(encodedInvoiceNumber).subscribe((response) => {
          this.saveToFileSystem(response);
        });
        break;
    }
  }


  /**
   * Download report and export into file
   * @param  {any} response: Response data.
   * @param action : specifies for what action
   */
  private saveToFileSystem(response: any, action?: string) {
    const contentDispositionHeader: string = response.headers.get('Content-Disposition');
    const parts: string[] = contentDispositionHeader.split(';');
    let fileName = decodeURI(parts[1].split('=')[1]);
    const blob = new Blob([response.body], { type: response.headers.get('Content-Type') });
    // fileName = fileName.replace('"', '').split('.').splice(0, fileName.split('.').length - 1).join();
    fileName = fileName.replace(/"/g, '');
    // TODO @Sanjiv: for quick fix ritesh added , asked by sanjiv
    if (action === 'invoice') {
      fileName = fileName.replace('trip', 'invoice');
    }
    saveAs(blob, fileName);
  }

  /**
   * To open pop up screen.
   * @param  {any} rowsData: rowdata
   * @param  {string} action: action event performed
   */
  private openModalWindow(rowsData: any, action: string) {
    if (action === 'click') {
      const gridConfiguration = new GridConfiguration();
      gridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
      gridConfiguration.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
      gridConfiguration.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
      gridConfiguration.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
      gridConfiguration.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
      gridConfiguration.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
      gridConfiguration.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
      gridConfiguration.css.fixedTableHeight = 'max-content';
      gridConfiguration.css.tableOverflow = 'hidden';
      this._dialog.open(InvoicingTripListComponent, {
        data: {
          rowsData: rowsData,
          column: this.getColumnsTripData(),
          gridConfiguration: gridConfiguration,
          mode: action,
          title: 'TRIPS'
        }
      });
    }
  }

  /**
   * To get trip related columns.
   * @returns Array of Columns.
   */
  private getColumnsTripData(isCancelInvoice = false): Array<Column> {
    let columnsTripData: Array<Column>;
    if (isCancelInvoice) {
      columnsTripData = [
        { columnDef: 'serviceReferenceId', headerName: 'Trip ID', dataType: DataType.String, css: { userSelect: 'text' } },
        { columnDef: 'ecShipmentLocation', headerName: 'Shipment Location', dataType: DataType.String, css: { userSelect: 'text' } },
        { columnDef: 'pickUpDate', headerName: 'Pick up Date', dataType: DataType.Date, dataFormat: DataFormat.Date, css: { horizontalAlign: 'left' } },
        { columnDef: 'fromCity', headerName: 'From City', dataType: DataType.String },
        { columnDef: 'toCity', headerName: 'To City', dataType: DataType.String },
      ];
    } else {
      columnsTripData = [
        { columnDef: 'serviceReferenceId', headerName: 'Trip ID', dataType: DataType.String, css: { userSelect: 'text' } },
        { columnDef: 'ecShipmentLocation', headerName: 'Shipment Location', dataType: DataType.String, css: { userSelect: 'text' } },
        { columnDef: 'itemAmount', headerName: 'Freight Value', dataType: DataType.Number, dataFormat: DataFormat.Currency },
        { columnDef: 'adjustmentAmount', headerName: 'Adjustments', dataType: DataType.Number, dataFormat: DataFormat.Currency },
        { columnDef: 'taxAmount', headerName: 'GST', dataType: DataType.Number, dataFormat: DataFormat.Currency },
        { columnDef: 'totalAmount', headerName: 'Total Invoice Value', dataType: DataType.Number, dataFormat: DataFormat.Currency }
      ];
    }
    return columnsTripData;
  }

  /**
   * To pop up Cancel Modal Window
   * @param  {any} rowsData: rowsData
   * @param  {string} invoiceNumber: InvoiceNumber
   * @param  {string} source ie from old world or new world
   */
  private cancelModalWindow(rowsData: any, invoiceNumber: string, source: string) {
    const gridConfiguration = new GridConfiguration();
    const cancelInvoiceData = new CancelInvoiceDetail();

    gridConfiguration.isRadioButtonEnabled = true;
    gridConfiguration.isRadioButtonAtStart = true;
    gridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
    gridConfiguration.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
    gridConfiguration.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    gridConfiguration.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    gridConfiguration.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    gridConfiguration.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    gridConfiguration.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
    gridConfiguration.css.fixedTableHeight = 'max-content';
    gridConfiguration.css.tableOverflow = 'hidden';
    cancelInvoiceData.invoice_number = invoiceNumber;
    // Commented as per request made by nethra
    // cancelInvoiceData.source = source;
    this._dialog.open(InvoicingTripListComponent, {
      width: FortigoConstant.MEDIUM_MODAL,
      data: {
        options: [{ name: InvoiceManagementConstant.DISCARD_INVOICE_NO, isDisabled: false }, { name: InvoiceManagementConstant.RESERVE_INVOICE_NO, isDisabled: false }],
        rowsData: rowsData,
        column: this.getColumnsTripData(true),
        invoiceNumber: invoiceNumber,
        gridConfiguration: gridConfiguration,
        source: source,
        title: 'CANCEL INVOICE'
      }
    });
    this._invoiceService.invoiceDataReload.subscribe(() => this.onRefresh('none'));
  }

  /**
   * Function to get grid configuration.
   */
  private getGridConfiguration() {
    this.gridConfiguration.isSortingEnabled = true;
    this.gridConfiguration.sortOrder = 'desc';
    this.gridConfiguration.sortColumnName = InvoiceManagementConstant.SORT_COLUMN;
    this.gridConfiguration.isFilterEnabled = false;
    this.gridConfiguration.disableHeaderToolTipText = false;
    this.gridConfiguration.isPaginaionEnabled = true;
    this.gridConfiguration.isCheckbox1Enabled = true;
    this.gridConfiguration.isCheckbox1AtEnd = true;
    this.gridConfiguration.isActionButtonEnabled = true;
    this.gridConfiguration.isFilterTabEnabled = true;
    this.gridConfiguration.filterTabList = [
      { label: InvoiceManagementConstant.SUBMISSION_PENDING_VALUE, key: InvoiceManagementConstant.SUBMISSION_PENDING_KEY, toolTipText: InvoiceManagementConstant.SUBMISSION_PENDING_TOOLTIP_TEXT },
      { label: InvoiceManagementConstant.SUBMITTED_VALUE, key: InvoiceManagementConstant.SUBMITTED_KEY, toolTipText: InvoiceManagementConstant.SUBMITTED_TOOLTIP_TEXT },
      { label: InvoiceManagementConstant.ZERO_RECEIVABLES_VALUE, key: InvoiceManagementConstant.ZERO_RECEIVABLES_KEY, toolTipText: InvoiceManagementConstant.ZERO_RECEIVABLES_TOOLTIP_TEXT },
      { label: InvoiceManagementConstant.ALL_VALUE, key: InvoiceManagementConstant.ALL_KEY }
    ];
    if (RoleId.FORTIGO_FINANCE_ROLES.includes(this.roleId) || RoleId.FORTIGO_READ_ONLY_USER === this.roleId) {
      this.gridConfiguration.filterTabList.splice(3, 0, ...[{ label: InvoiceManagementConstant.RESERVED_VALUE, key: InvoiceManagementConstant.RESERVED_KEY, toolTipText: InvoiceManagementConstant.RESERVED_TOOLTIP_TEXT }]);
    }
    this.statusFilterList = this.statusFilterList.concat(...this.gridConfiguration.filterTabList);
    this.gridConfiguration.isActionExtraButtonEnabled = true;
    this.gridConfiguration.css.tableRowHeight = InvoiceManagementConstant.TABLE_ROW_HEIGHT;
    this.gridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfiguration.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
    this.setActionButton(0);
  }

  /**
   * To set actions in Action items.
   * @param  {number} tabIndex
   */
  private setActionButton(tabIndex: number) {
    this.gridConfiguration.actionExtraButtonLabelList = new Array<RightClickMenu>();
    this.clearActionItemsEnableConfiguration();

    switch (tabIndex) {
      case 0:
      case 4:
      case 1:
        this.actionItemsDisableConfiguration.isSettleDisabled = true;
        this.actionItemsDisableConfiguration.isDiscardInvoiceDisabled = true;
        break;
      case 2:
        this.actionItemsDisableConfiguration.isDiscardInvoiceDisabled = true;
        break;
      case 3:
        this.actionItemsDisableConfiguration.isSettleDisabled = true;
        this.actionItemsDisableConfiguration.isCaptureInvoiceSubmissionDisabled = true;
        this.actionItemsDisableConfiguration.isCancelInvoiceDisabled = true;
        this.actionItemsDisableConfiguration.isDownloadInvoiceAcknowledgementDisabled = true;
        break;
      default:
        break;
    }
    this.applyRoleBasedActions(this.roleId, tabIndex);

    this.applyActionItemsConfiguration(tabIndex);
  }

  /**
   * Saving the response into blob.
   * @param  {any} data data to be saved
   * @param  {string} fileName i.e. the name of file.
   */
  private saveAsBlob(data: any, fileName: string) {
    const blob = new Blob([data.body], { type: 'application/vnd.ms-excel' });
    const file = new File([blob], fileName, { type: 'application/vnd.ms-excel' });

    saveAs(file);
  }

  /**
   * To create filter fields.
   */
  private getFilterFields() {
    this.groups = [{ id: 1, title: '' }, { id: 2, title: 'Invoice Date' }, { id: 3, title: '' }];
    const invoiceFilter = this._invoiceService.invoiceFilter;
    const customerList = invoiceFilter.endCustomerList;
    const customerListOption = new SelectOption('name', 'id', customerList);
    const customerName = new SearchableSelectInputField('Customer Name', 'customerName', customerListOption, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 1);

    const invoiceDateFrom = new DateInputField('From', 'invoiceDateFrom', 6, false, undefined, undefined, undefined, undefined, 2);
    const invoiceDateTo = new DateInputField('To', 'invoiceDateTo', 6, false, undefined, undefined, undefined, undefined, 2);

    const accountManagerList = invoiceFilter.accountManagerList;
    const accountManagerListOption = new SelectOption('accountManagerName', 'accountManagerId', accountManagerList);
    const accountManager = new SearchableSelectInputField('Account Manager', 'accountManager', accountManagerListOption, 6, undefined, false, undefined, undefined, undefined, undefined, undefined, undefined, 3);

    const collectionManagerList = invoiceFilter.collectionManagerList;
    const collectionManagerListOption = new SelectOption('name', 'id', collectionManagerList);
    const collectionManager = new SearchableSelectInputField('Collection Manager', 'collectionManager', collectionManagerListOption, 6, undefined, false, undefined, undefined, undefined, undefined, undefined, undefined, 3);

    this.getProcessedInternalCustomerList();
    const invoicingEntityListOption = new SelectOption('name', 'stringId', invoiceFilter.internalCustomerList);
    const invoicingEntity = new SelectInputField('Invoicing Entity', 'servicedBy', invoicingEntityListOption, 6, false, undefined, undefined, undefined, undefined, 3);

    const invoicingStatusListOption = new SelectOption('name', 'status', invoiceFilter.invoicingStatus);
    const invoicingStatus = new SelectInputField('Invoice Status', 'invoicingStatus', invoicingStatusListOption, 6, false, undefined, undefined, undefined, undefined, 3);

    this.filterFields =
      [customerName, invoiceDateFrom, invoiceDateTo, accountManager, collectionManager, invoicingEntity, invoicingStatus];
  }

  /**
   * This function gives Internal company List - abbreviated
   */
  private getProcessedInternalCustomerList() {
    if (this._invoiceService.invoiceFilter.internalCustomerList && Array.isArray(this._invoiceService.invoiceFilter.internalCustomerList)) {
      this._invoiceService.invoiceFilter.internalCustomerList.forEach((cusName) => {
        switch (cusName.name) {
          case 'FNLPL Net Partner':
          case FortigoConstant.FNLPL_VALUE:
            cusName.name = 'FNLPL';
            break;
          case '(FTAPL) Fortigo Transport Agency Pvt. Ltd':
          case FortigoConstant.FTAPL_VALUE:
            cusName.name = 'FTAPL';
            break;
        }
      });
    }
  }

  /**
   * For onRefresh purpose.
   */
  public onRefresh(refreshMode: RefreshMode = 'all') {
    this.clearSearchAndRefresh(refreshMode);

    if (this.reloadSubscription) {
      this.reloadSubscription.unsubscribe();
    }

    this.refreshData();
  }

  /**
   * This function clears Search and Rerfresh data for request payload
   */
  private clearSearchAndRefresh(refreshMode: RefreshMode) {
    this.clearMultiInvoiceSelection();

    switch (refreshMode) {
      case 'all':
        if (this.requestPayload.search_text) {
          this.requestPayload.search_text = '';
        }
        this.getFilterFields();
        this.requestPayload.filter = new Filter();
        this.showFilterApplied = false;
        this._invoiceService.clearFilterTabData();
        break;
      case 'filter':
        this.getFilterFields();
        this.requestPayload.filter = new Filter();
        this.showFilterApplied = false;
        break;
      case 'search':
        if (this.requestPayload.search_text) {
          this.requestPayload.search_text = '';
        }
        break;
      case 'none':
        break;
      default:
        break;
    }
  }

  /**
   * Clearing the multiple selection on data refresh.
   */
  private clearMultiInvoiceSelection() {
    this.selectedDataRows = [];
    this.isMultiInvoiceSelected = false;
  }

  /**
   * Function to create columns for the grid.
   */
  private getColumnData() {
    this.columnsData = [
      { columnDef: 'invoiceNumber', headerName: 'Invoice Number', dataType: DataType.String, css: { userSelect: 'text' }, disableHeaderToolTipText: true },
      { columnDef: 'invoiceDate', headerName: 'Invoice Date', dataType: DataType.Date, dataFormat: DataFormat.Date, disableHeaderToolTipText: true },
      { columnDef: 'customerName', headerName: 'Customer Name', dataType: DataType.String, disableHeaderToolTipText: true },
      { columnDef: 'invoicingEntity', headerName: 'Invoicing Entity', dataType: DataType.String, disableHeaderToolTipText: true },
      { columnDef: 'accountManager', headerName: 'Account Manager', dataType: DataType.String, disableHeaderToolTipText: true },
      { columnDef: 'collectionManager', headerName: 'Collection Manager', dataType: DataType.String, disableHeaderToolTipText: true },
      { columnDef: 'billToEntity', headerName: 'Bill To', dataType: DataType.String, title: 'Name & GSTIN', innerCells: 2 },
      { columnDef: 'serviceInvoiceBillingType', headerName: 'Trip Type', dataType: DataType.String },
      { columnDef: 'itemsCount', headerName: 'No. Of Trips', dataType: DataType.Number, action: 'click', disableHeaderToolTipText: true },
      { columnDef: 'baseAmount', headerName: 'Base Amount', dataType: DataType.Number, dataFormat: DataFormat.Currency, headerCalculatedDataType: CalculationDataType.Sum, disableHeaderToolTipText: true, dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
      { columnDef: 'taxAmount', headerName: 'GST', dataType: DataType.Number, dataFormat: DataFormat.Currency, headerCalculatedDataType: CalculationDataType.Sum, disableHeaderToolTipText: true, dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
      { columnDef: 'invoiceAmount', headerName: 'Invoice Amount', dataType: DataType.Number, dataFormat: DataFormat.Currency, headerCalculatedDataType: CalculationDataType.Sum, disableHeaderToolTipText: true, dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
      { columnDef: 'invoiceSubmissionDate', headerName: 'Submitted', dataType: DataType.Date, dataFormat: DataFormat.Date, css: { horizontalAlign: 'center' }, title: 'Invoice Submission Date', disableHeaderToolTipText: false, innerCells: 2, width: '80px' },
      { columnDef: 'invoiceSubmissionEnteredOn', headerName: 'Entered', dataType: DataType.Date, dataFormat: DataFormat.Date, css: { horizontalAlign: 'center', textColor: 'dark-greyish-magenta', fontWeight: 'lighter', fontSize: 'smaller' }, title: 'Invoice Entered On', disableHeaderToolTipText: false },
      { columnDef: 'invoiceStatus', headerName: 'Status', dataType: DataType.String, dataFormat: DataFormat.Title, title: 'Invoice Status', disableHeaderToolTipText: false },
      { columnDef: 'downloadInvoice', headerName: 'Invoice Download', dataType: DataType.String, action: 'view', css: { horizontalAlign: 'center' }, disableHeaderToolTipText: false }
    ];
  }

  /**
   * To enable all the action items present in right click menu.
   */
  private clearActionItemsEnableConfiguration() {
    this.actionItemsDisableConfiguration = {
      isdownloadInvoiceDataDisabled: false,
      isSettleDisabled: false,
      isCaptureInvoiceSubmissionDisabled: false,
      isCancelInvoiceDisabled: false,
      isDiscardInvoiceDisabled: false,
      isDownloadInvoiceAcknowledgementDisabled: false,
      isReservedReportDisabled: false
    };
  }

  /**
   * To apply role based actions on invoice action items.
   */
  private applyRoleBasedActions(roleId: number, tabIndex: number) {
    switch (roleId) {
      case RoleId.FBO_TEAM_MEMBER:
        this.actionItemsDisableConfiguration.isCancelInvoiceDisabled = true;
        break;

      case RoleId.SALES_MANAGER:
      case RoleId.OPERATION_MANAGER:
      case RoleId.SALES_MANAGER_PAYMENT_AUTHORIZED:
      case RoleId.OPERATION_MANAGER_PAYMENT_AUTHORIZED:
      case RoleId.OPERATION_MANAGER_SYSTEM:
      case RoleId.REGIONAL_MANAGER:
        this.actionItemsDisableConfiguration.isSettleDisabled = true;
        this.actionItemsDisableConfiguration.isCancelInvoiceDisabled = true;
        this.actionItemsDisableConfiguration.isDiscardInvoiceDisabled = true;
        break;

      case RoleId.FORTIGO_READ_ONLY_USER:
        this.actionItemsDisableConfiguration.isSettleDisabled = true;
        this.actionItemsDisableConfiguration.isCaptureInvoiceSubmissionDisabled = true;
        this.actionItemsDisableConfiguration.isCancelInvoiceDisabled = true;
        this.actionItemsDisableConfiguration.isDiscardInvoiceDisabled = true;
        break;

      default:
        break;
    }
  }

  /**
   * To apply the configuration i.e. enabling or disabling the action item as per user login.
   */
  private applyActionItemsConfiguration(tabIndex: number) {
    if (tabIndex === 3) {
      this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Download Reserved Report', 'sideMenudownloadInvoiceData', this.actionItemsDisableConfiguration.isReservedReportDisabled, 'save_alt'));
    } else {
      this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Export to Excel', 'sideMenudownloadInvoiceData', this.actionItemsDisableConfiguration.isdownloadInvoiceDataDisabled, 'save_alt'));
    }
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Settle', 'sideMenuSettle', this.actionItemsDisableConfiguration.isSettleDisabled, 'done_all'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Capture Invoice Submission', 'sideMenuCaptureInvoiceSubmission', this.actionItemsDisableConfiguration.isCaptureInvoiceSubmissionDisabled, 'drafts'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Cancel Invoice', 'sideMenuCancelInvoice', this.actionItemsDisableConfiguration.isCancelInvoiceDisabled, 'clear'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Discard Invoice #', 'sideMenuDiscardInvoice', this.actionItemsDisableConfiguration.isDiscardInvoiceDisabled, 'delete_sweep'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Download Invoice Acknowledgement', 'sideMenuDownloadInvoiceAcknowledgement', this.actionItemsDisableConfiguration.isDownloadInvoiceAcknowledgementDisabled, 'attachment'));
  }

  /**
   * Method used to get the request payload for listing Invoice data.
   * @returns InvoiceListRequestPayload
   */
  private getRequestPayload() {
    this.requestPayload.tab_filter = InvoiceManagementConstant.SUBMISSION_PENDING_KEY;
    this.requestPayload.search_text = '';
    this.requestPayload.filter = new Filter();
  }

  /**
   * On filter submission
   * @param  {any} filterForm
   */
  public submitFilterForm(filterForm: any) {
    this.showFilterApplied = true;
    this.rowsData = null;
    this.requestPayload.filter = this.createFilterData(filterForm);
  }

  /**
   * To create filter data familiar to request payload of filter.
   * @param  {any} filterForm : data corresponding to each filter field i.e. to be submited.
   */
  private createFilterData(filterForm: any): any {
    const filterKeys = Object.getOwnPropertyNames(filterForm);
    filterKeys.forEach((eachkey) => {
      filterForm[eachkey] = filterForm[eachkey] === '' ? null : filterForm[eachkey];
      if (['invoiceDateFrom', 'invoiceDateTo'].toString().includes(eachkey) && filterForm[eachkey]) {
        filterForm[eachkey] = filterForm[eachkey].format(FortigoConstant.FILTER_DATE_FORMAT);
      }
    });
    return filterForm;
  }

  /**
   * To clear the filter fields.
   */
  public filterClearClicked() {
    let isFilterApplied = false;
    Object.getOwnPropertyNames(this.requestPayload.filter).forEach((eachProperty) => {
      if (this.requestPayload.filter[eachProperty] !== null) {
        isFilterApplied = true;
      }
    });
    if (isFilterApplied) {
      this.onRefresh('filter');
    }
  }

  /**
   * To Apply search in all tab when search input comes with comma seperated values. 
   */
  public applySearchOnAllTab() {
    this.hasMultiSearch = true;
    this.selectedTabIndex = 4;
    this.onGridFilterTabSelection(this.selectedTabIndex);
  }

  /**
   * Method for selecting multiple line items in grid.
   * @param  {Array<any>} selectedData : data related to the invoice selected.
   */
  public onCheckboxSelection(selectedData: Array<any>) {
    this.selectedDataRows = selectedData;

    if (this.selectedDataRows.length > 1) {
      this.isMultiInvoiceSelected = true;
    } else {
      this.isMultiInvoiceSelected = false;
    }
  }

}
