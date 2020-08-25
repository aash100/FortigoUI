/*
 * Created on Tue Aug 20 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import * as moment from 'moment';

import { TextInputField, SelectInputField, SelectOption, DateInputField, NumberInputField, SearchableSelectInputField, TextAreaInputField, UploadInputField, RadioInputField, FieldTypes } from 'src/app/shared/abstracts/field-type.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { RightClickMenu } from 'src/app/shared/models/right-click-menu.model';
import { CellData } from 'src/app/shared/models/cell-data.model';
import { Column, DataType, DataFormat, CalculationDataType, DataCalculationFormat } from 'src/app/shared/models/column.model';
import { ExtraRowsData } from 'src/app/shared/models/extra-rows-data.model';
import { Tab } from 'src/app/shared/models/tab.model';
import { CollectionService } from '../../services/collection/collection.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { CollectionManagementConstant } from '../../constants/CollectionManagementConstant';
import { AutoUnsubscribe } from 'src/app/shared/decorators/auto-unsubscribe.decorator';
import { FieldGroup } from 'src/app/shared/models/field-group.model';
import { FortigoValidators } from 'src/app/shared/models/fortigo-validators.model';
import { Util } from 'src/app/core/abstracts/util';
import { Receipt } from '../../models/collection-list-request-payload.model';
import { FortigoConstant, RoleId } from 'src/app/core/constants/FortigoConstant';
import { ExpandCollapseState } from 'src/app/shared/components/fortigo-grid/fortigo-grid.component';

@Component({
  selector: 'app-collection-modal',
  templateUrl: './collection-modal.component.html',
  styleUrls: ['./collection-modal.component.css'],
})
@AutoUnsubscribe(['addCollectionSubscription'])
export class CollectionModalComponent implements OnInit {
  /**
   * Collection entry fields of collection modal component
   */
  public collectionEntryFields: Array<any>;

  /**
   * Instrument details fields of collection modal component
   */
  public instrumentDetailsFields: Array<any>;

  /**
   * Remarks fields of collection modal component
   */
  public remarksFields: Array<any>;

  /**
   * Tab selected index of collection modal component
   */
  public tabSelectedIndex = 0;

  /**
   * Extra rows of collection modal component
   */
  public extraRows: ExtraRowsData;

  /**
   * Tab list of collection modal component
   */
  public tabList: Array<Tab>;

  /**
   * Determines whether saved button clicked
   */
  public isSaved: boolean;

  /**
   * Determines whether submit button is clicked
   */
  public isSubmit: boolean;

  /**
   * Determines whether approved button is clicked
   */
  public isApproved: boolean;

  /**
   * Determines whether rejected button is clicked
   */
  public isRejected: boolean;

  public buttons: Array<any>;
  public disabledSubmit: boolean;

  /**
   * Current role id of collection modal component
   */
  private roleId: number;

  /**
   * Hide tab of collection modal component
   */
  public hideTab: Array<any>;
  private paymentLocation: any;
  private appropriationPaymentLocation: any;
  private receiptAmount: number;
  private receiptTds: number;
  private editableReceiptAmount: number;
  private receiptCashDiscount: number;
  private tripDeduction: number;
  private noTripDeduction: number;
  private receiptReferenceNumber: string;
  private invoicesIds: Array<any>;
  private tripsIds: Array<any>;
  private defaultyInvoices: Array<any>;
  private appropriationPayload: object = {
    receiptId: undefined,
    invoices: undefined,
    companyId: undefined
  };
  private hardAppropriationReceipt: Receipt = new Receipt();
  private deleteAppropriationFlag: boolean;
  private collectionPayload: any;

  public showModalLoader: boolean;

  public columnsData: Array<Column>;

  /**
   * Rows data of collection modal component
   */
  public rowsData: Array<any> = [];
  public uninvoiceRowsData: Array<any> = [];
  private copyOfRowsData: Array<any> = [];
  private expandedRows: Set<any> = new Set<any>();
  public invoiceData: Array<any> = [];

  private invoiceLevelEditData: Array<any> = [];
  private tripLevelEditData: Array<any> = [];

  // action: string;
  public columnData: CellData;
  public editColumnField: Array<any>;
  public appropriationGridConfigurationData: GridConfiguration = new GridConfiguration();
  public formData: Array<any> = new Array<any>();
  public appropriationFields: Array<any>;
  public totalAppropriationFields: Array<any>;
  public searchingFields: Array<any>;
  public pendingAppropriationFields: Array<any>;
  public isCollectionReadOnly: boolean;
  public encashmentFields: Array<any>;
  public groups: Array<FieldGroup>;
  public updateChanges: Array<any>;
  public appropriationGroup: Array<FieldGroup>;
  public totalAppropriationGroup: Array<FieldGroup>;
  public title: string;
  public isSubmitDisabled: boolean;
  public isSubmitReceiptDisabled: boolean;
  public isExpandButtonDisabled: boolean;

  private collectionId: any;
  private dataSource: any;
  private collectionData = {};
  private modalMode: any;
  private transactionMode: string;
  private collectionStatus: string;
  // identifies edited row in grid
  private checkEditRowsFlag = false;
  private apprPendAmt: NumberInputField;
  private apprPendTDS: NumberInputField;
  private apprPendTripDed: NumberInputField;
  private apprPendNonTripDed: NumberInputField;
  private apprPendCashDiscount: NumberInputField;

  private collectionDetailSubscription: Subscription;
  private searchAppropriationsSubscription: Subscription;
  private getAppropriationsSubscription: Subscription;
  private updateCollectionSubscription: Subscription;

  /**
   * View child of collection modal component
   */
  @ViewChild('instrumentDetailsForm', { static: false }) instrumentForm;

  /**
   * Columns data of collection modal component
   */
  @ViewChild('fortigoTab', { static: false }) tabReference;

  constructor(
    public _dialogRef: MatDialogRef<CollectionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public _data: any,
    public _collectionService: CollectionService,
    private _loginService: LoginControlV2Service
  ) { }

  ngOnInit() {
    this.roleId = Number.parseInt(this._loginService.roleId.toString());
    this.isExpandButtonDisabled = false;
    this.isSubmitReceiptDisabled = false;
    this.tabSelectedIndex = 0;
    this.getFields();
    this.tabList = [{ label: 'Collection Entry' }, { label: 'Appropriation' }];
    this.modalMode = this._data.modalMode;
    this.dataSource = this._data.dataSource;
    if (this.modalMode === 'new') {
      this.title = 'NEW RECEIPT';
      this.collectionStatus = '';
      this.buttons = [{ name: 'Submit', icon: 'send', isDisabled: false }];
    }

    if (this.modalMode === 'edit' || this.modalMode === 'view' || this.modalMode === 'validate' || this.modalMode === 'appropriate' || this.modalMode === 'view_appropriate') {
      this.isCollectionReadOnly = this._data.modalMode === 'view' ? true : false;
      this.isSubmitDisabled = this._data.modalMode === 'view' ? true : false;
      this.collectionId = this._data.collectionId;
      this.dataSource = this._data.dataSource;
      if (this._data.index) {
        this.tabSelectedIndex = this._data.index;
      }
      this.disabledSubmit = false;

      this.collectionDetailSubscription = this._collectionService.getCollectionIdDetail(this.collectionId, this.dataSource).subscribe(
        (response) => {

          this.collectionData = response;
          this.getInvoiceData(response['collectionId'].toString(), true);
          this.collectionStatus = response['collectionStatus'];
          if (response['amountDetails'][6] && response['amountDetails'][6]['amount'] !== 0) {
            this.hardAppropriationReceipt.receiptAmount = response['amountDetails'][6]['amount'].toString();
          } else if (response['amountDetails'][0]) {
            this.hardAppropriationReceipt.receiptAmount = response['amountDetails'][0]['amount'].toString();
          }
          this.hardAppropriationReceipt.invoiceList = [];
          this.hardAppropriationReceipt.receiptId = response['collectionId'].toString();
          this.hardAppropriationReceipt.userId = this._loginService.userId;
          this.appropriationPayload['receiptId'] = response['collectionId'].toString();
          if (response['payerCompany'] && response['payerCompany']['stringId']) {
            this.appropriationPayload['companyId'] = response['payerCompany']['stringId'].toString();
            this.hardAppropriationReceipt.companyId = response['payerCompany']['stringId'].toString();
          }
          switch (this.modalMode) {
            case 'edit':
              this.buttons = [{ name: 'Submit', icon: 'send', isDisabled: false }];
              this.title = 'EDIT RECEIPT';
              if ((this.collectionStatus === CollectionManagementConstant.CLAIMED_ENCASHED_KEY) && !this.isFinanceLoggedIn()) {
                this.tabSelectedIndex = 1;
                this.buttons = [{ name: 'Submit', icon: 'send', isDisabled: true }];
              } else {
                this._data.index ? this.tabSelectedIndex = 1 : this.tabSelectedIndex = 0;
              }
              break;
            case 'view':
              this.buttons = [];
              this.title = 'VIEW RECEIPT';
              break;
            case 'appropriate':
              this.title = 'APPROPRIATION';
              this.buttons = [];
              this.tabSelectedIndex = 1;
              break;
            case 'view_appropriate':
              this.title = 'VIEW APPROPRIATION';
              this.buttons = [];
              this.tabSelectedIndex = 1;
              break;
            case 'validate':
              this.title = 'VALIDATE RECEIPT';
              if (this.isFinanceLoggedIn()) {
                this.buttons = [{ name: 'Approve', icon: 'check', isDisabled: false }, { name: 'Reject', icon: 'close', isDisabled: false }];
              }
              break;
            default:
              break;
          }
          this.getFields();
        }
      );
    }

    this.getGridColumns();
    this.getGridConfiguration();

    if (this._data) {
      this.columnData = this._data.columnData;
      if (this.columnData) {
        this.editColumnField = [new TextInputField(this.columnData.columnName, 'editColumnField', undefined, undefined, undefined, undefined, undefined, this.columnData.rowData[this.columnData.columnName])];
      }
    }
  }

  /**
   * Get invoice data of receipt.
   * @param  {number} collectionId: collection id
   */
  private getInvoiceData(collectionId: number, methodFlag: boolean) {
    this.rowsData = null;

    this.searchAppropriationsSubscription = this._collectionService.getInvoiceData({ collection_id: collectionId.toString() }).subscribe((response: Array<any>) => {
      if (response.length) {
        this.processInvoiceData(response, methodFlag, true);
      } else {
        this.rowsData = [];
      }
    });
  }

  /**
   * This method check if finance user is login.
   */
  private isFinanceLoggedIn(): boolean {
    if (RoleId.FORTIGO_FINANCE_ROLES.includes(this.roleId)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Get/Create fields
   */
  private getFields() {

    this.groups = [{ id: 1, title: 'Instrument Details' }, { id: 2, title: 'Collection Details' }, { id: 3, title: '' }];
    this.appropriationGroup = [{ id: 1, title: '' }];
    this.totalAppropriationGroup = [{ id: 1, title: 'Receipt', columnRatio: 6 }, { id: 2, title: 'Unappropriated', columnRatio: 6 }];

    const modeOptionList = [
      { name: CollectionManagementConstant.MODE_CHEQUE_VALUE, action: CollectionManagementConstant.MODE_CHEQUE_KEY },
      { name: CollectionManagementConstant.MODE_PDC_VALUE, action: CollectionManagementConstant.MODE_PDC_KEY },
      { name: CollectionManagementConstant.MODE_DD_VALUE, action: CollectionManagementConstant.MODE_DD_KEY },
      { name: CollectionManagementConstant.MODE_ONLINE_VALUE, action: CollectionManagementConstant.MODE_ONLINE_KEY },
      { name: CollectionManagementConstant.MODE_CASH_VALUE, action: CollectionManagementConstant.MODE_CASH_KEY },
      { name: CollectionManagementConstant.MODE_OTHERS_KEY, action: CollectionManagementConstant.MODE_OTHERS_KEY }
    ];

    const depositeIntoList = [
      { branchName: 'ICICI Bank (FTAPL) (004705014491)', accountNumber: '004705014491' },
      { branchName: 'ICICI Bank (FNLPL) (004705010988)', accountNumber: '004705010988' },
      { branchName: 'Federal Bank (FTAPL) (21990200001359)', accountNumber: '21990200001359' },
      { branchName: 'Federal Bank (FNLPL) (11040200027319)', accountNumber: '11040200027319' },
      { branchName: 'Federal Bank (Nodal Ac) (21990200000963)', accountNumber: '21990200000963' },
      { branchName: 'Jana Bank (FNLPL) (4536020000123715)', accountNumber: '4536020000123715' },
      { branchName: 'IDFC Escrow (FTAPL) (10048460731)', accountNumber: '10048460731' }
    ];

    /**
     *create submitted by array of objects
     */
    const submittedByObject = {};
    submittedByObject['userId'] = this._loginService.userId;
    submittedByObject['userName'] = this._loginService.name;
    const depositedIntoOption = new SelectOption('branchName', 'accountNumber', depositeIntoList);
    const modeOption = new SelectOption('name', 'action', modeOptionList);
    const searchOptions = new SelectOption('name', 'stringId', this._collectionService.collectionFilter.companyCategory);
    const customerName = new SearchableSelectInputField('EC Name', 'payerCompanyId', searchOptions, undefined, false, false, new FortigoValidators(undefined, undefined, true), undefined, 1, this.collectionData && this.collectionData['payerCompany'] ? this.collectionData['payerCompany']['stringId'] : undefined, undefined, undefined, 2);
    const collectionManagerOptionList = this._collectionService.collectionFilter.collectionManagerList;
    const collectionManagerOption = new SelectOption('managerName', 'managerId', collectionManagerOptionList);
    const collectionManager = new SearchableSelectInputField('Collection Manager', 'collectionManagerId', collectionManagerOption, undefined, false, false, new FortigoValidators(undefined, undefined, true), undefined, 1, this.collectionData && this.collectionData['collectionManager'] ? this.collectionData['collectionManager']['id'] : undefined, undefined, undefined, 2);    // const recieptDateAndTime = new DateInputField('Reciept Date & Time', 'recieptDateAndTime');
    const amount = new NumberInputField('Amount', 'netAmount', 2, false, new FortigoValidators(undefined, undefined, true), undefined, 1, this.collectionData && this.collectionData['amountDetails'] ? +this.collectionData['amountDetails'][0]['amount'] : undefined, 2, 'Currency');
    const tds = new NumberInputField('TDS', 'TDSAmount', 2, false, {}, undefined, 1, this.collectionData && this.collectionData['amountDetails'] ? +this.collectionData['amountDetails'][1]['amount'] : undefined, 2, 'Currency');
    const cashDiscount = new NumberInputField('Cash discount', 'cashDiscount', 2, false, {}, undefined, 1, this.collectionData && this.collectionData['amountDetails'] ? +this.collectionData['amountDetails'][4]['amount'] : undefined, 2, 'Currency');
    const tripDeduction = new NumberInputField('Trip Deduction', 'tripDeductionsAmount', 2, false, {}, undefined, 1, this.collectionData && this.collectionData['amountDetails'] ? +this.collectionData['amountDetails'][2]['amount'] : undefined, 2, 'Currency');
    const nonTripDeduction = new NumberInputField('Non Trip Deduction', 'nonTripDeductionsAmount', 2, false, {}, undefined, 1, this.collectionData && this.collectionData['amountDetails'] ? +this.collectionData['amountDetails'][3]['amount'] : undefined, 2, 'Currency');
    const date = this.collectionData && this.collectionData['transactionDate'] ? Util.convertLocalDateTime(this.collectionData['transactionDate']) : undefined;
    const dateField = new DateInputField('Instrument Date', 'transactionDate', 3, false, new FortigoValidators(undefined, undefined, true), undefined, 1, date, 1, undefined, new Date());
    const depositedInto = new SearchableSelectInputField('Deposited Into', 'receiverAccountId', depositedIntoOption, 3, false, false, new FortigoValidators(undefined, undefined, true), undefined, 1, this.collectionData && this.collectionData['receiverBankAccount'] ? this.collectionData['receiverBankAccount']['accountNumber'] : undefined, undefined, undefined, 1);
    const reference = new TextInputField('Reference', 'referenceNumber', 3, false, new FortigoValidators(undefined, undefined, true), undefined, 1, this.collectionData ? this.collectionData['referenceNumber'] : undefined, 1);
    this.receiptReferenceNumber = this.collectionData ? this.collectionData['referenceNumber'] : '';
    const mode = new SelectInputField('Mode', 'transactionMode', modeOption, 3, false, new FortigoValidators(undefined, undefined, true), undefined, 1, this.collectionData ? this.collectionData['transactionMode'] : undefined, 1);
    const salesRemarks = new TextAreaInputField('FFE Remarks', 'salesRemarks', 12, this.isFinanceLoggedIn(), {}, undefined, 1, (this.collectionData && this.collectionData['remarks'] && this.collectionData['remarks'].salesRemarks) ? this.collectionData['remarks'].salesRemarks : undefined, 3);
    const docUpload = new UploadInputField('Upload Document', 'docUpload', 6, true, undefined, undefined, undefined, undefined, 3);
    const financeRemarks = new TextAreaInputField('Finance Remarks', 'financeRemarks', 12, !this.isFinanceLoggedIn(), {}, undefined, 1, (this.collectionData && this.collectionData['remarks'] && this.collectionData['remarks'].financeRemarks) ? this.collectionData['remarks'].financeRemarks : undefined, 3);
    this.paymentLocation = new SearchableSelectInputField('Payment Location  ', 'paymentLocation', undefined, undefined, false, true, {}, undefined, 1, undefined, undefined, undefined, 2);
    const apprCustomerName = new SearchableSelectInputField('EC Name', 'apprCustomerName', searchOptions, 3, false, true, {}, undefined, undefined, this.collectionData && this.collectionData['payerCompany'] ? this.collectionData['payerCompany']['stringId'] : undefined, undefined, undefined, 1);
    const apprDate = new DateInputField('Encashment Date', 'appDate', 3, true, {}, undefined, undefined, this.collectionData && this.collectionData['encashmentDate'] ? Util.convertLocalDateTime(this.collectionData['encashmentDate']) : undefined, 1);

    // for encashment
    let encashmentAmountData: number;
    if ((this.collectionData && this.collectionData['amountDetails'] && Array.isArray(this.collectionData['amountDetails']) && this.collectionData['amountDetails'].length >= 6) && this.collectionData['amountDetails'][6]['amount'] !== 0) {
      encashmentAmountData = this.collectionData['amountDetails'][6]['amount'];
      this.receiptAmount = encashmentAmountData;
      this.editableReceiptAmount = encashmentAmountData;
    } else if (this.collectionData && this.collectionData['amountDetails'] && Array.isArray(this.collectionData['amountDetails']) && this.collectionData['amountDetails'].length > 0) {
      // FIXME @Sachin please use mode for logic, title is not good to use.
      encashmentAmountData = (this.isFinanceLoggedIn() || this.title === 'APPROPRIATION' || this.title === 'VIEW APPROPRIATION') ? this.collectionData['amountDetails'][0]['amount'] : null;
      this.receiptAmount = this.collectionData['amountDetails'][0]['amount'];
      this.editableReceiptAmount = this.collectionData['amountDetails'][0]['amount'];
    }
    const apprAmt = new NumberInputField('Amount', 'apprAmt', 2, undefined, undefined, undefined, undefined, encashmentAmountData, 1, 'Currency', undefined, 'initial', DataFormat.Currency);

    let appropriationCaseDiscountData: number;
    if (this.collectionData && this.collectionData['amountDetails'] && Array.isArray(this.collectionData['amountDetails']) && this.collectionData['amountDetails'].length >= 4) {
      appropriationCaseDiscountData = Number.parseInt(this.collectionData['amountDetails'][4]['amount'].toString());
      this.receiptCashDiscount = appropriationCaseDiscountData;
    }
    const apprCaseDiscount = new NumberInputField('Cash discount', 'cashdiscount', 2, undefined, undefined, undefined, undefined, appropriationCaseDiscountData, 1, 'Currency', undefined, 'initial', DataFormat.Currency);

    let appropriationTDSData: number;
    if (this.collectionData && this.collectionData['amountDetails'] && Array.isArray(this.collectionData['amountDetails']) && this.collectionData['amountDetails'].length >= 1) {
      appropriationTDSData = Number.parseInt(this.collectionData['amountDetails'][1]['amount'].toString());
      this.receiptTds = appropriationTDSData;
    }
    const apprTDS = new NumberInputField('TDS', 'apprTDS', 2, undefined, undefined, undefined, undefined, appropriationTDSData, 1, 'Currency', undefined, 'initial', DataFormat.Currency);

    let appropriationTripDedData: number;
    if (this.collectionData && this.collectionData['amountDetails'] && Array.isArray(this.collectionData['amountDetails']) && this.collectionData['amountDetails'].length >= 3) {
      appropriationTripDedData = Number.parseInt(this.collectionData['amountDetails'][3]['amount'].toString());
      this.noTripDeduction = appropriationTripDedData;
    }
    const apprTripDed = new NumberInputField('Non Trip Deduction', 'apprTripDed', 3, undefined, undefined, undefined, undefined, appropriationTripDedData, 1, 'Currency', undefined, 'initial', DataFormat.Currency);

    let appropriationNonTripDedData: number;
    if (this.collectionData && this.collectionData['amountDetails'] && Array.isArray(this.collectionData['amountDetails']) && this.collectionData['amountDetails'].length >= 2) {
      appropriationNonTripDedData = Number.parseInt(this.collectionData['amountDetails'][2]['amount'].toString());
      this.tripDeduction = appropriationNonTripDedData;
    }
    const apprNonTripDed = new NumberInputField('Trip Deduction', 'apprTripDed', 2, undefined, undefined, undefined, undefined, appropriationNonTripDedData, 1, 'Currency', undefined, 'initial', DataFormat.Currency);
    this.apprPendAmt = new NumberInputField('Amount', 'apprPendAmt', 2, undefined, undefined, undefined, undefined, encashmentAmountData ? <number>Util.getObjectCopy(encashmentAmountData) : 0, 2, 'Currency', undefined, 'initial', DataFormat.Currency);
    this.apprPendTDS = new NumberInputField('TDS', 'apprPendTDS', 2, undefined, undefined, undefined, undefined, appropriationTDSData ? <number>Util.getObjectCopy(appropriationTDSData) : 0, 2, 'Currency', undefined, 'initial', DataFormat.Currency);
    this.apprPendTripDed = new NumberInputField('Non Trip Deduction', 'apprPendTripDed', 3, undefined, undefined, undefined, undefined, appropriationTripDedData ? <number>Util.getObjectCopy(appropriationTripDedData) : 0, 2, 'Currency', undefined, 'initial', DataFormat.Currency);
    this.apprPendNonTripDed = new NumberInputField('Trip Deduction', 'apprPendNonTripDed', 2, undefined, undefined, undefined, undefined, appropriationNonTripDedData ? <number>Util.getObjectCopy(appropriationNonTripDedData) : 0, 2, 'Currency', undefined, 'initial', DataFormat.Currency);
    this.apprPendCashDiscount = new NumberInputField('Cash discount', 'appCashDiscount', 2, undefined, undefined, undefined, undefined, appropriationCaseDiscountData ? <number>Util.getObjectCopy(appropriationCaseDiscountData) : 0, 2, 'Currency', undefined, 'initial', DataFormat.Currency);
    const encashmentAmount = new NumberInputField('Encashment Amount', 'encashmentAmount', 4, !this.isFinanceLoggedIn(), new FortigoValidators(undefined, undefined, true), undefined, undefined, ((this.collectionData['encashmentDate'] && this.isFinanceLoggedIn()) || (this.collectionData['amountDetails'] && this.collectionData['amountDetails'][6]['amount'])) ? encashmentAmountData : undefined, 3, 'Currency');
    const encashmentDate = new DateInputField('Encashment Date', 'encashmentDate', 4, !this.isFinanceLoggedIn(), new FortigoValidators(undefined, undefined, true), undefined, undefined, this.collectionData && this.collectionData['encashmentDate'] ? Util.convertLocalDateTime(this.collectionData['encashmentDate']) : undefined, 3, undefined, new Date());
    const searchFields = new TextInputField('Search by Invoice No. or Trip Id', 'searchValues', 3, undefined, undefined, undefined, undefined, undefined);
    const appPaymentLocation = new SearchableSelectInputField('Payment Location  ', 'paymentLocation', undefined, undefined, false, true, {}, undefined, 1, undefined, undefined, undefined, 1);

    this.appropriationFields = [
      apprCustomerName,
      appPaymentLocation,
      apprDate,
    ];
    this.searchingFields = [
      searchFields,
    ];
    this.totalAppropriationFields = [
      apprAmt,
      apprTDS,
      apprNonTripDed,
      apprTripDed,
      apprCaseDiscount,
      this.apprPendAmt,
      this.apprPendTDS,
      this.apprPendNonTripDed,
      this.apprPendTripDed,
      this.apprPendCashDiscount,
    ];
    this.pendingAppropriationFields = [
      this.apprPendAmt,
      this.apprPendTDS,
      this.apprPendTripDed,
      this.apprPendNonTripDed,
    ];
    this.collectionEntryFields = [
      customerName,
      collectionManager,
      amount,
      tds,
      tripDeduction,
      nonTripDeduction];

    this.instrumentDetailsFields = [dateField,
      depositedInto,
      reference,
      mode,
    ];
    this.remarksFields = [
      salesRemarks,
      financeRemarks,
      docUpload,
    ];
    this.encashmentFields = [
      depositedInto,
      mode,
      reference,
      dateField,
      amount,
      tds,
      tripDeduction,
      nonTripDeduction,
      cashDiscount,
      customerName,
      this.paymentLocation,
      collectionManager,
      encashmentDate,
      encashmentAmount,
      salesRemarks,
      financeRemarks,
    ];
    if (this.collectionData && this.collectionData['transactionMode']) {
      this.addMoreBankFields({ name: 'transactionMode', value: this.collectionData['transactionMode'] });
    }
    if (this.collectionData && this.collectionData['payerCompany']) {
      this.onCompanyChange({ name: 'payerCompanyId', value: this.collectionData['payerCompany']['stringId'] });
    }
  }

  /**
   * Handles filter tab clicked
   * @param tabIndex: tab number
   */
  public filterTabClicked(tabIndex: number) {
    this.tabSelectedIndex = tabIndex;
    this.extraRows = undefined;
    switch (tabIndex) {
      case 0:
        break;
      case 1:
        if (this.modalMode === 'new') {
          const payload = <any>Util.getObjectCopy(this.createPayloadEncashmentFields());
          if (this.validateForm(payload)) {
            if (payload.referenceNumber && payload.netAmount && payload.payerCompanyId) {
              const companyList = this._collectionService.collectionFilter.companyCategory;
              let companyName: string;
              companyList.forEach(eachCompany => {
                if (eachCompany.stringId === payload.payerCompanyId) {
                  companyName = eachCompany.name;
                }
              });
              const text = 'You have added receipt entry Reference No. ' + payload.referenceNumber + ' for ' + companyName + ' for amount Rs. ' + payload.netAmount + ' Would you like to save and continue with appropriation entry?';
              // const text = 'If you have received the payment advice with invoice numbers or trip IDs, would you like to add the appropriation details?';
              this.tabSelectedIndex = 0;
              Swal.fire({
                title: 'Are you sure?',
                type: 'question',
                width: 500,
                text: text,
                showCancelButton: true,
                confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
                cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
                confirmButtonText: 'Yes, save it!'
              }).then(result => {
                if (result.value) {
                  this.tabSelectedIndex = 1;
                  this.onSubmit(payload, 'appropriationTab');
                } else {
                  // TODO @Ritesh check this
                  setTimeout(() => {
                    this.tabSelectedIndex = 0;
                  }, 0);
                }
              });
            }
          } else {
            // TODO @Ritesh check this
            setTimeout(() => {
              this.tabSelectedIndex = 0;
            }, 0);
          }
        }
        break;
    }
  }

  /**
   * Handle the change of company selection
   * @param  {} event: Data recieve on select change.
   */
  public onCompanyChange(event) {
    if (event.name === 'transactionMode') {
      this.addMoreBankFields(event);
    } else if (event.name === 'payerCompanyId') {
      // this.showModalLoader = true;

      this._collectionService.getPaymentLocation(event.value.toString()).subscribe((res: Array<any>) => {
        // this.showModalLoader = false;

        // if (this.isFinanceLoggedIn()) {
        res.push({ locationName: 'Not Available', locationMapId: '0' });
        // }
        const locationSearchOptions = new SelectOption('locationName', 'locationMapId', res);
        let paymentLocationId;
        // If the EC has only one payment location then it will be auto populate on creating receipt.
        if (this.collectionData && (this.collectionData['paymentLocationId'] === 0 || this.collectionData['paymentLocationId'])) {
          if (this.collectionData['paymentLocationId'] === 0) {
            paymentLocationId = this.collectionData['paymentLocationId'].toString();
            // this.isSubmitDisabled = true;
          } else {
            paymentLocationId = this.collectionData['paymentLocationId'];
          }
        } else {
          if (locationSearchOptions['data'] && locationSearchOptions['data'].length === 1 && locationSearchOptions['data'][0]['locationMapId']) {
            paymentLocationId = locationSearchOptions['data'][0]['locationMapId'];
          }
        }
        this.paymentLocation = new SearchableSelectInputField('Payment Location', 'paymentLocation', locationSearchOptions, 4, false, false, undefined, undefined, 1, paymentLocationId ? paymentLocationId : undefined, undefined, undefined, 2);
        this.appropriationPaymentLocation = new SearchableSelectInputField('Payment Location', 'paymentLocation', locationSearchOptions, 4, false, true, undefined, undefined, 1, paymentLocationId ? paymentLocationId : undefined, undefined, undefined, 1);
        if (this.transactionMode === 'cheque') {
          this.encashmentFields.splice(15, 1, this.paymentLocation);
        } else {
          this.encashmentFields.splice(10, 1, this.paymentLocation);
        }
        this.encashmentFields = <Array<any>>Util.getObjectCopy(this.encashmentFields);
        this.addPaymentLocationToAppropriation();
      });
    }
  }

  /**
   * This method add payment location field to Appropriation form.
   */
  private addPaymentLocationToAppropriation() {
    if (this.collectionData && this.collectionData['paymentLocationId'] || (this.collectionData['paymentLocationId'] === 0)) {
      this.appropriationFields.splice(1, 1, this.appropriationPaymentLocation);
      const tempFields = Util.getObjectCopy(this.appropriationFields);
      this.appropriationFields = [];
      this.appropriationFields = <Array<any>>tempFields;
    }
  }

  /**
   * This Method add more fields to the account form on selection of payment mode.
   * @param  {} event: Selected data.
   */
  private addMoreBankFields(event) {
    const submittedByOption = new SelectOption('userName', 'userId', this._collectionService.collectionFilter.fortigoUsers);

    const depositedBank = new TextInputField('Deposited Bank', 'depositedBank', 3, undefined, {}, undefined, undefined, this.collectionData && this.collectionData['senderBankAccount'] ? this.collectionData['senderBankAccount'].userDefinedBank : '', 1);
    const depositedBranch = new TextInputField('Deposited Branch', 'depositedBranch', 3, undefined, {}, undefined, undefined, this.collectionData && this.collectionData['senderBankAccount'] ? this.collectionData['senderBankAccount'].branchName : '', 1);
    const submittedOn = new DateInputField('Submitted On', 'submittedOnDate', 3, false, {}, undefined, 1, this.collectionData && this.collectionData['submittedOnDate'] ? Util.convertLocalDateTime(this.collectionData['submittedOnDate']) : undefined, 1, undefined, new Date());
    const submittedBy = new SearchableSelectInputField('Submitted By', 'onBehalfOf', submittedByOption, 3, false, undefined, {}, -1, 0, this.collectionData && this.collectionData['onBehalfOf'] ? this.collectionData['onBehalfOf']['id'] : '', undefined, undefined, 1);
    const drawnOn = new TextInputField('Drawn On', 'chequeDrawnOn', 3, false, {}, -1, 1, this.collectionData && this.collectionData['receiverCompany'] ? this.collectionData['chequeDrawnOn'] : undefined, 1);

    let doFieldsExist = true;
    this.encashmentFields.forEach(eachField => {
      if (eachField.placeholder === 'Deposited Bank' || eachField.placeholder === 'Deposited Branch' || eachField.placeholder === 'Submitted On' || eachField.placeholder === 'Submitted By' || eachField.placeholder === 'Drawn On') {
        doFieldsExist = false;
      }
    });
    const date = this.collectionData && this.collectionData['transactionDate'] ? Util.convertLocalDateTime(this.collectionData['transactionDate']) : undefined;
    const currentDate = new Date();
    if (event.value.toLowerCase() === CollectionManagementConstant.MODE_PDC_VALUE.toLowerCase()) {
      const dateField = new DateInputField('Instrument Date', 'transactionDate', 3, false, new FortigoValidators(undefined, undefined, true), undefined, 1, date, 1, new Date(currentDate.setDate(currentDate.getDate() + 1)), undefined);
      this.encashmentFields.splice(3, 1, dateField);
    } else {
      const dateField = new DateInputField('Instrument Date', 'transactionDate', 3, false, new FortigoValidators(undefined, undefined, true), undefined, 1, date, 1, undefined, new Date());
      this.encashmentFields.splice(3, 1, dateField);
    }
    switch (event.value.toLowerCase()) {
      case CollectionManagementConstant.MODE_CHEQUE_VALUE.toLowerCase():
      case CollectionManagementConstant.MODE_PDC_VALUE.toLowerCase():
      case CollectionManagementConstant.MODE_DD_VALUE.toLowerCase():
        this.transactionMode = 'cheque';
        if (doFieldsExist) {
          this.encashmentFields.splice(5, 0, depositedBank, depositedBranch, submittedOn, submittedBy, drawnOn);
          const tempFields = Util.getObjectCopy(this.encashmentFields);
          this.encashmentFields = [];
          this.encashmentFields = <Array<any>>tempFields;
        }
        break;
      case CollectionManagementConstant.MODE_ONLINE_VALUE.toLowerCase():
      case CollectionManagementConstant.MODE_CASH_VALUE.toLowerCase():
      case CollectionManagementConstant.MODE_OTHERS_VALUE.toLowerCase():
        this.transactionMode = '';
        if (!doFieldsExist) {
          this.encashmentFields.splice(5, 5);
        }
        break;
      default:
        break;
    }
  }

  /**
   * Set columns of data grid.
   */
  private getGridColumns() {
    // ANCHOR Please @Mayur fix editable rows issue.
    this.columnsData = [
      { columnDef: 'invoiceNumber', headerName: 'Invoice No', innerCells: 2, action: 'data-expand-collapse', isExpandableRow: true, dataType: DataType.String, width: '125px' },
      { columnDef: 'tripId', headerName: 'Trip ', dataType: DataType.String },
      { columnDef: 'reference', headerName: 'Customer Reference', dataType: DataType.String },
      { columnDef: 'baseAmount', headerName: 'Base Amount', innerCells: 2, dataType: DataType.Number, headerCalculatedDataType: CalculationDataType.Sum, dataFormat: DataFormat.Currency, css: { textColor: 'blue' }, width: '10px' },
      { columnDef: 'taxAmount', headerName: 'GST Amount', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { textColor: 'blue' }, headerCalculatedDataType: CalculationDataType.Sum },
      { columnDef: 'invoiceAmount', headerName: 'Invoice Amount', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { textColor: 'blue' }, headerCalculatedDataType: CalculationDataType.Sum },
      { columnDef: 'outstandingAmount', headerName: 'Outstanding', dataType: DataType.Number, dataFormat: DataFormat.Currency, css: { textColor: 'blue' }, headerCalculatedDataType: CalculationDataType.Sum },
      { columnDef: 'appropriationAmount', headerName: 'Appropriated Amount', width: '10px', subHeader1Colspan: 4, dataType: DataType.Number, dataCalculationFormat: DataCalculationFormat.Currency, css: { textColor: 'blue', horizontalAlign: 'right' }, action: 'edit', editFieldType: FieldTypes.NumberInput, editExpandableFieldType: 'expanded-rows', headerCalculatedDataType: CalculationDataType.Sum, editPrefix: 'Currency', editDataFormat: DataFormat.Currency },
      { columnDef: 'tdsAmount', headerName: 'TDS Witheld', width: '10px', dataType: DataType.Number, dataCalculationFormat: DataCalculationFormat.Currency, css: { textColor: 'blue', horizontalAlign: 'right' }, action: 'edit', editFieldType: FieldTypes.NumberInput, editExpandableFieldType: 'expanded-rows', headerCalculatedDataType: CalculationDataType.Sum, editPrefix: 'Currency', editDataFormat: DataFormat.Currency },
      { columnDef: 'deductionAmount', headerName: 'Trip Deduction', width: '10px', innerCells: 1, dataType: DataType.Number, dataCalculationFormat: DataCalculationFormat.Currency, css: { textColor: 'blue', horizontalAlign: 'right' }, action: 'edit', editFieldType: FieldTypes.NumberInput, editExpandableFieldType: 'expanded-rows', headerCalculatedDataType: CalculationDataType.Sum, editPrefix: 'Currency', editDataFormat: DataFormat.Currency },
      { columnDef: 'nonTripDeductionAmount', headerName: 'Non Trip Deduction', width: '10px', innerCells: 1, dataType: DataType.Number, dataCalculationFormat: DataCalculationFormat.Currency, css: { textColor: 'blue', horizontalAlign: 'right' }, action: 'edit', editFieldType: FieldTypes.NumberInput, editExpandableFieldType: 'expanded-rows', headerCalculatedDataType: CalculationDataType.Sum, editPrefix: 'Currency', editDataFormat: DataFormat.Currency },
      { columnDef: 'cashDiscount', headerName: 'Cash Discount', width: '10px', innerCells: 1, dataType: DataType.Number, dataCalculationFormat: DataCalculationFormat.Currency, css: { textColor: 'blue', horizontalAlign: 'right' }, action: 'edit', editFieldType: FieldTypes.NumberInput, editExpandableFieldType: 'expanded-rows', headerCalculatedDataType: CalculationDataType.Sum, editPrefix: 'Currency', editDataFormat: DataFormat.Currency },
    ];
  }

  /**
   * Creates grid configuration
   */
  private getGridConfiguration() {
    this.appropriationGridConfigurationData.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.appropriationGridConfigurationData.uniqueColumnName = CollectionManagementConstant.UNIQUE_COLUMN_APP;
    this.appropriationGridConfigurationData.css.tableFont = FortigoConstant.FONT_MEDIUM + 'px';
    this.appropriationGridConfigurationData.actionIconList.length = 0;
    this.appropriationGridConfigurationData.uniqueLevel1RowExpansionColumnName = CollectionManagementConstant.UNIQUE_COLUMN_APP;
    this.appropriationGridConfigurationData.actionExtraButtonLabelList.length = 0;
    this.clearActionItemsEnableConfiguration();
    this.applyActionItemsConfiguration(true);
    this.appropriationGridConfigurationData.rowCollapseIcon = 'add_circle';
    this.appropriationGridConfigurationData.rowExpansionIcon = 'remove_circle';
    this.appropriationGridConfigurationData.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.appropriationGridConfigurationData.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.appropriationGridConfigurationData.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.appropriationGridConfigurationData.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
    this.appropriationGridConfigurationData.editableFormConfiguration.css.containerMaxWidth = '100px';
    this.appropriationGridConfigurationData.css.tableOuterHeight = 'auto';
    this.appropriationGridConfigurationData.actionButtonColumnWidth = '40px';
    this.appropriationGridConfigurationData.showExpandCollapseAllIcon = true;
  }

  /**
   * To enable all the action items present in right click menu. CLAIMED_CHECK_RECEIVED_KEY
   */
  private clearActionItemsEnableConfiguration() {
    this.appropriationGridConfigurationData.actionExtraButtonLabelList = new Array<RightClickMenu>();
  }

  /**
   * To apply the configuration i.e. enabling or disabling the action item as per user login.
   * @param  {boolean} isDisabled
   */
  private applyActionItemsConfiguration(isDisabled: boolean) {
    this.appropriationGridConfigurationData.actionExtraButtonLabelList.push(new RightClickMenu('Reverse Appropriation', 'sideMenuEditCollectionData', isDisabled, 'remove_circle_outline'));
    this.appropriationGridConfigurationData.actionExtraButtonLabelList.push(new RightClickMenu('Remove Row From Screen', 'sideMenuEditCollectionData', false, 'remove_circle_outline'));
  }

  /**
   *  On form submit
   * @param payload: Reciept fields
   */
  public onSubmit($event: any, action: string) {
    const payload = <any>Util.getObjectCopy(this.createPayloadEncashmentFields());
    this.collectionPayload = payload;
    // Sending null values if the user does not enter any value.
    payload.payerCompanyId = payload.payerCompanyId ? payload.payerCompanyId.toString() : null;
    payload.TDSAmount = payload.TDSAmount ? payload.TDSAmount.toString() : null;
    payload.collectionManagerId = payload.collectionManagerId ? payload.collectionManagerId.toString() : null;
    payload.encashmentAmount = payload.encashmentAmount ? payload.encashmentAmount.toString() : null;
    payload.netAmount = payload.netAmount ? payload.netAmount.toString() : null;
    payload.nonTripDeductionsAmount = payload.nonTripDeductionsAmount ? payload.nonTripDeductionsAmount.toString() : null;
    payload.onBehalfOf = payload.onBehalfOf ? payload.onBehalfOf.toString() : null;
    payload.receiverCompanyId = payload.receiverCompanyId ? payload.receiverCompanyId.toString() : null;
    payload.tripDeductionsAmount = payload.tripDeductionsAmount ? payload.tripDeductionsAmount.toString() : null;
    payload.requestId = (new Date).getMilliseconds().toString(); // Send current time in Milliseconds.
    payload.TDSAmount = payload.TDSAmount ? payload.TDSAmount.toString() : null;
    payload.cashDiscount = payload.cashDiscount ? payload.cashDiscount.toString() : null;
    payload.otherDeduction = payload.otherDeduction ? payload.otherDeduction.toString() : null;
    payload.tripDeductionsAmount = payload.tripDeductionsAmount ? payload.tripDeductionsAmount.toString() : null;
    payload.nonTripDeductionsAmount = payload.nonTripDeductionsAmount ? payload.nonTripDeductionsAmount.toString() : null;
    payload.depositedBranch = payload.depositedBranch ? payload.depositedBranch : null;
    payload.depositedBank = payload.depositedBank ? payload.depositedBank.toString() : null;
    payload.remarks = { salesRemarks: payload.salesRemarks ? payload.salesRemarks : null, financeRemarks: payload.financeRemarks ? payload.financeRemarks : null };
    payload.transactionDate = payload.transactionDate ? this.changeDateFormat(payload.transactionDate) : null;
    payload.encashmentDate = payload.encashmentDate ? this.changeDateFormat(payload.encashmentDate) : null;
    payload.submittedOnDate = payload.submittedOnDate ? this.changeDateFormat(payload.submittedOnDate) : null;
    payload.senderAccountDetails = { userDefinedBank: payload.depositedBank, branchName: payload.depositedBranch, ifscCode: '' };
    // To be modified later based on discussion with Dinesh sir.
    payload.receiptDate = payload.transactionDate;
    this.setPayloadCollectionStatus(payload, action);
    if (this.validateForm(payload)) {
      this.isSubmitReceiptDisabled = true;
      if (this.modalMode === 'edit' || this.modalMode === 'validate') {
        payload.collection_id = this.collectionId.toString();
        payload.datasource = this.dataSource;
        this.showModalLoader = true;
        if (payload.collectionStatus === 'rejected') {
          Swal.fire({
            title: 'Are you sure, you want to reject the receipt?',
            type: 'question',
            width: 500,
            text: 'This action will reject the receipt',
            showCancelButton: true,
            confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
            cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
            confirmButtonText: 'Yes, reject it!'
          }).then(result => {
            if (result.value) {
              payload.encashmentDate = null;
              payload.encashmentAmount = null;
              this.updateReceipt(payload);
            } else {
              this.isSubmitReceiptDisabled = false;
              this.showModalLoader = false;
            }
          });
        } else {
          this.updateReceipt(payload);
        }

      } else if (this.modalMode === 'new') {
        this.showModalLoader = true;

        this._collectionService.addCollection(payload).subscribe(response => {
          this.showModalLoader = false;

          if (!response['errorCode']) {
            this.isSubmitReceiptDisabled = true;
            Swal.fire('Success', 'Receipt created successfully', 'success');
            this._dialogRef.close('saved');
            if (action === 'appropriationTab') {
              this._collectionService.refresh.next(response['collection_id']);
            } else {
              this.getReceiptAfterSave(response['collection_id']);
            }
          } else {
            this.isSubmitReceiptDisabled = false;
            Swal.fire('Failure', response['errorMessage'], 'error');
          }
        });
      }
    }
  }

  /**
   * Update receipt
   * @param  {} payload: Form data
   */
  private updateReceipt(payload) {
    this._collectionService.updateCollection(payload).subscribe(response => {
      this.showModalLoader = false;
      if (!response['errorCode']) {
        Swal.fire('Success', 'Receipt updated successfully', 'success');
        this._dialogRef.close('updated');
        this._collectionService.refresh.next();
      } else {
        this.isSubmitReceiptDisabled = false;
        Swal.fire('Failure', response['errorMessage'], 'error');
      }
    });
  }

  /**
   * This method opens the receipt in edit mode after saving
   * @param  {} collectionId: Collection Id.
   */
  private getReceiptAfterSave(collectionId) {
    const companyList = this._collectionService.collectionFilter.companyCategory;
    let companyName: string;
    companyList.forEach(eachCompany => {
      if (eachCompany.stringId === this.collectionPayload['payerCompanyId']) {
        companyName = eachCompany.name;
      }
    });
    let text = 'You have added receipt with reference No. ' + this.collectionPayload['referenceNumber'] + ' for ' + companyName + ' for amount Rs. ' + this.collectionPayload['netAmount'] + '.';
    if (this.collectionPayload['paymentLocation'] && this.collectionPayload['paymentLocation'] !== '0') {
      text = text + 'If you have received the payment advice with invoice numbers or trip IDs, would you like to add the appropriation details?';
      Swal.fire({
        title: 'Success',
        type: 'success',
        width: 500,
        text: text,
        showCancelButton: true,
        confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
        cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
        confirmButtonText: 'Yes!'
      }).then(result => {
        if (result.value) {
          this.tabSelectedIndex = 1;
          this._collectionService.refresh.next(collectionId);
        } else {
          this._collectionService.refresh.next();
          this.tabSelectedIndex = 0;
        }
      });
    } else {
      Swal.fire('Success', text, 'success');
    }
  }

  /**
   * To set payload collection status
   * @param  {any} payload : request payload
   * @param  {string} action: action performed by user
   */
  private setPayloadCollectionStatus(payload: any, action: string) {

    switch (action) {
      case 'Approve':
        payload.collectionStatus = 'approved';
        return;  // REVIEW @Mayur: why isn't break is working
      case 'Reject':
        payload.collectionStatus = 'rejected';
        return;
      case 'Submit':
        if (this.collectionStatus !== '') {
          payload.collectionStatus = this.collectionStatus;
        } else {
          payload.collectionStatus = 'requested';
        }
        return;
      default:
        break;
    }
  }

  /**
   * Update encashment amount feild on data selection.
   * @param  {any} event: selected date field
   */
  public onDateChange(event: any) {
    // ANCHOR We will changes this code and remove setTimeOut.
    const encashmentDate = this.encashmentFields.filter((eachField) => {
      return (eachField.name === 'encashmentDate');
    })[0];
    if (this.modalMode === 'new') {
      const netAmount = this.encashmentFields.filter((eachField) => {
        return (eachField.name === 'netAmount');
      })[0];
      setTimeout(() => {
        if (netAmount && netAmount['defaultValue'] && encashmentDate && encashmentDate['defaultValue']) {
          if (event instanceof moment) {
            this.updateChanges = [{
              name: 'encashmentAmount',
              value: netAmount['defaultValue']
            }];
          }
        }
      }, 20);
    } else {
      setTimeout(() => {
        if (encashmentDate && encashmentDate.defaultValue) {
          if (event instanceof moment) {
            this.updateChanges = [{
              name: 'encashmentAmount',
              value: this.getReceiptAmount()
            }];
          }
        }
      }, 20);
    }
  }

  /**
   * Create payload data for receipt form and return that payload values
   * @returns any
   */
  private createPayloadEncashmentFields(): any {
    const encashmentFieldsMap = {};
    this.encashmentFields.forEach((eachField) => {
      encashmentFieldsMap[eachField.name] = eachField.defaultValue ? eachField.defaultValue.toString() : '';
    });
    return encashmentFieldsMap;
  }

  /**
   * this funckion validate the required fields of form.
   * @param  {} payload: Form fields.
   * @returns boolean
   */
  private validateForm(payload): boolean {
    if (!payload.receiverAccountId || payload.receiverAccountId === '' || payload.receiverAccountId === 'NaN') {
      Swal.fire('Please select receiver bank');
      return false;
    } else if (!payload.transactionMode || payload.transactionMode === '' || payload.transactionMode === 'NaN') {
      Swal.fire('Please select mode of payment');
      return false;
    } else if (!payload.referenceNumber || payload.referenceNumber === '' || payload.referenceNumber === 'NaN') {
      Swal.fire('Please enter reference number');
      return false;
    } else if (!payload.transactionDate || payload.transactionDate === '' || payload.transactionDate === 'NaN-0NaN-0NaN') {
      Swal.fire('Please enter transaction date');
      return false;
    } else if (!payload.netAmount || payload.netAmount === '' || payload.netAmount === 'NaN') {
      Swal.fire('Please enter net amount');
      return false;
    } else if ((!payload.payerCompanyId || payload.payerCompanyId === '' || payload.payerCompanyId === 'NaN') && !this.isFinanceLoggedIn()) {
      Swal.fire('Please select the company name');
      return false;
    } else if ((payload.payerCompanyId) && ((payload.paymentLocation === '0') || !payload.paymentLocation || payload.paymentLocation === '' || payload.paymentLocation === 'NaN') && !this.isFinanceLoggedIn()) {
      Swal.fire('Please select payment location');
      return false;
    } else if ((payload.payerCompanyId) && (!payload.paymentLocation || payload.paymentLocation === '' || payload.paymentLocation === 'NaN') && this.isFinanceLoggedIn()) {
      Swal.fire('Please select payment location');
      return false;
    } else if ((payload.payerCompanyId) && (!payload.collectionManagerId || payload.collectionManagerId === '' || payload.collectionManagerId === 'NaN') && !this.isFinanceLoggedIn()) {
      Swal.fire('Please select manager name');
      return false;
    } else if ((payload.paymentLocation && payload.paymentLocation !== '0') && (!payload.collectionManagerId || payload.collectionManagerId === '' || payload.collectionManagerId === 'NaN') && this.isFinanceLoggedIn()) {
      Swal.fire('Please select manager name');
      return false;
    } else if (parseInt(payload.netAmount) <= 0) {
      Swal.fire('Enter valid amount');
      return false;
    } else if ((!payload.encashmentDate || payload.encashmentDate === '' || payload.encashmentDate === 'NaN-0NaN-0NaN') && (payload.collectionStatus === 'approved')) {
      Swal.fire('Please enter encashment date');
      return false;
    } else if ((!payload.encashmentDate || payload.encashmentDate === '' || payload.encashmentDate === 'NaN-0NaN-0NaN') && (this.isFinanceLoggedIn()) && payload.collectionStatus !== 'rejected' && payload.collectionStatus === 'approved') {
      Swal.fire('Please enter encashment date');
      return false;
    } else if ((!payload.encashmentDate || payload.encashmentDate === '' || payload.encashmentDate === 'NaN-0NaN-0NaN') && (this.isFinanceLoggedIn()) && payload.collectionStatus === 'approved') {
      Swal.fire('Please enter encashment date');
      return false;
    } else if ((!payload.encashmentDate || payload.encashmentDate === '' || payload.encashmentDate === 'NaN-0NaN-0NaN') && (this.isFinanceLoggedIn()) && payload.paymentLocation === '0') {
      Swal.fire('Please enter encashment date');
      return false;
    } else if (new Date(payload.encashmentDate).getTime() < new Date(payload.transactionDate).getTime() && payload.encashmentDate && payload.collectionStatus !== 'rejected') {
      Swal.fire('Encashment date cannot be prior to date of instrument');
      return false;
    } else if ((new Date(payload.encashmentDate).getTime() < new Date(payload.submittedOnDate).getTime()) && payload.submittedOnDate && payload.encashmentDate && payload.collectionStatus !== 'rejected') {
      Swal.fire('Encashment date cannot be prior to deposit date');
      return false;
    } else if ((!payload.encashmentAmount || payload.encashmentAmount === '' || payload.encashmentAmount === 'NaN') && (payload.collectionStatus === 'approved')) {
      Swal.fire('Please enter encashment amount');
      return false;
    } else if ((!payload.encashmentAmount || payload.encashmentAmount === '' || payload.encashmentAmount === 'NaN') && (!payload.payerCompanyId || payload.payerCompanyId === '' || payload.payerCompanyId === 'NaN')) {
      Swal.fire('Please enter encashment amount');
      return false;
    } else if ((!payload.encashmentAmount || payload.encashmentAmount === '' || payload.encashmentAmount === 'NaN') && payload.payerCompanyId && this.isFinanceLoggedIn() && payload.encashmentDate && payload.collectionStatus !== 'rejected') {
      Swal.fire('Please enter encashment amount');
      return false;
    } else if ((!payload.encashmentAmount || payload.encashmentAmount === '' || payload.encashmentAmount === 'NaN') && payload.payerCompanyId && this.isFinanceLoggedIn() && payload.paymentLocation === '0') {
      Swal.fire('Please enter encashment amount');
      return false;
    } else if (payload.netAmount && payload.encashmentAmount && (parseInt(payload.encashmentAmount) > parseInt(payload.netAmount)) && payload.collectionStatus !== 'rejected') {
      Swal.fire('Encashment Amount can not be greater than Receipt Amount');
      return false;
    } else if ((parseInt(payload.encashmentAmount) <= 0) && payload.encashmentDate && payload.collectionStatus !== 'rejected') {
      Swal.fire('Enter valid encashment amount');
      return false;
    } else if ((!payload.encashmentAmount || payload.encashmentAmount === '' || payload.encashmentAmount === 'NaN') && (payload.collectionStatus !== 'approved') && payload.encashmentDate && this.isFinanceLoggedIn() && payload.collectionStatus !== 'rejected') {
      Swal.fire('Please enter encashment amount');
      return false;
    } else if ((!payload.encashmentAmount || payload.encashmentAmount === '' || payload.encashmentAmount === 'NaN') && payload.encashmentDate && this.isFinanceLoggedIn() && payload.collectionStatus !== 'rejected') {
      Swal.fire('Please enter encashment amount');
      return false;
    } else if ((!payload.encashmentDate || payload.encashmentDate === '' || payload.encashmentDate === 'NaN-0NaN-0NaN') && this.isFinanceLoggedIn() && payload.encashmentAmount && payload.collectionStatus !== 'rejected') {
      Swal.fire('Please enter encashment date');
      return false;
    } else {
      return true;
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
   * Determines whether cell click on
   * @param cellData
   */
  public onCellClick(cellData: CellData) {
    switch (cellData.action.toLowerCase()) {
      case 'data-expand-collapse'.toLowerCase():
        if (cellData.isForExtraData) {
          this.getExpandedRowData(cellData);
        }
        break;
      case 'click'.toLowerCase():
        break;
      default:
        break;
    }
  }

  /**
   * Search data by invoice number.
   * @param  {string} event: Search field values.
   */
  public onEnterSearch(event: string) {
    if (this.searchAppropriationsSubscription) {
      this.searchAppropriationsSubscription.unsubscribe();
      this.showModalLoader = false;
    }
    if (this.getAppropriationsSubscription) {
      this.getAppropriationsSubscription.unsubscribe();
      this.showModalLoader = false;
    }

    const searchText = event['searchValues'];
    this.disabledSubmit = false;
    this.expandedRows = new Set<any>();
    this.isExpandButtonDisabled = false;
    this.extraRows = undefined;

    if (searchText !== '') {
      this.appropriationPayload['invoices'] = searchText;
      this.showModalLoader = true;

      this.getAppropriationsSubscription = this._collectionService.getAppropriationData(this.appropriationPayload).subscribe((response: Array<Object>) => {
        let tripData = [];
        let checkTripFlag: boolean;
        if (response.length) {
          // Filter trip trips
          response.forEach(eachInvoice => {
            if (!eachInvoice['hardAppropriated']) {
              tripData = [];
              if (eachInvoice['trips'] && eachInvoice['trips'].length) {
                eachInvoice['trips'].forEach(eachTrip => {
                  checkTripFlag = true;
                  if (tripData.length) {
                    for (let i = 0; i < tripData.length; i++) {
                      if (eachTrip['tripId'] === tripData[i]['tripId']) {
                        checkTripFlag = false;
                        break;
                      }
                    }
                  }
                  if (checkTripFlag) {
                    tripData.push(eachTrip);
                  }
                });
              }
              eachInvoice['trips'] = tripData;
            }
          });
          this.showModalLoader = false;
          // Make trips empty inside invoices
          if ((response[0]['invoiceNumber'] === 'UNINVOICED')) {
            this.processInvoiceData(this.addTrip(response), true, true);
          } else {
            this.processInvoiceData(response, true, false);
          }
        } else {
          this.showModalLoader = false;
          Swal.fire('Error', 'One or more invoice/trip does not belong to user.', 'error');
        }
      });
    } else {
      Swal.fire('Error', 'Please enter invoice no.', 'error');
    }
  }

  /**
   * Process invoice data it add the amounts of all trips in each invoice.
   * @param  {any} response: invoice response data.
   */
  private processInvoiceData(response: any, methodFlag: boolean, softAppropriationFlag: boolean) {
    this.invoiceLevelEditData = <Array<any>>Util.getObjectCopy(response);
    this.copyOfRowsData = <Array<any>>Util.getObjectCopy(response);
    let length: number;
    let baseAmount: number;
    let cashDiscount: number;
    let deduction: number;
    let tdsAmount: number;
    let gstAmount: number;
    let appropriatedAmount: number;
    let appropriatedAmountInvoice: number;
    let invoiceDts = 0;
    let invoiceOtherDeductions = 0;
    let invoiceCashDiscount = 0;
    let invoiceTdsAmount: number;
    let tripTdsAmountSum: number;
    let outstandingAmount: number;
    let invoiceAmount: number;
    let invoiceLength: number;
    let originalOutstandingAmount: number;
    if (response.length) {
      invoiceLength = response.length;
    }
    this.receiptAmount = this.getReceiptAmount();
    // Adding editable rows.
    response.forEach(eachInvoice => {
      if (eachInvoice['trips'].length) {
        length = eachInvoice['trips'].length;
        baseAmount = 0;
        cashDiscount = 0;
        deduction = 0;
        tdsAmount = 0;
        invoiceTdsAmount = 0;
        tripTdsAmountSum = 0;
        gstAmount = 0;
        outstandingAmount = 0;
        appropriatedAmount = 0;
        originalOutstandingAmount = 0;
        invoiceAmount = 0;
        appropriatedAmountInvoice = 0;
        let tempTdsAmount = 0;
        eachInvoice['trips'].forEach(eachTrip => {
          eachTrip['nonTripDeductionAmount_isReadOnly'] = true;
          if (eachTrip['hardAppropriated'] || eachTrip['claimed'] || eachTrip['partiallyAppropriated']) {
            if (eachTrip['hardAppropriated']) {
              eachTrip['invoiceAmount'] = eachTrip['totalAmount'];
              eachTrip['appropriationAmount_isReadOnly'] = true;
              eachTrip['tdsAmount_isReadOnly'] = true;
              eachTrip['cashDiscount_isReadOnly'] = true;
              eachTrip['deductionAmount_isReadOnly'] = true;
            }
            if (eachTrip['referenceNumber'] === this.receiptReferenceNumber) {
              this.receiptAmount -= eachTrip['appropriationAmount'];
            }
            invoiceTdsAmount += eachTrip['tdsAmount'];
            eachTrip['tdsAmount'] = (eachTrip['tdsAmount']) ? (eachTrip['tdsAmount']).toFixed(2) : 0;
          } else {
            eachTrip['tdsAmount'] = Math.round(Number(((eachTrip['baseAmount'] * 2) / 100).toFixed(2)));
            tempTdsAmount = ((eachTrip['baseAmount'] * 2) / 100);
            tripTdsAmountSum += Number(eachTrip['tdsAmount']);
            eachTrip['outstandingAmount'] = eachTrip['totalAmount'];
            eachTrip['originalOutstandingAmount'] = eachTrip['totalAmount'];
            appropriatedAmount += Number(eachTrip['appropriationAmount'].toFixed(2));
            if (this.receiptAmount) {
              const tempAmount = eachTrip['outstandingAmount'];
              if (this.receiptAmount >= tempAmount) {
                if (eachTrip['appropriationAmount'] === 0) {
                  eachTrip['appropriationAmount'] = Number((eachTrip['totalAmount'] - eachTrip['tdsAmount']).toFixed(2));
                } else {
                  eachTrip['appropriationAmount'] = Number((tempAmount - eachTrip['tdsAmount']).toFixed(2));
                }
              } else {
                eachTrip['appropriationAmount'] = Number((eachTrip['totalAmount'] - eachTrip['tdsAmount']).toFixed(2));
              }
            }
          }
          if (eachTrip['partiallyAppropriated']) {
            eachTrip['outstandingAmount'] = -eachTrip['outstandingAmount'];
          } else {
            eachTrip['outstandingAmount'] = eachTrip['totalAmount'] - (eachTrip['appropriationAmount'] + Number(eachTrip['tdsAmount']) + eachTrip['deductionAmount'] + eachTrip['nonTripDeductionAmount'] + eachTrip['cashDiscount']);
            if (eachTrip['outstandingAmount'] < 0 && !eachTrip['partiallyAppropriated']) {
              eachTrip['outstandingAmount'] = 0;
            }
          }
          baseAmount += eachTrip['baseAmount'];
          cashDiscount += eachTrip['cashDiscount'];
          deduction += eachTrip['deductionAmount'];
          gstAmount += eachTrip['taxAmount'];
          outstandingAmount += eachTrip['outstandingAmount'];
          originalOutstandingAmount += eachTrip['originalOutstandingAmount'];
          appropriatedAmountInvoice += Number(eachTrip['appropriationAmount'].toFixed(2));
          invoiceAmount += Number(eachTrip['invoiceAmount']);
          if (eachTrip['claimed']) {
            tdsAmount += eachTrip['tdsAmount'];
          }
        });
        eachInvoice['baseAmount'] = baseAmount;
        eachInvoice['cashDiscount'] = cashDiscount;
        eachInvoice['deductionAmount'] = deduction;
        eachInvoice['taxAmount'] = gstAmount;
        eachInvoice['tdsAmount'] = tdsAmount ? Math.round(tdsAmount) : Math.round(tripTdsAmountSum);
        eachInvoice['originalOutstandingAmount'] = originalOutstandingAmount;
        eachInvoice['invoiceAmount'] = invoiceAmount;
        if (!eachInvoice['claimed']) {
          eachInvoice['appropriationAmount'] = Number(appropriatedAmountInvoice.toFixed(2));
        }
        if (eachInvoice['hardAppropriated']) {
          if (isNaN(eachInvoice['outstandingAmount'])) {
            eachInvoice['outstandingAmount'] = 0;
          }
          eachInvoice['tdsAmount'] = invoiceTdsAmount.toFixed(2);
          eachInvoice['outstandingAmount'] = Number(eachInvoice['invoiceAmount'] ? eachInvoice['invoiceAmount'] : 0) - (Number(eachInvoice['appropriationAmount'] ? eachInvoice['appropriationAmount'] : 0) + Number(eachInvoice['tdsAmount'] ? eachInvoice['tdsAmount'] : 0) + Number(eachInvoice['deductionAmount'] ? eachInvoice['deductionAmount'] : 0) + Number(eachInvoice['nonTripDeductionAmount'] ? eachInvoice['nonTripDeductionAmount'] : 0) + Number(eachInvoice['cashDiscount'] ? eachInvoice['cashDiscount'] : 0));
          if (eachInvoice['partiallyAppropriated']) {
            eachInvoice['outstandingAmount'] = Number(eachInvoice['outstandingAmount'] ? eachInvoice['outstandingAmount'] : 0) - (Number(eachInvoice['appropriationAmount'] ? eachInvoice['appropriationAmount'] : 0) + Number(eachInvoice['tdsAmount'] ? eachInvoice['tdsAmount'] : 0) + Number(eachInvoice['deductionAmount'] ? eachInvoice['deductionAmount'] : 0) + Number(eachInvoice['nonTripDeductionAmount'] ? eachInvoice['nonTripDeductionAmount'] : 0) + Number(eachInvoice['cashDiscount'] ? eachInvoice['cashDiscount'] : 0));
          }
          if (eachInvoice['outstandingAmount'] < 0) {
            eachInvoice['outstandingAmount'] = 0;
          }
          eachInvoice['appropriationAmount_isReadOnly'] = true;
          eachInvoice['tdsAmount_isReadOnly'] = true;
          eachInvoice['cashDiscount_isReadOnly'] = true;
          eachInvoice['deductionAmount_isReadOnly'] = true;
          eachInvoice['nonTripDeductionAmount_isReadOnly'] = true;
          this.deleteAppropriationFlag = true;
          this.isSubmitDisabled = true;
          this.clearActionItemsEnableConfiguration();
          if (this.isFinanceLoggedIn()) {
            this.applyActionItemsConfiguration(false);
          } else {
            this.applyActionItemsConfiguration(true);
          }
        } else {
          if (eachInvoice['invoiceNumber'] === 'UNINVOICED') {
            eachInvoice['appropriationAmount_isReadOnly'] = true;
            eachInvoice['tdsAmount_isReadOnly'] = true;
            eachInvoice['cashDiscount_isReadOnly'] = true;
            eachInvoice['deductionAmount_isReadOnly'] = true;
            eachInvoice['nonTripDeductionAmount_isReadOnly'] = true;
          }
          eachInvoice['outstandingAmount'] = outstandingAmount;
          if (eachInvoice['claimed']) {
            if (!this.isFinanceLoggedIn()) {
              this.isSubmitDisabled = true;
            } else {
              if (!this.collectionData['encashmentDate']) {
                this.isSubmitDisabled = true;
              }
            }
          } else {
            if (this.collectionData['paymentLocationId'] === 0) {
              this.isSubmitDisabled = true;
            } else {
              this.isSubmitDisabled = false;
            }
          }
          this.deleteAppropriationFlag = false;
          this.receiptAmount -= eachInvoice['appropriationAmount'];
          this.clearActionItemsEnableConfiguration();
          this.applyActionItemsConfiguration(false);
        }
      }
      invoiceDts += eachInvoice['tdsAmount'];
      invoiceOtherDeductions += eachInvoice['deductionAmount'];
      invoiceCashDiscount += eachInvoice['cashDiscount'];
    });
    if (softAppropriationFlag) {
      this.rowsData = <Array<any>>Util.getObjectCopy(response);
    } else {
      this.addInvoiceInExistingList(<Array<any>>Util.getObjectCopy(response));
    }
    // Update Form on Search invoices or trips.
    this.apprPendAmt = new NumberInputField('Amount', 'apprPendAmt', 2, undefined, undefined, undefined, undefined, this.receiptAmount ? Math.ceil(this.receiptAmount) : 0, 2, 'Currency', undefined, 'initial', DataFormat.Currency);
    this.apprPendTDS = new NumberInputField('TDS', 'apprPendTDS', 2, undefined, undefined, undefined, undefined, this.receiptTds ? this.receiptTds : 0, 2, 'Currency', undefined, 'initial', DataFormat.Currency);
    this.apprPendTripDed = new NumberInputField('Non Trip Deduction', 'apprPendTripDed', 2, undefined, undefined, undefined, undefined, this.noTripDeduction ? this.noTripDeduction : 0, 2, 'Currency', undefined, 'initial', DataFormat.Currency);
    this.apprPendNonTripDed = new NumberInputField('Trip Deduction', 'apprPendNonTripDed', 3, undefined, undefined, undefined, undefined, this.tripDeduction ? this.tripDeduction : 0, 2, 'Currency', undefined, 'initial', DataFormat.Currency);
    this.apprPendCashDiscount = new NumberInputField('Cash discount', 'appCashDiscount', 2, undefined, undefined, undefined, undefined, this.receiptCashDiscount && this.receiptCashDiscount > invoiceCashDiscount ? this.receiptCashDiscount - invoiceCashDiscount : 0, 2, 'Currency', undefined, 'initial', DataFormat.Currency);

    this.totalAppropriationFields.splice(5, 5, this.apprPendAmt, this.apprPendTDS, this.apprPendNonTripDed, this.apprPendTripDed, this.apprPendCashDiscount);
    const tempFields = Util.getObjectCopy(this.totalAppropriationFields);

    this.totalAppropriationFields = [];
    this.totalAppropriationFields = <Array<any>>tempFields;

    if (this.rowsData.length && this.rowsData[0]['invoiceNumber'] === 'UNINVOICED' && !this.rowsData[0]['hardAppropriated']) {
      this.gridExpandCollapse(this.rowsData);
    }

    this.showModalLoader = false;
  }

  /**
   * This method add trip to the uninvoice data
   * @param  {} response
   */
  private addTrip(response) {
    let checkInvoice: boolean;
    if (!this.uninvoiceRowsData) {
      this.uninvoiceRowsData = [];
    }
    if (this.uninvoiceRowsData && this.uninvoiceRowsData.length && this.uninvoiceRowsData[0]['trips'] && this.uninvoiceRowsData[0]['trips'].length) {
      if (response[0]['trips'] && response[0]['trips'].length) {
        for (let tripIndex = 0; tripIndex < response[0]['trips'].length; tripIndex++) {
          checkInvoice = true;
          for (let index = 0; index < this.uninvoiceRowsData[0]['trips'].length; index++) {
            if (this.uninvoiceRowsData[0]['trips'][index]['tripId'] === response[0]['trips'][tripIndex]['tripId']) {
              checkInvoice = false;
              break;
            }
          }
          if (this.uninvoiceRowsData.length && checkInvoice) {
            this.extraRows = this.uninvoiceRowsData[0]['trips'];
            this.uninvoiceRowsData[0]['trips'] = this.uninvoiceRowsData[0]['trips'].concat(response[0]['trips']);
          }
        }
      }
    } else {
      this.uninvoiceRowsData = response;
    }
    return this.uninvoiceRowsData;
  }

  /**
   * This method add invoice in the existing list
   * @param  {} response: Searched invoices
   */
  private addInvoiceInExistingList(response) {
    let checkInvoice: boolean;
    if (response && response.length) {
      for (let index = 0; index < response.length; index++) {
        checkInvoice = true;
        if (this.rowsData && this.rowsData.length) {
          for (let rowIndex = 0; rowIndex < this.rowsData.length; rowIndex++) {
            if (this.rowsData[rowIndex]['invoiceNumber'] === response[index]['invoiceNumber']) {
              checkInvoice = false;
              break;
            }
          }
        }
        if (checkInvoice) {
          if (!this.rowsData) {
            this.rowsData = [];
          }
          this.rowsData = this.rowsData.concat(<Array<any>>Util.getObjectCopy([response[index]]));
        }
      }
    }
    this.updateUnappropriatedAmount();
  }

  /**
   * This method uses to update acttual receipt amouny
   */
  private getReceiptAmount(): number {
    let encashmentAmountData: number;
    if ((this.collectionData && this.collectionData['amountDetails'] && Array.isArray(this.collectionData['amountDetails']) && this.collectionData['amountDetails'].length >= 6) && this.collectionData['amountDetails'][6]['amount'] !== 0) {
      encashmentAmountData = this.collectionData['amountDetails'][6]['amount'];
    } else if (this.collectionData && this.collectionData['amountDetails'] && Array.isArray(this.collectionData['amountDetails']) && this.collectionData['amountDetails'].length > 0) {
      encashmentAmountData = this.collectionData['amountDetails'][0]['amount'];
    }
    return encashmentAmountData;
  }

  /**
   * This function is used to get expanded data for clicked row item.
   *
   * @param  {CellData} cellData: Cell Data of clicked row
   */
  private getExpandedRowData(cellData: CellData) {
    switch (cellData.columnName.toString().toLowerCase()) {
      case 'invoiceNumber'.toLowerCase():
        this.getRowDataIndex(cellData);
        this.setExtraRowsData(cellData.rowData, cellData.columnName, cellData.rowExpansionLevel);
        break;
      default:
        break;
    }
  }

  /**
   * Set data for all inner rows for expansion
   */
  public onExpandAll() {
    this.gridExpandCollapse(this.rowsData);
    this.showModalLoader = false;
  }

  /**
   * Updates state of all row expanse/collapse
   * @param  {ExpandCollapseState} $event: State for Expand/Collapse
   */
  public onAllRowExpandCollapseStateClick($event: ExpandCollapseState) {
    switch ($event) {
      case 'isCollapsed':
        this.expandedRows = new Set<any>();
        break;
      case 'isExpanded':
        if (this.rowsData && this.rowsData.length) {
          this.rowsData.forEach((eachRowData) => {
            if (!Object.getOwnPropertyNames(eachRowData).toString().includes('tripInvoiceNumber')) {
              if (!this.expandedRows.has(eachRowData[this.appropriationGridConfigurationData.uniqueColumnName])) {
                this.expandedRows.add(eachRowData[this.appropriationGridConfigurationData.uniqueColumnName]);
              }
            }
          });
        }
        break;
    }
  }

  /**
   * This method capture the data index of expended row.
   * @param  {} cellData
   */
  private getRowDataIndex(cellData) {
    this.copyOfRowsData.forEach((eachInvoice) => {
      if (eachInvoice[this.appropriationGridConfigurationData.uniqueColumnName] === cellData.rowData[this.appropriationGridConfigurationData.uniqueColumnName]) {
        if (!this.expandedRows.has(eachInvoice[this.appropriationGridConfigurationData.uniqueColumnName])) {
          this.expandedRows.add(eachInvoice[this.appropriationGridConfigurationData.uniqueColumnName]);
        }
      }
    });
  }

  /**
   * This method expand all the rows at first level.
   * @param  {Array<any>} rowsData: array of row
   */
  private gridExpandCollapse(rowsData: Array<any>) {
    this.showModalLoader = true;
    rowsData.forEach((eachInvoice, index) => {
      const timeout = 20 * (index + 1);
      setTimeout(() => {
        this.setExtraRowsData(eachInvoice, 'invoiceNumber', 0);
        if (rowsData.length === index) {
          this.showModalLoader = false;
        }
      }, timeout);
    });
    this.isExpandButtonDisabled = true;
  }

  /**
   * Gets extra rows data
   * @param rowData
   * @param columnName
   */
  private setExtraRowsData(rowData: any, columnName: string, rowExpansionLevel: number) {
    this.extraRows = new ExtraRowsData(rowData, rowData.trips, columnName, rowExpansionLevel);
  }

  /**
   * Handles button click on app-fortigo-button-group
   * @param formRef
   * @param event
   */
  public onClick(formRef: Array<any>, event: any) {
    formRef.forEach(element => {
      this.formData.push(element.submit());
    });
    this.formData.push(event);
    switch (event.toLowerCase()) {
      case 'save':
        this.isSaved = true;
        break;
      case 'submit':
        this.isSubmit = true;
        break;
      case 'approve':
        this.isApproved = true;
        break;
      case 'reject':
        this.isRejected = true;
        break;
    }
    this.onClose();
  }

  /**
   * This function on edit data grid rows.
   * @param  {} event: Row's data.
   */
  public editRows(event: any) {
    this.checkEditRowsFlag = true;
    this.tripLevelEditData = [];

    // identifying trip data and removing from inner data of rows
    if (this.rowsData && this.rowsData.length) {
      this.rowsData.forEach((eachRowData) => {
        const tempData: Array<any> = <Array<any>>Util.getObjectCopy(eachRowData);
        delete tempData['invoiceNumber_isExpanded'];
        delete tempData['invoiceNumber_icon'];
        if (!Object.getOwnPropertyNames(tempData).toString().includes('tripInvoiceNumber')) {
          if (Object.getOwnPropertyNames(tempData).toString().includes('invoiceNumber_innerData')) {
            tempData['trips'] = tempData['invoiceNumber_innerData'];
          }
          this.tripLevelEditData.push(tempData);
          delete tempData['invoiceNumber_innerData'];
        }
      });
    }

    this.rowsData = <Array<any>>Util.getObjectCopy(this.tripLevelEditData);

    let invoiceId: number;
    this.editableReceiptAmount = this.getReceiptAmount();
    let amount = this.editableReceiptAmount;
    if (this.rowsData && this.rowsData.length) {
      this.rowsData.forEach(invoiceRowData => {
        if (invoiceId === invoiceRowData['invoiceId']) {
          amount = this.editableReceiptAmount - Number(invoiceRowData['appropriationAmount']);
        } else {
          amount = amount - Number(invoiceRowData['appropriationAmount']);
        }
        invoiceId = invoiceRowData['invoiceId'];
      });
      let totalAppropritationAmount = 0;
      if (Number(event.row['appropriationAmount']) === 0 && event.row['deductionAmount'] > 0) {
        this.rowsData.forEach(eachInvoice => {
          totalAppropritationAmount += Number(eachInvoice['appropriationAmount']);
        });
        if (totalAppropritationAmount > this.editableReceiptAmount) {
          event.row['appropriationAmount'] = Number((this.editableReceiptAmount - totalAppropritationAmount).toFixed(2));
          amount -= event.row['appropriationAmount'];
        }
      }
      this.receiptAmount = amount;
      this.addUpdatedFields();
    }

    if (!Object.getOwnPropertyNames(event.row).toString().includes('tripInvoiceNumber')) {
      // updating invoice
      this.updateTripAmount(event.row);
    } else {
      // updating trip
      this.updateOutstandingAmount(event.row);
    }

    this.isExpandButtonDisabled = false;

    if (this.rowsData.length && this.rowsData[0]['invoiceNumber'] === 'UNINVOICED') {
      this.gridExpandCollapse(this.rowsData);
    } else {
      if (this.expandedRows) {
        this.expandedRows.forEach(eachInvoice => {
          this.gridExpandCollapse(this.rowsData.filter((eachRow) => eachRow[this.appropriationGridConfigurationData.uniqueColumnName] === eachInvoice));
        });
      }
    }
    this.showModalLoader = false;
  }

  /**
   * This function add replace the editable invoice in the rowsData.
   * @param  {} row: selected invoice.
   */
  private updateTripAmount(row) {
    const tempRowData = <Array<any>>Util.getObjectCopy(this.rowsData);
    this.rowsData = [];
    this.extraRows = undefined;
    tempRowData.forEach((eachInvoice, index) => {
      if (Object.getOwnPropertyNames(eachInvoice).toString().includes('tripInvoiceNumber')) {
        tempRowData.splice(index, 1);
      }
    });
    if (row.trips && row.trips.length) {
      if (row['partiallyAppropriated']) {
        row['outstandingAmount'] = row['originalOutstandingAmount'] - (Number(row['appropriationAmount']) + Number(row['tdsAmount']) + Number(row['deductionAmount']) + Number(row['nonTripDeductionAmount']) + Number(row['cashDiscount']));
      } else {
        row['outstandingAmount'] = row['invoiceAmount'] - (Number(row['appropriationAmount']) + Number(row['tdsAmount']) + Number(row['deductionAmount']) + Number(row['nonTripDeductionAmount']) + Number(row['cashDiscount']));
      }

      let tempAmount = Number(row['appropriationAmount']);
      if (row.trips.length > 1) {
        row.trips.forEach((eachTrip, index) => {
          if (0 < tempAmount) {
            if (eachTrip['appropriationAmount'] < tempAmount) {
              if (index === row.trips.length - 1) {
                eachTrip['appropriationAmount'] = Number(tempAmount.toFixed(2));
              } else {
                tempAmount = tempAmount - eachTrip['appropriationAmount'];
              }
            } else {
              eachTrip['appropriationAmount'] = Number(tempAmount.toFixed(2));
              tempAmount = tempAmount - eachTrip['appropriationAmount'];
            }
          } else if (tempAmount <= 0) {
            eachTrip['appropriationAmount'] = 0;
          }
          if (eachTrip['partiallyAppropriated']) {
            eachTrip['outstandingAmount'] = eachTrip['originalOutstandingAmount'] - (Number(eachTrip['appropriationAmount']) + Number(eachTrip['tdsAmount']) + Number(eachTrip['deductionAmount']) + Number(eachTrip['nonTripDeductionAmount']) + Number(eachTrip['cashDiscount']));
          } else {
            eachTrip['outstandingAmount'] = eachTrip['invoiceAmount'] - (Number(eachTrip['appropriationAmount']) + Number(eachTrip['tdsAmount']) + Number(eachTrip['deductionAmount']) + Number(eachTrip['nonTripDeductionAmount']) + Number(eachTrip['cashDiscount']));
          }
          // eachTrip['tdsAmount'] = Math.round(Number(((eachTrip['appropriationAmount'] / row['appropriationAmount']) * row['tdsAmount']).toFixed(2)));
          eachTrip['tdsAmount'] = Math.round(Number(((eachTrip['baseAmount'] * 2) / 100).toFixed(2)));
        });
      } else {
        row.trips[0]['appropriationAmount'] = row['appropriationAmount'];
        row.trips[0]['tdsAmount'] = Math.round(Number(((row.trips[0]['appropriationAmount'] / row['appropriationAmount']) * row['tdsAmount']).toFixed(2)));
        row.trips[0]['cashDiscount'] = row['cashDiscount'];
        row.trips[0]['deductionAmount'] = row['deductionAmount'];
        row.trips[0]['outstandingAmount'] = row['outstandingAmount'];
      }
    }
    tempRowData.forEach((eachInvoice, index) => {
      if (eachInvoice['invoiceId'] === row['invoiceId']) {
        tempRowData.splice(index, 1, row);
      }
    });
    this.rowsData = <Array<any>>Util.getObjectCopy(tempRowData);
  }

  /**
   * This method call if the user edit any trip in appropriations.
   * @param  {} row: selected trip
   */
  private updateOutstandingAmount(row) {
    const tempRowData = <Array<any>>Util.getObjectCopy(this.rowsData);
    this.rowsData = [];
    this.extraRows = undefined;
    for (let invoice = 0; invoice < tempRowData.length; invoice++) {
      for (let trip = 0; trip < tempRowData[invoice]['trips'].length; trip++) {
        if (tempRowData[invoice]['trips'][trip]['tripId'] === row['tripId']) {
          tempRowData[invoice]['trips'].splice(trip, 1, row);
        }
        if (row['partiallyAppropriated']) {
          tempRowData[invoice]['trips'][trip]['outstandingAmount'] = tempRowData[invoice]['trips'][trip]['originalOutstandingAmount'] - (Number(tempRowData[invoice]['trips'][trip]['appropriationAmount']) + Number(tempRowData[invoice]['trips'][trip]['tdsAmount']) + Number(tempRowData[invoice]['trips'][trip]['deductionAmount']) + Number(tempRowData[invoice]['trips'][trip]['nonTripDeductionAmount']) + Number(tempRowData[invoice]['trips'][trip]['cashDiscount']));
        } else {
          tempRowData[invoice]['trips'][trip]['outstandingAmount'] = tempRowData[invoice]['trips'][trip]['totalAmount'] - (Number(tempRowData[invoice]['trips'][trip]['appropriationAmount']) + Number(tempRowData[invoice]['trips'][trip]['tdsAmount']) + Number(tempRowData[invoice]['trips'][trip]['deductionAmount']) + Number(tempRowData[invoice]['trips'][trip]['nonTripDeductionAmount']) + Number(tempRowData[invoice]['trips'][trip]['cashDiscount']));
        }
      }
    }
    if (tempRowData.length) {
      let invoiceAppropriationAmount = 0;
      let tds = 0;
      let tripDeduction = 0;
      let cashDiscount = 0;
      let outstandingAmount = 0;
      this.receiptAmount = this.getReceiptAmount();
      if (tempRowData[0]['invoiceNumber'] === 'UNINVOICED') {
        if (tempRowData[0]['trips'] && tempRowData[0]['trips'].length) {
          tempRowData[0]['trips'].forEach(eachTrip => {
            invoiceAppropriationAmount += Number(eachTrip['appropriationAmount']);
            tds += Number(eachTrip['tdsAmount']);
            tripDeduction += Number(eachTrip['deductionAmount']);
            cashDiscount += Number(eachTrip['cashDiscount']);
            outstandingAmount += Number(eachTrip['outstandingAmount']);
          });
        }
        tempRowData[0]['appropriationAmount'] = invoiceAppropriationAmount;
        tempRowData[0]['tdsAmount'] = tds;
        tempRowData[0]['deductionAmount'] = tripDeduction;
        tempRowData[0]['cashDiscount'] = cashDiscount;
        tempRowData[0]['outstandingAmount'] = outstandingAmount;
        this.receiptAmount -= Number(tempRowData[0]['appropriationAmount']);
        this.addUpdatedFields();
      }
    }
    this.rowsData = <Array<any>>Util.getObjectCopy(tempRowData);
  }


  /**
   * This method adding the updated amount to the unappropriated tab.
   */
  private addUpdatedFields() {
    this.apprPendAmt = new NumberInputField('Amount', 'apprPendAmt', 2, undefined, undefined, undefined, undefined, this.receiptAmount ? Math.ceil(this.receiptAmount) : 0, 2, 'Currency');
    this.apprPendTDS = new NumberInputField('TDS', 'apprPendTDS', 2, undefined, undefined, undefined, undefined, this.receiptTds && this.receiptTds > 0 ? this.receiptTds - 0 : 0, 2, 'Currency');
    this.apprPendTripDed = new NumberInputField('Non Trip Deduction', 'apprPendTripDed', 2, undefined, undefined, undefined, undefined, this.noTripDeduction ? this.noTripDeduction : 0, 2, 'Currency');
    this.apprPendNonTripDed = new NumberInputField('Trip Deduction', 'apprPendNonTripDed', 2, undefined, undefined, undefined, undefined, this.tripDeduction ? this.tripDeduction : 0, 2, 'Currency');
    this.apprPendCashDiscount = new NumberInputField('Cash discount', 'appCashDiscount', 2, undefined, undefined, undefined, undefined, this.receiptCashDiscount && this.receiptCashDiscount > 0 ? this.receiptCashDiscount - 0 : 0, 2, 'Currency');
    this.totalAppropriationFields.splice(5, 5, this.apprPendAmt, this.apprPendTDS, this.apprPendNonTripDed, this.apprPendTripDed, this.apprPendCashDiscount);
    const tempFields = Util.getObjectCopy(this.totalAppropriationFields);
    this.totalAppropriationFields = [];
    this.totalAppropriationFields = <Array<any>>tempFields;
  }

  /**
   * Handles on close of modal
   */
  private onClose() {
    if (this.collectionDetailSubscription) {
      this.collectionDetailSubscription.unsubscribe();
    }
    if (this.searchAppropriationsSubscription) {
      this.searchAppropriationsSubscription.unsubscribe();
    }
    if (this.getAppropriationsSubscription) {
      this.getAppropriationsSubscription.unsubscribe();
    }
    if (this.updateCollectionSubscription) {
      this.updateCollectionSubscription.unsubscribe();
    }
    this._dialogRef.close(this.formData);
  }

  /**
   * Clear the grid editable data.
   */
  private clearGridData() {
    const tempRowData = (this.rowsData);
    this.rowsData = [];
    this.extraRows = undefined;
    if (tempRowData && tempRowData.length) {
      tempRowData.forEach(eachInvoice => {
        if (eachInvoice.trips && eachInvoice.trips.length) {
          eachInvoice.trips.forEach(eachTrip => {
            if (!eachTrip['hardAppropriated']) {
              eachTrip['cashDiscount'] = 0;
              eachTrip['deductionAmount'] = 0;
              eachTrip['tdsAmount'] = 0;
              eachTrip['appropriationAmount'] = 0;
            }
          });
        }
        if (!eachInvoice['hardAppropriated']) {
          eachInvoice['cashDiscount'] = 0;
          eachInvoice['deductionAmount'] = 0;
          eachInvoice['tdsAmount'] = 0;
          eachInvoice['appropriationAmount'] = 0;
        }
      });
    }
    this.rowsData = <Array<any>>Util.getObjectCopy(tempRowData);
  }

  /**
   * Save collection data to the db
   * @param  {any} data
   */
  public onFormSubmit(data: any) {
    if (data === 'clear') {
      Swal.fire({
        title: 'Are you sure?',
        type: 'question',
        width: 500,
        text: 'This action will clear all the appropriation amount',
        showCancelButton: true,
        confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
        cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
        confirmButtonText: 'Yes, clear it!'
      }).then(result => {
        if (result.value) {
          this.clearGridData();
        }
      });
    } else {
      const refNumber = this.collectionData ? this.collectionData['referenceNumber'] : '';
      // Compare invoice numbers at trip and invoice level.
      this.invoiceLevelEditData.forEach((invoiceData) => {
        invoiceData['referenceNumber'] = refNumber;
        this.tripLevelEditData.forEach(tripData => {
          tripData['appropriationAmount'] = parseInt(tripData['appropriationAmount']);
          if (tripData.tripInvoiceNumber && (invoiceData.invoiceNumber.toLowerCase() === tripData.tripInvoiceNumber.toLowerCase())) {
            invoiceData.trips.push(tripData);
          }
        });
        if (invoiceData['hardAppropriated']) {
          this.hardAppropriationReceipt.receiptAmount -= invoiceData['appropriationAmount'];
        }
      });
      if (this.checkEditRowsFlag) {
        this.hardAppropriationReceipt.invoiceList = this.rowsData;
        this.saveHardAppropriation(this.hardAppropriationReceipt);
      } else {
        this.hardAppropriationReceipt.invoiceList = [];
        let checkAppropritionFlag = false;
        if (this.rowsData && this.rowsData.length) {
          for (let i = 0; i < this.rowsData.length; i++) {
            if (!this.rowsData[i]['hardAppropriated']) {
              checkAppropritionFlag = true;
              break;
            }
          }
        }
        if (checkAppropritionFlag) {
          this.hardAppropriationReceipt.invoiceList = <Array<any>>Util.getObjectCopy(this.rowsData);
          this.saveHardAppropriation(this.hardAppropriationReceipt);
        } else if (!this.hardAppropriationReceipt.invoiceList.length) {
          Swal.fire('Warning', 'Nothing to update here');
        } else if (!checkAppropritionFlag) {
          Swal.fire('Warning', 'The invoice is already appropriated');
        }
      }
    }
  }

  /**Save appriopriation data to the db
   * @param  {} hardAppropriationReceipt: appropriation data.
   */
  private saveHardAppropriation(hardAppropriationReceipt) {
    let checkAmount = false;
    this.tripsIds = [];
    this.invoicesIds = [];
    const InvoiceWithZeroAmount = [];
    this.defaultyInvoices = [];
    if (this.disabledSubmit) {
      Swal.fire('Warning', 'One or more appropriations done to this receipt have been removed. Pls search for this receipt again and check before submitting any further changes. Appropriation reversals can continue as before', 'warning');
    } else {
      if (hardAppropriationReceipt && hardAppropriationReceipt['invoiceList'] && hardAppropriationReceipt['invoiceList'].length) {
        hardAppropriationReceipt['invoiceList'] = hardAppropriationReceipt['invoiceList'].filter((eachInvoice, index) => {
          if (Object.getOwnPropertyNames(eachInvoice).toString().includes('tripInvoiceNumber')) {
            return false;
          } else {
            return true;
          }
        });
        hardAppropriationReceipt['invoiceList'].forEach((eachInvoice, invoiceIndex) => {
          delete eachInvoice['invoiceNumber_innerData'];
          eachInvoice['referenceNumber'] = this.receiptReferenceNumber;
          if (eachInvoice.trips && eachInvoice.trips.length) {
            eachInvoice.trips.forEach((eachTrip, tripIndex) => {
              eachTrip['referenceNumber'] = this.receiptReferenceNumber;
              this.isValidData(eachTrip, invoiceIndex, tripIndex);
              if (this.tripsIds.length) {
                Swal.fire('Error', 'Outstanding amount can not be less than appropriation amount - ' + 'Trip No. ' + eachTrip['tripId'], 'error');
                checkAmount = true;
                return;
              } else if (eachTrip['appropriationAmount'] < 0) {
                if (this.isFinanceLoggedIn()) {
                  if ((Number(eachTrip['appropriationAmount']) + Number(eachTrip['tdsAmount']) + Number(eachTrip['cashDiscount']) + Number(eachTrip['deductionAmount']) + Number(eachTrip['nonTripDeductionAmount'])) !== 0) {
                    Swal.fire('Error', 'Negative amount is being appropriated for trip ' + 'Trip No. ' + eachTrip['tripId'] + '. The total amount being appropriated to this invoice is Rs.' + eachTrip['totalAmount'] + '. Negative amount is only allowed if an equal positive amount is added under trip deductions and the total amount appropriated to the invoice is zero', 'error');
                    checkAmount = true;
                    return;
                  }
                } else {
                  Swal.fire('Error', 'Negative amount can be enter for - ' + 'Trip No. ' + eachTrip['tripId'], 'error');
                  checkAmount = true;
                  return;
                }
              }
            });
          }
          this.isValidData(eachInvoice, invoiceIndex, -1);
          if (this.invoicesIds.length) {
            Swal.fire('Error', 'The total amount appropriated to an invoice can not be greater than the outstanding amount.', 'error');
            checkAmount = true;
            return;
          } else if (eachInvoice['appropriationAmount'] < 0) {
            if (this.isFinanceLoggedIn()) {
              if ((Number(eachInvoice['appropriationAmount']) + Number(eachInvoice['tdsAmount']) + Number(eachInvoice['cashDiscount']) + Number(eachInvoice['deductionAmount']) + Number(eachInvoice['nonTripDeductionAmount'])) !== 0) {
                Swal.fire('Error', 'Negative amount is being appropriated for ' + 'Invoice No. ' + eachInvoice['invoiceNumber'] + '. The total amount being appropriated to this invoice is Rs.' + eachInvoice['invoiceAmount'] + '. Negative amount is only allowed if an equal positive amount is added under trip deductions and the total amount appropriated to the invoice is zero', 'error');
                checkAmount = true;
                return;
              }
            } else {
              Swal.fire('Error', 'Negative amount can not be enter for ' + 'Invoice No. ' + eachInvoice['invoiceNumber'], 'error');
              checkAmount = true;
              return;
            }
          }
          if (Number(eachInvoice['appropriationAmount']) === 0) {
            InvoiceWithZeroAmount.push(eachInvoice);
          }
        });
      }
      if (checkAmount) {
        return;
      }
      if (!InvoiceWithZeroAmount.length) {
        this.isSubmitDisabled = true;
        if (this.isFinanceLoggedIn()) {
          if (this.collectionData && this.collectionData['collectionStatus'] === 'approved') {
            this.showModalLoader = true;

            this._collectionService.addHardAppropriation(hardAppropriationReceipt).subscribe(response => {

              if (!response['errorCode']) {
                Swal.fire('Success', 'Updated successfully', 'success');
                this.hardAppropriationReceipt.invoiceList = [];
                this.onClose();
              } else {
                if (response['errorCode'] === 2) {
                  Swal.fire('Error', 'Failure to submit due to some technical issues.', 'error');
                } else {
                  Swal.fire('Error', response['errorMessage'], 'error');
                }
                this.isSubmitDisabled = false;
              }
            });
          } else {
            Swal.fire('Warning', 'Only encashed receipts can be appropriated. Please provide the encashment date and amount in the collection entry screen', 'info');
          }
        } else {
          this.saveClaimedAppropriation(hardAppropriationReceipt);
        }
      } else {
        let text = '';
        InvoiceWithZeroAmount.forEach(invoice => {
          text = text + invoice['invoiceNumber'] + ',';
        });
        Swal.fire('Error', 'The appropriation amount value 0 of invoices ' + text + ' can not be submitted', 'error');
      }
    }
    this.showModalLoader = false;
  }

  /** This method save claimed data.
   * @param  {} hardAppropriationReceipt : claimed data.
   */
  private saveClaimedAppropriation(hardAppropriationReceipt) {
    this.showModalLoader = true;
    this._collectionService.addClaimedAppropriation(hardAppropriationReceipt).subscribe(response => {
      this.showModalLoader = false;

      if (!response['errorCode']) {
        Swal.fire('Success', 'Updated successfully', 'success');
        this.hardAppropriationReceipt.invoiceList = [];
        this.onClose();
      } else {
        if (response['errorCode'] === 2) {
          Swal.fire('Error', 'Failure to submit due to some technical issues.', 'error');
        } else {
          Swal.fire('Error', response['errorMessage'], 'error');
        }
        this.isSubmitDisabled = false;
      }
    });
  }

  /** Delete appropriation data.
   * @param  {} event: selected appropriation row
   */
  public onActionItemClick(event) {
    switch (event.index) {
      case 0:
        this.deleteAppropriation(event);
        break;
      case 1:
        this.removeFromList(event);
        break;
    }
  }

  /**
   * This method remove seletcted row from the list
   * @param  {} event: selected row with index of array
   */
  private removeFromList(event) {
    if (Object.getOwnPropertyNames(event.data).toString().includes('trips')) {
      if (this.rowsData[0]['invoiceNumber'] !== 'UNINVOICED') {
        const tempData = <Array<any>>Util.getObjectCopy(this.rowsData);
        this.rowsData = [];
        const tripArraylength = tempData[event.rowIndex]['invoiceNumber_innerData'] && tempData[event.rowIndex]['invoiceNumber_isExpanded'] ? tempData[event.rowIndex]['invoiceNumber_innerData'].length : 0;
        tempData.splice(event.rowIndex, 1 + tripArraylength);
        this.extraRows = new ExtraRowsData(tempData, null, 'invoiceNumber', 0);
        this.rowsData = <Array<any>>Util.getObjectCopy(tempData);
        // ANCHOR @Mayur, please handle this situation in grid.
        this.updateUnappropriatedAmount();
      }
    } else {
      // Remove trip from in case of uninvoiced
      if (this.rowsData && this.rowsData.length) {
        if (this.rowsData[0]['invoiceNumber'] === 'UNINVOICED') {
          if (this.rowsData[0]['invoiceNumber_innerData'] && this.rowsData[0]['invoiceNumber_innerData'].length) {
            const tempData = <Array<any>>Util.getObjectCopy(this.rowsData);
            this.rowsData = [];
            tempData.splice(event.rowIndex, 1);
            // Update amount at invoice level
            tempData[0]['appropriationAmount'] -= event.data['appropriationAmount'];
            tempData[0]['tdsAmount'] -= event.data['tdsAmount'];
            tempData[0]['deductionAmount'] -= event.data['deductionAmount'];
            tempData[0]['cashDiscount'] -= event.data['cashDiscount'];
            tempData[0]['outstandingAmount'] -= event.data['outstandingAmount'];
            // Remove trip from inner data
            tempData[0]['invoiceNumber_innerData'].splice(event.rowIndex - 1, 1);
            if (this.uninvoiceRowsData && this.uninvoiceRowsData.length && this.uninvoiceRowsData[0]['trips'] && this.uninvoiceRowsData[0]['trips'].length) {
              for (let index = 0; index < this.uninvoiceRowsData[0]['trips'].length; index++) {
                if (this.uninvoiceRowsData[0]['trips'][index]['tripId'] === event.data['tripId']) {
                  // Remove trip from original list
                  this.uninvoiceRowsData[0]['trips'].splice(index, 1);
                  break;
                }
              }
            }
            this.extraRows = event.data;
            this.extraRows.data = null;
            this.rowsData = <Array<any>>Util.getObjectCopy(tempData);
            this.updateUnappropriatedAmount();
          }
        }
      }
    }
  }

  /**
   * Update unappropriated amount on removing trip and invoice.
   */
  private updateUnappropriatedAmount() {
    this.receiptAmount = this.getReceiptAmount();
    if (this.rowsData && this.rowsData.length) {
      this.rowsData.forEach(eachInvoice => {
        if (Object.getOwnPropertyNames(eachInvoice).toString().includes('trips')) {
          this.receiptAmount -= Number(eachInvoice['appropriationAmount']);
        }
      });
    }
    this.showModalLoader = false;
    this.addUpdatedFields();
  }

  /**
   * This method delete seletcted row
   * @param  {} event: selected row with index of array
   */
  private deleteAppropriation(event) {
    if (!Object.getOwnPropertyNames(event.data).toString().includes('trips')) {
      this.rowsData.forEach(incoiveData => {
        // updating invoice updated data, if match found
        if (event.data.tripInvoiceNumber && (incoiveData.invoiceNumber.toLowerCase() === event.data.tripInvoiceNumber.toLowerCase())) {
          this.hardAppropriationReceipt.invoiceList = [incoiveData];
          this.hardAppropriationReceipt.invoiceList[0]['trips'] = [];
          this.hardAppropriationReceipt.invoiceList[0]['trips'].push(event.data);
          delete this.hardAppropriationReceipt.invoiceList[0]['invoiceNumber_innerData'];
          delete this.hardAppropriationReceipt.invoiceList[0]['invoiceNumber_icon'];
          delete this.hardAppropriationReceipt.invoiceList[0]['invoiceNumber_isExpanded'];
        }
      });
    } else {
      this.hardAppropriationReceipt.invoiceList = [event.data];
      delete this.hardAppropriationReceipt.invoiceList[0]['invoiceNumber_innerData'];
      delete this.hardAppropriationReceipt.invoiceList[0]['invoiceNumber_icon'];
      delete this.hardAppropriationReceipt.invoiceList[0]['invoiceNumber_isExpanded'];
    }
    const text = '';
    const tilteText = this.deleteAppropriationFlag ? 'Are you sure you want to reverse appropriation?' : 'Are you sure you want to remove claimed appropriation?';
    const confirmButtonText = this.deleteAppropriationFlag ? 'Yes, reverse it!' : 'Yes, remove it!';
    Swal.fire({
      title: tilteText,
      type: 'question',
      width: 500,
      text: text,
      showCancelButton: true,
      confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
      cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
      confirmButtonText: confirmButtonText
    }).then(result => {
      if (result.value) {
        this.updateAmountAfterDelete(this.hardAppropriationReceipt.invoiceList);
        if (this.deleteAppropriationFlag) {
          this.showModalLoader = true;

          this._collectionService.deleteAppropriation(this.hardAppropriationReceipt)
            .subscribe(response => {
              this.showModalLoader = false;

              if (!response['errorCode']) {
                this.disabledSubmit = true;
                this.checkEditRowsFlag = true;
                this.getInvoiceData(this.hardAppropriationReceipt.receiptId, false);
                this.hardAppropriationReceipt.invoiceList = [];
                Swal.fire('Success', response['errorMessage'], 'success');
              } else {
                Swal.fire('Error', response['errorMessage'], 'error');
              }
            });
        } else {
          this.deleteClaimedAppropriation(this.hardAppropriationReceipt);
        }
      }
    });
  }

  /**
   * This methed remove claimed appropriation.
   * @param  {object} hardAppropriationReceipt: seleted invoice.
   */
  private deleteClaimedAppropriation(hardAppropriationReceipt: object) {
    this.showModalLoader = true;

    this._collectionService.deleteClaimed(hardAppropriationReceipt)
      .subscribe(response => {
        this.showModalLoader = false;

        if (!response['errorCode']) {
          this.disabledSubmit = true;
          this.checkEditRowsFlag = true;
          this.getInvoiceData(this.hardAppropriationReceipt.receiptId, false);
          this.hardAppropriationReceipt.invoiceList = [];
          Swal.fire('Success', response['errorMessage'], 'success');
        } else {
          Swal.fire('Error', response['errorMessage'], 'error');
        }
      });
  }

  /**
   * This method is adding deleted amount to the receipt amount.
   * @param  {Array<any>} invoiceList: selected
   */
  private updateAmountAfterDelete(invoiceList: Array<any>) {
    let tempAmount = 0;
    if (invoiceList && invoiceList[0].trips) {
      if (invoiceList[0].trips && invoiceList[0].trips.length) {
        invoiceList[0].trips.forEach(eachTrip => {
          tempAmount += eachTrip['appropriationAmount'];
        });
      }
    }
    invoiceList['appropriationAmount'] = invoiceList['appropriationAmount'] - tempAmount;
    this.rowsData.forEach((eachInvoice, index) => {
      if (eachInvoice['invoiceId'] === invoiceList['appropriationAmount']) {
        this.rowsData.splice(index, 1, invoiceList);
      }
    });
    if (isNaN(this.receiptAmount)) {
      this.receiptAmount = 0;
    }
    this.receiptAmount += tempAmount;
    if (this.collectionData['amountDetails'][6]) {
      if (this.receiptAmount > Number.parseInt(this.collectionData['amountDetails'][6]['amount'].toString())) {
        this.receiptAmount = Number.parseInt(this.collectionData['amountDetails'][6]['amount'].toString());
      }
    }
    this.addUpdatedFields();
  }

  /**
   * ANCHOR : @Sachin will check it
   */
  clearForm(formType) {
    switch (formType) {
      case 'collection':
        // need to change this approach, its very resource consumint
        this.collectionData = {};
        this.getFields();
        break;
      case 'appropriation':
        this.instrumentForm.reset();
        break;
      default:
        break;
    }
  }

  private isValidData(eachInvoice, invoiceIndex, tripIndex) {
    this.defaultyInvoices = [];
    if (this.rowsData[invoiceIndex] && this.rowsData[invoiceIndex]['invoiceNumber_icon'] === 'remove_circle') {
      this.rowsData[invoiceIndex]['invoiceNumber_isExpanded'] = false;
      this.rowsData[invoiceIndex]['invoiceNumber_icon'] = 'add_circle';
      this.extraRows = undefined;
    }
    if (Object.getOwnPropertyNames(eachInvoice).toString().includes('tripInvoiceNumber')) {
      const tempRowData = <Array<any>>Util.getObjectCopy(this.rowsData);
      this.rowsData = [];
      tempRowData.forEach(iterativeInvoive => {
        if (!Object.getOwnPropertyNames(iterativeInvoive).toString().includes('tripInvoiceNumber')) {
          this.rowsData.push(iterativeInvoive);
        }
      });
    }
    const outstandingAmount = Number(eachInvoice['outstandingAmount']);
    // Ignore if outstanding amount is between 1 and -1
    if ((-1 <= outstandingAmount && outstandingAmount <= 1) || outstandingAmount >= 0) {
      if (Object.getOwnPropertyNames(eachInvoice).toString().includes('tripInvoiceNumber')) {
        if (tripIndex !== -1) {
          if (this.rowsData[invoiceIndex] && this.rowsData[invoiceIndex]['trips'] && this.rowsData[invoiceIndex]['trips'][tripIndex]) {
            delete this.rowsData[invoiceIndex]['trips'][tripIndex]['_rowType'];
          }
        }
      } else {
        if (this.rowsData[invoiceIndex]) {
          delete this.rowsData[invoiceIndex]['_rowType'];
        }
      }
    } else {
      if (Object.getOwnPropertyNames(eachInvoice).toString().includes('tripInvoiceNumber')) {
        this.tripsIds.push(eachInvoice['tripId']);
        if (tripIndex !== -1) {
          if (this.rowsData[invoiceIndex] && this.rowsData[invoiceIndex]['trips'][tripIndex]) {
            this.rowsData[invoiceIndex]['trips'][tripIndex]['_rowType'] = 'danger';
            if (this.rowsData[invoiceIndex]['invoiceNumber_innerData']) {
              this.rowsData[invoiceIndex]['invoiceNumber_innerData'][tripIndex]['_rowType'] = 'danger';
            }
          }
          // Check if outStanding Amount in also negative
          if (this.rowsData[invoiceIndex] && this.rowsData[invoiceIndex]['outstandingAmount'] >= -1) {
            this.defaultyInvoices.push(this.rowsData[invoiceIndex]);
            this.rowsData.splice(invoiceIndex, 1);
          }
        }
      } else {
        this.invoicesIds.push(eachInvoice['invoiceNumber']);
        if (this.rowsData[invoiceIndex]) {
          this.rowsData[invoiceIndex]['_rowType'] = 'danger';
        }
        this.defaultyInvoices.push(this.rowsData[invoiceIndex]);
        this.rowsData.splice(invoiceIndex, 1);
      }
      if (this.defaultyInvoices.length) {
        this.rowsData = this.defaultyInvoices.concat(this.rowsData);
      }
    }
  }
}
