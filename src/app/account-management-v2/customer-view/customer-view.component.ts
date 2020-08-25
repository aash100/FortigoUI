import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Column, DataType, DataFormat } from 'src/app/shared/models/column.model';
import { GridConfiguration, GridActionIcon } from 'src/app/shared/models/grid-configuration.model';
import { AccountService } from '../services/account/account.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { FortigoConstant, RoleId } from 'src/app/core/constants/FortigoConstant';
import { ExtraRowsData } from 'src/app/shared/models/extra-rows-data.model';
import { CellData } from 'src/app/shared/models/cell-data.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { AccountFormComponent } from '../account/account-form/account-form.component';
import Swal from 'sweetalert2';
import { MetadataService } from '../services/metadata/metadata.service';
@Component({
  selector: 'app-customer-view',
  templateUrl: './customer-view.component.html',
  styleUrls: ['./customer-view.component.css']
})
export class CustomerViewComponent implements OnInit, OnChanges {
  // Takes boolean input if refresh is triggered
  @Input() isRefresh = false;
  // Takes text passed to search
  @Input() searchText: string;
  // Takes data to filter
  @Input() filterData: any;
  public columnsData: Array<Column> = new Array<Column>();
  private chunkInterval: any;
  public rowsData: Array<Object>;
  public companyViewRowsData: Array<Object>;
  public gridconfiguration: GridConfiguration = new GridConfiguration();
  public extraRows: ExtraRowsData;
  public selectedTabIndex: number;
  public meetingDataWithUserId = new Array<Object>();

  constructor(
    private _metaData: MetadataService,
    private _accountService: AccountService,
    private _loginControlV2Service: LoginControlV2Service,
    private _router: Router,
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
    this.selectedTabIndex = 1;
    // this.setCustomerViewGridConfiguration();
    this.getGridConfiguration();
    this.setCustomerViewColumnsData();
    this.setCustomerViewRowsData();

  }

