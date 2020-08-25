/*
 * Created on Wed Oct 09 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';

import { AutoUnsubscribe } from 'src/app/shared/decorators/auto-unsubscribe.decorator';
import { Column, DataType, CalculationDataType, DataFormat, DataCalculationFormat } from 'src/app/shared/models/column.model';
import { TripModalComponent } from '../modals/trip-modal/trip-modal.component';
import { ViewReserveInvoiceModalComponent } from '../modals/view-reserve-invoice-modal/view-reserve-invoice-modal.component';
import { TripInvoicingListRequestPayload, Filter } from '../models/trip-invoicing-list-request-payload.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { TripService } from '../services/trip/trip.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { MetadataService } from '../services/metadata/metadata.service';
import { TripManagementConstant } from '../constants/TripManagementConstant';
import { FortigoConstant, RoleId } from 'src/app/core/constants/FortigoConstant';
import { UploadManualInvoiceModalComponent } from '../modals/upload-manual-invoice-modal/upload-manual-invoice-modal.component';
import { CellData } from 'src/app/shared/models/cell-data.model';
import { SelectOption, SearchableSelectInputField, DateInputField, SelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { RightClickMenu } from 'src/app/shared/models/right-click-menu.model';
import { FieldGroup } from 'src/app/shared/models/field-group.model';
import { environment } from 'src/environments/environment';
import { Util } from 'src/app/core/abstracts/util';
import { TripEcAttributeModalComponent } from '../modals/trip-ec-attribute-modal/trip-ec-attribute-modal.component';
import { ViewGeneratedInvoiceModalComponent } from '../modals/view-generated-invoice-modal/view-generated-invoice-modal.component';
import { TripEcAdjustmentDetailsModalComponent } from '../modals/trip-ec-adjustment-details-modal/trip-ec-adjustment-details-modal.component';
import { FortigoValidators } from 'src/app/shared/models/fortigo-validators.model';
import { PatternModel } from 'src/app/core/constants/FortigoPattern';
import { TripInvoicingListResponsePayload } from '../models/trip-invoicing-list-response-payload.model';
import { TripInvoicingListByTab } from '../models/trip-invoicing-list-by-tab.model';

type RefreshMode = 'search' | 'filter' | 'all' | 'none';
type Mode = 'readOnly' | 'editable';

@Component({
  selector: 'app-trip-dashboard',
  templateUrl: './trip-dashboard.component.html',
  styleUrls: ['./trip-dashboard.component.css']
})
@AutoUnsubscribe()
export class TripDashboardComponent implements OnInit {
  public pageTitle: string;
  public filterFields: Array<any>;
  private selectedDataRows: Array<any>;
  public columnsData: Array<Column> = [];
  public searchText: string;
  public showFilterApplied = false;
  public showLoader = false;
  private validationRequestDateColumn: Column = { columnDef: 'validationRequestDate', headerName: 'Requested On', dataType: DataType.Date, dataFormat: DataFormat.Date, innerCells: 1 };
  private vehicleNumber: Column = { columnDef: 'vehicleNumber', headerName: 'Vehicle Number', dataType: DataType.String, innerCells: 1, css: { userSelect: 'text' }, width: '10px' };
  private invoiceNumber: Column = { columnDef: 'invoiceNumber', headerName: 'Invoice Number', dataType: DataType.String, innerCells: 1, disableHeaderToolTipText: true };
  private invoiceDate: Column = { columnDef: 'invoiceDate', headerName: 'Invoice Date', dataType: DataType.Date, innerCells: 2, dataFormat: DataFormat.Date, disableHeaderToolTipText: true };
  private invoiceSubmissionDate: Column = { columnDef: 'invoiceSubmissionDate', headerName: 'Submission Date', dataType: DataType.Date, innerCells: 1, dataFormat: DataFormat.Date, disableHeaderToolTipText: false, title: 'Invoice Submission Date' };

  public rowsData: Array<any>;
  public rowsDataDocs: Array<any> = new Array();
  // for grouping of filter fields
  public groups: Array<FieldGroup>;

  private tripModalReference: MatDialogRef<TripModalComponent>;
  private viewReserveInvoiceModalReference: MatDialogRef<ViewReserveInvoiceModalComponent>;

  public selectedTabIndex = 0;
  // for search text and validation purpose.
  public searchTextValidation = new FortigoValidators(6, 2000, false, new PatternModel(undefined, undefined, TripManagementConstant.SEARCH_REGEX_PATTERN, undefined, 'Invalid search text, Please remove spaces if any.'));
  private hasMultiSearch = false;
  private isOpenedFromExt = false;

  private refreshSubscription: Subscription;
  private listTripDetailsSubscription: Subscription;
  private downloadInvoiceDataSubscription: Subscription;
  private requestForTripValidationSubscription: Subscription;

  private requestPayload = new TripInvoicingListRequestPayload();

  public columnDocsData: Array<Column> = new Array();
  public gridConfiguration: GridConfiguration = new GridConfiguration();
  // Search regex pattern for Trip.
  public searchRegexPatternTripInvoice = TripManagementConstant.SEARCH_REGEX_PATTERN;

  private viewReserveInvoiceData = { 'service_ref_id': '' };
  private reserveInvoiceData = { 'service_ref_id': '', };

  public filterFontSize: number;

  private companyId: string;

  // used for enabling all the action items in side menu.
  private actionItemsDisableConfiguration = {
    'isReserveInvoiceDisabled': false,
    'rfvDisabled': false,
    'validateDisabled': false,
    'downloadDataInvoiceDisabled': false,
    'viewResInvDisabled': false,
    'uploadManualInvDisabled': false,
    'generateInvDisabled': false
  };
  private isMultiTripSelected = false;
  private roleId: number;

  constructor(
    private _title: Title,
    private _activatedRoute: ActivatedRoute,
    private _tripService: TripService,
    private _dialog: MatDialog,
    private _loginControlV2Service: LoginControlV2Service,
    private _metadataService: MetadataService,
    private _snackBar: MatSnackBar
  ) {
    this.getRequestPayload();
  }

  ngOnInit() {
    this.pageTitle = this._activatedRoute.snapshot.data['title'];
    this._title.setTitle(this._activatedRoute.snapshot.data['title']);

    this.roleId = Number.parseInt(this._loginControlV2Service.roleId.toString());

    this.filterFontSize = FortigoConstant.FONT_SMALL;
    this.getFilterFields();

    this.getColumnData();
    this.getGridConfiguration();
    this._tripService.generateInvoiceReload.subscribe((actionData) => {
      this.generateInvoice(actionData);
    });

    if (localStorage.getItem('filter') && localStorage.getItem('filter') !== 'null' && JSON.parse(localStorage.getItem('filter')) && JSON.parse(localStorage.getItem('filter')).unbilledRevenue) {
      const unbilledRevenueTripIds = JSON.parse(localStorage.getItem('filter')).unbilledRevenue.tripIds;
      const tabName = JSON.parse(localStorage.getItem('filter')).unbilledRevenue.tabName;
      this.requestPayload.tab_filter = tabName;
      const data: TripInvoicingListRequestPayload = <TripInvoicingListRequestPayload>Util.getObjectCopy(this.requestPayload);
      data.service_ref_ids = unbilledRevenueTripIds;
      this.isOpenedFromExt = true;
      switch (tabName) {
        case TripManagementConstant.ELIGIBLE_KEY:
          this.selectedTabIndex = 0;
          break;
        case TripManagementConstant.SENT_FOR_VALIDATION_KEY:
          this.selectedTabIndex = 1;
          break;
        case TripManagementConstant.READY_FOR_INVOICING_SYSTEM_KEY:
          this.selectedTabIndex = 3;
          break;
        default:
          break;
      }
      this.listTripDetailsSubscription = this._tripService.getTripInvoicingList(data).subscribe((response: TripInvoicingListResponsePayload) => {
        if (response['errorMessage']) {
          Swal.fire('Error', response['errorMessage'], 'error');
          this.rowsData = [];
        } else {
          this.rowsData = this._metadataService.dataExtractor(response.tripInvoicingList);
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
      if (this._tripService.tripInvoicingListByTab[this.gridConfiguration.filterTabList[this.selectedTabIndex].key].data) {
        this.rowsData = this._tripService.tripInvoicingListByTab[this.gridConfiguration.filterTabList[this.selectedTabIndex].key].data;
        this.setBadgeCount();
      }
    }

    this._metadataService.filterTabLoaderSubject.subscribe((data: any) => {
      if (this.requestPayload.tab_filter === data.filter) {
        if (this._tripService.tripInvoicingListByTab[this.requestPayload.tab_filter === null ? TripManagementConstant.ALL_KEY : this.requestPayload.tab_filter].data) {
          this.rowsData = this._tripService.tripInvoicingListByTab[this.requestPayload.tab_filter === null ? TripManagementConstant.ALL_KEY : this.requestPayload.tab_filter].data;
          this.setBadgeCount();
        } else {
          if (this._tripService.tripInvoicingListByTab[this.requestPayload.tab_filter === null ? TripManagementConstant.ALL_KEY : this.requestPayload.tab_filter]['errorMessage']) {
            this.gridConfiguration.customFooterMessage = this._tripService.tripInvoicingListByTab[this.requestPayload.tab_filter === null ? TripManagementConstant.ALL_KEY : this.requestPayload.tab_filter]['errorMessage'];
            this.rowsData = [];
          }
        }
      }
      // for all tab
      if (this.selectedTabIndex === 8) {
        if (this.hasMultiSearch !== true && !this.requestPayload.search_text && !this.isFilterAppliedOnTrips(this.requestPayload.filter)) {
          this.gridConfiguration.customFooterMessage = 'Please apply filter to view data';
        }
      }
    });
  }

  private setBadgeCount() {
    if (this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.eligible_for_invoicing]) {
      this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.eligible_for_invoicing].badge = this._tripService.tripInvoicingListByTab.eligible_for_invoicing.count;
    }
    if (this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.invoice_reserved]) {
      this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.invoice_reserved].badge = this._tripService.tripInvoicingListByTab.invoice_reserved.count;
    }
    if (this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.null]) {
      this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.null].badge = this._tripService.tripInvoicingListByTab.all.count;
    }
    if (this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.ready_for_invoicing_manual]) {
      this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.ready_for_invoicing_manual].badge = this._tripService.tripInvoicingListByTab.ready_for_invoicing_manual.count;
    }
    if (this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.ready_for_invoicing_system]) {
      this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.ready_for_invoicing_system].badge = this._tripService.tripInvoicingListByTab.ready_for_invoicing_system.count;
    }
    if (this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.sent_for_validation]) {
      this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.sent_for_validation].badge = this._tripService.tripInvoicingListByTab.sent_for_validation.count;
    }
    if (this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.submission_pending]) {
      this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.submission_pending].badge = this._tripService.tripInvoicingListByTab.submission_pending.count;
    }
    if (this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.submitted]) {
      this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.submitted].badge = this._tripService.tripInvoicingListByTab.submitted.count;
    }
    if (this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.validation_rejected]) {
      this.gridConfiguration.filterTabList[TripManagementConstant.TRIP_INVOICING_TAB_DATA.validation_rejected].badge = this._tripService.tripInvoicingListByTab.validation_rejected.count;
    }
  }

  /**
   * Method used to perform actions as per user actions from action items.
   * @param  {any} actionData : info of the action performed by user.
   */
  public onActionExtraButtonClick(actionData: any) {
    //FIXME Validation should be applicable for all tabs?
    // if (this.requestPayload.tab_filter === null) {
    if (this.isMultiTripSelected && actionData.index !== 3) {
      if (!this.filterValidTrips(actionData)) {
        return;
      }
    }
    // }
    switch (actionData.index) {
      case 0:
        Swal.fire({
          title: 'Do you want to reserve invoice number',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
          cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
          confirmButtonText: 'Yes'
        }).then(result => {
          if (result.value) {
            this.reserveInvoice(actionData);
          }
        });
        break;
      case 1:
        const rfvScreenTitle = 'REQUEST FOR VALIDATION';
        const rfvButtons = this.getButtons(actionData.index);
        this.viewRfvScreen(rfvScreenTitle, actionData, rfvButtons);

        break;
      case 2:
        const validateScreenTitle = 'REQUEST FOR VALIDATION';
        const validateButtons = this.getButtons(actionData.index);
        this.viewRfvScreen(validateScreenTitle, actionData, validateButtons);
        break;
      case 3:
        const tripIdList: Array<string> = new Array<string>();
        this.selectedDataRows.forEach((eachTripData) => {
          tripIdList.push(eachTripData.tripId);
        });
        this.downloadInvoiceDataSubscription = this._tripService.downloadInvoiceData(tripIdList, this.requestPayload.tab_filter).subscribe(
          (data) => {
            if (data) {
              this.saveToFileSystem(data);
            }
          },
          (err) => {
          }
        );
        break;
      case 4:
        this.viewReserveInvoice(actionData);
        break;
      case 5:
        // TODO  @Vinayak K s Change the text to Constant
        if (this.isMultiTripSelected) {
          this.showLoader = true;
          this.viewGeneratedInvoiceStatus('manualUpload', actionData);
        } else
          if (actionData.data.tripPerInvoice === 2) {
            const message = actionData.data.customer.name + ' supports Multiple trips in a single invoice (MTSI). You have selected only a single trip for this invoice. If the customer expects bulk invoice with multiple trips, then this invoice may get rejected. Are you sure you want to continue?';
            Swal.fire({
              title: message,
              type: 'warning',
              showCancelButton: true,
              confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
              cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
              confirmButtonText: 'Yes, Generate Invoice',
              cancelButtonText: 'Cancel'
            }).then(result => {
              if (result.value) {
                if (this.filterValidTrips(actionData)) {
                  this.uploadManualDoc();
                }
              }
            });
          } else {
            if (this.filterValidTrips(actionData)) {
              this.uploadManualDoc();
            }
          }
        break;
      case 6:
        if (this.isMultiTripSelected) {
          this.showLoader = true;
          this.viewGeneratedInvoiceStatus('generateInvoice', actionData);
        } else {

          if (actionData.data.tripPerInvoice === 2) {
            const message = actionData.data.customer.name + ' supports Multiple trips in a single invoice (MTSI). You have selected only a single trip for this invoice. If the customer expects bulk invoice with multiple trips, then this invoice may get rejected. Are you sure you want to continue?';
            Swal.fire({
              title: message,
              type: 'warning',
              showCancelButton: true,
              confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
              cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
              confirmButtonText: 'Yes, Generate Invoice',
              cancelButtonText: 'Cancel'
            }).then(result => {
              if (result.value) {
                this.generateInvoice(actionData);
              }
            });
          } else {
            this.generateInvoice(actionData);
          }
        }

        break;
      default:
    }
  }

  /**
   * generates the invoice
   * @param  {any} actionData
   */
  private generateInvoice(actionData: any) {
    const generateInvScreenbuttons = this.getButtons(actionData.index);
    const generateInvScreentitle = 'GENERATE INVOICE';
    if (this.filterValidTrips(actionData)) {
      this.viewRfvScreen(generateInvScreentitle, actionData, generateInvScreenbuttons);
    }
  }
  /**
   * views the generated invoice
   * @param  {any} type
   * @param  {any} actionData
   */
  private viewGeneratedInvoiceStatus(type: any, actionData: any) {
    const rfvTripRequestPayload: any = {};
    rfvTripRequestPayload.service_ref_ids = [];
    this.selectedDataRows.forEach((eachTripData) => {
      rfvTripRequestPayload.service_ref_ids.push(eachTripData.tripId);
    });
    if (environment.name !== 'prod') {
      rfvTripRequestPayload.source = this.requestPayload.tab_filter !== null ? this.requestPayload.tab_filter : this.getInvoicingStatus(actionData.data.invoicingStatus);
    } else {
      rfvTripRequestPayload.source = this.requestPayload.tab_filter;
    }
    rfvTripRequestPayload.role_id = this._loginControlV2Service.roleId;
    rfvTripRequestPayload.user_id = this._loginControlV2Service.userId;
    if (type === 'manualUpload') {
      rfvTripRequestPayload.is_manual = true;
    } else if (type === 'generateInvoice') {
      rfvTripRequestPayload.is_manual = false;
    }
    this._tripService.viewGenerateInvoice(rfvTripRequestPayload).subscribe((response: any) => {
      this.showLoader = false;
      if (response['status'] === undefined) {
        const errorMessage = response['errorMessage'];
        Swal.fire({
          title: 'Error',
          type: 'error',
          text: errorMessage
        });

      } else if (response['status'] === 'failure') {
        this.showLoader = false;
        this._dialog.open(ViewGeneratedInvoiceModalComponent, {
          data: {
            requestPayload: rfvTripRequestPayload,
            tripList: this.rowsData,
            responseList: response['response'],
            source: this.requestPayload.tab_filter,
            role_id: this._loginControlV2Service.roleId,
            user_id: this._loginControlV2Service.userId,
            actionData: actionData,
            type: type
          }
        });
      } else {
        (type === 'manualUpload') ? this.uploadManualDoc() : this.generateInvoice(actionData);
      }
    });
  }

  /**
   * Uploads the Manual Invoice
   */
  private uploadManualDoc() {
    const rfvTripRequestPayload: any = {};
    rfvTripRequestPayload.service_ref_ids = [];
    this.selectedDataRows.forEach((eachTripData) => {
      rfvTripRequestPayload.service_ref_ids.push(eachTripData.tripId);
    });
    rfvTripRequestPayload.source = this.requestPayload.tab_filter;
    this._dialog.open(UploadManualInvoiceModalComponent, {
      data: {
        // actionData: actionData,
        requestPayload: rfvTripRequestPayload,
        tripList: this.rowsData,
        source: this.requestPayload.tab_filter,
        role_id: this._loginControlV2Service.roleId,
        user_id: this._loginControlV2Service.userId
      }
    });
  }

  private filterValidTrips(actionData: any) {
    if (!this.isMultiTripSelected) {
      this.selectedDataRows = new Array<any>();
      this.selectedDataRows.push(actionData.data);
    }
    const cusName = this.selectedDataRows[0].customer.name;
    const status = this.getInvoicingStatus(this.selectedDataRows[0].invoicingStatus);
    const servicedByName = this.selectedDataRows[0].servicedBy.name;
    let isValidTrips = true;
    this.selectedDataRows.forEach((eachTripData) => {
      if (this.requestPayload.tab_filter === null) {
        if (this.getInvoicingStatus(eachTripData.invoicingStatus) === status) {
          isValidTrips = this.validateCusNameAndServicedByName(eachTripData, cusName, isValidTrips, servicedByName);
        } else {
          Swal.fire('Warning', 'Selected Trips do not have same Invoicing Status', 'warning');
          isValidTrips = false;
        }
      } else {
        isValidTrips = this.validateCusNameAndServicedByName(eachTripData, cusName, isValidTrips, servicedByName);
      }
      return;
    });
    return isValidTrips;
  }

  /**
   * To validate same Cus Name and Serviced By Name.
   * @param  {any} eachTripData:tripData
   * @param  {any} cusName:cusName
   * @param  {boolean} isValidTrips:isValidTrips
   * @param  {any} servicedByName:servicedByName
   */
  private validateCusNameAndServicedByName(eachTripData: any, cusName: any, isValidTrips: boolean, servicedByName: any): boolean {
    if (eachTripData.customer.name !== cusName) {
      Swal.fire('Warning', 'Selected Trips do not have same Customer Name', 'warning');
      isValidTrips = false;
    } else if (eachTripData.servicedBy.name !== servicedByName) {
      Swal.fire('Warning', 'Selected Trips do not have same Bill To Name', 'warning');
      isValidTrips = false;
    }
    return isValidTrips;
  }

  /**
   *
   * Function name:  getButtons
   *
   * To get buttons for rfv screen
   * @param  {number} actionItemIndex i.e. index of action items selected.
   */
  private getButtons(actionItemIndex: number) {
    const rfvButtons = [];
    switch (actionItemIndex) {
      case 1:
        if (this.requestPayload.tab_filter === TripManagementConstant.SUBMITTED_KEY || this.requestPayload.tab_filter === TripManagementConstant.GENERATED_KEY) {
          rfvButtons.push({ name: 'Save', icon: 'save', isDisabled: true });
          rfvButtons.push({ name: 'Submit', icon: 'check', isDisabled: true });
          return rfvButtons;
        }
        switch (this.roleId) {
          case RoleId.FORTIGO_READ_ONLY_USER:
            rfvButtons.push({ name: 'Save', icon: 'save', isDisabled: true });
            rfvButtons.push({ name: 'Submit', icon: 'check', isDisabled: true });
            break;
          case RoleId.FBO_TEAM_LEADER:
          case RoleId.FBO_TEAM_MEMBER:
          case RoleId.FBO_WITH_FUEL_PAYMENT:
          case RoleId.FBO_AR:
          case RoleId.FBO_TM_WITHOUT_BANK_ACCOUNT_UPDATE:
          case RoleId.FBO_AR_WITH_BANK_ACCOUNT_UPDATE:
          case RoleId.FBO_TM_WITH_FULL_PAYMENT_ACCESS:
            rfvButtons.push({ name: 'Generate Invoice', icon: 'check', isDisabled: false });
            // Save option only in eligible tab.
            if (this.requestPayload.tab_filter === TripManagementConstant.ELIGIBLE_KEY) {
              rfvButtons.push({ name: 'Save', icon: 'save', isDisabled: false });
            }
            rfvButtons.push({ name: 'Submit', icon: 'check', isDisabled: false });
            break;
          default:
            break;
        }
        break;
      case 2:
        rfvButtons.push({ name: 'Approve & Generate', icon: 'check', isDisabled: false });
        rfvButtons.push({ name: 'Approve', icon: 'check', isDisabled: false });
        rfvButtons.push({ name: 'Reject', icon: 'close', isDisabled: false });
        break;
      case 5:
        rfvButtons.push({ name: 'Submit', icon: 'check', isDisabled: false });
        rfvButtons.push({ name: 'Cancel', icon: 'close', isDisabled: false });
        break;
      case 6:
        rfvButtons.push({ name: 'Generate Invoice', icon: 'check', isDisabled: false });
        rfvButtons.push({ name: 'Cancel', icon: 'close', isDisabled: false });
        break;
      default:
        break;
    }
    return rfvButtons;
  }

  /**
   * To view reserved Invoice No.
   * @param  {any} actionData : info of the action performed by user.
   */
  private viewReserveInvoice(actionData: any) {
    this.showLoader = true; // enabling loader till response come from server side.
    this.viewReserveInvoiceData.service_ref_id = actionData.data.tripId.toString();
    this._tripService.viewReserveInvoice(this.viewReserveInvoiceData).subscribe((response) => {
      if (response) {
        this.showLoader = false; // disabling loader after response came from server side.
        if (response['errorMessage']) {
          Swal.fire('Error', response['errorMessage'], 'error');
        } else {
          this.viewReserveInvoiceModalReference = this._dialog.open(ViewReserveInvoiceModalComponent, {
            data: {
              // pass data here
              viewReserveInvoiceData: this.viewReserveInvoiceData,
              reserveInvoiceData: response
            }
          });
        }
      } else {
        Swal.fire('Error', 'Something went wrong', 'error');
      }
    });
  }

  /**
   * To reserve the Invoice No. against a trip.
   * @param  {any} actionData : info of the action performed by user.
   */
  private reserveInvoice(actionData: any) {
    this.showLoader = true; // enabling loader till response come from server side.
    this.reserveInvoiceData.service_ref_id = actionData.data.tripId.toString();
    this._tripService.reserveInvoice(this.reserveInvoiceData).subscribe((response) => {
      if (response && response['response']) {
        this.showLoader = false; // disabling loader after response came from server side.
        Swal.fire('Success', response['response'], 'success');
      } else {
        this.showLoader = false; // disabling loader after response came from server side.
        if (response && response['errorMessage']) {
          Swal.fire('Error', response['errorMessage'], 'error');
        } else {
          Swal.fire('Error', 'error');
        }
      }
    });
  }


  /**
   * To view RFV Screen
   * @param  {string} title :Title of screen.
   * @param  {any} actionData:Action performed by user.
   * @param  {Array<any>} buttons: Buttons required for screen
   */
  private viewRfvScreen(title: string, actionData: any, buttons: Array<any>) {
    let mode: Mode;
    if (this.requestPayload.tab_filter === TripManagementConstant.SUBMITTED_KEY || this.requestPayload.tab_filter === TripManagementConstant.GENERATED_KEY) {
      mode = 'readOnly';
    }
    const rfvTripRequestPayload = this.getRfvRequestPayload(actionData);
    if (environment.name !== 'prod') {
      rfvTripRequestPayload.source = this.requestPayload.tab_filter !== null ? this.requestPayload.tab_filter : this.getInvoicingStatus(actionData.data.invoicingStatus);
    } else {
      rfvTripRequestPayload.source = this.requestPayload.tab_filter;
    }
    this.tripModalReference = this._dialog.open(TripModalComponent, {
      data: {
        title: title,
        tripValidationData: rfvTripRequestPayload,
        actionItemIndex: actionData.index,
        buttons: buttons,
        mode: mode
      }
    });
    this.refreshSubscription = this._tripService.refresh.subscribe(() => this.onRefresh('none'));
  }

  /**
   * To get Invoicing status
   * @param  {string} invoicingStatus :Invoicing Status of trip.
   */
  private getInvoicingStatus(invoicingStatus: string): string {
    if (this.requestPayload.tab_filter === null) {
      switch (invoicingStatus) {
        case 'Generated':
        case 'Generated - Partial':
        case 'open':
        case 'Open':
          return TripManagementConstant.ELIGIBLE_KEY;
        default:
          return invoicingStatus;
      }
    } else {
      return invoicingStatus;
    }
  }

  private getRfvRequestPayload(actionData: any): any {
    const rfvTripRequestPayload: any = {};
    if (actionData.index !== 6) {
      this.selectedDataRows = [];
      this.selectedDataRows.push(actionData.data);
      rfvTripRequestPayload.service_ref_id = this.selectedDataRows[0].tripId.toString();
    } else {
      rfvTripRequestPayload.service_ref_ids = [];
      this.selectedDataRows.forEach((eachTripData) => {
        rfvTripRequestPayload.service_ref_ids.push(eachTripData.tripId);
      });
    }
    return rfvTripRequestPayload;
  }

  /**
   * @param  {CellData} columnData : info of the cell on which action performed
   * Method used to perform the actions denoted to the given cell/column.
   */
  public onCellClick(columnData: CellData) {
    switch (columnData.action) {
      case 'view':
        if (columnData.columnName === 'linkToDocs') {
          localStorage.setItem('tripDocData', JSON.stringify({ 'tripData': columnData.rowData }));
          if (environment.name === 'localhost') {
            window.open(environment.baseUIUrl + '/landing/trip-doc-view/' + this._loginControlV2Service.encodedUserId, '_blank');
          } else {
            window.open(environment.baseUIUrl + '/web/landing/trip-doc-view/' + this._loginControlV2Service.encodedUserId, '_blank');
          }
        }
        break;
      case 'click':
        switch (columnData.columnName) {
          case 'customer.name':
            if (columnData.rowData.customer && columnData.rowData.customer.stringId) {
              this.getCusAttributes(columnData.rowData);
            } else {
              this._snackBar.open('No details found.');
            }
            break;
          case 'ecAdjustment':
            if (columnData.rowData.ecAdjustment) {
              this.getECAdjustmentDetails(columnData.rowData);
            } else {
              this._snackBar.open('No details found.');
            }
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
   * To fetch Ec Adjustment Details
   * @param  {any} rowData:rowData
   */
  private getECAdjustmentDetails(rowData: any) {
    this._dialog.open(TripEcAdjustmentDetailsModalComponent, {
      data: {
        rowData: rowData
      }
    });
  }

  /**
   * To get EC Attributes
   * @param  {any} rowData: rowData
   */
  private getCusAttributes(rowData: any) {
    this._dialog.open(TripEcAttributeModalComponent, {
      data: {
        rowData: rowData
      }
    });
  }

  /**
   * Method used to create the configuration of grid.
   */
  private getGridConfiguration() {
    this.gridConfiguration.uniqueColumnName = TripManagementConstant.UNIQUE_COLUMN;
    this.gridConfiguration.isCheckbox1Enabled = true;
    this.gridConfiguration.isCheckbox1AtEnd = true;
    this.gridConfiguration.isActionButtonEnabled = true;
    this.gridConfiguration.isActionExtraButtonEnabled = true;
    this.gridConfiguration.isFilterTabEnabled = true;
    this.gridConfiguration.isSortingEnabled = true;
    this.gridConfiguration.sortOrder = 'desc';
    this.gridConfiguration.sortColumnName = TripManagementConstant.SORT_COLUMN;
    this.gridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfiguration.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.filterTabList = [
      { label: TripManagementConstant.ELIGIBLE_VALUE, key: TripManagementConstant.ELIGIBLE_KEY, toolTipText: 'Eligible for Invoicing' },
      { label: TripManagementConstant.SENT_FOR_VALIDATION_VALUE, key: TripManagementConstant.SENT_FOR_VALIDATION_KEY },
      { label: TripManagementConstant.VALIDATION_FAILED_VALUE, key: TripManagementConstant.VALIDATION_FAILED_KEY },
      { label: TripManagementConstant.READY_FOR_INVOICING_SYSTEM_VALUE, key: TripManagementConstant.READY_FOR_INVOICING_SYSTEM_KEY },
      { label: TripManagementConstant.READY_FOR_INVOICING_MANUAL_VALUE, key: TripManagementConstant.READY_FOR_INVOICING_MANUAL_KEY },
      { label: TripManagementConstant.GENERATED_VALUE, key: TripManagementConstant.GENERATED_KEY },
      { label: TripManagementConstant.SUBMITTED_VALUE, key: TripManagementConstant.SUBMITTED_KEY },
      { label: TripManagementConstant.ALL_VALUE, key: TripManagementConstant.ALL_KEY },
    ];
    if (RoleId.FORTIGO_FINANCE_ROLES.includes(this.roleId) || RoleId.FORTIGO_READ_ONLY_USER === this.roleId) {
      this.gridConfiguration.filterTabList.splice(7, 0, ...[{ label: TripManagementConstant.INVOICE_RESERVED_VALUE, key: TripManagementConstant.INVOICE_RESERVED_KEY }]);
    }
    this.gridConfiguration.css.tableRowHeight = TripManagementConstant.TABLE_ROW_HEIGHT;
    this.setActionButton(0);
  }


  /**
   * Method used for Filter Tab Selection purpose
   * @param  {number} tabIndex
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

    switch (tabIndex) {
      case 0:
        this.requestPayload.tab_filter = TripManagementConstant.ELIGIBLE_KEY;
        this.modifyColumn(false, 'invoicingStatus', this.validationRequestDateColumn);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceNumber);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceDate);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceSubmissionDate);
        this.modifyColumn(true, 'ecPrice', this.vehicleNumber);
        this.getTripInvoicingRowData(this._tripService.tripInvoicingListByTab.eligible_for_invoicing.data);
        break;
      case 1:
        this.requestPayload.tab_filter = TripManagementConstant.SENT_FOR_VALIDATION_KEY;
        this.modifyColumn(false, 'invoicingStatus', this.invoiceNumber);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceDate);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceSubmissionDate);
        this.modifyColumn(true, 'invoicingStatus', this.validationRequestDateColumn);
        this.modifyColumn(true, 'ecPrice', this.vehicleNumber);
        this.getTripInvoicingRowData(this._tripService.tripInvoicingListByTab.sent_for_validation.data);
        break;
      case 2:
        this.requestPayload.tab_filter = TripManagementConstant.VALIDATION_FAILED_KEY;
        this.modifyColumn(false, 'invoicingStatus', this.validationRequestDateColumn);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceNumber);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceDate);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceSubmissionDate);
        this.modifyColumn(true, 'ecPrice', this.vehicleNumber);
        this.getTripInvoicingRowData(this._tripService.tripInvoicingListByTab.validation_rejected.data);
        break;
      case 3:
        this.requestPayload.tab_filter = TripManagementConstant.READY_FOR_INVOICING_SYSTEM_KEY;
        this.modifyColumn(false, 'invoicingStatus', this.validationRequestDateColumn);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceNumber);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceDate);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceSubmissionDate);
        this.modifyColumn(true, 'ecPrice', this.vehicleNumber);
        this.getTripInvoicingRowData(this._tripService.tripInvoicingListByTab.ready_for_invoicing_system.data);
        break;
      case 4:
        this.requestPayload.tab_filter = TripManagementConstant.READY_FOR_INVOICING_MANUAL_KEY;
        this.modifyColumn(false, 'invoicingStatus', this.validationRequestDateColumn);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceNumber);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceDate);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceSubmissionDate);
        this.modifyColumn(true, 'ecPrice', this.vehicleNumber);
        this.getTripInvoicingRowData(this._tripService.tripInvoicingListByTab.ready_for_invoicing_manual.data);
        break;
      case 5:
        this.requestPayload.tab_filter = TripManagementConstant.GENERATED_KEY;
        this.modifyColumn(true, 'invoicingStatus', this.invoiceNumber);
        this.modifyColumn(true, 'invoicingStatus', this.invoiceDate);
        this.modifyColumn(false, 'invoicingStatus', this.validationRequestDateColumn);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceSubmissionDate);
        this.modifyColumn(false, 'ecPrice', this.vehicleNumber);
        this.getTripInvoicingRowData(this._tripService.tripInvoicingListByTab.submission_pending.data);
        break;
      case 6:
        this.requestPayload.tab_filter = TripManagementConstant.SUBMITTED_KEY;
        this.modifyColumn(true, 'invoicingStatus', this.invoiceNumber);
        this.modifyColumn(true, 'invoicingStatus', this.invoiceDate);
        this.modifyColumn(true, 'invoicingStatus', this.invoiceSubmissionDate);
        this.modifyColumn(false, 'invoicingStatus', this.validationRequestDateColumn);
        this.modifyColumn(false, 'ecPrice', this.vehicleNumber);
        this.getTripInvoicingRowData(this._tripService.tripInvoicingListByTab.submitted.data);
        break;
      case 7:
        this.requestPayload.tab_filter = TripManagementConstant.INVOICE_RESERVED_KEY;
        this.modifyColumn(false, 'invoicingStatus', this.validationRequestDateColumn);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceNumber);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceDate);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceSubmissionDate);
        this.modifyColumn(true, 'ecPrice', this.vehicleNumber);
        this.getTripInvoicingRowData(this._tripService.tripInvoicingListByTab.invoice_reserved.data);
        break;
      case 8:
        // hide footer message, if search text contains comma
        this.requestPayload.tab_filter = null;
        this.modifyColumn(false, 'invoicingStatus', this.validationRequestDateColumn);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceNumber);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceDate);
        this.modifyColumn(false, 'invoicingStatus', this.invoiceSubmissionDate);
        this.modifyColumn(true, 'ecPrice', this.vehicleNumber);
        if (this.hasMultiSearch !== true && !this.requestPayload.search_text && !this.isFilterAppliedOnTrips(this.requestPayload.filter)) {
          this.rowsData = [];
          this.gridConfiguration.customFooterMessage = 'Please apply filter to view data';
        } else {
          this.getTripInvoicingRowData(this._tripService.tripInvoicingListByTab.all.data);
        }
        break;
      default:
        break;
    }

    if (this._tripService.tripInvoicingListByTab[this.requestPayload.tab_filter === null ? TripManagementConstant.ALL_KEY : this.requestPayload.tab_filter].data && tabIndex !== 8) {
      this.rowsData = this._tripService.tripInvoicingListByTab[this.requestPayload.tab_filter === null ? TripManagementConstant.ALL_KEY : this.requestPayload.tab_filter].data;
    }
  }

  private isFilterAppliedOnTrips(filter: Filter): boolean {
    const filterKeys = Object.getOwnPropertyNames(filter);
    for (let i = 0; i < filterKeys.length; i++) {
      if (this.requestPayload.filter[filterKeys[i]] !== '' && this.requestPayload.filter[filterKeys[i]] !== null) {
        return true;
      }
    }
    return false;
  }

  /**
   * The function to modify column - add or delete
   * @param  {boolean} isAdd: is adding or removing column
   * @param  {string} afterColumn: column after which column need to be added
   * @param  {Column} columnToAdd: column data to add to columns for grid
   */
  // ANCHOR @mayur move it to inside grid.
  private modifyColumn(isAdd: boolean, afterColumn: string, columnToAdd: Column) {
    let columnIndex = 0;
    let isColumnPresent = false;
    this.columnsData.forEach((column, index) => {
      if (column.columnDef === afterColumn) {
        columnIndex = index;
      }
      if (columnToAdd.columnDef === column.columnDef) {
        isColumnPresent = true;
      }
    });
    if (isAdd === true) {
      if (isColumnPresent) {
        return;
      }
      this.columnsData.splice(columnIndex, 0, ...[columnToAdd]);
    } else {
      if (isColumnPresent) {
        this.columnsData = this.columnsData.filter((eachColumnsData: Column) => {
          if (eachColumnsData.columnDef.includes(columnToAdd.columnDef)) {
            return false;
          } else {
            return true;
          }
        });
      }
    }
  }

  /** This get the row data on tab click
   * @param  {Array<any>} requestedArray: requested tab array.
   */
  private getTripInvoicingRowData(requestedArray: Array<any>) {
    if (requestedArray && requestedArray.length) {
      this.rowsData = requestedArray;
    } else {
      this.clearBadgeCount();
      this._metadataService.getTabData(this.requestPayload);
    }
  }

  /**
   * Clearing the multiple selection on data refresh.
   */
  private clearMultiTripSelection() {
    this.selectedDataRows = [];
    this.isMultiTripSelected = false;
  }

  /**
   * Method for creating columns for Trip Invoicing Screen.
   */
  private getColumnData() {
    this.columnsData = [
      { columnDef: 'tripId', headerName: 'Trip Id', dataType: DataType.Number, width: '40px', css: { userSelect: 'text' } },
      { columnDef: 'pickUpDate', headerName: 'Pickup Date', width: '10px', dataFormat: DataFormat.LocalDate, dataType: DataType.Date },
      { columnDef: 'customer.name', headerName: 'Customer Name', width: '200px', action: 'click', innerCells: 2 },
      { columnDef: 'tripType', headerName: 'Trip Type' },
      { columnDef: 'shipmentLocation', headerName: 'Shipment Location', width: '200px' },
      { columnDef: 'accountManager', headerName: 'Account Manager', dataType: DataType.String, innerCells: 2, width: '150px' },
      { columnDef: 'tripSalesManager', headerName: 'Trip Sales Manager', dataType: DataType.String },
      { columnDef: 'servicedBy', headerName: 'Invoicing Entity', width: '100px' },
      { columnDef: 'from', headerName: 'From', dataType: DataType.String, innerCells: 2 },
      { columnDef: 'to', headerName: 'To', dataType: DataType.String },
      { columnDef: 'vehicleNumber', headerName: 'Vehicle Number', dataType: DataType.String, innerCells: 1, css: { userSelect: 'text' }, width: '10px' },
      { columnDef: 'ecPrice', headerName: 'EC Price', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { textColor: 'blue' }, innerCells: 2, headerCalculatedDataType: CalculationDataType.Sum, width: '95px', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
      { columnDef: 'ecAdjustment', headerName: 'EC Adjustment', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { textColor: 'blue' }, headerCalculatedDataType: CalculationDataType.Sum, action: 'click', dataCalculationFormat: DataCalculationFormat.CurrencyInLac },
      { columnDef: 'ePoDUploadDate', headerName: 'ePoD', innerCells: 2, disableHeaderToolTipText: false, title: 'ePoD Upload Date', width: '10px', dataFormat: DataFormat.LocalDate, dataType: DataType.Date },
      { columnDef: 'pPoDUploadDate', headerName: 'pPoD', disableHeaderToolTipText: false, title: 'pPoD Upload Date', dataFormat: DataFormat.LocalDate, dataType: DataType.Date },
      { columnDef: 'invoicingStatus', headerName: 'Status', dataType: DataType.String, disableHeaderToolTipText: false, dataFormat: DataFormat.Title, title: 'Invoicing Status', rowToolTipTextFormat: DataFormat.Title, css: { horizontalAlign: 'center' }, width: '100px' },
      { columnDef: 'linkToDocs', headerName: 'Doc(s)', css: { horizontalAlign: 'center' }, width: '8px', action: 'view' },
    ];
  }

  /**
   * Method used to get all Filter fields.
   */
  private getFilterFields() {
    this.groups = [{ id: 1, title: 'Customer Details' }, { id: 2, title: 'City' }, { id: 3, title: 'pPoD Upload Date Range' }, { id: 4, title: 'ePoD Upload Date Range' }, { id: 5, title: 'Pick Up Date Range' }, { id: 6, title: '' }];

    const tripFilterData = this._tripService.tripFilter;
    const cityOptionsList = tripFilterData.locationList;
    const shipmentOptionsList = tripFilterData.shipmentLocationList;

    const cusOptionsList = tripFilterData.endCustomerList;

    const cusNameOptions = new SelectOption('name', 'stringId', cusOptionsList);
    const customerName = new SearchableSelectInputField('Customer Name', 'customerName', cusNameOptions, 12, false, false, undefined, undefined, undefined, undefined, undefined, undefined, 1);
    // FIXME Please use locationID instead of locationName
    const shipmentLocationOption = new SelectOption('locationName', 'locationName', shipmentOptionsList);
    const shipmentLocation = new SearchableSelectInputField('Shipment Location', 'shipmentLocation', shipmentLocationOption, 12, undefined, (this.companyId) ? false : true, undefined, undefined, undefined, undefined, undefined, undefined, 1);
    const cityOptions = new SelectOption('town', 'town', cityOptionsList);
    const fromCity = new SearchableSelectInputField('From', 'fromCity', cityOptions, 6, undefined, false, undefined, undefined, undefined, undefined, undefined, undefined, 2);
    const toCity = new SearchableSelectInputField('To', 'toCity', cityOptions, 6, undefined, false, undefined, undefined, undefined, undefined, undefined, undefined, 2);
    this.getProcessedInternalCustomerList();
    const entityOptions = new SelectOption('name', 'stringId', tripFilterData.internalCustomerList);
    const invoicingEntity = new SearchableSelectInputField('Invoicing Entity', 'invoicingEntity', entityOptions, 6, undefined, false, undefined, undefined, undefined, undefined, undefined, undefined, 6);

    const pPoDUploadDateFrom = new DateInputField('From', 'pPodUploadDateFrom', 6, false, undefined, undefined, undefined, undefined, 3);
    const pPoDUploadDateTo = new DateInputField('To', 'pPodUploadDateTo', 6, false, undefined, undefined, undefined, undefined, 3);
    const ePoDUploadDateFrom = new DateInputField('From', 'ePodUploadDateFrom', 6, false, undefined, undefined, undefined, undefined, 4);
    const ePoDUploadDateTo = new DateInputField('To', 'ePodUploadDateTo', 6, false, undefined, undefined, undefined, undefined, 4);
    let invoicingStatus: any;
    if (tripFilterData.invoicingStatusList) {
      if (tripFilterData.invoicingStatusList['errorMessage']) {
        tripFilterData.invoicingStatusList = [];
      }
      const statusOptions = new SelectOption('name', 'status', tripFilterData.invoicingStatusList);
      invoicingStatus = new SelectInputField('Invoicing Status', 'invoicingStatus', statusOptions, 6, false, undefined, undefined, undefined, undefined, 6);
    }
    const tripTypeOptionList = [{ name: 'To pay', value: 'to_pay' }, { name: 'To be billed', value: 'to_be_billed' }];
    const tripTypeOptions = new SelectOption('name', 'value', tripTypeOptionList);
    const tripType = new SelectInputField('Trip Type', 'tripType', tripTypeOptions, 6, false, undefined, undefined, undefined, undefined, 6);
    const pickUpDateFrom = new DateInputField('From', 'pickupDateFrom', 6, false, undefined, undefined, undefined, undefined, 5);
    const pickUpDateTo = new DateInputField('To', 'pickupDateTo', 6, false, undefined, undefined, undefined, undefined, 5);
    const ePodOrpPodstatusList = [{ name: 'Uploaded', value: 'submitted' }, { name: 'Not Uploaded', value: 'pending' }];
    const ePodOrpPodStatusOption = new SelectOption('name', 'value', ePodOrpPodstatusList);
    const ePodStatus = new SelectInputField('ePod Status', 'ePodStatus', ePodOrpPodStatusOption, 6, false, undefined, undefined, undefined, undefined, 6);
    const pPodStatus = new SelectInputField('pPod Status', 'pPodStatus', ePodOrpPodStatusOption, 6, false, undefined, undefined, undefined, undefined, 6);
    this.filterFields =
      [customerName, shipmentLocation, fromCity, toCity, invoicingEntity, invoicingStatus,
        tripType,
        pPoDUploadDateFrom, pPoDUploadDateTo, ePoDUploadDateFrom, ePoDUploadDateTo, pickUpDateFrom, pickUpDateTo, ePodStatus, pPodStatus];
  }

  /**
   * This will set the Forms based on the position and element
   * @param  {} position: position of the field to remove
   * @param  {} filterField: Field to be added in position of removed field
   */
  private setShipmentLocations(position: number, filterField: any) {
    this.filterFields.splice(position, 1, filterField);
    this.filterFields = <Array<any>>Util.getObjectCopy(this.filterFields);
  }

  /**
   *  selectes the company name and prepares its shipping locations
   * @param  {any} selectedCompany
   */
  public onSelectChanges(selectedCompany: any) {
    if (selectedCompany['name'] === 'customerName') {
      this.companyId = selectedCompany.value;
      this._tripService.getCompanyLoactionList(this.companyId).subscribe((response: any) => {
        this._tripService.tripFilter.shipmentLocationList = response;
        const shipmentOptionsList = this._tripService.tripFilter.shipmentLocationList;
        const shipmentLocationOption = new SelectOption('locationName', 'locationName', shipmentOptionsList);
        const shipmentLocation = new SearchableSelectInputField('Shipment Location', 'shipmentLocation', shipmentLocationOption, 12, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 1);
        this.setShipmentLocations(1, shipmentLocation);
      });
    }
  }

  /**
   * This function gives Internal company List - abbreviated
   */
  private getProcessedInternalCustomerList() {
    if (this._tripService.tripFilter.internalCustomerList && Array.isArray(this._tripService.tripFilter.internalCustomerList)) {
      this._tripService.tripFilter.internalCustomerList.forEach((cusName) => {
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
   * Method used to perform search operations.
   * @param  {any} searchText
   */
  public onSearch(searchText: any) {
    this._tripService.clearFilterTabData();

    // resetting multiple search
    this.hasMultiSearch = false;
    if (searchText.toString().includes(',')) {
      this.requestPayload.tab_filter = null;
    }

    this.requestPayload.search_text = searchText;
    this.refreshData();
  }

  /**
   * Method to enable all the action items.
   */
  private clearActionItemsEnableConfiguration() {
    this.actionItemsDisableConfiguration = {
      isReserveInvoiceDisabled: false,
      rfvDisabled: false,
      validateDisabled: false,
      downloadDataInvoiceDisabled: false,
      viewResInvDisabled: false,
      uploadManualInvDisabled: false,
      generateInvDisabled: false
    };
  }

  /**
   * Method used for adding actions as per given tab filters.
   * @param  {number} tabIndex : index number of tab selected.
   */
  private setActionButton(tabIndex: number) {
    this.gridConfiguration.actionExtraButtonLabelList = new Array<RightClickMenu>();

    this.clearActionItemsEnableConfiguration();
    this.applyActionItemsByTabAndRole(tabIndex);

    this.applyActionItemsConfiguration();
  }

  /**
   * Apply action items by tab and role
   * @param  {number} tabIndex:tabIndex
   */
  private applyActionItemsByTabAndRole(tabIndex: number) {
    switch (tabIndex) {
      case 0:
      case 2:
        this.actionItemsDisableConfiguration.validateDisabled = true;
        break;
      case 1:
        this.actionItemsDisableConfiguration.rfvDisabled = true;
        break;
      case 3:
        this.actionItemsDisableConfiguration.validateDisabled = true;
        break;
      case 4:
        this.actionItemsDisableConfiguration.validateDisabled = true;
        this.actionItemsDisableConfiguration.generateInvDisabled = true;
        break;
      case 5:
      case 6:
        this.actionItemsDisableConfiguration.rfvDisabled = false;
        this.actionItemsDisableConfiguration.viewResInvDisabled = true;
        this.actionItemsDisableConfiguration.isReserveInvoiceDisabled = true;
        this.actionItemsDisableConfiguration.validateDisabled = true;
        this.actionItemsDisableConfiguration.uploadManualInvDisabled = true;
        this.actionItemsDisableConfiguration.generateInvDisabled = true;
        break;
      case 7:
        this.actionItemsDisableConfiguration.isReserveInvoiceDisabled = true;
        this.actionItemsDisableConfiguration.validateDisabled = true;
        this.actionItemsDisableConfiguration.uploadManualInvDisabled = true;
        this.actionItemsDisableConfiguration.generateInvDisabled = true;
        break;
      case 8:
        this.actionItemsDisableConfiguration.viewResInvDisabled = true;
        this.actionItemsDisableConfiguration.validateDisabled = true;
        break;
      default:
        break;
    }

    if (this.roleId !== undefined || this.roleId !== null) {
      this.applyRoleBasedActions(this.roleId, tabIndex);
    }

    if (this.roleId === RoleId.FORTIGO_READ_ONLY_USER || RoleId.FORTIGO_FINANCE_ROLES.includes(this.roleId)) {
      this.actionItemsDisableConfiguration.rfvDisabled = false;
    }
  }

  /**
   * Method used to perform role based actions functionality.
   */
  private applyRoleBasedActions(roleId: number, tabIndex: number) {
    switch (roleId) {

      case RoleId.FBO_TEAM_LEADER:
      case RoleId.FBO_TEAM_MEMBER:
      case RoleId.FBO_WITH_FUEL_PAYMENT:
      case RoleId.FBO_AR:
      case RoleId.FBO_TM_WITHOUT_BANK_ACCOUNT_UPDATE:
      case RoleId.FBO_AR_WITH_BANK_ACCOUNT_UPDATE:
      case RoleId.FBO_TM_WITH_FULL_PAYMENT_ACCESS:
        this.actionItemsDisableConfiguration.validateDisabled = true;
        break;

      case RoleId.SALES_MANAGER:
      case RoleId.OPERATION_MANAGER:
      case RoleId.SALES_MANAGER_PAYMENT_AUTHORIZED:
      case RoleId.OPERATION_MANAGER_PAYMENT_AUTHORIZED:
      case RoleId.OPERATION_MANAGER_SYSTEM:
      case RoleId.REGIONAL_MANAGER:
      case RoleId.KEY_ACCOUNT_MANAGER:
      case RoleId.REGIONAL_KEY_ACCOUNT_MANAGER:
        this.actionItemsDisableConfiguration.isReserveInvoiceDisabled = true;
        this.actionItemsDisableConfiguration.rfvDisabled = true;
        this.actionItemsDisableConfiguration.viewResInvDisabled = true;
        this.actionItemsDisableConfiguration.uploadManualInvDisabled = true;
        if (tabIndex === 3) {
          this.actionItemsDisableConfiguration.generateInvDisabled = false;
        } else {
          this.actionItemsDisableConfiguration.generateInvDisabled = true;
        }
        break;
      case RoleId.FORTIGO_READ_ONLY_USER:
        this.actionItemsDisableConfiguration.isReserveInvoiceDisabled = true;
        this.actionItemsDisableConfiguration.validateDisabled = true;
        this.actionItemsDisableConfiguration.viewResInvDisabled = true;
        this.actionItemsDisableConfiguration.uploadManualInvDisabled = true;
        this.actionItemsDisableConfiguration.generateInvDisabled = true;
        break;

      default:
        break;

    }
  }

  /**
   * Method used to enable/disable the given action items.
   */
  private applyActionItemsConfiguration() {
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Reserve invoice #', 'sideMenuReserveInvoice', this.actionItemsDisableConfiguration.isReserveInvoiceDisabled, 'archive'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Request for Validation', 'sideMenuRequestForValidation', this.actionItemsDisableConfiguration.rfvDisabled, 'assignment'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Validate', 'sideMenuValidate', this.actionItemsDisableConfiguration.validateDisabled, 'how_to_reg'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Export to Excel', 'sideMenuDownloadDataForInvoice', this.actionItemsDisableConfiguration.downloadDataInvoiceDisabled, 'save_alt'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('View reserved invoice #', 'sideMenuViewReserveInvoiceNo', this.actionItemsDisableConfiguration.viewResInvDisabled, 'remove_red_eye'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Upload Manual Invoice', 'sideMenuUploadManualInvoice', this.actionItemsDisableConfiguration.uploadManualInvDisabled, 'publish'));
    this.gridConfiguration.actionExtraButtonLabelList.push(new RightClickMenu('Generate Invoice', 'sideMenuGenerateInvoice', this.actionItemsDisableConfiguration.generateInvDisabled, 'text_format'));
  }

  /**
   * Method used to perform refresh functionality.
   */
  public onRefresh(refreshMode: RefreshMode = 'all') {
    this.clearSearchAndRefresh(refreshMode);

    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    this.refreshData();
  }

  /**
   * This function clears Search and Rerfresh data for request payload
   */
  private clearSearchAndRefresh(refreshMode: RefreshMode) {
    this.clearMultiTripSelection();

    switch (refreshMode) {
      case 'all':
        if (this.requestPayload.search_text) {
          this.requestPayload.search_text = '';
        }
        this.getFilterFields();
        this.requestPayload.filter = new Filter();
        this.showFilterApplied = false;
        this._tripService.clearFilterTabData();
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
   *  To get columns for trip data of Upload Invoice POP UP screen.
   */
  public uploadInvoiceTripColumns(): Array<Column> {
    const uploadInvoiceTripColumn: Array<Column> = [
      { columnDef: 'tripId', headerName: 'Trip ID', dataType: DataType.Number },
      { columnDef: 'pickUpDate', headerName: 'Pickup Dt', dataType: DataType.Date, dataFormat: DataFormat.Date },
      { columnDef: 'from.town', headerName: 'From', dataType: DataType.String, innerCells: 2 },
      { columnDef: 'to.town', headerName: 'To', dataType: DataType.String },
      { columnDef: 'truckNo', headerName: 'Truck No', dataType: DataType.String },
      { columnDef: 'ecPrice', headerName: 'EC Contract Value', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { textColor: 'blue' }, innerCells: 2, isHavingFooter: true, footerCalculatedDataType: CalculationDataType.Sum }, // isHavingFooter: true, footerDataType: FooterDataType.Sum },
      { columnDef: 'ecAdjustment', headerName: 'Adjustment', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { textColor: 'blue' }, isHavingFooter: true, footerCalculatedDataType: CalculationDataType.Sum }, // isHavingFooter: true, footerDataType: FooterDataType.Sum },
      { columnDef: 'gst', headerName: 'GST', dataType: DataType.Date, dataFormat: DataFormat.Date },
      { columnDef: 'total', headerName: 'Total', dataType: DataType.String, dataFormat: DataFormat.Status, rowToolTipTextFormat: DataFormat.Title, css: { horizontalAlign: 'center' }, isHavingFooter: true, footerCalculatedDataType: CalculationDataType.Sum }, // isHavingFooter: true, footerDataType: FooterDataType.Sum },
    ];
    return uploadInvoiceTripColumn;
  }

  /**
   * Method for selecting multiple line items in grid.
   * @param  {Array<any>} selectedData : data related to the trip selected.
   */
  public onCheckboxSelection(selectedData: Array<any>) {
    this.selectedDataRows = selectedData;

    if (this.selectedDataRows.length > 1) {
      this.isMultiTripSelected = true;
      this.gridConfiguration.actionExtraButtonLabelList[1].isDisabled = true; // Disabling rfv
    } else {
      this.isMultiTripSelected = false;
      this.gridConfiguration.actionExtraButtonLabelList[1].isDisabled = this.actionItemsDisableConfiguration.rfvDisabled; // Setting the RFV state in which it was earlier.
    }
  }

  /**
   * Method used to perform submission of filter.
   * @param  {any} filterForm : data corresponding to each filter field i.e. to be submited.
   */
  public submitFilterForm(filterForm: any) {
    this.createFilterData(filterForm);
    this.showFilterApplied = true;
    this.requestPayload.filter = filterForm;

    this.refreshData();
  }

  /**
   * To create filter data familiar to request payload of filter.
   * @param  {any} filterForm : data corresponding to each filter field i.e. to be submited.
   */
  private createFilterData(filterForm: any) {
    const filterKeys = Object.getOwnPropertyNames(filterForm);
    filterKeys.forEach((eachkey) => {
      filterForm[eachkey] = filterForm[eachkey] === '' ? null : filterForm[eachkey];
      if (['ePodUploadDateFrom', 'ePodUploadDateTo', 'pPodUploadDateFrom', 'pPodUploadDateTo', 'pickupDateFrom', 'pickupDateTo'].toString().includes(eachkey) && filterForm[eachkey]) {
        filterForm[eachkey] = filterForm[eachkey].format(FortigoConstant.FILTER_DATE_FORMAT);
      }
    });
  }

  /**
   * To get Request Payload for list trip details.
   */
  private getRequestPayload() {
    this.requestPayload.tab_filter = TripManagementConstant.ELIGIBLE_KEY;
    this.requestPayload.search_text = '';
    this.requestPayload.filter = new Filter();
  }

  /**
   * To clear the filter fields.
   */
  public filterClearClicked() {
    this.companyId = undefined;
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
   * To refresh data for corresponding tab.
   */
  private refreshData() {
    this.rowsData = null;
    this._tripService.tripInvoicingListByTab = new TripInvoicingListByTab();
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
   * To Apply search in all tab when search input comes with comma seperated values.
   */
  public applySearchOnAllTab() {
    this.hasMultiSearch = true;
    this.selectedTabIndex = 8;
    this.onGridFilterTabSelection(this.selectedTabIndex);
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
    fileName = fileName.replace(/"/g, '');
    saveAs(blob, fileName);
  }

  /**
   * Get Menu Action Items as per row data - only for all Tab.
   * @param  {any} rowData: rowData.
   */
  public getActionItemsByInvoicingStatus(rowData: any) {
    if (this.requestPayload.tab_filter === null && environment.name !== 'prod') {
      this.gridConfiguration.actionExtraButtonLabelList = new Array<RightClickMenu>();

      this.clearActionItemsEnableConfiguration();
      const tabIndex = TripManagementConstant.TRIP_INVOICING_TAB_DATA[this.getInvoicingStatus(rowData.invoicingStatus)];
      this.applyActionItemsByTabAndRole(tabIndex);

      this.applyActionItemsConfiguration();
    }
  }
}
