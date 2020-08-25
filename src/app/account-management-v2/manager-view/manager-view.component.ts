import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import { Subscription } from 'rxjs';

import { Column, DataType, DataFormat } from 'src/app/shared/models/column.model';
import { AccountService } from '../services/account/account.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { CellData } from 'src/app/shared/models/cell-data.model';
import { ExtraRowsData } from 'src/app/shared/models/extra-rows-data.model';
import { Util } from 'src/app/core/abstracts/util';
import { RoleId } from 'src/app/core/constants/FortigoConstant';

@Component({
  selector: 'app-manager-view',
  templateUrl: './manager-view.component.html',
  styleUrls: ['./manager-view.component.css']
})
export class ManagerViewComponent implements OnInit, OnChanges {
  @Input() isRefresh = false;
  @Input() searchText: any;
  @Input() filterData: any;
  public columnsData: Array<Column> = new Array<Column>();
  public rowsData: Array<object>;
  private _globalRowData: Array<object>;
  public rMDetails: object[];
  public namDetails: object[];
  public smList: Set<string>;
  public sMDetails: any[];
  public smData: any[];
  public smAsNamData: any[];
  public rmSmMap: object;
  public gridConfiguration: GridConfiguration = new GridConfiguration();
  public extraRows: ExtraRowsData;
  public customerSearchSubscription: Subscription;
  public searchSubscription: Subscription;

  constructor(
    private _accountService: AccountService,
    private _loginControlV2Service: LoginControlV2Service,
  ) { }

  ngOnInit() {
    this.getGridConfiguration();
    this.rmSmMap = new Object();
    this.getRMList();
  }

  private onSearch(searchText: any) {
    this._globalRowData = this.rowsData.filter((row) => {
      if (
        this.getLowerCaseString(row['rmAccountManager']).includes(searchText) ||
        this.getLowerCaseString(row['salesManagerName']).includes(searchText) ||
        this.getLowerCaseString(row['companyName']).includes(searchText) ||
        this.getLowerCaseString(row['actualAnnualRevenue']).includes(searchText) ||
        this.getLowerCaseString(row['targetAnnualExpectedRevenue']).includes(searchText) ||
        this.getLowerCaseString(row['actualRevenueQ1']).includes(searchText) ||
        this.getLowerCaseString(row['targetRevenueQ1']).includes(searchText) ||
        this.getLowerCaseString(row['actualRevenueQ2']).includes(searchText) ||
        this.getLowerCaseString(row['targetRevenueQ2']).includes(searchText) ||
        this.getLowerCaseString(row['actualRTD']).includes(searchText) ||
        this.getLowerCaseString(row['actualR1']).includes(searchText) ||
        this.getLowerCaseString(row['targetRevenueM1']).includes(searchText) ||
        this.getLowerCaseString(row['actualR2']).includes(searchText) ||
        this.getLowerCaseString(row['targetRevenueM2']).includes(searchText) ||
        this.getLowerCaseString(row['totalOutstanding']).includes(searchText) ||
        this.getLowerCaseString(row['actualOverdue']).includes(searchText) ||
        this.getLowerCaseString(row['actualBilled']).includes(searchText) ||
        this.getLowerCaseString(row['actualDue']).includes(searchText) ||
        this.getLowerCaseString(row['actualCollection']).includes(searchText) ||
        this.getLowerCaseString(row['cycleTime']).includes(searchText) ||
        this.getLowerCaseString(row['companyStatus']).includes(searchText) ||
        this.getLowerCaseString(row['primaryContactName']).includes(searchText) ||
        this.getLowerCaseString(row['primaryContactNumber']).includes(searchText) ||
        this.getLowerCaseString(row['postMeetingRemarks']).includes(searchText) ||
        this.getLowerCaseString(row['nextActionItemDate']).includes(searchText)) {
        return true;
      }
      return false;
    });
  }
  /**
   * returns the lowercase string of element passed
   * @param  {any} elemet
   */
  private getLowerCaseString(elemet: any) {

    return elemet.toString().toLowerCase();
  }

