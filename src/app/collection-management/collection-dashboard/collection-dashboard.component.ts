/*
 * Created on Mon Feb 04 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';

import { SelectInputField, SelectOption, DateInputField, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { FortigoButton } from 'src/app/shared/abstracts/button.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { CollectionModalComponent } from '../modals/collection-modal/collection-modal.component';
import { FortigoConstant, RoleId } from 'src/app/core/constants/FortigoConstant';
import { Column, DataFormat, CalculationDataType, DataType, DataCalculationFormat } from 'src/app/shared/models/column.model';
import { CollectionService } from '../services/collection/collection.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { CollectionManagementConstant } from '../constants/CollectionManagementConstant';
import { MetadataService } from '../services/metadata/metadata.service';
import { AutoUnsubscribe } from 'src/app/shared/decorators/auto-unsubscribe.decorator';
import { CollectionListRequestPayload, Filter } from '../models/collection-list-request-payload.model';
import { RightClickMenu } from 'src/app/shared/models/right-click-menu.model';
import { ActionItemsDisableConfiguration } from '../models/collection-list-request-payload.model';
import { Util } from 'src/app/core/abstracts/util';
import { FieldGroup } from 'src/app/shared/models/field-group.model';
import { Style } from 'src/app/shared/models/style.model';
import { CollectionListByTab } from '../models/collection-list-by-tab.model';

type RefreshMode = 'search' | 'filter' | 'all' | 'none';

@Component({
  selector: 'app-collection-dashboard',
  templateUrl: './collection-dashboard.component.html',
  styleUrls: ['./collection-dashboard.component.css'],
  providers: [DatePipe]
})
@AutoUnsubscribe()
export class CollectionDashboardComponent implements OnInit {

  /**
   * Request payload for collection dashboard component
   */
  public requestPayload: CollectionListRequestPayload;

  /**
   * Page title of collection dashboard component
   */
  public pageTitle: string;

  /**
   * Header Style of collection dashboard component
   */
  public headerStyle: Style;

  /**
   * Filter fields of collection dashboard component
   */
  public filterFields: Array<any>;

  /**
   * Columns data of collection dashboard component
   */
  public columnsData: Array<Column>;
  public tempColumns: Array<Column>;

  /**
   * Buttons of fortigo head
   */
  public buttons: Array<FortigoButton>;
  public collectionIds: Array<string> = [];
  public data: any;
  public selectedTabIndex: number;
  public rowsData: Array<any>;
  public gridConfiguration: GridConfiguration = new GridConfiguration();
  public filterFontSize: number;
  public searchRegexPatternCollections = CollectionManagementConstant.SEARCH_REGEX_PATTERN;
  public searchTextMaxLength = CollectionManagementConstant.SEARCH_TEXT_MAX_LENGTH;
  public showFilterApplied = false;
  public collectionFilterGroup: Array<FieldGroup>;

  private selectedDataRows: Array<any> = [];
  private paymentLocation: SearchableSelectInputField;
  private locationSearchOptions: SelectOption;
  // Extra buttons for data grid.
  private actionItemsDisableConfiguration: ActionItemsDisableConfiguration = new ActionItemsDisableConfiguration();
  private roleId: number;

  private isMultiTripSelected: boolean;

  private metadataSubscription: Subscription;
  private refreshSubscription: Subscription;

  constructor(
    private _title: Title,
    private _dialog: MatDialog,
    private _activatedRoute: ActivatedRoute,
    public _collectionService: CollectionService,
    private _metadataService: MetadataService,
    private _loginControlV2Service: LoginControlV2Service,
    private _datePipe: DatePipe) {
    this.requestPayload = new CollectionListRequestPayload();
  }

  ngOnInit() {
    this.setDefaultTab();

    this.buttons = new Array<FortigoButton>();
    this.roleId = Number.parseInt(this._loginControlV2Service.roleId.toString());

    this.createHeadButton();
    if (this._collectionService.refresh) {
      this.refreshSubscription = this._collectionService.refresh.subscribe((id: any) => {
        if (id) {
          this._dialog.open(CollectionModalComponent, {
            data: { modalMode: 'appropriate', collectionId: id, dataSource: 'platform', index: 1 },
            maxWidth: '100%',
            width: '100%'
          });
        }
        // Refresh grid data.
        this.rowsData = null;
        this._metadataService.getTabData(this.requestPayload, true);
      });
    }
    this.headerStyle = new Style();
    this.headerStyle.height = '38px';

    this.pageTitle = this._activatedRoute.snapshot.data['title'];
    this._title.setTitle(this._activatedRoute.snapshot.data['title']);

    this.getFilterFields();
    this.filterFontSize = FortigoConstant.FONT_SMALL;

    this.getColumnData();
    this.getGridConfiguration();
    this.addReceiptControl();
    this.changeColumnView(0);

    this.setTabData();
    this.setBadgeCount();
  }

  /**
   * This method load the tab data based on user login.
   */
  private setDefaultTab() {
    this.roleId = Number.parseInt(this._loginControlV2Service.roleId.toString());
    if (this.isFinanceLoggedIn()) {
      this.selectedTabIndex = 3;
    } else if (this.roleId === RoleId.FORTIGO_READ_ONLY_USER) {
      this.selectedTabIndex = 0;
    } else {
      this.selectedTabIndex = 2;
    }
  }

  private setTabData() {
    this.rowsData = null;

    if (this.selectedTabIndex === 0) {
      this.requestPayload.tab_filter = this.gridConfiguration.filterTabList[this.selectedTabIndex].key;
      if (this._collectionService.collectionListByTab[this.gridConfiguration.filterTabList[this.selectedTabIndex].key].data) {
        this.rowsData = this._collectionService.collectionListByTab[this.gridConfiguration.filterTabList[this.selectedTabIndex].key].data;
        this.setBadgeCount();
      }
    }

    this._metadataService.filterTabLoaderSubject.subscribe((data: any) => {
      if (this.requestPayload.tab_filter === data.filter) {
        if (this._collectionService.collectionListByTab[this.requestPayload.tab_filter].data) {
          this.rowsData = this._collectionService.collectionListByTab[this.requestPayload.tab_filter].data;
          this.setBadgeCount();
        } else {
          if (this._collectionService.collectionListByTab[this.requestPayload.tab_filter]['errorMessage']) {
            this.gridConfiguration.customFooterMessage = this._collectionService.collectionListByTab[this.requestPayload.tab_filter]['errorMessage'];
            this.rowsData = [];
          }
        }
      }
    });
  }

  private setBadgeCount() {
    if (this.gridConfiguration.filterTabList[CollectionManagementConstant.COLLECTION_TAB_DATA.cheque_received]) {
      this.gridConfiguration.filterTabList[CollectionManagementConstant.COLLECTION_TAB_DATA.cheque_received].badge = this._collectionService.collectionListByTab.cheque_received.count;
    }
    if (this.gridConfiguration.filterTabList[CollectionManagementConstant.COLLECTION_TAB_DATA.requested]) {
      this.gridConfiguration.filterTabList[CollectionManagementConstant.COLLECTION_TAB_DATA.requested].badge = this._collectionService.collectionListByTab.requested.count;
    }
    if (this.gridConfiguration.filterTabList[CollectionManagementConstant.COLLECTION_TAB_DATA.suspense]) {
      this.gridConfiguration.filterTabList[CollectionManagementConstant.COLLECTION_TAB_DATA.suspense].badge = this._collectionService.collectionListByTab.suspense.count;
    }
    if (this.gridConfiguration.filterTabList[CollectionManagementConstant.COLLECTION_TAB_DATA.approved]) {
      this.gridConfiguration.filterTabList[CollectionManagementConstant.COLLECTION_TAB_DATA.approved].badge = this._collectionService.collectionListByTab.approved.count;
    }
    if (this.gridConfiguration.filterTabList[CollectionManagementConstant.COLLECTION_TAB_DATA.rejected]) {
      this.gridConfiguration.filterTabList[CollectionManagementConstant.COLLECTION_TAB_DATA.rejected].badge = this._collectionService.collectionListByTab.rejected.count;
    }
    if (this.gridConfiguration.filterTabList[CollectionManagementConstant.COLLECTION_TAB_DATA.appropriated]) {
      this.gridConfiguration.filterTabList[CollectionManagementConstant.COLLECTION_TAB_DATA.appropriated].badge = this._collectionService.collectionListByTab.appropriated.count;
    }
    if (this.gridConfiguration.filterTabList[CollectionManagementConstant.COLLECTION_TAB_DATA.all]) {
      this.gridConfiguration.filterTabList[CollectionManagementConstant.COLLECTION_TAB_DATA.all].badge = this._collectionService.collectionListByTab.all.count;
    }
  }

  /**
   * Set datagrid configuration.
   */
  private getGridConfiguration() {
    this.gridConfiguration.uniqueColumnName = CollectionManagementConstant.UNIQUE_COLUMN_COLLECTION;
    this.gridConfiguration.isCheckbox1Enabled = true;
    this.gridConfiguration.isCheckbox1AtEnd = true;
    this.gridConfiguration.css.tableRowHeight = '25px';
    this.gridConfiguration.disableCalcHeaderToolTipText = true;
    this.gridConfiguration.isSortingEnabled = true;
    this.gridConfiguration.isActionExtraButtonEnabled = true;
    this.gridConfiguration.defaultPageSize = 25;
    this.gridConfiguration.isActionButtonEnabled = true;
    this.gridConfiguration.sortOrder = 'desc';
    this.gridConfiguration.css.tableFont = CollectionManagementConstant.FONT_SMALL + 'px';
    this.gridConfiguration.sortColumnName = CollectionManagementConstant.SORT_COLUMN;
    this.gridConfiguration.isFilterTabEnabled = true;
    this.gridConfiguration.disableRowToolTipText = false;
    this.gridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfiguration.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.filterTabList = [
      { label: CollectionManagementConstant.CLAIMED_CHEQUE_RECEIVED_VALUE, key: CollectionManagementConstant.CLAIMED_CHEQUE_RECEIVED_KEY },
      { label: CollectionManagementConstant.CLAIMED_CLAIMED_VALUE, key: CollectionManagementConstant.CLAIMED_REQUESTED_KEY },
      { label: CollectionManagementConstant.CLAIMED_SUSPENSE_VALUE, key: CollectionManagementConstant.CLAIMED_SUSPENSE_KEY },
      { label: CollectionManagementConstant.CLAIMED_ENCASHED_VALUE, key: CollectionManagementConstant.CLAIMED_ENCASHED_KEY },
      { label: CollectionManagementConstant.APPROPRIATION_REJECTED_VALUE, key: CollectionManagementConstant.APPROPRIATION_REJECTED_KEY },
      { label: CollectionManagementConstant.APPROPRIATION_APPROPRIATED_VALUE, key: CollectionManagementConstant.APPROPRIATION_APPROPRIATED_KEY },
      { label: CollectionManagementConstant.ALL_VALUE, key: CollectionManagementConstant.ALL_KEY }
    ];
    this.clearActionItemsEnableConfiguration();
    if (this.roleId !== RoleId.FORTIGO_READ_ONLY_USER) {
      this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = false;
      this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = false;
    } else {
      this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = true;
      this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = true;
    }
    this.applyActionItemsConfiguration();
  }

  /**
   * To enable all the action items present in right click menu. CLAIMED_CHECK_RECEIVED_KEY
   */
  private clearActionItemsEnableConfiguration() {
    this.gridConfiguration.actionExtraButtonLabelList = new Array<RightClickMenu>();
    this.actionItemsDisableConfiguration = new ActionItemsDisableConfiguration();
    this.isFinanceLoggedIn() ? this.actionItemsDisableConfiguration.isValidateCollectionDataDisabled = false : this.actionItemsDisableConfiguration.isValidateCollectionDataDisabled = true;
  }

  /**
   * To apply the configuration i.e. enabling or disabling the action item as per user login.
   */
  private applyActionItemsConfiguration() {
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Edit Receipt', 'sideMenuEditCollectionData', this.actionItemsDisableConfiguration.isEditCollectionDataDisabled, 'edit'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('View Receipt', 'sideMenuViewCollectionData', this.actionItemsDisableConfiguration.isViewCollectionDataDisabled, 'visibility'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Delete Receipt', 'sideMenuDeleteReceiptData', this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled, 'delete'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Validate Receipt', 'sideMenuValidateReceiptData', this.actionItemsDisableConfiguration.isValidateCollectionDataDisabled, 'receipt'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Appropriate', 'sideMenuAppropriateData', this.actionItemsDisableConfiguration.isAppropriateCollectionDataDisabled, 'spellcheck'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('View Appropriation', 'sideMenuViewAppropriationData', this.actionItemsDisableConfiguration.isViewAppropriateCollectionDataDisabled, 'visibility'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Reverse Appropriation', 'sideMenuReverseAppropriationData', this.actionItemsDisableConfiguration.isReverseAppropriateCollectionDataDisabled, 'undo'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Download Receipt Data', 'sideMenuDownloadCollectionData', this.actionItemsDisableConfiguration.isdownloadCollectionDataDisabled, 'save_alt'));
  }

  /**
   * Add columns for data grid
   */
  private getColumnData() {
    this.columnsData = [
      { columnDef: 'collectionEntryDate', headerName: 'Entered On', innerCells: 2, dataType: DataType.Date, dataFormat: DataFormat.LocalDate, disableRowToolTipText: true },
      { columnDef: 'createdByName', headerName: 'Entered By' },
      { columnDef: 'senderCompanyName', headerName: 'EC Name', innerCells: 2, width: '200px', disableRowToolTipText: true },
      { columnDef: 'paymentLocationName', headerName: 'Payment Location', disableRowToolTipText: true },
      { columnDef: 'collectionManagerName', headerName: 'Collection Manager', innerCells: 1, disableRowToolTipText: true },
      { columnDef: 'transactionMode', headerName: 'Mode', innerCells: 1, width: '10px', disableRowToolTipText: true, dataFormat: DataFormat.Title },
      { columnDef: 'receiverAccountName', headerName: 'Deposited Into', innerCells: 1, disableRowToolTipText: true },
      { columnDef: 'referenceNumber', headerName: 'Reference Number', innerCells: 2, rowToolTipTextFormat: DataFormat.Title, width: '150px', dataFormat: DataFormat.BigTextWithCopy, css: { horizontalAlign: 'center', userSelect: 'text' } },
      { columnDef: 'transactionDate', headerName: 'Date Of Instrument', css: { horizontalAlign: 'center' }, dataType: DataType.Date, dataFormat: DataFormat.LocalDate, disableRowToolTipText: true },
      { columnDef: 'netAmount', headerName: 'Amount', innerCells: 2, dataFormat: DataFormat.Currency, css: { textColor: 'blue', fontWeight: 'bold' }, dataType: DataType.Number, headerCalculatedDataType: CalculationDataType.Sum, disableRowToolTipText: true, dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
      { columnDef: 'tdsAmount', headerName: 'TDS', dataFormat: DataFormat.Currency, dataType: DataType.Number, headerCalculatedDataType: CalculationDataType.Sum, disableRowToolTipText: true, dataCalculationFormat: DataCalculationFormat.CurrencyInLac, css: { textColor: 'blue' } },
      { columnDef: 'nonTripDeduction', headerName: 'Non Trip Deductions', innerCells: 2, dataType: DataType.Number, css: { textColor: 'blue' }, dataFormat: DataFormat.Currency, headerCalculatedDataType: CalculationDataType.Sum, width: '30px', disableRowToolTipText: true, dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
      { columnDef: 'tripDeduction', headerName: 'Trip Deductions', dataType: DataType.Number, css: { textColor: 'blue' }, dataFormat: DataFormat.Currency, headerCalculatedDataType: CalculationDataType.Sum, disableRowToolTipText: true, dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
      { columnDef: 'collectionStatus', headerName: 'Claim Status', disableRowToolTipText: true },
      { columnDef: 'encashmentStatus', headerName: 'Encashment Status', dataFormat: DataFormat.Title, disableRowToolTipText: true },
      { columnDef: 'encashmentDate', headerName: 'Encashment Date', css: { horizontalAlign: 'center' }, dataType: DataType.Date, dataFormat: DataFormat.LocalDate, disableRowToolTipText: true, innerCells: 2 },
      { columnDef: 'appropriationStatus', headerName: 'Appropriation Status', css: { horizontalAlign: 'center' }, dataFormat: DataFormat.Title, width: '10px', disableRowToolTipText: true }
    ];
  }

  /**
   * This method check if finance user is login.
   */
  private isFinanceLoggedIn() {
    if (RoleId.FORTIGO_FINANCE_ROLES.includes(this.roleId)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Add receipt control
   */
  private addReceiptControl() {
    if (this.roleId !== RoleId.FORTIGO_READ_ONLY_USER) {
      this.buttons.push(new FortigoButton('Receipt'));
    }
  }

  /**
   * Method used to perform submission of filter.
   * @param  {any} filterForm : data corresponding to each filter field i.e. to be submited.
   */
  public submitFilterForm(filterForm: any) {
    filterForm.dateFrom = filterForm.dateFrom ? this.changeDateFormat(filterForm.dateFrom) : null;
    filterForm.dateTo = filterForm.dateTo ? this.changeDateFormat(filterForm.dateTo) : null;
    filterForm.dateFrom = filterForm.dateFrom !== 'NaN-0NaN-0NaN' ? filterForm.dateFrom : null;
    filterForm.dateTo = filterForm.dateTo !== 'NaN-0NaN-0NaN' ? filterForm.dateTo : null;
    filterForm.collectionManagerId = filterForm.collectionManagerId ? filterForm.collectionManagerId.toString() : null;
    filterForm.appropriationStatus = filterForm.appropriationStatus ? filterForm.appropriationStatus : null;
    filterForm.claimStatus = filterForm.claimStatus ? filterForm.claimStatus : null;
    filterForm.depositedBank = filterForm.depositedBank ? filterForm.depositedBank : null;
    filterForm.ecCustomerId = filterForm.ecCustomerId ? filterForm.ecCustomerId : null;
    filterForm.transactionMode = filterForm.transactionMode ? filterForm.transactionMode : null;
    filterForm.paymentLocation = filterForm.paymentLocation ? filterForm.paymentLocation : null;

    this.showFilterApplied = true;
    this.requestPayload.filter = filterForm;

    this.refreshData();
  }

  /**
   * Set receipt form fields
   */
  private getFilterFields() {
    this.collectionFilterGroup = [{ id: 1, title: 'Instrument Date' }, { id: 2, title: 'Customer Details' }, { id: 3, title: '' }, { id: 4, title: 'Instrument Details' }, { id: 5, title: 'Status' }];
    const modeOfReceiptOptionsList = Array<{ name: string, key: string }>();
    modeOfReceiptOptionsList.push({ name: CollectionManagementConstant.MODE_CHEQUE_VALUE, key: CollectionManagementConstant.MODE_CHEQUE_KEY });
    modeOfReceiptOptionsList.push({ name: CollectionManagementConstant.MODE_PDC_VALUE, key: CollectionManagementConstant.MODE_PDC_KEY });
    modeOfReceiptOptionsList.push({ name: CollectionManagementConstant.MODE_UPI_VALUE, key: CollectionManagementConstant.MODE_UPI_KEY });
    modeOfReceiptOptionsList.push({ name: CollectionManagementConstant.MODE_NEFT_VALUE, key: CollectionManagementConstant.MODE_NEFT_KEY });
    modeOfReceiptOptionsList.push({ name: CollectionManagementConstant.MODE_IMPS_VALUE, key: CollectionManagementConstant.MODE_IMPS_KEY });
    modeOfReceiptOptionsList.push({ name: CollectionManagementConstant.MODE_DD_VALUE, key: CollectionManagementConstant.MODE_DD_KEY });
    modeOfReceiptOptionsList.push({ name: CollectionManagementConstant.MODE_ONLINE_VALUE, key: CollectionManagementConstant.MODE_ONLINE_KEY });
    modeOfReceiptOptionsList.push({ name: CollectionManagementConstant.MODE_CASH_VALUE, key: CollectionManagementConstant.MODE_IMPS_KEY });
    modeOfReceiptOptionsList.push({ name: CollectionManagementConstant.MODE_OTHERS_VALUE, key: CollectionManagementConstant.MODE_OTHERS_KEY });

    const accountDepositedIntoOptionsList = [
      { branchName: 'ICICI Bank (FTAPL) (004705014491)', accountNumber: '004705014491' },
      { branchName: 'ICICI Bank (FNLPL) (004705010988)', accountNumber: '004705010988' },
      { branchName: 'Federal Bank (FTAPL) (21990200001359)', accountNumber: '21990200001359' },
      { branchName: 'Federal Bank (FNLPL) (11040200027319)', accountNumber: '11040200027319' },
      { branchName: 'Federal Bank (Nodal Ac) (21990200000963)', accountNumber: '21990200000963' },
      { branchName: 'Jana Bank (FNLPL) (4536020000123715)', accountNumber: '4536020000123715' },
    ];

    const claimStatusOptionsList = Array<{ name: string, key: string }>();
    claimStatusOptionsList.push({ name: CollectionManagementConstant.CLAIMED_CHEQUE_RECEIVED_VALUE, key: CollectionManagementConstant.CLAIMED_CHEQUE_RECEIVED_KEY });
    claimStatusOptionsList.push({ name: CollectionManagementConstant.CLAIMED_REQUESTED_VALUE, key: CollectionManagementConstant.CLAIMED_REQUESTED_KEY });
    claimStatusOptionsList.push({ name: CollectionManagementConstant.CLAIMED_ENCASHED_VALUE, key: CollectionManagementConstant.CLAIMED_ENCASHED_KEY });
    claimStatusOptionsList.push({ name: CollectionManagementConstant.CLAIMED_REJECTED_VALUE, key: CollectionManagementConstant.CLAIMED_REJECTED_KEY });
    claimStatusOptionsList.push({ name: CollectionManagementConstant.CLAIMED_SUSPENSE_VALUE, key: CollectionManagementConstant.CLAIMED_SUSPENSE_KEY });
    claimStatusOptionsList.push({ name: CollectionManagementConstant.CLAIMED_LOCATION_NA_VALUE, key: CollectionManagementConstant.CLAIMED_LOCATION_NA_KEY });

    const appropriationStatusOptionsList = Array<{ name: string, key: string }>();
    appropriationStatusOptionsList.push({ name: CollectionManagementConstant.APPROPRIATION_ENCASHED_VALUE, key: CollectionManagementConstant.APPROPRIATION_ENCASHED_KEY });
    appropriationStatusOptionsList.push({ name: CollectionManagementConstant.APPROPRIATION_REJECTED_VALUE, key: CollectionManagementConstant.APPROPRIATION_REJECTED_KEY });
    appropriationStatusOptionsList.push({ name: CollectionManagementConstant.APPROPRIATION_DELETED_VALUE, key: CollectionManagementConstant.APPROPRIATION_DELETED_KEY });
    appropriationStatusOptionsList.push({ name: CollectionManagementConstant.APPROPRIATION_PARTIALLY_APPROPRIATED_VALUE, key: CollectionManagementConstant.APPROPRIATION_PARTIALLY_APPROPRIATED_KEY });
    appropriationStatusOptionsList.push({ name: CollectionManagementConstant.APPROPRIATION_APPROPRIATED_VALUE, key: CollectionManagementConstant.APPROPRIATION_APPROPRIATED_KEY });

    const searchOptions = new SelectOption('name', 'stringId', this._collectionService.collectionFilter.ecCompanyList);
    const customerName = new SearchableSelectInputField('EC Name', 'ecCustomerId', searchOptions, 12, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 2);
    const dateFrom = new DateInputField('From', 'dateFrom', 6, false, undefined, undefined, undefined, undefined, 1);
    const dateTo = new DateInputField('To', 'dateTo', 6, false, undefined, undefined, undefined, undefined, 1);

    const modeOfReceiptOptions = new SelectOption('name', 'key', modeOfReceiptOptionsList);
    const transactionMode = new SelectInputField('Mode Of Receipt', 'transactionMode', modeOfReceiptOptions, undefined, undefined, undefined, undefined, undefined, undefined, 4);
    const accountDepositedIntoOptions = new SelectOption('branchName', 'accountNumber', accountDepositedIntoOptionsList);
    const depositedBank = new SelectInputField('Deposited Into', 'depositedBank', accountDepositedIntoOptions, undefined, undefined, undefined, undefined, undefined, undefined, 4);

    this.paymentLocation = new SearchableSelectInputField('Payment Location', 'paymentLocation', undefined, 12, false, false, undefined, undefined, 1, undefined, undefined, undefined, 2);
    const collectionManagerOptionList = this._collectionService.collectionFilter.collectionManagerList;
    const collectionManagerOption = new SelectOption('managerName', 'managerId', collectionManagerOptionList);
    const collectionManager = new SearchableSelectInputField('Collection Manager', 'collectionManagerId', collectionManagerOption, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 3);

    const claimStatusOptions = new SelectOption('name', 'key', claimStatusOptionsList);
    const claimStatus = new SelectInputField('Claim Status', 'claimStatus', claimStatusOptions, undefined, undefined, undefined, undefined, undefined, undefined, 5);

    const appropriationStatusOptions = new SelectOption('name', 'key', appropriationStatusOptionsList);
    const appropriationStatus = new SelectInputField('Appropriation Status', 'appropriationStatus', appropriationStatusOptions, undefined, undefined, undefined, undefined, undefined, undefined, 5);

    this.filterFields =
      [
        dateFrom,
        dateTo,
        customerName,
        this.paymentLocation,
        transactionMode,
        depositedBank,
        collectionManager,
        claimStatus,
        appropriationStatus
      ];
  }

  /**
    * Handle the change of company selection
    * @param  {} event
    */
  public onCompanyChange(event) {
    let flag = true;
    if (event.name === 'ecCustomerId') {
      this._collectionService.getPaymentLocation(event.value.toString()).subscribe((res: Array<any>) => {
        const locationSearchOptions = new SelectOption('locationName', 'locationMapId', res);
        this.paymentLocation = new SearchableSelectInputField('Payment Location', 'paymentLocation', locationSearchOptions, 12, false, false, undefined, undefined, 1, undefined, undefined, undefined, 2);
        this.filterFields.forEach(eachField => {
          if (eachField.placeholder === 'Payment Location') {
            flag = false;
            eachField.option = this.locationSearchOptions;
            this.filterFields.splice(3, 1, this.paymentLocation);
            const tempFields = Util.getObjectCopy(this.filterFields);
            this.filterFields = [];
            this.filterFields = <Array<any>>tempFields;
          }
        });
        if (flag) {
          this.filterFields.splice(3, 0, this.paymentLocation);
          const tempFields = Util.getObjectCopy(this.filterFields);
          this.filterFields = [];
          this.filterFields = <Array<any>>tempFields;
        }
      });
    }
  }

  /**
   * This method return the date .format as 'year-monnth-date'
   * @param  {Date} date
   */
  private changeDateFormat(date: Date) {
    const selectedDate = new Date(date);
    const formatedDate = selectedDate.getFullYear() + '-' + (((selectedDate.getMonth() + 1) >= 10) ? (selectedDate.getMonth() + 1) : '0' + (selectedDate.getMonth() + 1)) + '-' + ((selectedDate.getDate() >= 10) ? selectedDate.getDate() : '0' + selectedDate.getDate());
    return formatedDate;
  }

  /**
   * This function use to clear the filter and searching results
   */
  public onRefresh(refreshMode: RefreshMode = 'all') {
    this.clearSearchAndRefresh(refreshMode);
    this.setRequestPayload(this.requestPayload.tab_filter);

    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    this.refreshData();
  }

  private refreshData() {
    this.rowsData = null;
    this._collectionService.collectionListByTab = new CollectionListByTab();
    this.clearBadgeCount();
    this._metadataService.getTabData(this.requestPayload);
  }

  /**
   * To reset badge count
   */
  private clearBadgeCount() {
    this.gridConfiguration.filterTabList.forEach((eachFilterTab) => {
      eachFilterTab.badge = undefined;
    });
  }

  /**
   * Clearing the multiple selection on data refresh.
   */
  private clearMultiTripSelection() {
    this.selectedDataRows = [];
    this.isMultiTripSelected = false;
  }

  /**
   * This function clears Search and Rerfresh data for request payload
   */
  private clearSearchAndRefresh(refreshMode: RefreshMode) {
    switch (refreshMode) {
      case 'all':
        if (this.requestPayload.search_text) {
          this.requestPayload.search_text = '';
        }
        this.getFilterFields();
        this.requestPayload.filter = new Filter();
        this.showFilterApplied = false;
        this._collectionService.clearFilterTabData();
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
   * This function clear the filter
   */
  public clearFilter() {
    this.showFilterApplied = false;
  }

  /**
   * Determines whether tab change on
   * @param  {number} tabIndex
   */
  public onGridFilterTabSelection(tabIndex: number) {
    this.gridConfiguration.customFooterMessage = undefined;

    this.setActionButton(tabIndex);
    this.rowsData = null;
    this.changeColumnView(tabIndex);

    this.selectedDataRows = [];
    this.collectionIds = [];

    switch (tabIndex) {
      case 0:
        this.requestPayload.tab_filter = CollectionManagementConstant.CLAIMED_CHEQUE_RECEIVED_KEY;
        this.getCollectionRowData(this._collectionService.collectionListByTab.cheque_received.data);
        break;
      case 1:
        this.requestPayload.tab_filter = CollectionManagementConstant.CLAIMED_REQUESTED_KEY;
        this.getCollectionRowData(this._collectionService.collectionListByTab.requested.data);
        break;
      case 2:
        this.requestPayload.tab_filter = CollectionManagementConstant.CLAIMED_SUSPENSE_KEY;
        this.getCollectionRowData(this._collectionService.collectionListByTab.suspense.data);
        break;
      case 3:
        this.requestPayload.tab_filter = CollectionManagementConstant.CLAIMED_ENCASHED_KEY;
        this.getCollectionRowData(this._collectionService.collectionListByTab.approved.data);
        break;
      case 4:
        this.requestPayload.tab_filter = CollectionManagementConstant.CLAIMED_REJECTED_KEY;
        this.getCollectionRowData(this._collectionService.collectionListByTab.rejected.data);
        break;
      case 5:
        this.requestPayload.tab_filter = CollectionManagementConstant.APPROPRIATION_APPROPRIATED_KEY;
        this.getCollectionRowData(this._collectionService.collectionListByTab.appropriated.data);
        break;
      case 6:
        this.requestPayload.tab_filter = CollectionManagementConstant.ALL_KEY;
        this.getCollectionRowData(this._collectionService.collectionListByTab.all.data);
        break;
      default:
        break;
    }
    if (this._collectionService.collectionListByTab[this.requestPayload.tab_filter].data && tabIndex !== 6) {
      this.rowsData = this._collectionService.collectionListByTab[this.requestPayload.tab_filter].data;
    }
  }

  private changeColumnView(tabIndex: number) {
    let checkColumnFlag = true;
    this.tempColumns = [
      { columnDef: 'apprNetAmount', headerName: 'Appropriated Amount', innerCells: 1, dataFormat: DataFormat.Currency, css: { textColor: 'blue', fontWeight: 'bold' }, dataType: DataType.Number, headerCalculatedDataType: CalculationDataType.Sum, disableRowToolTipText: true, dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
      { columnDef: 'apprTDS', headerName: 'TDS', innerCells: 2, dataFormat: DataFormat.Currency, dataType: DataType.Number, headerCalculatedDataType: CalculationDataType.Sum, disableRowToolTipText: true, dataCalculationFormat: DataCalculationFormat.CurrencyInLac, css: { textColor: 'blue' } },
      { columnDef: 'apprNonTripDeduction', headerName: 'Appropriated Non Trip Deductions', innerCells: 1, dataType: DataType.Number, css: { textColor: 'blue' }, dataFormat: DataFormat.Currency, headerCalculatedDataType: CalculationDataType.Sum, width: '30px', disableRowToolTipText: true, dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
      { columnDef: 'apprTripDeduction', headerName: 'Trip Deductions', innerCells: 2, dataType: DataType.Number, css: { textColor: 'blue' }, dataFormat: DataFormat.Currency, headerCalculatedDataType: CalculationDataType.Sum, disableRowToolTipText: true, dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
    ];
    for (let i = 0; i < this.columnsData.length; i++) {
      if (this.columnsData[i].columnDef === 'apprNetAmount') {
        checkColumnFlag = false;
        break;
      }
    }
    if (tabIndex === 5 || tabIndex === 6) {
      if (checkColumnFlag) {
        this.columnsData.splice(13, 0, ...this.tempColumns);
      }
    } else {
      if (!checkColumnFlag) {
        this.columnsData.splice(13, 4);
      }
    }
  }

  /** This get the row data on tab click
   * @param  {Array<any>} requestedArray: requested tab array.
   */
  private getCollectionRowData(requestedArray: Array<any>) {
    if (requestedArray && requestedArray.length) {
      this.rowsData = requestedArray;
    } else {
      this.clearBadgeCount();
      this._metadataService.getTabData(this.requestPayload);
    }
  }

  /**
   * Perform operation on tab selection.
   * @param  {} tabIndex: selected tab
   */
  private setActionButton(tabIndex: number) {
    this.clearActionItemsEnableConfiguration();
    switch (tabIndex) {
      case 0:
        if (this.roleId !== RoleId.FORTIGO_READ_ONLY_USER) {
          this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = false;
          this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = false;
          if (this.isFinanceLoggedIn()) {
            this.actionItemsDisableConfiguration.isAppropriateCollectionDataDisabled = true;
          } else {
            this.actionItemsDisableConfiguration.isAppropriateCollectionDataDisabled = false;
          }
        } else {
          this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = true;
          this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = true;
        }
        this.actionItemsDisableConfiguration.isValidateCollectionDataDisabled = true;
        this.actionItemsDisableConfiguration.isViewAppropriateCollectionDataDisabled = false;
        break;
      case 1:
        if (this.roleId !== RoleId.FORTIGO_READ_ONLY_USER) {
          this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = false;
          this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = false;
          if (this.isFinanceLoggedIn()) {
            this.actionItemsDisableConfiguration.isAppropriateCollectionDataDisabled = true;
          } else {
            this.actionItemsDisableConfiguration.isAppropriateCollectionDataDisabled = false;
          }
        } else {
          this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = true;
          this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = true;
        }
        if (this.isFinanceLoggedIn()) {
          this.actionItemsDisableConfiguration.isValidateCollectionDataDisabled = false;
        } else {
          this.actionItemsDisableConfiguration.isValidateCollectionDataDisabled = true;
        }
        this.actionItemsDisableConfiguration.isViewAppropriateCollectionDataDisabled = false;
        break;
      case 3:
        this.requestPayload.tab_filter = CollectionManagementConstant.CLAIMED_ENCASHED_KEY;
        this.actionItemsDisableConfiguration.isValidateCollectionDataDisabled = true;
        if (this.isFinanceLoggedIn()) {
          this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = false;
          this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = false;
        } else {
          this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = true;
          this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = true;
        }
        this.actionItemsDisableConfiguration.isViewAppropriateCollectionDataDisabled = false;
        if (this.roleId !== RoleId.FORTIGO_READ_ONLY_USER) {
          this.actionItemsDisableConfiguration.isAppropriateCollectionDataDisabled = false;
        } else {
          this.actionItemsDisableConfiguration.isAppropriateCollectionDataDisabled = true;
        }
        break;
      case 4:
        this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = true;
        this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = true;
        this.actionItemsDisableConfiguration.isViewAppropriateCollectionDataDisabled = true;
        this.actionItemsDisableConfiguration.isAppropriateCollectionDataDisabled = true;
        this.actionItemsDisableConfiguration.isValidateCollectionDataDisabled = true;
        break;
      case 2:
        if (this.roleId !== RoleId.FORTIGO_READ_ONLY_USER) {
          this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = false;
        } else {
          this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = true;
        }
        this.isFinanceLoggedIn() ? this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = false : this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = true;
        this.actionItemsDisableConfiguration.isValidateCollectionDataDisabled = true;
        this.actionItemsDisableConfiguration.isViewAppropriateCollectionDataDisabled = false;
        this.actionItemsDisableConfiguration.isAppropriateCollectionDataDisabled = true;
        break;
      case 5:
        if (this.isFinanceLoggedIn()) {
          this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = false;
          this.actionItemsDisableConfiguration.isAppropriateCollectionDataDisabled = false;
        } else {
          this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = true;
          this.actionItemsDisableConfiguration.isAppropriateCollectionDataDisabled = true;
        }
        this.actionItemsDisableConfiguration.isViewAppropriateCollectionDataDisabled = false;
        this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = true;
        this.actionItemsDisableConfiguration.isValidateCollectionDataDisabled = true;
        break;
      case 6:
        this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = true;
        this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = true;
        this.actionItemsDisableConfiguration.isValidateCollectionDataDisabled = true;
        this.actionItemsDisableConfiguration.isViewAppropriateCollectionDataDisabled = false;
        this.actionItemsDisableConfiguration.isAppropriateCollectionDataDisabled = true;
        break;
      default:
        break;
    }

    this.applyActionItemsConfiguration();
  }

  /**
   * On Collection dashboard Search
   * @param searchText
   */
  public onSearch(searchText: string) {
    this.requestPayload.search_text = searchText;

    this.refreshData();
  }

  /**
   * This function trigger on click edit or view
   * @param  {} event: Form data
   */
  public onActionItemClick(event) {
    switch (event.index) {
      case 0:
        this._dialog.open(CollectionModalComponent, {
          data: { modalMode: 'edit', collectionId: event.data.collectionId, dataSource: event.data.dataSource },
          maxWidth: '100%',
          width: '100%'
        });
        break;
      case 1:
        this._dialog.open(CollectionModalComponent, {
          data: { modalMode: 'view', collectionId: event.data.collectionId, dataSource: event.data.dataSource },
          maxWidth: '100%',
          width: '100%'
        });
        break;
      case 4:
        this._dialog.open(CollectionModalComponent, {
          data: { modalMode: 'appropriate', collectionId: event.data.collectionId, dataSource: event.data.dataSource },
          maxWidth: '100%',
          width: '100%'
        });
        break;
      case 2:
        this.deleteReceipt(event.data);
        break;
      case 3:
        this._dialog.open(CollectionModalComponent, {
          data: { modalMode: 'validate', collectionId: event.data.collectionId, dataSource: event.data.dataSource },
          maxWidth: '100%',
          width: '100%'
        });
        break;
      case 5:
        this._dialog.open(CollectionModalComponent, {
          data: { modalMode: 'view_appropriate', collectionId: event.data.collectionId, dataSource: event.data.dataSource },
          maxWidth: '100%',
          width: '100%'
        });
        break;
      case 6:
        // ANCHOR : view Appropriation to be added
        break;
      case 7:
        if (!this.selectedDataRows.length) {
          this.collectionIds = [];
          this.collectionIds.push(event['data']['collectionId'].toString());
        }
        this._collectionService.downloadReport({ collection_id: this.collectionIds, tab_filter: this.requestPayload.tab_filter }).subscribe(response => {
          if (!response['errorCode']) {
            this.saveToFileSystem(response);
          }
        });
        break;
      default:
        break;
    }
  }

  /**
   * This method delete selected row.
   * @param  {any} data: Selected row.
   */
  private deleteReceipt(data: any) {
    let text = 'The receipt with Reference No.: ';
    text += data.referenceNumber + ', Amount: ' + data.netAmount + ', Entry Date: ';
    text += this._datePipe.transform(Util.convertLocalDateTime(data['transactionDate']), FortigoConstant.INDIAN_DATE_FORMAT) + ', Entered by: ';
    text += (data.createdByName ? data.createdByName : '');
    text += ', Collection Manager: ' + (data.collectionManager ? data.collectionManagerName : '');
    Swal.fire({
      title: 'Are you sure you want to delete this receipt?',
      type: 'question',
      width: 500,
      text: text,
      showCancelButton: true,
      confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
      cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.value) {
        // const collectionStatus = data.collectionStatus === 'Claimed' ? 'requested' : data.collectionStatus;
        this._collectionService.deleteReceipt({
          collection_id: data.collectionId.toString(), collectionStatus: data.collectionStatus, datasource: data.dataSource,
          payerCompanyId: data['payerCompany'] ? data['payerCompany']['stringId'] : null,
          receiverCompanyId: data['receiverCompany'] ? data['receiverCompany']['stringId'] : null,
          referenceNumber: data['referenceNumber'] ? data['referenceNumber'] : null,
          remarks: data['remarks'],
        })
          .subscribe(response => {
            if (!response['errorCode']) {
              this._collectionService.refresh.next();
              Swal.fire('Success', response['errorMessage'], 'success');
            } else {
              Swal.fire('Error', response['errorMessage'], 'error');
            }
          });
      }
    });
  }

  /**
   * Download collection report and export into csv format
   * @param  {any} response: Response data.
   */
  private saveToFileSystem(response: any) {
    const contentDispositionHeader: string = response.headers.get('Content-Disposition');
    const parts: string[] = contentDispositionHeader ? contentDispositionHeader.split(';') : [];
    let fileName = decodeURI(parts[1].split('=')[1]);
    const blob = new Blob([response.body], { type: response.headers.get('Content-Type') });
    fileName = fileName.replace('"', '').split('.').splice(0, fileName.split('.').length - 1).join();
    saveAs(blob, fileName);
  }

  /**
   * This method use to add collection payload.
   */
  private setRequestPayload(key: string) {
    const filter: Filter = new Filter();
    this.requestPayload = new CollectionListRequestPayload(key, undefined, '', undefined, this._collectionService.collectionFilter.companyList, filter);
  }

  /**
   * This function trigger on check and uncheck the checkbox.
   * @param  {any} selectedData: Total selected data grids rows.
   */
  public onCheckboxSelection(selectedData: any) {
    this.selectedDataRows = selectedData;
    this.collectionIds = [];

    if (this.selectedDataRows.length) {
      this.selectedDataRows.forEach(eachElement => {
        this.collectionIds.push(eachElement.collectionId.toString());
      });
    }

    if (this.selectedDataRows.length > 1) {
      this.isMultiTripSelected = true;
      this.clearActionItemsEnableConfiguration();
      this.actionItemsDisableConfiguration.isViewCollectionDataDisabled = true;
      this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = true;
      this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = true;
      this.applyActionItemsConfiguration();
    } else {
      this.isMultiTripSelected = false;
      this.clearActionItemsEnableConfiguration();
      this.actionItemsDisableConfiguration.isViewCollectionDataDisabled = false;
      this.actionItemsDisableConfiguration.isEditCollectionDataDisabled = false;
      this.actionItemsDisableConfiguration.isDeleteCollectionDataDisabled = false;
      this.applyActionItemsConfiguration();
    }
  }

  /**
   * Triggers whenever head button is clicked
   * @param value event
   */
  public onHeadButtonClick(value: any) {
    if (value === 'MTD Collection Report') {
      this._collectionService.generateECReceiptSuspenseReport(this._loginControlV2Service.userId).subscribe((data) => {
        this.saveToSystem(data);
      },
        err => {
          console.log(err);
        });
    }
    if (value === 'Receipt') {
      let filter;
      if (RoleId.FORTIGO_FINANCE_ROLES.includes(this.roleId)) {
        filter = CollectionManagementConstant.CLAIMED_ENCASHED_KEY;
      } else if (RoleId.FORTIGO_SALES_REGIONAL_AND_OPERATIONS_ROLES.includes(this.roleId)) {
        filter = CollectionManagementConstant.CLAIMED_REQUESTED_KEY;
      } else if (this._loginControlV2Service.roleId.toString() === RoleId.FORTIGO_READ_ONLY_USER.toString()) {
        filter = CollectionManagementConstant.CLAIMED_REQUESTED_KEY;
      }
      this._dialog.open(CollectionModalComponent, {
        data: { modalMode: 'new', collectionId: '', filter: filter, dataSource: '' },
        maxWidth: '100%',
        width: '100%'
      });
    }
  }

  /**
   * Used to save file to system
   * @param response
   */
  public saveToSystem(response: any) {
    // const contentDispositionHeader: string = response.headers.get('Content-Disposition');
    // const parts: string[] = contentDispositionHeader.split(';');

    // let fileName = decodeURI(parts[1].split('=')[1]);
    // fileName = fileName.replace('"', '').split('.').splice(0, fileName.split('.').length - 1).join();
    const blob = new Blob([response.body], { type: 'application/vnd.ms-excel' });
    const file = new File([blob], 'EC_Receipt_Suspense' + '.xlsx', { type: 'application/vnd.ms-excel' });
    saveAs(file);
  }

  /**
   * Used to create head button based on role id
   */
  private createHeadButton() {
    if (this.roleId === RoleId.FORTIGO_READ_ONLY_USER ||
      RoleId.FORTIGO_FINANCE_ROLES.includes(this.roleId) ||
      RoleId.FORTIGO_SALES_REGIONAL_AND_OPERATIONS_ROLES.includes(this.roleId)
    ) {
      this.buttons.push(new FortigoButton('MTD Collection Report', 'save_alt'));
    }
  }
}
