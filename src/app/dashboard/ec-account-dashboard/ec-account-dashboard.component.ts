/*
 * Created on Thu Dec 26 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Column, DataType, DataFormat } from 'src/app/shared/models/column.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { FortigoButton } from 'src/app/shared/abstracts/button.model';
import { DateInputField, SearchableSelectInputField, SelectOption } from 'src/app/shared/abstracts/field-type.model';
import { ExtraRowsData } from 'src/app/shared/models/extra-rows-data.model';
import { MetadataService } from '../services/metadata/metadata.service';
import { EcAccountService } from '../services/ec-account/ec-account.service';
import { FortigoFilterService } from 'src/app/shared/services/fortigo-filter.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { Util } from 'src/app/core/abstracts/util';
import { RoleId } from 'src/app/core/constants/FortigoConstant';

@Component({
  selector: 'app-ec-account-dashboard',
  templateUrl: './ec-account-dashboard.component.html',
  styleUrls: ['./ec-account-dashboard.component.css'],
  providers: [DatePipe]
})
export class EcAccountDashboardComponent implements OnInit, AfterViewInit {
  public columnsData: Array<Column> = new Array<Column>();
  public gridConfigurationData: GridConfiguration = new GridConfiguration();
  public title: string;
  public subTitle: string;
  rowData = new Array<any>();
  details: Array<any>;
  headButtonList: FortigoButton[];
  filterFields: any[];
  expandedRowIndex: number;
  extraRows: ExtraRowsData;
  firstTimeLoad = true;
  extraRowsFetchData: any;
  selectedTab = 0;
  summary;
  loadingSummary = false;
  loadingDetails = false;
  startingBalance: number;
  closingBalance: number;
  stickyBottomData: any;
  startDate: any;
  endDate: any;
  endCustomer: any;
  paymentLocation: any;
  endCustomertoExport: any;
  startDatetoExport: string;
  endDatetoExport: string;
  isFilterApplied: boolean;
  paymentLocationData: any;
  public totalOutstanding: number;
  public group: Array<any>;
  private roleId: number;

  constructor(
    private _metadataService: MetadataService,
    private _ecAccountService: EcAccountService,
    private _filterService: FortigoFilterService,
    private _datePipe: DatePipe,
    private _loginService: LoginControlV2Service,
    private _title: Title,
    private _activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this._title.setTitle(this._activatedRoute.snapshot.data['title']);
    this.title = 'EC Statement of Accounts';

    this.roleId = Number.parseInt(this._loginService.roleId.toString());

    this.createHeadButton();
    this.setSummaryColData();
    this.getGridConfiguration();
    // Used inside filter to group fields
    this.group = [{ id: 1, title: '' }];
  }

  ngAfterViewInit(): void {
    // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    // Add 'implements AfterViewInit' to the class.
    this.configureCommonFilter();
    this.getParamFromUrl();
  }


  private createHeadButton() {
    if (this.roleId === RoleId.FORTIGO_READ_ONLY_USER || this.roleId === RoleId.COLLECTION_BACK_OFFICE) {
      this.headButtonList = [
        new FortigoButton('Export To Excel'), new FortigoButton('Export Bulk Details')
      ];
    } else {
      this.headButtonList = [new FortigoButton('Export To Excel')];
    }
  }

  /**
   * Configure common filter across tabs
   */
  private configureCommonFilter() {
    const paymentLocationOption = new SelectOption('aliasNm', 'id', this.paymentLocationData);
    this.filterFields = [];
    const startDate = new DateInputField('Start Date', 'startDate', undefined, false, {}, -1, 8, this.startDate, 1);
    const endDate = new DateInputField('End Date', 'endDate', undefined, false, {}, -1, 8, this.endDate, 1);
    const ecOption = new SelectOption('companyname', 'compId', this._metadataService.ecDetails);
    const ec = new SearchableSelectInputField('End Customer', 'compId', ecOption, undefined, false, false, {}, -1, 0, this.endCustomer, undefined, undefined, 1);
    const payLocation = new SearchableSelectInputField('Payment Location', 'payment_loc_id', paymentLocationOption, undefined, false, false, {}, -1, 0, this.paymentLocation, undefined, undefined, 1);

    this.filterFields = [ec, payLocation, startDate, endDate];
  }

  /**
  * this method set the 'Summary tab' data for grid i.e sets rowData
  */
  private setSummaryColData() {
    this.columnsData = [
      { columnDef: 'MainDate', headerName: 'Date', dataType: DataType.Date, css: { horizontalAlign: 'left', fontWeight: 'bolder', textColor: 'blue' } },
      { columnDef: 'tranType', headerName: 'Transaction Type', dataType: DataType.String, css: { horizontalAlign: 'left', fontWeight: 'normal' } },
      { columnDef: 'refNo', headerName: 'Ref Number', css: { horizontalAlign: 'left', fontWeight: 'bolder' } },
      { columnDef: 'payLocName', headerName: 'Payment Location', css: { horizontalAlign: 'left', fontWeight: 'bolder' } },
      { columnDef: 'fortigoTripID', headerName: '4TiGO Trip ID', css: { horizontalAlign: 'left', fontWeight: 'bolder' } },
      { columnDef: 'gcn', headerName: 'GCN Number', css: { horizontalAlign: 'left' } },
      { columnDef: 'custRefNum', headerName: 'Customer Reference(s)', css: { horizontalAlign: 'left', fontWeight: 'bolder' } },
      { columnDef: 'debitAmt', headerName: 'Debit', css: { horizontalAlign: 'left', fontWeight: 'bolder', textColor: 'maroon' }, dataType: DataType.Number, dataFormat: DataFormat.Currency },
      { columnDef: 'creditAmt', headerName: 'Credit', css: { horizontalAlign: 'left', fontWeight: 'bolder', textColor: 'green' }, dataType: DataType.Number, dataFormat: DataFormat.Currency },
    ];
    this.rowData = this.summary ? <Array<any>>Util.getObjectCopy(this.summary) : null;
  }

  /**
   * this method set the 'Detail tab' data for grid i.e sets rowData
   */
  private setDetailsColData() {
    this.columnsData = [
      { columnDef: 'tripId', headerName: 'Trip ID', css: { horizontalAlign: 'right', fontWeight: 'bold' }, innerCells: 2, },
      { columnDef: 'tripDate', headerName: 'Trip Date', css: { horizontalAlign: 'right', fontWeight: 'bold' } },
      { columnDef: 'fromCity', headerName: 'From', css: { horizontalAlign: 'right', fontWeight: 'normal' }, innerCells: 2 },
      { columnDef: 'toCity', headerName: 'To', css: { horizontalAlign: 'right', fontWeight: 'normal' } },
      { columnDef: 'truck', headerName: 'Truck', css: { horizontalAlign: 'right', fontWeight: 'normal' } },
      { columnDef: 'custRefNum', headerName: 'Cu.Ref.Number', css: { horizontalAlign: 'right' }, innerCells: 2 },
      { columnDef: 'invNum', headerName: 'Inv.Number', css: { horizontalAlign: 'right' } },
      { columnDef: 'invAmt', headerName: 'Inv.Value', css: { horizontalAlign: 'right', fontWeight: 'bold' }, innerCells: 2, dataType: DataType.Number, dataFormat: DataFormat.Currency },
      { columnDef: 'invDate', headerName: 'Inv.Date', css: { horizontalAlign: 'right', fontWeight: 'bold' } },
      { columnDef: 'invSubDate', headerName: 'Inv.Sub.Date', css: { horizontalAlign: 'right', fontWeight: 'normal' } },
      { columnDef: 'payLocName', headerName: 'Payment Location', css: { horizontalAlign: 'right' }, innerCells: 2 },
      { columnDef: 'collRefNum', headerName: 'Coll.Ref.No', css: { horizontalAlign: 'right' } },
      { columnDef: 'amtReceived', headerName: 'Amt.Received', css: { horizontalAlign: 'right', fontWeight: 'bolder', textColor: 'green' }, dataType: DataType.Number, dataFormat: DataFormat.Currency },
      { columnDef: 'shorAmt', headerName: 'Shortages', css: { horizontalAlign: 'right', fontWeight: 'normal' }, dataType: DataType.Number, dataFormat: DataFormat.Currency },
      { columnDef: 'DmgAmt', headerName: 'Damages', css: { horizontalAlign: 'right', fontWeight: 'normal' }, dataType: DataType.Number, dataFormat: DataFormat.Currency },
      { columnDef: 'cashDiscount', headerName: 'Cash Discounts', css: { horizontalAlign: 'right', fontWeight: 'normal' }, dataType: DataType.Number, dataFormat: DataFormat.Currency },
      { columnDef: 'tdsAmt', headerName: 'TDS Withheld', css: { horizontalAlign: 'right', fontWeight: 'normal' }, dataType: DataType.Number, dataFormat: DataFormat.Currency },
      { columnDef: 'invDeduct', headerName: 'Other Ded./Add.', css: { horizontalAlign: 'right', fontWeight: 'normal' }, dataType: DataType.Number, dataFormat: DataFormat.Currency },
      { columnDef: 'creditNote', headerName: 'Credit Note Generated', css: { horizontalAlign: 'right', fontWeight: 'normal' } },
      { columnDef: 'amtReceivable', headerName: 'Balance Receivable', css: { horizontalAlign: 'right', textColor: 'blue' }, dataType: DataType.Number, dataFormat: DataFormat.Currency },
      { columnDef: 'is_soft', headerName: 'Confirmed By Customer', css: { horizontalAlign: 'center', fontWeight: 'normal' } },
    ];
    this.rowData = this.details ? <Array<any>>Util.getObjectCopy(this.details) : null;
  }

  /**
   * this method sets the fortigo grid configuration
   */
  private getGridConfiguration() {
    this.gridConfigurationData = new GridConfiguration();
    this.gridConfigurationData.isFilterTabEnabled = true;
    this.gridConfigurationData.isPaginaionEnabled = true;
    this.gridConfigurationData.defaultPageSize = 50;
    this.gridConfigurationData.isStickyTopRow = true;
    this.gridConfigurationData.isStickyBottomRow = true;
    this.gridConfigurationData.filterTabList = [{ label: 'Summary', hideBadge: true, hideToolTipText: true }, { label: 'Details', hideBadge: true, hideToolTipText: true }];
    this.gridConfigurationData.css.tableRowHeight = '30px';
    this.gridConfigurationData.css.tableOuterHeight = '100px';
    if (this.selectedTab === 1) {
      this.gridConfigurationData.isStickyTopRow = false;
      this.gridConfigurationData.isStickyBottomRow = false;
    }
  }
  /**
   * this is called whenever tab is changed
   * @param value = tab index
   */
  onGridFilterTabSelection(value) {
    this.selectedTab = value;
    this.clearData();
  }

  clearData() {
    this.rowData = [];
    this.columnsData = [];
    this.getGridConfiguration();
    if (this.selectedTab === 0) {
      this.setSummaryColData();
    }
    if (this.selectedTab === 1) {
      this.setDetailsColData();
    }
    if (!this.rowData) {
      this.rowData = [];
    }
  }

  /**
   * this method is called whenever filter is submitted
   */
  public onFilterSubmit(value) {
    this.startDate = value.startDate;
    this.endDate = value.endDate;
    this.endCustomer = value.compId;
    this.paymentLocation = value.payment_loc_id;
    this.setDataToExportToExcel(value);
    this.updateTitle(value.compId, value.payment_loc_id);
    this.loadingSummary = true;
    this.loadingDetails = true;
    this.clearData();
    this._ecAccountService.getSummaryDetails(value.payment_loc_id, value.compId, this.startDate ? this._datePipe.transform(value.startDate, 'yyyy-MM-dd') : '', this.endDate ? this._datePipe.transform(value.endDate, 'yyyy-MM-dd') : '').subscribe(
      (data: any) => {
        this.loadingSummary = false;
        this.summary = <any>Util.getObjectCopy(data.results);
        if (!this.summary) {
          this.rowData = [];
          this.getGridConfiguration();
          this.setSummaryColData();
        }
        if (this.summary) {
          this.stickyBottomData = {};
          this.startingBalance = data.balance.starting_balance;
          this.closingBalance = data.balance.closing_balance;
          this.stickyBottomData['closingBalance'] = data.balance.closing_balance;
          this.stickyBottomData['closing_balance_TdsEx'] = data.balance.closing_balance_TdsEx;
          this.stickyBottomData['hardTdsAmt'] = data.balance.hardTdsAmt;
          this.stickyBottomData['softTdsAmt'] = data.balance.softTdsAmt;
          this.stickyBottomData['hardAllAmt'] = data.balance.hardAllAmt;

          this.totalOutstanding = data.balance.closing_balance_TdsEx;
        }
        if (this.selectedTab === 0) {
          this.rowData = <Array<any>>Util.getObjectCopy(this.summary);
          this.getGridConfiguration();
        }
      });
    this._ecAccountService.getECDetails(value.payment_loc_id, value.compId, value.startDate ? this._datePipe.transform(value.startDate, 'yyyy-MM-dd') : '', value.endDate ? this._datePipe.transform(value.endDate, 'yyyy-MM-dd') : '').subscribe(
      (data: any) => {
        this.loadingDetails = false;
        this.details = <Array<any>>Util.getObjectCopy(data.results);
        if (!this.details) {
          this.rowData = [];
        }
        if (this.selectedTab === 1) {
          this.rowData = <Array<any>>Util.getObjectCopy(this.details);
        }
      });
  }

  private updateTitle(companyId: string, paymentLocationId: string) {
    let subTitle: string;

    if (paymentLocationId && paymentLocationId !== '' && this.paymentLocationData) {
      subTitle = this.paymentLocationData.filter((eachPaymentLocation) => {
        return eachPaymentLocation.id === paymentLocationId;
      })[0].aliasNm;
    } else {
      if (companyId && companyId !== '') {
        subTitle = this._metadataService.ecDetails.filter((eachECDetails) => {
          return eachECDetails.compId === companyId;
        })[0].companyname;
      }
    }

    this.title = 'EC Statement of Accounts';
    if (subTitle) {
      this.subTitle = subTitle;
    }
  }

  private setDataToExportToExcel(value) {
    this.endCustomertoExport = value.compId;
    this.startDatetoExport = this.startDate ? this._datePipe.transform(value.startDate, 'yyyy-MM-dd') : '';
    this.endDatetoExport = this.endDate ? this._datePipe.transform(value.endDate, 'yyyy-MM-dd') : '';
  }

  public onFilterClick() {
    this.configureCommonFilter();
  }

  public onHeadButtonClicked(value) {
    if (value === 'Export To Excel') {
      switch (this.selectedTab) {
        case 0: const excelUrl1 = this._ecAccountService.openSummaryExportToExcel(this.endCustomertoExport, this.startDatetoExport, this.endDatetoExport, this.paymentLocation);
          window.open(excelUrl1, '_blank');
          break;
        case 1:
          const excelUrl2 = this._ecAccountService.openDetailsExportToExcel(this.endCustomertoExport, this.startDatetoExport, this.endDatetoExport, this.paymentLocation);
          window.open(excelUrl2, '_blank');
      }
    }
    if (value === 'Export Bulk Details') {
      const excelBulk = this._ecAccountService.openBulkDetailsExportToExcel();
      window.open(excelBulk, '_blank');
    }
  }

  public onClear() {
    this.startDate = undefined;
    this.endDate = undefined;
    this.endCustomer = undefined;
    this.paymentLocation = undefined;
  }

  public selectChanged(value) {
    if (value.name === 'compId') {
      this.endCustomer = value.value;
      this.paymentLocation = undefined;
      this._ecAccountService.getAllEcLoc(value.value).subscribe(
        (ecLocation: any) => {
          this.paymentLocationData = ecLocation['result'];
          this.configureCommonFilter();
        }
      );
    }
  }

  // gets query params and makes related rest calls
  private getParamFromUrl() {
    this._activatedRoute.queryParamMap.subscribe((params) => {
      const routeCompanyId = params.get('companyId');
      const routeEcLocationId = params.get('ecLocationId');
      if (routeCompanyId) {
        this.selectChanged({ name: 'compId', value: routeCompanyId });
        if (routeEcLocationId) {
          this.onFilterSubmit({ 'compId': routeCompanyId, 'payment_loc_id': routeEcLocationId });
        }
      } else {
        this._filterService.showFiller.emit();
      }
    });
  }
}