  /**
   * Filters the row data
   */
  private onFilterApply() {
    console.log(this.filterData);
    if (this.filterData.accountManagerName && this.filterData.showData) {
      this.filterByManagerName();
      this.filterShowData(this.filterData.showData);
    } else if (!this.filterData.accountManagerName && this.filterData.showData) {
      this.filterShowData(this.filterData.showData);
    } else if (this.filterData.accountManagerName && !this.filterData.showData) {
      this.filterByManagerName();
    }
  }

  private filterByManagerName() {
    this.rowsData = this._globalRowData.filter((row) => {
      if (row['rmAccountManagerId'].toString().toLowerCase() === this.filterData.accountManagerName.trim().toString().toLowerCase()) {
        return true;
      }
      return false;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isRefresh) {
      this.isRefresh = changes.isRefresh.currentValue;
      if (this.isRefresh) {
        this.setManagerViewRowsData();
      }
    }
    if (changes.searchText) {
      this.searchText = changes.searchText.currentValue;
      this.onSearch(this.searchText);
    }
    if (changes.filterData) {
      this.filterData = changes.filterData.currentValue;
      this.onFilterApply();
    }
  }

  /**
   * Used to load manager view configuration
   */
  private loadManagerView() {
    this.setManagerViewColumnsData();
    this.setManagerViewRowsData();
  }

  /**
   * used to set grid configuration
   */
  private getGridConfiguration() {
    this.gridConfiguration.uniqueColumnName = 'rmAccountManagerId';
    this.gridConfiguration.uniqueLevel1RowExpansionColumnName = 'rmAccountManagerId';
    this.gridConfiguration.uniqueLevel2RowExpansionColumnName = 'salesManagerId';
    this.gridConfiguration.rowExpansionIcon = 'remove_circle';
    this.gridConfiguration.rowCollapseIcon = 'add_circle';
    this.gridConfiguration.showLoader = false;
    this.gridConfiguration.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
  }
  /**
   * filter data by showAs
   * @param  {} showData
   */
  private filterShowData(showData) {
    if (showData.trim() === 'asSM') {
      this.rowsData = this._globalRowData.filter(
        (eachTreeData) => {
          if (!eachTreeData['userAsNAM']) {
            return true;
          }
          return false;
        }
      );
    } else if (showData.trim() === 'asNAM') {
      this.rowsData = this._globalRowData.filter(
        (eachTreeData) => {
          if (eachTreeData['userAsNAM']) {
            return true;
          }
          return false;
        }
      );
    } else if (showData.trim() === 'asBoth') {
      this.rowsData = this._globalRowData;
    }

  }
  /**
    *  Sets columns data for Manager
    */
  private setManagerViewColumnsData() {
    // TODO  Add actual Column data for Manager View
    this.columnsData = [
      { columnDef: 'rmAccountManager', headerName: 'Account Manager', action: 'data-expand-collapse', isExpandableRow: true, dataType: DataType.String, dataFormat: DataFormat.BigText, bigTextLength: 10, css: { marginLeft: 'medium' }, innerCells: 1 },
      { columnDef: 'salesManagerName', headerName: 'Sales Manager', action: 'data-expand-collapse', isExpandableRow: true, dataType: DataType.String, css: { marginLeft: 'large' } },
      { columnDef: 'companyName', headerName: 'Company Name', dataType: DataType.String, dataFormat: DataFormat.BigText, bigTextLength: 15, css: { horizontalAlign: 'left' } },
      // Target and Actual: Revenue - Annually
      { columnDef: 'actualAnnualRevenue', headerName: 'T.D', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, css: { textColor: 'blue' }, innerCells: 2, subHeader1Name: 'Rev. (Annual & Qtly)', subHeader1Colspan: 3 },
      { columnDef: 'targetAnnualExpectedRevenue', headerName: 'Annual', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, css: { textColor: 'blue' } },
      // Target and Actual: Revenue - Last Quarter
      { columnDef: 'actualRevenueQ1', headerName: 'Q-1', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, innerCells: 2, subHeader1Colspan: 0 },
      { columnDef: 'targetRevenueQ1', headerName: 'Q-1', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
      // Target and Actual: Revenue - Second Last Quarter
      { columnDef: 'actualRevenueQ2', headerName: 'Q-2', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, innerCells: 2, subHeader1Colspan: 0 },
      { columnDef: 'targetRevenueQ2', headerName: 'Q-2', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
      // Target and Actual: Revenue - Monthly
      { columnDef: 'actualRTD', headerName: 'T.D', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, css: { textColor: 'blue' }, innerCells: 2, subHeader1Name: 'Rev. (Monthly)', subHeader1Colspan: 3 },
      { columnDef: 'targetRevenueMTD', headerName: 'M', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, css: { textColor: 'blue' } },
      // Target and Actual: Revenue - Last Month
      { columnDef: 'actualR1', headerName: 'M-1', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, innerCells: 2, subHeader1Colspan: 0 },
      { columnDef: 'targetRevenueM1', headerName: 'M-1', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
      // Target and Actual: Revenue - Second Last Month
      { columnDef: 'actualR2', headerName: 'M-2', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, innerCells: 2, subHeader1Colspan: 0 },
      { columnDef: 'targetRevenueM2', headerName: 'M-2', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
      // Target and Actual: Margin - Monthly
      { columnDef: 'actualMTD', headerName: 'T.D', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, css: { textColor: 'blue' }, innerCells: 2, subHeader1Name: 'Margin (Monthly)', subHeader1Colspan: 3 },
      { columnDef: 'targetMarginMTD', headerName: 'M', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, css: { textColor: 'blue' } },
      // Target and Actual: Margin - Last Month
      { columnDef: 'actualM1', headerName: 'M-1', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, innerCells: 2, subHeader1Colspan: 0 },
      { columnDef: 'targetMarginM1', headerName: 'M-1', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
      // Target and Actual: Margin - Second Last Month
      { columnDef: 'actualM2', headerName: 'M-2', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, innerCells: 2, subHeader1Colspan: 0 },
      { columnDef: 'targetMarginM2', headerName: 'M-2', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
      // Outstanding, Due, Overdue, Billed
      { columnDef: 'totalOutstanding', headerName: 'Tot. Out.', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, css: { textColor: 'blue' }, innerCells: 2 },
      { columnDef: 'actualOverdue', headerName: 'O.D', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, css: { textColor: 'blue' } },
      { columnDef: 'actualBilled', headerName: 'Billed', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, innerCells: 2 },
      { columnDef: 'actualDue', headerName: 'Due', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
      // Collected Amount, Cycle Time
      { columnDef: 'actualCollection', headerName: 'Coll-Amt', dataType: DataType.Number, dataFormat: DataFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency, innerCells: 2 },
      { columnDef: 'cycleTime', headerName: 'Cycle T', dataType: DataType.Number },
      // company status
      { columnDef: 'companyStatus', headerName: 'Status', dataType: DataType.String, dataFormat: DataFormat.Status, rowToolTipTextFormat: DataFormat.Title, css: { horizontalAlign: 'center' } },
      // contact details
      { columnDef: 'primaryContactName', headerName: 'Name', dataType: DataType.String, dataFormat: DataFormat.BigText, innerCells: 2, css: { horizontalAlign: 'right' } },
      { columnDef: 'primaryContactNumber', headerName: 'Number', dataType: DataType.Number },
      // meeting details
      { columnDef: 'postMeetingRemarks', headerName: 'Next Step', dataType: DataType.String, dataFormat: DataFormat.BigText, innerCells: 2, css: { horizontalAlign: 'right' } },
      { columnDef: 'nextActionItemDate', headerName: 'When', dataType: DataType.Date, dataFormat: DataFormat.Date, css: { horizontalAlign: 'right' } }
    ];
  }

  /**
 * Sets the Row data for ManagerView
 */
  private setManagerViewRowsData() {
    this.rowsData = this.rMDetails.slice().concat(this.namDetails.slice());
    this._globalRowData = <Array<object>>Util.getObjectCopy(this.rowsData);
  }

  /**
* Trigger on click cells
* @param  {CellData} event
*/
  public onCellClick(event: CellData) {
    switch (event.action.toLowerCase()) {
      case 'data-expand-collapse'.toLowerCase():
        if (event.isForExtraData) {
          this.getExpandedRowData(event);
        }
        break;
      default:
        break;
    }
  }

  /**
   * This method set the extra rows onclick datagrid cell
   * @param  {CellData} event: Selected cell
   */
  private getExpandedRowData(event: CellData) {
    if (event.columnName === 'rmAccountManager') {
      this.setExtraRowDataForRM(event.rowData.rmAccountManagerId, 'rmAccountManager', event.rowData, event.rowExpansionLevel);
    }
    if (event.columnName === 'salesManagerName') {
      this.setExtraRowDataForSM(event.rowData.rmAccountManagerId, 'salesManagerName', event.rowData, event.rowExpansionLevel);
    }
  }


  /**
   * Get data for extra customer rows
   * @param  {string} columnName
   * @param  {any} rowData
   */
  private setExtraRowDataForSM(rowId: number, columnName: string, rowData: any, rowExpansionLevel) {
    let extraData = [];

    this._accountService.getCompaniesForSalesManager(rowData['salesManagerId'].toString()).subscribe((companySMResponse: Array<object>) => {
      extraData = companySMResponse.sort((a, b) => b['actualAnnualRevenue'] - a['actualAnnualRevenue']);
      this.extraRows = new ExtraRowsData(rowData, extraData, columnName, rowExpansionLevel);

    });
  }

  /**
   * Get data for extra customer rows
   * @param  {string} columnName
   * @param  {any} rowData
   */
  private setExtraRowDataForRM(rowId: number, columnName: string, rowData: any, rowExpansionLevel) {

    let extraData = [];
    if (rowData['userAsNAM']) {
      extraData = this.smAsNamData.filter(eachElement => eachElement['salesManagerId'].toString() === rowId.toString());

    } else {
      extraData = this.smData.filter(eachElement => eachElement['salesManagerId'].toString() === rowId.toString());
    }

    this.extraRows = new ExtraRowsData(rowData, extraData, columnName, rowExpansionLevel);
  }

  /**check customer data if exist then fetch it otherwise make a rest call */
  private getRMList() {
    // get dataset for RM and NAM
    this.rMDetails = this._accountService.rMDetails;
    this.namDetails = this._accountService.rmAsNamData;

    // get all sm related to rm
    this._accountService.listSMForRM().subscribe((response1: Array<any>) => {
      // list of all sm's
      this.smList = new Set<string>();
      this.rMDetails.forEach((eachRMDetails) => {
        response1.forEach((eachResponse) => {
          if (eachRMDetails['rmAccountManagerId'].toString() === eachResponse['rmUserStringId']) {
            this.smList.add(eachResponse['smUserStringID']);
            if (this.rmSmMap[eachRMDetails['rmAccountManagerId']]) {
              this.rmSmMap[eachRMDetails['rmAccountManagerId']] += ',' + eachResponse['smUserStringID'];
            } else {
              this.rmSmMap[eachRMDetails['rmAccountManagerId']] = eachResponse['smUserStringID'];
            }
          }
        });
      });

      // if a logged in user role is READ-ONLY or REGIONAL MANAGER
      if (this._loginControlV2Service.roleId.toString() !== RoleId.FORTIGO_READ_ONLY_USER.toString() && this._loginControlV2Service.roleId.toString() !== RoleId.REGIONAL_MANAGER.toString()) {
        this.smList.clear();
        this.smList.add(this._loginControlV2Service.userId);
      }

      const smStringList = Array.from(this.smList).join();
      // get all sm's data
      this._accountService.getSalesManagerDataList(smStringList).subscribe((response2: Array<any>) => {
        this.sMDetails = response2;

        if (this.sMDetails === null || this.sMDetails === undefined) {
          this.sMDetails = [];
        }
        // create's dataset for sm and nam
        this.smData = this.sMDetails.filter(e => !e.userAsNAM);
        this.smAsNamData = this.sMDetails.filter(e => e.userAsNAM);
        this.loadManagerView();
      });
    });

  }

}