  /**
   * searches the text in the dataset
   * @param  {any} searchText
   */
  private onSearch(searchText: any) {
    const roleId = Number.parseInt(this._loginControlV2Service.roleId.toString());
    if (roleId === RoleId.FORTIGO_READ_ONLY_USER) {
      this._accountService.searchAccount(searchText).subscribe((response) => {
        this.rowsData = response;
      });
    } else {
      const requestPayload = {
        companyIds: this._metaData.hierarchyCompanyIds,
        userIds: this._loginControlV2Service.userId.toString(),
        search: searchText
      };
      this._accountService.searchCustomerByHierarchy(requestPayload).subscribe((response) => {
        this.rowsData = response;
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if refresh value changes
    if (changes.isRefresh) {
      this.isRefresh = changes.isRefresh.currentValue;
      if (this.isRefresh) {
        this.setCustomerViewRowsData();
      }
    }
    // if search text changes
    if (changes.searchText) {
      this.searchText = changes.searchText.currentValue;
      this.onSearch(this.searchText);
    }
    // if filter data changes
    if (changes.filterData) {
      this.filterData = changes.filterData.currentValue;
      this.onFilterApplied();
    }
  }

  /**
   * Filters the data as based on the condition
   */
  private onFilterApplied() {
    this._accountService.getCompanyIds(this.filterData['accountManagerName']).subscribe((response) => {
      const companyIds = this.getCompanyIdsInString(response);
      const requestPayload = {
        companyIds: companyIds,
        userIds: this.filterData['accountManagerName'].toString(),
        search: this.filterData['contactPerson']
      };
      this._accountService.searchCustomerByHierarchy(requestPayload).subscribe((response1) => {
        this.rowsData = response1;
      });
    });

  }

  /**
   * parses the response to get comma seperated companyIds string
   * @param  {any} response
   */
  private getCompanyIdsInString(response: any) {
    const temp: JSON = response['results'];
    let companyIds = '';
    if (temp['nationalCompanyIds']) {
      companyIds += temp['nationalCompanyIds'];
    }
    if (temp['regionalCompanyIds']) {
      if (temp['nationalCompanyIds'] !== null) {
        companyIds += ',';
      }
      companyIds += temp['regionalCompanyIds'];
    }
    return companyIds;
  }

  /**
   * Set Data table fields for customer view
   */
  private setCustomerViewColumnsData() {
    this.columnsData.length = 0;
    this.columnsData = [
      { columnDef: 'companyName', headerName: 'Company Name', dataType: DataType.String, dataFormat: DataFormat.BigText, bigTextLength: 15, action: 'data-expand-collapse', css: { horizontalAlign: 'left' }, isExpandableRow: true, innerCells: 2 },
      { columnDef: 'nationalAccountManager', headerName: 'Account Manager', action: 'click', dataType: DataType.String, dataFormat: DataFormat.BigText, bigTextLength: 10, css: { marginLeft: 'medium' } },
      { columnDef: 'rmAccountManager', headerName: 'Regional Manager', action: 'click', dataType: DataType.String, css: { marginLeft: 'large' } },
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
 * Create chunks of data
 * @param  {Array<any>} data
 */
  private createDataChunk(data: Array<any>) {
    const chunkSize = 50;
    const intervalInSec = 0.1;

    this.chunkInterval = setInterval(() => {
      if (this.selectedTabIndex === 1) {
        if (data.length > chunkSize) {
          if (this.rowsData === undefined) {
            this.rowsData = data.slice(0, chunkSize);
          } else {
            this.rowsData = this.rowsData.concat(...data.slice(0, chunkSize));
          }
          data = data.slice(chunkSize, data.length);
        } else {
          this.rowsData = this.rowsData.concat(...data.slice(0, data.length));
          clearInterval(this.chunkInterval);
        }
      } else {
        clearInterval(this.chunkInterval);
      }
    }, intervalInSec * 1000);

  }

  /**
  * Set data for customer view
  */
  private setCustomerViewRowsData() {
    this.rowsData = [];

    if (this.companyViewRowsData && this.companyViewRowsData.length > 0) {
      this.rowsData = this.companyViewRowsData;
      this.getGridConfiguration();
    } else {
      const roleId = Number.parseInt(this._loginControlV2Service.roleId.toString());
      this._accountService.getCompanyDashbaord(roleId === RoleId.FORTIGO_READ_ONLY_USER).subscribe((response: Array<any>) => {
        this.createDataChunk(response.slice(0, 50));
        this.companyViewRowsData = response;
        this.getGridConfiguration();
      });
    }
  }

  /**
   * Get data for extra customer rows
   * @param  {string} columnName
   * @param  {any} rowData
   */
  private setCustomerViewExtraRowsData(rowId: number, columnName: string, rowData: any, rowExpansionLevel) {
    let extraData = [];
    this._accountService.getRMsForCompany(rowData['companyStringId'].toString()).subscribe((response: Array<Object>) => {
      extraData = response;
      this.extraRows = new ExtraRowsData(rowData, extraData, columnName, rowExpansionLevel);
    });
  }

  /**
  * used to set grid configuration
  */
  private getGridConfiguration() {
    this.gridconfiguration = new GridConfiguration();
    this.gridconfiguration.uniqueColumnName = 'companyStringId';
    this.gridconfiguration.uniqueLevel1RowExpansionColumnName = 'companyStringId';
    this.gridconfiguration.sortColumnName = 'actualAnnualRevenue';
    this.gridconfiguration.rowExpansionIcon = 'remove_circle';
    this.gridconfiguration.rowCollapseIcon = 'add_circle';
    this.gridconfiguration.isPaginaionEnabled = true;

    this.gridconfiguration.showLoader = false;
    this.gridconfiguration.actionIconList.length = 0;
    this.gridconfiguration.actionIconList.push(new GridActionIcon('edit', 'Edit Account'));
    this.gridconfiguration.actionIconList.push(new GridActionIcon('delete', 'Deactivate'));
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
      case 'click'.toLowerCase():
        this.openLink(event);
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
    if (event.columnName === 'companyName') {
      this.setCustomerViewExtraRowsData(event.rowData.id, event.columnName, event.rowData, event.rowExpansionLevel);
    }
  }

  /**
 * This method call on click event of data-grid cell
 * @param  {} event: selected row
 */
  private openLink(event) {
    if (event.columnName.toLowerCase() === 'nationalAccountManager'.toLowerCase()) {
      this._router.navigate(['account/landing', event.rowData['companyStringId']]);
    }
  }

  /**
  * Handles on extra button click 
 * @param  {any} data
 */
  public onActionExtraButtonClick(data: any) {
    switch (data.index) {
      case 0:
        this._dialog.open(AccountFormComponent, {
          data: {
            mode: FortigoConstant.FORM_EDIT_MODE,
            companyId: data.data.companyStringId
          }
        });
        break;
      case 1:
        this.deactivateAccount(data.data);
        break;
      default:
        break;
    }
  }

  /**
 * Delete account
 * @param  {any} account
 */
  private deactivateAccount(account: any) {
    Swal.fire({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
      cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.value) {
        // this.loading = true;
        this._accountService
          .deleteAccount(account.companyStringId)
          .subscribe(
            () => {
              this.clearData();
            },
            (error) => {
              Swal.fire('Faied to delete account', '', 'error');
            });
      }
    });
  }

  /**
 * Clear form data
 */
  private clearData() {
    clearInterval(this.chunkInterval);
  }

}
