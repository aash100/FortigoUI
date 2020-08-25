import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

import { Column, CalculationDataType, DataFormat, DataType, DataCalculationFormat } from 'src/app/shared/models/column.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { ExtraRowsData } from 'src/app/shared/models/extra-rows-data.model';
import { Note } from 'src/app/shared/models/note.model';
import { CellData } from 'src/app/shared/models/cell-data.model';
import { DateInputField, SelectOption, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { Util } from 'src/app/core/abstracts/util';
import { CollectionService } from '../services/collection/collection.service';

@Component({
  selector: 'app-customer-collection-summary',
  templateUrl: './customer-collection-summary.component.html',
  styleUrls: ['./customer-collection-summary.component.css']
})
export class CustomerCollectionSummaryComponent implements OnInit {

  public pageTitle: string;
  public columnsData: Array<Column>;
  public gridConfigurationData: GridConfiguration;
  public rowsData: Array<any>;
  public extraRows: ExtraRowsData;
  public filterFields: Array<any>;
  public miniNotes: Array<Note>;

  private paymentLocation: SearchableSelectInputField;
  private filter = {
    ecNameId: null,
    paymentLocationId: null,
    collectionManagerId: null,
    ecName: null,
    paymentLocation: null,
    collectionManager: null,
    searchText: null
  };
  private locationSearchOptions: SelectOption;

  constructor(private _collectionService: CollectionService) { }

  ngOnInit() {
    this.pageTitle = FortigoConstant.CUSTOMER_COLLECTION_SUMMARY;
    // setting mini notes
    this.miniNotes = [
      { horizontalAlign: 'left', text: '* All amounts are in Lakhs' }
    ];
    this.getGridConfigurations();
    this.getCustomerSummary();
    this.getFilterFields();
    this.getColumnData();
    this.getCompanyList();
    this.getCollectionManager();
  }

  /**
   * Get customer summary
   */
  private getCustomerSummary() {
    this.rowsData = null;
    this.extraRows = undefined;
    this._collectionService.getCustomerSummary(this.filter).subscribe((response: Array<any>) => {
      // this.rowsData = this.processRowData(response);
      this.rowsData = response;
    });
  }

  /**
   * This method sort rowsData according to the difference of invoice amount and collected amount.
   */
  private processRowData(response) {
    response.sort((invoiceAmount, collectedAmount) => {
      if (Math.abs(invoiceAmount.invoicedAmount - invoiceAmount.collectedAmount) > Math.abs(collectedAmount.invoicedAmount - collectedAmount.collectedAmount)) {
        return -1;
      } else if (Math.abs(invoiceAmount.invoicedAmount - invoiceAmount.collectedAmount) < Math.abs(collectedAmount.invoicedAmount - collectedAmount.collectedAmount)) {
        return 1;
      } else {
        return 0;
      }
    });
    return response;
  }

  /**
   * Get company list for filter.
   */
  private getCompanyList() {
    this._collectionService.listEndCustomerName().subscribe((response: Array<any>) => {
      this._collectionService.collectionFilter.ecCompanyList = response;
      const searchOptions = new SelectOption('name', 'stringId', this._collectionService.collectionFilter.ecCompanyList);
      const customerName = new SearchableSelectInputField('EC Name', 'ecCustomerId', searchOptions, 12, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
      this.filterFields.splice(0, 1, customerName);
      const tempFields = Util.getObjectCopy(this.filterFields);
      this.filterFields = [];
      this.filterFields = <Array<any>>tempFields;
    });
  }

  /**
   * Get manager list for filter
   */
  private getCollectionManager() {
    this._collectionService.listCollectionManager().subscribe((response: Array<any>) => {
      this._collectionService.collectionFilter.collectionManagerList = response.map((x) => {
        let name = Object.values(x['name']);
        name = name.filter(eachName => eachName !== null);
        const fullName = name.join(' ');
        return { 'managerId': x.id, 'managerName': fullName };
      });
      const collectionManagerOptionList = this._collectionService.collectionFilter.collectionManagerList;
      const collectionManagerOption = new SelectOption('managerName', 'managerId', collectionManagerOptionList);
      const collectionManager = new SearchableSelectInputField('Account Manager', 'collectionManagerId', collectionManagerOption, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
      this.filterFields.splice(2, 1, collectionManager);
      const tempFields = Util.getObjectCopy(this.filterFields);
      this.filterFields = [];
      this.filterFields = <Array<any>>tempFields;
    });
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
        let paymentLocationId;
        if (locationSearchOptions['data'].length === 1) {
          paymentLocationId = locationSearchOptions['data'][0]['locationMapId'].toString();
        }
        this.paymentLocation = new SearchableSelectInputField('Payment Location', 'paymentLocation', locationSearchOptions, 12, false, false, undefined, undefined, 1, undefined, undefined, undefined);
        this.filterFields.splice(1, 1, this.paymentLocation);
        const tempFields = Util.getObjectCopy(this.filterFields);
        this.filterFields = [];
        this.filterFields = <Array<any>>tempFields;
      });
    }
  }

  /**
   * This method is use to set the column for data grid.
   */
  private getColumnData() {
    this.columnsData = [
      { columnDef: 'customerName', headerName: 'Customer Name', innerCells: 1, action: 'data-expand-collapse', isExpandableRow: true, dataType: DataType.String, disableRowToolTipText: true, css: { userSelect: 'text' } },
      { columnDef: 'paymentLocation', headerName: 'Payment location', innerCells: 1 },
      { columnDef: 'accountManagerName', headerName: 'Account Manager Name', innerCells: 1, width: '200px', disableRowToolTipText: true },
      { columnDef: 'invoicedAmount', headerName: 'Invoiced Amount', innerCells: 1, dataFormat: DataFormat.CurrencyInLac, css: { textColor: 'blue', fontWeight: 'bold' }, dataType: DataType.Number, headerCalculatedDataType: CalculationDataType.Sum, dataCalculationFormat: DataCalculationFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
      { columnDef: 'collectedAmount', headerName: 'Collected Amount', innerCells: 1, dataFormat: DataFormat.CurrencyInLac, css: { textColor: 'blue', fontWeight: 'bold' }, dataType: DataType.Number, headerCalculatedDataType: CalculationDataType.Sum, dataCalculationFormat: DataCalculationFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
      { columnDef: 'appropriatedAmount', headerName: 'Appropriated Amount', dataFormat: DataFormat.CurrencyInLac, innerCells: 1, dataType: DataType.Number, headerCalculatedDataType: CalculationDataType.Sum, dataCalculationFormat: DataCalculationFormat.CurrencyInLac, css: { textColor: 'blue' }, rowToolTipTextFormat: DataFormat.Currency },
      { columnDef: 'customerOnAccount', headerName: 'Customer On Account', innerCells: 1, dataType: DataType.Number, css: { textColor: 'blue' }, dataFormat: DataFormat.CurrencyInLac, headerCalculatedDataType: CalculationDataType.Sum, width: '30px', dataCalculationFormat: DataCalculationFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
      { columnDef: 'unrealizedAmount', headerName: 'In-transit Amount', dataType: DataType.Number, innerCells: 1, css: { textColor: 'blue' }, dataFormat: DataFormat.CurrencyInLac, headerCalculatedDataType: CalculationDataType.Sum, dataCalculationFormat: DataCalculationFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
      { columnDef: 'tds', headerName: 'TDS', innerCells: 1, dataFormat: DataFormat.CurrencyInLac, css: { textColor: 'blue', fontWeight: 'bold' }, dataType: DataType.Number, headerCalculatedDataType: CalculationDataType.Sum, dataCalculationFormat: DataCalculationFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
      { columnDef: 'tripDeductions', headerName: 'Trip Deductions', innerCells: 1, dataFormat: DataFormat.CurrencyInLac, css: { textColor: 'blue', fontWeight: 'bold' }, dataType: DataType.Number, headerCalculatedDataType: CalculationDataType.Sum, dataCalculationFormat: DataCalculationFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
      { columnDef: 'nonTripDeductions', headerName: 'Non-Trip Deductions', innerCells: 1, dataFormat: DataFormat.CurrencyInLac, css: { textColor: 'blue', fontWeight: 'bold' }, dataType: DataType.Number, headerCalculatedDataType: CalculationDataType.Sum, dataCalculationFormat: DataCalculationFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
      { columnDef: 'cashdiscount', headerName: 'Cash discount', innerCells: 1, dataFormat: DataFormat.CurrencyInLac, css: { textColor: 'blue', fontWeight: 'bold' }, dataType: DataType.Number, headerCalculatedDataType: CalculationDataType.Sum, dataCalculationFormat: DataCalculationFormat.CurrencyInLac, rowToolTipTextFormat: DataFormat.Currency },
    ];
  }

  /**
   * Set grid configurations.
   */
  private getGridConfigurations() {
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
    // this.gridConfigurationData.defaultPageSize = 50;
    this.gridConfigurationData.uniqueColumnName = 'customerName';
    this.gridConfigurationData.sortOrder = 'desc';
    this.gridConfigurationData.isSortingEnabled = true;
    this.gridConfigurationData.uniqueLevel1RowExpansionColumnName = 'customerName';
    this.gridConfigurationData.rowExpansionIcon = 'remove_circle';
    this.gridConfigurationData.rowCollapseIcon = 'add_circle';
    this.gridConfigurationData.uniqueColumnName = 'customerName';
    this.gridConfigurationData.disableRowToolTipText = false;
    this.gridConfigurationData.isPaginaionEnabled = false;
    this.gridConfigurationData.css.tableRowHeight = '25px';
  }

  /**
   * This is use to set filter fields.
   */
  private getFilterFields() {
    const searchOptions = new SelectOption('name', 'stringId', this._collectionService.collectionFilter.ecCompanyList);
    const customerName = new SearchableSelectInputField('EC Name', 'ecCustomerId', searchOptions, 12, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    this.paymentLocation = new SearchableSelectInputField('Payment Location', 'paymentLocation', undefined, 12, false, false, undefined, undefined, 1, undefined, undefined, undefined);
    const collectionManagerOptionList = this._collectionService.collectionFilter.collectionManagerList;
    const collectionManagerOption = new SelectOption('managerName', 'managerId', collectionManagerOptionList);
    const collectionManager = new SearchableSelectInputField('Account Manager', 'collectionManagerId', collectionManagerOption, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);

    this.filterFields =
      [
        customerName,
        this.paymentLocation,
        collectionManager,
      ];
  }

  /**
   * This triggers to expand the seletect rows.
   * @param  {any} cellData: data of seleted row.
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
   * This function is used to get expanded data for clicked row item.
   *
   * @param  {CellData} cellData: Cell Data of clicked row
   */
  private getExpandedRowData(cellData: CellData) {
    switch (cellData.columnName.toString().toLowerCase()) {
      case 'customerName'.toLowerCase():
        this.getExtraRowsData(cellData.rowData, cellData.columnName, cellData.rowExpansionLevel);
        break;
      default:
        break;
    }
  }

  /**
   * Gets extra rows data
   * @param rowData
   * @param columnName
   */
  private getExtraRowsData(rowData: any, columnName: string, rowExpansionLevel: number) {
    this.extraRows = new ExtraRowsData(rowData, rowData.paymentLocationCollectionSummaries, columnName, rowExpansionLevel);
  }

  /**
   * Apply filter for the grid.
   * @param  {any} filterData: selected filter fields.
   */
  public filterSubmit(filterData: any) {
    this.filter = filterData;
    this.rowsData = null;
    this.extraRows = undefined;
    this._collectionService.getCustomerSummary(this.filter).subscribe((response: Array<any>) => {
      this.rowsData = this.processRowData(response);
    });
  }

  /**
   * This clear the filter form fields
   */
  public clearFilter() {
  }

  /**
   * This method is use to clear the filter and search.
   */
  public refresh() {
    this.filter = {
      ecNameId: null,
      paymentLocationId: null,
      collectionManagerId: null,
      ecName: null,
      paymentLocation: null,
      collectionManager: null,
      searchText: null
    };
    this.getCustomerSummary();
  }

  /**
   * This methos trigger on enter search text.
   * @param  {any} event: Entered text in search box.
   */
  public onSearch(event: string) {
    if (event) {
      this.filter.searchText = event;
    }
    this.rowsData = null;
    this.extraRows = undefined;
    this._collectionService.getCustomerSummary(this.filter).subscribe((response: Array<any>) => {
      this.rowsData = this.processRowData(response);
    });
  }
}
