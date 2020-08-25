/*
 * Created on Mon Jan 21 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, Input, SimpleChanges, OnChanges, ViewChild, Output, EventEmitter, HostListener } from '@angular/core';
import { TitleCasePipe, CurrencyPipe, DatePipe, SlicePipe, UpperCasePipe } from '@angular/common';
import { MatSort, MatTableDataSource, MatPaginator, MatTable, MatCheckboxChange, MatSnackBar } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

import Swal from 'sweetalert2';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { Util } from 'src/app/core/abstracts/util';

import { Column, CalculationDataType, DataType, DataFormat, CellActions, DataCalculationFormat } from '../../models/column.model';
import { GridConfiguration, GridConfigValidation } from '../../models/grid-configuration.model';
import { CellData } from '../../models/cell-data.model';
import { ExtraRowsData } from '../../models/extra-rows-data.model';
import { Style } from '../../models/style.model';

import { RsToLakhPipe } from '../../pipes/rs-to-lakh.pipe';
import { TruncateTextPipe } from '../../pipes/truncate-text/truncate-text.pipe';
import { ReplaceStringPipe } from '../../pipes/replace-string.pipe';

import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { ClipboardService, IClipboardResponse } from 'ngx-clipboard';
import { SnackbarModel } from '../../models/snackbar.model';
import { FortigoSnackbarComponent } from '../fortigo-snackbar/fortigo-snackbar.component';

export type ExpandCollapseState = 'isExpanded' | 'isCollapsed';
export type ExpandCollapseTooltip = 'Expand all' | 'Collapse all';

@Component({
  selector: 'app-fortigo-grid',
  templateUrl: './fortigo-grid.component.html',
  styleUrls: ['./fortigo-grid.component.css'],
  providers: [UpperCasePipe, TitleCasePipe, CurrencyPipe, DatePipe, SlicePipe, ReplaceStringPipe]
})
export class FortigoGridComponent implements OnChanges {


  // takes input for Debug Mode to console error, warning and logs
  @Input() isDebug: boolean;
  // takes input as `Column` model for column name and key
  @Input() columns: Array<Column>;
  // takes input as row data
  @Input() rows: Array<Object>;
  // takes input as grid configuration as `GridConfiguration` model
  @Input() gridConfiguration: GridConfiguration;
  @Input() extraColumns: { position: number, data: Array<Column> };
  @Input() extraRows: ExtraRowsData;
  @Input() selectedTabIndex: number;

  // emits column config changes
  @Output() columnsChange = new EventEmitter<Array<Column>>();
  // emits grid config changes
  @Output() gridConfigurationChange = new EventEmitter<GridConfiguration>();
  // gives output for filter tab selection
  @Output() filterTabSelectedIndex = new EventEmitter<number>();
  // gives output for action extra button click
  @Output() actionExtraButtonSelectedIndex = new EventEmitter<Object>();
  // gives output for checkbox 1 selection
  @Output() checkbox1SelectedRow = new EventEmitter<Array<any>>();
  // gives output for checkbox 2 selection
  @Output() checkbox2SelectedRow = new EventEmitter<Array<any>>();
  // gives output for radio button selection
  @Output() radioButtonSelectedRow = new EventEmitter<number>();
  // gives output for clicked cell
  @Output() cellClick = new EventEmitter<CellData>();
  // gives output for edited rows
  @Output() editRows = new EventEmitter<any>();
  @Output() actionItemMenuClick = new EventEmitter<any>();
  @Output() expandAllClick = new EventEmitter<any>();
  @Output() allRowExpandCollapseState = new EventEmitter<ExpandCollapseState>();

  // binds UI element MatTable to table
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  // binds UI element MatSort to sort
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  // binds UI element MatPaginator to paginator
  private paginator: MatPaginator;
  @ViewChild(MatPaginator, { static: false }) set content(content: MatPaginator) {
    this.paginator = content;
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
  }

  // do not change, any value other than 1 is not handled
  public readonly DEFAULT_INNER_CELLS: number = 1;

  public readonly CHECKBOX_1_COL_DEF: string = 'checkbox1';
  public readonly CHECKBOX_2_COL_DEF: string = 'checkbox2';
  public readonly RADIO_BUTTON_COL_DEF: string = 'radio';

  private readonly ROW_INNER_DATA_SUFFIX: string = '_innerData';
  private readonly ROW_ICON_SUFFIX: string = '_icon';
  private readonly ROW_IMAGE_SUFFIX: string = '_image';
  private readonly ROW_IMAGE_ALT_SUFFIX: string = '_imageAlt';
  private readonly ROW_IS_EXPANDED_SUFFIX: string = '_isExpanded';
  private readonly ROW_IS_EXPANDED_ROW_SUFFIX: string = '_isExpandedRow';
  private readonly ROW_EDITABLE_CELL_IS_READ_ONLY_SUFFIX: string = '_isReadOnly';

  public readonly ACTION_BUTTON_COL_DEF: string = 'actionButtons';
  public readonly SUB_HEADER_1_COL_DEF: string = '_subHeader1';
  public readonly SUB_HEADER_1_HIDE: string = '_hideSubHeader1Column';
  public readonly SUB_HEADER_2_COL_DEF: string = '_subHeader2';
  public readonly SUB_HEADER_2_HIDE: string = '_hideSubHeader2Column';
  public readonly CALCULATED_SUB_HEADER_COL_DEF: string = '_calculatedSubHeader';

  public displayedColumns: Array<string>;
  public subHeaders1: Array<string>;
  public subHeaders2: Array<string>;
  public calculatedSubHeaders: Array<string>;
  public dataSource: MatTableDataSource<any>;
  public selection1 = new SelectionModel<any>(true, []);
  public selection2 = new SelectionModel<any>(true, []);
  public radioSelectedRowIndex: number;
  public isLoadingData: boolean;
  private rawColumnData: Array<Column>;
  private rawRowData: Array<Object>;
  private isHavingNestedData: boolean;

  public rowsCalcHeight: string;

  public isMasterCheckbox1Checked: boolean;
  public isMasterCheckbox1Indeterminate: boolean;
  public isMasterCheckbox2Checked: boolean;
  public isMasterCheckbox2Indeterminate: boolean;

  public maxInnerCells: number;
  // Allowing 2 sub headers and 1 calculated header
  public isHavingSubHeader1: boolean;
  public isHavingSubHeader2: boolean;
  public isHavingCalculatedSubHeader: boolean;

  private isDataChunked = false;

  public expandAllCollapseAllState: ExpandCollapseState;
  public expandAllCollapseAllIcon: string;
  public expandAllCollapseAllTooltip: ExpandCollapseTooltip;
  private isAllRowExpanded: boolean;

  private snackbarData: SnackbarModel;

  private expansionCheckOnTab = false;
  // calculated table height
  public calcTableHeight: any;

  // style for table container
  public tableContainerStyle: Style;

  // Used to enable/disable paginator
  public displayPaginator: boolean;

  constructor(
    private _titleCasePipe: TitleCasePipe,
    private _upperCasePipe: UpperCasePipe,
    private _rsToLakhPipe: RsToLakhPipe,
    private _truncateTextPipe: TruncateTextPipe,
    private _currencyPipe: CurrencyPipe,
    private _datePipe: DatePipe,
    private _slicePipe: SlicePipe,
    private _hotkeysService: HotkeysService,
    private _metadataService: AppMetadataService,
    private _replaceStringPipe: ReplaceStringPipe,
    private _snackBar: MatSnackBar,
    private _clipboardService: ClipboardService
  ) {
    this.tableContainerStyle = new Style();
    this.setDefaultGridConfiguration();
    this.applyGridConfiguration();
    this.setKeyboardShortcuts();
  }

  /**
   * Hosts listener on window resize
   * @param [event]
   */
  @HostListener('window:resize', ['$event'])
  onResize(event?) {

    const height = this.gridConfiguration.css.fixedTableHeight;

    let tableOuterHeight: number;

    // TODO @Ritesh: Add values to Fortigo Constants
    // if height of table is provided the override the resizable height
    if (height) {
      this.calcTableHeight = height;
      if (height.includes('px')) {
        const rowsCalcHeight = +(height.substr(0, height.length - 2));
        this.rowsCalcHeight = (rowsCalcHeight - 261) + 'px';
      } else {
        this.rowsCalcHeight = 'initial';
      }
      this.tableContainerStyle.height = this.calcTableHeight;
      return;
    }
    // If user has specified table height
    if (this.gridConfiguration.css.tableOuterHeight) {
      // if table height is set to auto
      if (this.gridConfiguration.css.tableOuterHeight.trim() === 'auto') {
        this.tableContainerStyle.height = 'auto';
        return;
      } else {
        tableOuterHeight = +(this.gridConfiguration.css.tableOuterHeight.substr(0, this.gridConfiguration.css.tableOuterHeight.length - 2));
      }
    } else { // if user has not specified table height
      if (this.gridConfiguration.isFilterTabEnabled) {
        tableOuterHeight = 176;
      } else {
        tableOuterHeight = 136;
      }
    }
    this.calcTableHeight = window.innerHeight - tableOuterHeight;
    // calculate row height in case of no data found
    this.rowsCalcHeight = (this.calcTableHeight - 79) + 'px';
    this.calcTableHeight = this.calcTableHeight + 18 + 'px';
    this.tableContainerStyle.height = this.calcTableHeight;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.
    const startTime = performance.now();
    this.onResize();

    if (this.columns && this.columns.length > 0) {

      if (this.compareData(this.rawColumnData, this.columns)) {
        // same object, do nothing
        if (this.isDebug) {
          console.warn('Same Column input found.');
        }
      } else {
        if (this.gridConfiguration) {
          this.gridConfiguration.isFooterEnabled = this.checkIfFooterRequired();
        }

        this.formatColumns();

        if (this.isDebug) {
          console.info('Column object before Inner Cell Validation: ', this.columns);
        }
        if (this.rawColumnData === undefined && !this.compareColumnDefData(this.rawColumnData, this.columns)) {
          this.validateInnerCellData();
        }
        this.rawColumnData = <Array<Column>>Util.getObjectCopy(this.columns);
        if (this.isDebug) {
          console.info('Column object after Inner Cell Validation: ', this.columns);
        }
      }

      this.columnsChange.emit(this.columns);
      this.isLoadingData = true;
    }

    // when row data is given as input
    if (this.rows) {
      this.isDataChunked = false;

      this.controlPaginator();
      if (!this.dataSource) {
        this.dataSource = new MatTableDataSource<any>();
      }

      if (this.displayPaginator && !this.extraRows && !this.compareData(this.rawRowData, this.rows)) {
        this.createDataChunk(<Array<any>>Util.getObjectCopy(this.rows));
        this.rows = null;
      }

      if (this.rows && this.rows.length > 0) {
        if (this.compareData(this.rawRowData, this.rows)) {
          // same object, do nothing
          if (this.isDebug) {
            console.warn('Same Row input found.');
          }
          this.isLoadingData = false;
        } else {
          this.clearCheckboxSelection();
          this.dataFormatter();
          this.buildColumns();
          this.calculateHeader();
          if (this.extraRows === undefined) {
            this.setRowExpansionButton(this.columns[0].columnDef, this.gridConfiguration.rowCollapseIcon);
          }
        }
      }

      if (this.rows && this.rows.length === 0 && !this.isDataChunked) {
        this.dataSource.data = new MatTableDataSource(this.rows).data;
        this.isLoadingData = false;
        this.calculateHeader(true);
      }

      this.rawRowData = <Array<any>>Util.getObjectCopy(this.rows);
    } else {
      if (this.rows === null && this.dataSource && this.dataSource.data) {
        // loading data
        this.dataSource.data = [];
      }
      this.calculateHeader(true);
    }

    if (this.extraRows && this.extraRows.selectedRowData && this.extraRows.data && this.extraRows.columnName) {
      this.toggleRowExpansionButton(this.extraRows.columnName, this.extraRows.selectedRowData, this.gridConfiguration.rowCollapseIcon, this.gridConfiguration.rowExpansionIcon, this.extraRows.rowExpansionLevel);
      this.extraRows.data.forEach((eachData) => {
        eachData[this.extraRows.columnName + '_isExtraRow'] = true;
        eachData[this.columns[1].columnDef + this.ROW_ICON_SUFFIX] = this.gridConfiguration.rowCollapseIcon;
        // adding extra row identification
        eachData[this.extraRows.columnName + this.ROW_IS_EXPANDED_ROW_SUFFIX] = true;
      });
      let rowIndex: number;

      this.rows.some((row, index) => {
        switch (this.extraRows.rowExpansionLevel) {
          case 0:
            if (row[this.gridConfiguration.uniqueLevel1RowExpansionColumnName] === this.extraRows.selectedRowData[this.gridConfiguration.uniqueLevel1RowExpansionColumnName] && row[this.extraRows.columnName + this.ROW_INNER_DATA_SUFFIX] === undefined) {
              row[this.extraRows.columnName + this.ROW_INNER_DATA_SUFFIX] = this.extraRows.data;
              rowIndex = index;
              return true;
            }
            break;
          case 1:
            if (row[this.gridConfiguration.uniqueLevel2RowExpansionColumnName] === this.extraRows.selectedRowData[this.gridConfiguration.uniqueLevel2RowExpansionColumnName] && row[this.extraRows.columnName + this.ROW_INNER_DATA_SUFFIX] === undefined) {
              row[this.extraRows.columnName + this.ROW_INNER_DATA_SUFFIX] = this.extraRows.data;
              rowIndex = index;
              return true;
            }
            break;
          case 2:
            if (row[this.gridConfiguration.uniqueLevel3RowExpansionColumnName] === this.extraRows.selectedRowData[this.gridConfiguration.uniqueLevel3RowExpansionColumnName] && row[this.extraRows.columnName + this.ROW_INNER_DATA_SUFFIX] === undefined) {
              row[this.extraRows.columnName + this.ROW_INNER_DATA_SUFFIX] = this.extraRows.data;
              rowIndex = index;
              return true;
            }
            break;
          default:
            if (row[this.gridConfiguration.uniqueColumnName] === this.extraRows.selectedRowData[this.gridConfiguration.uniqueColumnName] && row[this.extraRows.columnName + this.ROW_INNER_DATA_SUFFIX] === undefined) {
              row[this.extraRows.columnName + this.ROW_INNER_DATA_SUFFIX] = this.extraRows.data;
              rowIndex = index;
              return true;
            }
            break;
        }
        return false;
      });
      if (this.rows[rowIndex] && this.rows[rowIndex][this.extraRows.columnName + this.ROW_INNER_DATA_SUFFIX] && this.rows[rowIndex][this.extraRows.columnName + this.ROW_INNER_DATA_SUFFIX].length > 0) {
        this.rows.splice(rowIndex + 1, 0, ...this.rows[rowIndex][this.extraRows.columnName + this.ROW_INNER_DATA_SUFFIX]);
      }

      this.dataFormatter();
      this.buildColumns();
      this.calculateHeader();
    }

    if (this.gridConfiguration) {
      if (this.columns && this.columns.length > 0) {
        this.gridConfiguration.isFooterEnabled = this.checkIfFooterRequired();
      }

      if (this.columns && this.columns.length > 0 && this.gridConfiguration.showExpandCollapseAllIcon) {
        if (this.checkIfExpandableRowGrid()) {
          this.gridConfiguration.showExpandCollapseAllIcon = true;
          if (!this.expandAllCollapseAllState) {
            this.expandAllCollapseAllState = 'isCollapsed';
          }
          if (!this.expandAllCollapseAllTooltip) {
            this.expandAllCollapseAllTooltip = 'Expand all';
          }
          if (!this.expandAllCollapseAllIcon) {
            this.expandAllCollapseAllIcon = this.gridConfiguration.rowCollapseIcon;
          }
        } else {
          this.gridConfiguration.showExpandCollapseAllIcon = false;
        }
      }

      const gridConfigValidation: GridConfigValidation = this.gridConfiguration.validateGridOptions(this.gridConfiguration);

      if (gridConfigValidation) {
        this.gridConfiguration = gridConfigValidation.gridConfigDataObject;

        if (this.isDebug) {
          gridConfigValidation.errorMessages.forEach((errorMessage) => {
            console.log(errorMessage);
          });
        }
      }

      this.applyGridConfiguration();
      this.gridConfigurationChange.emit(this.gridConfiguration);
    }

    const duration = performance.now() - startTime;
    console.log(`ngOnChange took ${duration}ms`);
  }

  /**
   * This function increases the grid loading performance by setting timeout and chunking data
   * @param  {Array<any>} data: data to be added to grid
   */
  private createDataChunk(data: Array<any>) {
    this.isDataChunked = true;

    if (this.gridConfiguration && this.gridConfiguration.sortColumnName) {
      data.sort((a, b) => {
        const column = this.columns.find((eachColumn) => eachColumn.columnDef === this.gridConfiguration.sortColumnName);
        a = this.applyPipe(a[this.gridConfiguration.sortColumnName], column.dataFormat);
        b = this.applyPipe(b[this.gridConfiguration.sortColumnName], column.dataFormat);

        if (column.dataFormat === DataFormat.Date || column.dataFormat === DataFormat.DateAndTime || column.dataFormat === DataFormat.LocalDate || column.dataFormat === DataFormat.LocalDateTime) {
          a = new Date(a);
          b = new Date(b);
        }

        if (a > b) {
          if (this.gridConfiguration.sortOrder === 'desc') {
            return -1;
          } else {
            return 1;
          }
        }
        if (b > a) {
          if (this.gridConfiguration.sortOrder === 'desc') {
            return 1;
          } else {
            return -1;
          }
        }
        return 0;
      });
    }

    this.calculateHeader(false, data);

    const chunkSize = this.gridConfiguration.defaultPageSize;

    setTimeout(() => {
      // loading first page data
      if (!this.rows) {
        this.rows = [];
      }
      this.rows = this.rows.concat(...data.slice(0, chunkSize));
      this.dataSource.data = new MatTableDataSource(this.rows).data;

      // loading rest data
      data = data.slice(chunkSize, data.length);
      this.rows = this.rows.concat(...data);
      this.dataSource.data = new MatTableDataSource(this.rows).data;

      this.rawRowData = <Array<any>>Util.getObjectCopy(this.rows);

      this.buildColumns();
      if (this.extraRows === undefined) {
        this.setRowExpansionButton(this.columns[0].columnDef, this.gridConfiguration.rowCollapseIcon);
      }
      this.isLoadingData = false;
    }, 10);
  }

  /**
   * Function compareData:
   *
   * This function compares two object and returns true, if equal, else false
   *
   * @param  {any} oldData: Old Data
   * @param  {any} newData: New Data
   * @returns boolean: returns true, if objects are equal, else false
   */
  private compareData(oldData: any, newData: any): boolean {
    if (JSON.stringify(oldData) === JSON.stringify(newData)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Function compareColumnDefData:
   *
   * This function compares two object and returns true, if equal, else false
   *
   * @param  {Array<Column>} oldData: Old Column Data Array
   * @param  {Array<Column>} newData: New Column Data Array
   * @returns boolean: returns true, if objects are equal, else false
   */
  private compareColumnDefData(oldData: Array<Column>, newData: Array<Column>): boolean {
    if (oldData && oldData.length === newData.length) {
      let columnFound = true;
      for (let index = 0; index < oldData.length; index++) {
        const eachOldData = oldData[index];
        if (eachOldData.columnDef !== newData[index].columnDef) {
          columnFound = false;
          break;
        }
      }
      return columnFound;
    } else {
      return false;
    }
  }

  /**
   * This function collapse and expand all on header icon click
   */
  public onHeaderIconClick() {
    switch (this.expandAllCollapseAllState) {
      case 'isExpanded':
        this.expandAllCollapseAllState = 'isCollapsed';
        this.allRowExpandCollapseState.emit('isCollapsed');
        this.expandAllCollapseAllTooltip = 'Expand all';
        this.expandAllCollapseAllIcon = this.gridConfiguration.rowCollapseIcon;
        this.collapseAllRow();
        // Snackbar for Notifying Collapse and Expand All function
        this.snackbarData = new SnackbarModel('All rows are Collapsed!');
        break;
      case 'isCollapsed':
        this.expandAllCollapseAllState = 'isExpanded';
        this.allRowExpandCollapseState.emit('isExpanded');
        this.expandAllCollapseAllTooltip = 'Collapse all';
        if (this.isAllRowExpanded) {
          this.expandAllRow();
        } else {
          this.expandAllClick.emit();
          this.isAllRowExpanded = true;
        }
        // Snackbar for Notifying Collapse and Expand All function
        this.snackbarData = new SnackbarModel('All rows are Expanded!');
        this.expandAllCollapseAllIcon = this.gridConfiguration.rowExpansionIcon;
        break;
    }
    this._snackBar.openFromComponent(FortigoSnackbarComponent, { data: this.snackbarData });
  }

  /**
   * This function collapse all expanded rows
   */
  private collapseAllRow() {
    this.rows.forEach((eachRow, rowIndex) => {
      if (eachRow[this.columns[0].columnDef + this.ROW_IS_EXPANDED_SUFFIX]) {
        this.collapseSelectedRow(this.columns[0].columnDef, eachRow, rowIndex, 0);
      }
    });
  }

  /**
   * This function collapse all expanded rows
   */
  private expandAllRow() {
    for (let rowIndex = 0; rowIndex < this.rows.length; rowIndex++) {
      const eachRow = this.rows[rowIndex];
      if (!eachRow[this.columns[0].columnDef + this.ROW_IS_EXPANDED_SUFFIX]) {
        eachRow[this.columns[0].columnDef + this.ROW_IS_EXPANDED_SUFFIX] = true;
        eachRow[this.columns[0].columnDef + this.ROW_ICON_SUFFIX] = this.gridConfiguration.rowExpansionIcon;
        this.rows.splice(rowIndex + 1, 0, ...this.rows[rowIndex][this.columns[0].columnDef + this.ROW_INNER_DATA_SUFFIX]);
        rowIndex += this.rows[rowIndex][this.columns[0].columnDef + this.ROW_INNER_DATA_SUFFIX].length;
      }
    }

    this.dataSource.data = new MatTableDataSource(this.rows).data;
  }

  /**
   * Function setKeyboardShortcuts:
   *
   * This function will set Keyboard Shortcut for Fortigo-Grid
   */
  private setKeyboardShortcuts() {
    // Next Page
    if (!this._hotkeysService.get('ctrl+right')) {
      this._hotkeysService.add(new Hotkey('ctrl+right', (event: KeyboardEvent): boolean => {
        if (this.paginator.hasNextPage()) {
          this.paginator.nextPage();
          // Toaster for Notifying Next Page
          this._snackBar.open('Moved to Next Page');
        }
        return false; // Prevent bubbling
      }, undefined, 'Grid: Next Page'));
    }
    // Previous Page
    if (!this._hotkeysService.get('ctrl+left')) {
      this._hotkeysService.add(new Hotkey('ctrl+left', (event: KeyboardEvent): boolean => {
        if (this.paginator.hasPreviousPage()) {
          this.paginator.previousPage();
          // Toaster for Notifying Next Page
          this._snackBar.open('Moved to Previous Page');
        }
        return false; // Prevent bubbling
      }, undefined, 'Grid: Previous Page'));
    }
    // Last Page
    if (!this._hotkeysService.get('ctrl+shift+right')) {
      this._hotkeysService.add(new Hotkey('ctrl+shift+right', (event: KeyboardEvent): boolean => {
        if (this.paginator.hasNextPage()) {
          this.paginator.lastPage();
          // Toaster for Notifying Next Page
          this._snackBar.open('Moved to Last Page');
        }
        return false; // Prevent bubbling
      }, undefined, 'Grid: Last Page'));
    }
    // First Page
    if (!this._hotkeysService.get('ctrl+shift+left')) {
      this._hotkeysService.add(new Hotkey('ctrl+shift+left', (event: KeyboardEvent): boolean => {
        if (this.paginator.hasPreviousPage()) {
          this.paginator.firstPage();
          // Toaster for Notifying Next Page
          this._snackBar.open('Moved to First Page');
        }
        return false; // Prevent bubbling
      }, undefined, 'Grid: First Page'));
    }
  }

  /**
   * Function setDefaultGridConfiguration:
   *
   * This function sets default GridCOnfiguration,
   * if not sent from parent component.
   */
  private setDefaultGridConfiguration() {
    this.gridConfiguration = new GridConfiguration(this._metadataService);
  }

  /**
   * Function formatColumns:
   *
   * This function formats the column and adds cell reference to the cells.
   * Also, pupulates displyed header for Column Names.
   */
  private formatColumns() {
    if (this.isDebug) {
      // checking for reserved keywords in columnDef
      this.checkIfReserveKeywords();
    }

    this.columns.forEach((column, columnIndex) => {

      column = this.settingColumnTitle(column);
      column.subHeader1ColumnDef = column.columnDef + this.SUB_HEADER_1_COL_DEF;
      column.subHeader2ColumnDef = column.columnDef + this.SUB_HEADER_2_COL_DEF;
      column.calculatedSubHeaderColumnDef = column.columnDef + this.CALCULATED_SUB_HEADER_COL_DEF;

      if (column.subHeader1Colspan && column.subHeader1Colspan > 1) {
        for (let index = 1; index < column.subHeader1Colspan; index++) {
          this.columns[columnIndex + index][this.SUB_HEADER_1_HIDE] = true;
        }
      }

      if (column.subHeader2Colspan && column.subHeader2Colspan > 1) {
        for (let index = 1; index < column.subHeader2Colspan; index++) {
          this.columns[columnIndex + index][this.SUB_HEADER_2_HIDE] = true;
        }
      }

      if (column.subHeader1Name && !this.isHavingSubHeader1) {
        this.isHavingSubHeader1 = true;
      }
      if (column.subHeader2Name && !this.isHavingSubHeader2) {
        this.isHavingSubHeader2 = true;
      }
      if ((column.calculatedSubHeaderName || column.headerCalculatedDataType) && !this.isHavingCalculatedSubHeader) {
        this.isHavingCalculatedSubHeader = true;
      }

      if (this.isDebug) {
        if (column.calculatedSubHeaderName && column.headerCalculatedDataType) {
          console.warn(JSON.stringify(column)
            + 'calculatedSubHeaderName && headerCalculatedDataType, shouldn\'t be set together');
        }
        // calculatedSubHeaderName will take preference
        delete column.calculatedSubHeaderName;
      }

      // FIXME @Mayur: move all the data access funciton to a method
      if (column.columnDef.includes('.')) {
        this.isHavingNestedData = true;
        // applying data function
        column['cell'] = (element: any) => {
          column.columnDef.split('.').forEach((eachKey) => {
            if (element !== null && element !== undefined && element[eachKey] !== undefined && element[eachKey] !== null) {
              element = element[eachKey];
            } else {
              element = '';
            }
          });
          element = this.applyPipe(element, column.dataFormat, column.bigTextLength);
          return `${element}`;
        };
        // applying icon data function
        column['iconCell'] = (element: any) => {
          column.columnDef.split('.').forEach((eachKey, index) => {
            const arraySize = column.columnDef.split('.').length - 1;
            if (element !== null && element !== undefined && element[eachKey] !== undefined && element[eachKey] !== null) {
              if (index === arraySize) {
                element = element[eachKey + this.ROW_ICON_SUFFIX];
              } else {
                element = element[eachKey];
              }
            } else {
              element = '';
            }
          });
          return `${element}`;
        };
        // applying image data function
        column['imageCell'] = (element: any) => {
          column.columnDef.split('.').forEach((eachKey, index) => {
            const arraySize = column.columnDef.split('.').length - 1;
            if (element !== null && element !== undefined && element[eachKey] !== undefined && element[eachKey] !== null) {
              if (index === arraySize) {
                element = element[eachKey + this.ROW_IMAGE_SUFFIX];
              } else {
                element = element[eachKey];
              }
            } else {
              element = '';
            }
          });
          return `${element}`;
        };
        // applying image data function
        column['imageAltCell'] = (element: any) => {
          column.columnDef.split('.').forEach((eachKey, index) => {
            const arraySize = column.columnDef.split('.').length - 1;
            if (element !== null && element !== undefined && element[eachKey] !== undefined && element[eachKey] !== null) {
              if (index === arraySize) {
                element = element[eachKey + this.ROW_IMAGE_ALT_SUFFIX];
              } else {
                element = element[eachKey];
              }
            } else {
              element = '';
            }
          });
          return `${element}`;
        };
        // applying tootlip text function
        column['cellToolTipText'] = (element: any) => {
          column.columnDef.split('.').forEach((eachKey) => {
            if (element !== null && element !== undefined && element[eachKey] !== undefined && element[eachKey] !== null) {
              element = element[eachKey];
            } else {
              element = '';
            }
          });
          if (column.dataFormat !== DataFormat.BigText) {
            element = this.applyPipe(element, column.rowToolTipTextFormat ? column.rowToolTipTextFormat : column.dataFormat);
          }
          return `${element}`;
        };
        // applying read-only function for editable column
        if (column.action === 'edit') {
          column['isReadOnly'] = (element: any) => {
            const arraySize = column.columnDef.split('.').length - 1;
            column.columnDef.split('.').forEach((eachKey, index) => {
              if (element !== null && element !== undefined && element[eachKey] !== undefined && element[eachKey] !== null) {
                if (index === arraySize) {
                  element = element[eachKey + this.ROW_EDITABLE_CELL_IS_READ_ONLY_SUFFIX];
                } else {
                  element = element[eachKey];
                }
              } else {
                element = false;
              }
            });
            const booleanValue = (`${element}` === 'true');
            return booleanValue;
          };
        }
      } else {
        // applying data function
        column['cell'] = (element: any) => {
          element = this.applyPipe(element[column.columnDef], column.dataFormat, column.bigTextLength);
          // changes done for showing lesser text in cell and the complete text in tooltip text.
          let splittedElement = element;

          if (element && column.hideDescriptionData && element.toString().includes('(')) {
            splittedElement = element.toString().split('(')[0];
          }

          return `${splittedElement}`;
        };
        // applying icon data function
        column['iconCell'] = (element: any) => {
          element = element[column.columnDef + this.ROW_ICON_SUFFIX];
          return `${element}`;
        };
        // applying icon data function
        column['imageCell'] = (element: any) => {
          element = element[column.columnDef + this.ROW_IMAGE_SUFFIX];
          return `${element}`;
        };
        // applying icon data function
        column['imageAltCell'] = (element: any) => {
          element = element[column.columnDef + this.ROW_IMAGE_ALT_SUFFIX];
          return `${element}`;
        };
        // applying tootlip text function
        column['cellToolTipText'] = (element: any) => {
          if (column.dataFormat !== DataFormat.BigText) {
            element = this.applyPipe(element[column.columnDef], column.rowToolTipTextFormat ? column.rowToolTipTextFormat : column.dataFormat);
          } else {
            element = element[column.columnDef];
          }
          return `${element}`;
        };
        // applying read-only function for editable column
        if (column.action === 'edit') {
          column['isReadOnly'] = (element: any) => {
            element = element[column.columnDef + this.ROW_EDITABLE_CELL_IS_READ_ONLY_SUFFIX];
            const booleanValue = (`${element}` === 'true');
            return booleanValue;
          };
        }
      }

      // applying css classes
      column = this.applyCSS(column);

      // setting icon
      if (column.isExpandableRow) {
        column['cellIcon'] = (element: any) => {
          element = element[column.columnDef + this.ROW_ICON_SUFFIX];
          return `${element}`;
        };

        if (column.showExpandedRow && !this.expansionCheckOnTab) {
          this.setSelectedColumnData(this.rows[0], column.columnDef, column.action, 0);
          this.expansionCheckOnTab = true;
        }
      }
    });

    this.displayedColumns = this.columns.map(c => c.columnDef);
    if (this.isHavingSubHeader1) {
      this.subHeaders1 = this.columns.map(c => c.subHeader1ColumnDef);
    }
    if (this.isHavingSubHeader2) {
      this.subHeaders2 = this.columns.map(c => c.subHeader2ColumnDef);
    }
    if (this.isHavingCalculatedSubHeader) {
      this.calculatedSubHeaders = this.columns.map(c => c.calculatedSubHeaderColumnDef);
    }
  }

  /**
   * This function checks for checkbox disabled property
   * @param  {object} row: Row in which data has to be checked
   * @param  {number} checkboxNumber: Checkbox index (number) against which it needs to be checked
   * @returns boolean: Returns user input of checkbox disabled/enabled
   */
  public isCheckboxDisabled(row: object, checkboxNumber: number): boolean {
    switch (checkboxNumber) {
      case 1:
        if (this.gridConfiguration.isCheckbox1Enabled && this.gridConfiguration.checkbox1ColumnDef) {
          if (this.gridConfiguration.checkbox1IsDisabledColumnDef && this.gridConfiguration.checkbox1IsDisabledColumnDef.includes('.')) {
            let tempData = Util.getObjectCopy(row);
            this.gridConfiguration.checkbox1IsDisabledColumnDef.split('.').forEach((eachKey) => {
              if (tempData !== null && tempData !== undefined && tempData[eachKey] !== undefined && tempData[eachKey] !== null) {
                tempData = tempData[eachKey];
              } else {
                tempData = false;
              }
            });
            return <boolean>tempData;
          } else {
            if (row[this.gridConfiguration.checkbox1IsDisabledColumnDef]) {
              return true;
            } else {
              return false;
            }
          }
        }
        break;
      case 2:
        if (this.gridConfiguration.isCheckbox2Enabled && this.gridConfiguration.checkbox2ColumnDef) {
          if (this.gridConfiguration.checkbox2IsDisabledColumnDef && this.gridConfiguration.checkbox2IsDisabledColumnDef.includes('.')) {
            let tempData = Util.getObjectCopy(row);
            this.gridConfiguration.checkbox2IsDisabledColumnDef.split('.').forEach((eachKey) => {
              if (tempData !== null && tempData !== undefined && tempData[eachKey] !== undefined && tempData[eachKey] !== null) {
                tempData = tempData[eachKey];
              } else {
                tempData = false;
              }
            });
            return <boolean>tempData;
          } else {
            if (row[this.gridConfiguration.checkbox2IsDisabledColumnDef]) {
              return true;
            } else {
              return false;
            }
          }
        }
        break;
      default:
        break;
    }
  }

  /**
   * This function applies CSS for each column
   * @param  {Column} column: column to apply css for
   * @returns Column: CSS applied column
   */
  private applyCSS(column: Column): Column {
    column['cssClass'] = new Array<string>();

    if (column.css) {
      // applying horizontal align css
      switch (column.css.horizontalAlign) {
        case 'center':
          column['cssClass'].push('align-center');
          break;
        case 'left':
          column['cssClass'].push('align-left');
          break;
        case 'right':
          column['cssClass'].push('align-right');
          break;
        default:
          break;
      }
      // applying vertical align css
      switch (column.css.verticalAlign) {
        case 'top':
        case 'middle':
        case 'bottom':
          // TODO: @Mayur: implement this style
          break;
      }

      // applying text color css
      switch (column.css.fontSize) {
        case 'large':
          column['cssClass'].push('large-text');
          break;
        case 'larger':
          column['cssClass'].push('larger-text');
          break;
        case 'medium':
          column['cssClass'].push('medium-text');
          break;
        case 'small':
          column['cssClass'].push('small-text');
          break;
        case 'smaller':
          column['cssClass'].push('smaller-text');
          break;
        case 'inherit':
          break;
        default:
          break;
      }

      // applying text color css
      switch (column.css.textColor) {
        case 'blue':
          column['cssClass'].push('blue-text');
          break;
        case 'red':
          column['cssClass'].push('red-text');
          break;
        case 'black':
          column['cssClass'].push('black-text');
          break;
        case 'maroon':
          column['cssClass'].push('maroon-text');
          break;
        case 'green':
          column['cssClass'].push('green-text');
          break;
        case 'orange':
          column['cssClass'].push('orange-text');
          break;
        case 'dark-greyish-magenta':
          column['cssClass'].push('dark-greyish-magenta-text');
          break;
        case 'very-dark-greyish-violet':
          column['cssClass'].push('very-dark-greyish-violet-text');
          break;
        case 'red-shade-1':
          column['cssClass'].push('red-shade-1-text');
          break;
        case 'red-shade-2':
          column['cssClass'].push('red-shade-2-text');
          break;
        case 'red-shade-3':
          column['cssClass'].push('red-shade-3-text');
          break;
        case 'red-shade-4':
          column['cssClass'].push('red-shade-4-text');
          break;
        case 'red-shade-5':
          column['cssClass'].push('red-shade-5-text');
          break;
        default:
          break;
      }
      // applying font weight css
      switch (column.css.fontWeight) {
        case 'bold':
          column['cssClass'].push('bold-font-weight');
          break;
        case 'bolder':
          column['cssClass'].push('bolder-font-weight');
          break;
        case 'normal':
          column['cssClass'].push('normal-font-weight');
          break;
        case 'lighter':
          column['cssClass'].push('lighter-font-weight');
          break;
        default:
          break;
      }
      // applying margin top css
      switch (column.css.marginTop) {
        case 'small':
          column['cssClass'].push('margin-top-small');
          break;
        case 'medium':
          column['cssClass'].push('margin-top-medium');
          break;
        case 'large':
          column['cssClass'].push('margin-top-large');
          break;
        default:
          break;
      }
      // applying margin right css
      switch (column.css.marginRight) {
        case 'small':
          column['cssClass'].push('margin-right-small');
          break;
        case 'medium':
          column['cssClass'].push('margin-right-medium');
          break;
        case 'large':
          column['cssClass'].push('margin-right-large');
          break;
        default:
          break;
      }
      // applying margin bottom css
      switch (column.css.marginBottom) {
        case 'small':
          column['cssClass'].push('margin-bottom-small');
          break;
        case 'medium':
          column['cssClass'].push('margin-bottom-medium');
          break;
        case 'large':
          column['cssClass'].push('margin-bottom-large');
          break;
        default:
          break;
      }
      // applying margin left css
      switch (column.css.marginLeft) {
        case 'small':
          column['cssClass'].push('margin-left-small');
          break;
        case 'medium':
          column['cssClass'].push('margin-left-medium');
          break;
        case 'large':
          column['cssClass'].push('margin-left-large');
          break;
        default:
          break;
      }
      // applying user select css
      switch (column.css.userSelect) {
        case 'all':
          column['cssClass'].push('user-select-all');
          break;
        case 'auto':
          column['cssClass'].push('user-select-auto');
          break;
        case 'inherit':
          column['cssClass'].push('user-select-inherit');
          break;
        case 'initial':
          column['cssClass'].push('user-select-initial');
          break;
        case 'none':
          column['cssClass'].push('user-select-none');
          break;
        case 'text':
          column['cssClass'].push('user-select-text');
          break;
        case 'unset':
          column['cssClass'].push('user-select-unset');
          break;
        default:
          break;
      }
    }

    if (column.dataType) {
      switch (column.dataType) {
        case DataType.Number:
        case DataType.Date:
          column['cssClass'].push('align-right');
          break;
        default:
          break;
      }
    }
    return column;
  }

  /**
   * Function settingColumnTitle:
   *
   * This function adds title to the column header,
   * if not provided
   *
   * @param  {Column} column: takes input as `Column`
   * @returns Column: returns `Column` with title
   */
  private settingColumnTitle(column: Column): Column {
    if (!column.title) {
      column.title = column.headerName;
    }
    return column;
  }

  /**
   * Function applyPipe:
   *
   * This function applies pipe to row data
   * @param  {any} data: Data to which format applies
   * @param  {DataFormat} dataFormat: Format of Data
   * @param  {number} bigTextLength?: Optional, if big text length is specified
   * @returns string: Returns data in defined format
   */
  private applyPipe(data: any, dataFormat: DataFormat | DataCalculationFormat, bigTextLength?: number): string {
    switch (dataFormat) {
      case DataFormat.Currency:
        if (data === undefined || data === null) {
          return '-';
        }
        return isNaN(data) ? data : this._currencyPipe.transform(data, FortigoConstant.INDIAN_CUR_SYM, 'symbol', '0.2-2');
      case DataFormat.CurrencyInLac:
        if (data === undefined || data === null) {
          return '-';
        }
        return isNaN(this._rsToLakhPipe.transform(data)) ? this._rsToLakhPipe.transform(data) : this._currencyPipe.transform(this._rsToLakhPipe.transform(data), FortigoConstant.INDIAN_CUR_SYM, 'symbol', '0.2-2');
      case DataFormat.Date:
        return this.getFormattedDate(data, FortigoConstant.INDIAN_DATE_FORMAT_GRID);
      case DataFormat.Time:
        return this.getFormattedDate(data, FortigoConstant.INDIAN_TIME_FORMAT);
      case DataFormat.DateAndTime:
        return this.getFormattedDate(data, FortigoConstant.INDIAN_DATE_AND_TIME_FORMAT);
      case DataFormat.DateAndTimeInSec:
        return this.getFormattedDate(data, FortigoConstant.INDIAN_DATE_AND_TIME_IN_SEC_FORMAT);
      case DataFormat.LocalDate:
        return this.getFormattedDate(Util.convertLocalDateTime(data), FortigoConstant.INDIAN_DATE_FORMAT_GRID);
      case DataFormat.LocalDateTime:
        return this.getFormattedDate(Util.convertLocalDateTime(data), FortigoConstant.INDIAN_DATE_AND_TIME_FORMAT);
      case DataFormat.BigText:
      case DataFormat.BigTextWithCopy:
        if (bigTextLength) {
          return this._truncateTextPipe.transform(data, bigTextLength.toString());
        } else {
          return this._truncateTextPipe.transform(data);
        }
      case DataFormat.Status:
        if (typeof (data) === 'string') {
          return this._titleCasePipe.transform(this._slicePipe.transform(data, 0, 1));
        } else {
          return data;
        }
      case DataFormat.Title:
        if (data.toString().includes('_')) {
          data = this._replaceStringPipe.transform(data, '_', ' ');
        }
        return this._titleCasePipe.transform(data);
      case DataFormat.UpperCase:
        return this._upperCasePipe.transform(data);
      case DataFormat.None:
      default:
        return data;
    }
  }

  /**
   * Function checkIfReserveKeywords:
   *
   * This function checks if column definition doesn't contains
   * reserved keywords
   */
  private checkIfReserveKeywords() {
    // TODO work on it
    this.columns.some((column) => {
      // checking for reserve keywords
      switch (column.columnDef) {
        case this.CHECKBOX_1_COL_DEF:
          Swal.fire('Error', 'Can\'t use reverve keyword: ' + this.CHECKBOX_1_COL_DEF, 'error');
          return true;
        case this.ACTION_BUTTON_COL_DEF:
          Swal.fire('Error', 'Can\'t use reverve keyword: ' + this.ACTION_BUTTON_COL_DEF, 'error');
          return true;
        default:
          break;
      }
      return false;
    });
  }

  /**
   * Function checkIfFooterRequired:
   *
   * Checks if the footer configuration is found in `columns` input
   * for any of the column.
   * @returns boolean: Returns true if footer is found, else false.
   */
  private checkIfFooterRequired(): boolean {
    const footerFound = this.columns.find((column) => {
      if (column.footerCalculatedDataType) {
        return true;
      }
    });

    if (footerFound) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Function checkIfExpandableRowGrid:
   *
   * Checks if the row have expandable configuration is found in `columns` input
   * for any of the column.
   * @returns boolean: Returns true if expandable row is found, else false.
   */
  private checkIfExpandableRowGrid(): boolean {
    const rowExpandableFound = this.columns.find((column) => {
      if (column.isExpandableRow) {
        return true;
      }
    });

    if (rowExpandableFound) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Function buildColumns:
   *
   * This function Builds Columns from Row Data, input as `rows`
   * and prepares columns if not defined in input as `columns`.
   */
  private buildColumns() {
    if (this.columns === undefined) {
      this.columns = new Array<Column>();
      if (this.dataSource) {
        Object.keys(this.dataSource[0]).forEach((eachRowData) => {
          const eachCol = new Column();
          eachCol.columnDef = eachRowData;
          eachCol.headerName = this._titleCasePipe.transform(eachRowData);
          this.columns.push(eachCol);
        });

        this.formatColumns();
      }
    }
  }

  /**
   * Function applyGridConfiguration:
   *
   * This function applies Grid Configuration from input as `gridConfiguration`
   * with model `GridConfiguration`.
   */
  private applyGridConfiguration() {
    // applying sorting configuration
    if (this.gridConfiguration.isSortingEnabled) {
      this.applySorting();
    }

    // applying checkbox1 configuration
    if (this.gridConfiguration.isCheckbox1Enabled && !this.displayedColumns.includes(this.CHECKBOX_1_COL_DEF)) {
      if (this.gridConfiguration.isCheckbox1AtStart || this.gridConfiguration.isCheckbox1AtEnd || this.gridConfiguration.checkbox1Postion) {
        if (this.gridConfiguration.isCheckbox1AtStart) {
          this.displayedColumns.unshift(this.CHECKBOX_1_COL_DEF);
          if (this.isHavingSubHeader1) {
            this.subHeaders1.unshift(this.CHECKBOX_1_COL_DEF + this.SUB_HEADER_1_COL_DEF);
          }
          if (this.isHavingSubHeader2) {
            this.subHeaders2.unshift(this.CHECKBOX_1_COL_DEF + this.SUB_HEADER_2_COL_DEF);
          }
          if (this.isHavingCalculatedSubHeader) {
            this.calculatedSubHeaders.unshift(this.CHECKBOX_1_COL_DEF + this.CALCULATED_SUB_HEADER_COL_DEF);
          }
        }
        if (this.gridConfiguration.isCheckbox1AtEnd) {
          this.displayedColumns.push(this.CHECKBOX_1_COL_DEF);
          if (this.isHavingSubHeader1) {
            this.subHeaders1.push(this.CHECKBOX_1_COL_DEF + this.SUB_HEADER_1_COL_DEF);
          }
          if (this.isHavingSubHeader2) {
            this.subHeaders2.push(this.CHECKBOX_1_COL_DEF + this.SUB_HEADER_2_COL_DEF);
          }
          if (this.isHavingCalculatedSubHeader) {
            this.calculatedSubHeaders.push(this.CHECKBOX_1_COL_DEF + this.CALCULATED_SUB_HEADER_COL_DEF);
          }
        }
        if (this.gridConfiguration.checkbox1Postion) {
          this.displayedColumns.splice(this.gridConfiguration.checkbox1Postion, 0, this.CHECKBOX_1_COL_DEF);
          if (this.isHavingSubHeader1) {
            this.subHeaders1.splice(this.gridConfiguration.checkbox1Postion, 0, this.CHECKBOX_1_COL_DEF + this.SUB_HEADER_1_COL_DEF);
          }
          if (this.isHavingSubHeader2) {
            this.subHeaders2.splice(this.gridConfiguration.checkbox1Postion, 0, this.CHECKBOX_1_COL_DEF + this.SUB_HEADER_2_COL_DEF);
          }
          if (this.isHavingCalculatedSubHeader) {
            this.calculatedSubHeaders.splice(this.gridConfiguration.checkbox1Postion, 0, this.CHECKBOX_1_COL_DEF + this.CALCULATED_SUB_HEADER_COL_DEF);
          }
        }
      } else {
        this.displayedColumns.unshift(this.CHECKBOX_1_COL_DEF);
        if (this.isHavingSubHeader1) {
          this.subHeaders1.unshift(this.CHECKBOX_1_COL_DEF + this.SUB_HEADER_1_COL_DEF);
        }
        if (this.isHavingSubHeader2) {
          this.subHeaders2.unshift(this.CHECKBOX_1_COL_DEF + this.SUB_HEADER_2_COL_DEF);
        }
        if (this.isHavingCalculatedSubHeader) {
          this.calculatedSubHeaders.unshift(this.CHECKBOX_1_COL_DEF + this.CALCULATED_SUB_HEADER_COL_DEF);
        }
      }

      // toggling checkbox Header with Text and checkbox
      if (this.gridConfiguration.checkbox1HeaderText) {
        this.gridConfiguration.showCheckbox1HeaderText = true;
      }
    }

    // applying checkbox2 configuration
    if (this.gridConfiguration.isCheckbox2Enabled && !this.displayedColumns.includes(this.CHECKBOX_2_COL_DEF)) {
      if (this.gridConfiguration.isCheckbox2AtStart || this.gridConfiguration.isCheckbox2AtEnd || this.gridConfiguration.checkbox2Postion) {
        if (this.gridConfiguration.isCheckbox2AtStart) {
          this.displayedColumns.unshift(this.CHECKBOX_2_COL_DEF);
          if (this.isHavingSubHeader1) {
            this.subHeaders1.unshift(this.CHECKBOX_2_COL_DEF + this.SUB_HEADER_1_COL_DEF);
          }
          if (this.isHavingSubHeader2) {
            this.subHeaders2.unshift(this.CHECKBOX_2_COL_DEF + this.SUB_HEADER_2_COL_DEF);
          }
          if (this.isHavingCalculatedSubHeader) {
            this.calculatedSubHeaders.unshift(this.CHECKBOX_2_COL_DEF + this.CALCULATED_SUB_HEADER_COL_DEF);
          }
        }
        if (this.gridConfiguration.isCheckbox2AtEnd) {
          this.displayedColumns.push(this.CHECKBOX_2_COL_DEF);
          if (this.isHavingSubHeader1) {
            this.subHeaders1.push(this.CHECKBOX_2_COL_DEF + this.SUB_HEADER_1_COL_DEF);
          }
          if (this.isHavingSubHeader2) {
            this.subHeaders2.push(this.CHECKBOX_2_COL_DEF + this.SUB_HEADER_2_COL_DEF);
          }
          if (this.isHavingCalculatedSubHeader) {
            this.calculatedSubHeaders.push(this.CHECKBOX_2_COL_DEF + this.CALCULATED_SUB_HEADER_COL_DEF);
          }
        }
        if (this.gridConfiguration.checkbox2Postion) {
          this.displayedColumns.splice(this.gridConfiguration.checkbox2Postion, 0, this.CHECKBOX_2_COL_DEF);
          if (this.isHavingSubHeader1) {
            this.subHeaders1.splice(this.gridConfiguration.checkbox2Postion, 0, this.CHECKBOX_2_COL_DEF + this.SUB_HEADER_1_COL_DEF);
          }
          if (this.isHavingSubHeader2) {
            this.subHeaders2.splice(this.gridConfiguration.checkbox2Postion, 0, this.CHECKBOX_2_COL_DEF + this.SUB_HEADER_2_COL_DEF);
          }
          if (this.isHavingCalculatedSubHeader) {
            this.calculatedSubHeaders.splice(this.gridConfiguration.checkbox2Postion, 0, this.CHECKBOX_2_COL_DEF + this.CALCULATED_SUB_HEADER_COL_DEF);
          }
        }
      } else {
        this.displayedColumns.unshift(this.CHECKBOX_2_COL_DEF);
        if (this.isHavingSubHeader1) {
          this.subHeaders1.unshift(this.CHECKBOX_2_COL_DEF + this.SUB_HEADER_1_COL_DEF);
        }
        if (this.isHavingSubHeader2) {
          this.subHeaders2.unshift(this.CHECKBOX_2_COL_DEF + this.SUB_HEADER_2_COL_DEF);
        }
        if (this.isHavingCalculatedSubHeader) {
          this.calculatedSubHeaders.unshift(this.CHECKBOX_2_COL_DEF + this.CALCULATED_SUB_HEADER_COL_DEF);
        }
      }

      // toggling checkbox Header with Text and checkbox
      if (this.gridConfiguration.checkbox2HeaderText) {
        this.gridConfiguration.showCheckbox2HeaderText = true;
      }
    }

    // applying radio button configuration
    if (this.gridConfiguration.isRadioButtonEnabled && !this.displayedColumns.includes(this.RADIO_BUTTON_COL_DEF)) {
      if (this.gridConfiguration.isRadioButtonAtStart || this.gridConfiguration.isRadioButtonAtEnd || this.gridConfiguration.radioButtonPostion) {
        if (this.gridConfiguration.isRadioButtonAtStart) {
          this.displayedColumns.unshift(this.RADIO_BUTTON_COL_DEF);
          if (this.isHavingSubHeader1) {
            this.subHeaders1.unshift(this.RADIO_BUTTON_COL_DEF + this.SUB_HEADER_1_COL_DEF);
          }
          if (this.isHavingSubHeader2) {
            this.subHeaders2.unshift(this.RADIO_BUTTON_COL_DEF + this.SUB_HEADER_2_COL_DEF);
          }
          if (this.isHavingCalculatedSubHeader) {
            this.calculatedSubHeaders.unshift(this.RADIO_BUTTON_COL_DEF + this.CALCULATED_SUB_HEADER_COL_DEF);
          }
        }
        if (this.gridConfiguration.isRadioButtonAtEnd) {
          this.displayedColumns.push(this.RADIO_BUTTON_COL_DEF);
          if (this.isHavingSubHeader1) {
            this.subHeaders1.push(this.RADIO_BUTTON_COL_DEF + this.SUB_HEADER_1_COL_DEF);
          }
          if (this.isHavingSubHeader2) {
            this.subHeaders2.push(this.RADIO_BUTTON_COL_DEF + this.SUB_HEADER_2_COL_DEF);
          }
          if (this.isHavingCalculatedSubHeader) {
            this.calculatedSubHeaders.push(this.RADIO_BUTTON_COL_DEF + this.CALCULATED_SUB_HEADER_COL_DEF);
          }
        }
        if (this.gridConfiguration.radioButtonPostion) {
          this.displayedColumns.splice(this.gridConfiguration.radioButtonPostion, 0, this.RADIO_BUTTON_COL_DEF);
          if (this.isHavingSubHeader1) {
            this.subHeaders1.splice(this.gridConfiguration.radioButtonPostion, 0, this.RADIO_BUTTON_COL_DEF + this.SUB_HEADER_1_COL_DEF);
          }
          if (this.isHavingSubHeader2) {
            this.subHeaders2.splice(this.gridConfiguration.radioButtonPostion, 0, this.RADIO_BUTTON_COL_DEF + this.SUB_HEADER_2_COL_DEF);
          }
          if (this.isHavingCalculatedSubHeader) {
            this.calculatedSubHeaders.splice(this.gridConfiguration.radioButtonPostion, 0, this.RADIO_BUTTON_COL_DEF + this.CALCULATED_SUB_HEADER_COL_DEF);
          }
        }
      } else {
        this.displayedColumns.unshift(this.RADIO_BUTTON_COL_DEF);
        if (this.isHavingSubHeader1) {
          this.subHeaders1.unshift(this.RADIO_BUTTON_COL_DEF + this.SUB_HEADER_1_COL_DEF);
        }
        if (this.isHavingSubHeader2) {
          this.subHeaders2.unshift(this.RADIO_BUTTON_COL_DEF + this.SUB_HEADER_2_COL_DEF);
        }
        if (this.isHavingCalculatedSubHeader) {
          this.calculatedSubHeaders.unshift(this.RADIO_BUTTON_COL_DEF + this.CALCULATED_SUB_HEADER_COL_DEF);
        }
      }

      // toggling radio button Header with Text and radio button
      if (this.gridConfiguration.radioButtonHeaderText) {
        this.gridConfiguration.showRadioButtonHeaderText = true;
      }
    }

    // applying action button configuration
    if (this.gridConfiguration.isActionButtonEnabled && !this.displayedColumns.includes(this.ACTION_BUTTON_COL_DEF)) {
      this.displayedColumns.push(this.ACTION_BUTTON_COL_DEF);
      if (this.isHavingSubHeader1) {
        this.subHeaders1.push(this.ACTION_BUTTON_COL_DEF + this.SUB_HEADER_1_COL_DEF);
      }
      if (this.isHavingSubHeader2) {
        this.subHeaders2.push(this.ACTION_BUTTON_COL_DEF + this.SUB_HEADER_2_COL_DEF);
      }
      if (this.isHavingCalculatedSubHeader) {
        this.calculatedSubHeaders.push(this.ACTION_BUTTON_COL_DEF + this.CALCULATED_SUB_HEADER_COL_DEF);
      }
    }

    // applying sticky property
    if (this.gridConfiguration.isStickyHeader) {

    }

    if (this.gridConfiguration.css) {
      // shares the style to the entire html body
      const bodyStyles = document.body.style;
      bodyStyles.setProperty('--table-font', this.gridConfiguration.css.tableFont);
      bodyStyles.setProperty('--table-head-font', this.gridConfiguration.css.tableHeadFont === undefined ? this.gridConfiguration.css.tableFont : this.gridConfiguration.css.tableHeadFont);
      bodyStyles.setProperty('--table-sub-head-font', this.gridConfiguration.css.tableSubHeadFont === undefined ? this.gridConfiguration.css.tableFont : this.gridConfiguration.css.tableSubHeadFont);
      bodyStyles.setProperty('--table-row-font', this.gridConfiguration.css.tableRowFont === undefined ? this.gridConfiguration.css.tableFont : this.gridConfiguration.css.tableRowFont);
      bodyStyles.setProperty('--table-sub-row-font', this.gridConfiguration.css.tableSubRowFont === undefined ? this.gridConfiguration.css.tableFont : this.gridConfiguration.css.tableSubRowFont);
      bodyStyles.setProperty('--table-row-height', this.gridConfiguration.css.tableRowHeight);

      // Calculated Header Border style
      bodyStyles.setProperty('--mat-grid-calculated-header-border-top', this.gridConfiguration.css.tableTopCalculatedHeaderBorderStyle);
      bodyStyles.setProperty('--mat-grid-calculated-header-border-right', this.gridConfiguration.css.tableRightCalculatedHeaderBorderStyle);
      bodyStyles.setProperty('--mat-grid-calculated-header-border-bottom', this.gridConfiguration.css.tableBottomCalculatedHeaderBorderStyle);
      bodyStyles.setProperty('--mat-grid-calculated-header-border-left', this.gridConfiguration.css.tableLeftCalculatedHeaderBorderStyle);
      // Sub Header 1 Border style
      bodyStyles.setProperty('--mat-grid-sub-header-1-border-top', this.gridConfiguration.css.tableTopSubHeader1BorderStyle);
      bodyStyles.setProperty('--mat-grid-sub-header-1-border-right', this.gridConfiguration.css.tableRightSubHeader1BorderStyle);
      bodyStyles.setProperty('--mat-grid-sub-header-1-border-bottom', this.gridConfiguration.css.tableBottomSubHeader1BorderStyle);
      bodyStyles.setProperty('--mat-grid-sub-header-1-border-left', this.gridConfiguration.css.tableLeftSubHeader1BorderStyle);
      // Sub Header 2 Border style
      bodyStyles.setProperty('--mat-grid-sub-header-2-border-top', this.gridConfiguration.css.tableTopSubHeader2BorderStyle);
      bodyStyles.setProperty('--mat-grid-sub-header-2-border-right', this.gridConfiguration.css.tableRightSubHeader2BorderStyle);
      bodyStyles.setProperty('--mat-grid-sub-header-2-border-bottom', this.gridConfiguration.css.tableBottomSubHeader2BorderStyle);
      bodyStyles.setProperty('--mat-grid-sub-header-2-border-left', this.gridConfiguration.css.tableLeftSubHeader2BorderStyle);
      // Header Border style
      bodyStyles.setProperty('--mat-grid-header-border-top', this.gridConfiguration.css.tableTopHeaderBorderStyle);
      bodyStyles.setProperty('--mat-grid-header-border-right', this.gridConfiguration.css.tableRightHeaderBorderStyle);
      bodyStyles.setProperty('--mat-grid-header-border-bottom', this.gridConfiguration.css.tableBottomHeaderBorderStyle);
      bodyStyles.setProperty('--mat-grid-header-border-left', this.gridConfiguration.css.tableLeftHeaderBorderStyle);

      // Cell Border style
      bodyStyles.setProperty('--mat-grid-cell-border-top', this.gridConfiguration.css.tableTopCellBorderStyle);
      bodyStyles.setProperty('--mat-grid-cell-border-right', this.gridConfiguration.css.tableRightCellBorderStyle);
      bodyStyles.setProperty('--mat-grid-cell-border-bottom', this.gridConfiguration.css.tableBottomCellBorderStyle);
      bodyStyles.setProperty('--mat-grid-cell-border-left', this.gridConfiguration.css.tableLeftCellBorderStyle);

      // Footer Border style
      bodyStyles.setProperty('--mat-grid-footer-border-right', this.gridConfiguration.css.tableRightFooterBorderStyle);
      bodyStyles.setProperty('--mat-grid-footer-border-bottom', this.gridConfiguration.css.tableBottomFooterBorderStyle);
      bodyStyles.setProperty('--mat-grid-footer-border-left', this.gridConfiguration.css.tableLeftFooterBorderStyle);
      bodyStyles.setProperty('--mat-grid-footer-border-top', this.gridConfiguration.css.tableTopFooterBorderStyle);

      // Header Background
      bodyStyles.setProperty('--mat-grid-calculated-header-background', this.gridConfiguration.css.tableCalculatedHeaderBackgroundStyle);
      bodyStyles.setProperty('--mat-grid-sub-header-1-background', this.gridConfiguration.css.tableSubHeader1BackgroundStyle);
      bodyStyles.setProperty('--mat-grid-sub-header-2-background', this.gridConfiguration.css.tableSubHeader2BackgroundStyle);
      bodyStyles.setProperty('--mat-grid-header-background', this.gridConfiguration.css.tableHeaderBackgroundStyle);
      // Cell Background
      bodyStyles.setProperty('--mat-grid-cell-background', this.gridConfiguration.css.tableCellBackgroundStyle);
      // Footer Background
      bodyStyles.setProperty('--mat-grid-footer-background', this.gridConfiguration.css.tableFooterBackgroundStyle);
    }

    if (this.gridConfiguration.iconCSS) {
      const bodyStyles = document.body.style;
      bodyStyles.setProperty('--icon-alignment', this.gridConfiguration.iconCSS.alignment);
      bodyStyles.setProperty('--icon-expand-color', this.gridConfiguration.iconCSS.expandIconColor);
      bodyStyles.setProperty('--icon-collapse-color', this.gridConfiguration.iconCSS.collapseIconColor);
    }

    if (this.gridConfiguration.css.tableOverflow !== 'auto') {
      this.tableContainerStyle['overflow-x'] = this.gridConfiguration.css.tableOverflow;
      this.tableContainerStyle['overflow-y'] = this.gridConfiguration.css.tableOverflow;
    } else {
      if (this.gridConfiguration.css.tableOverflowX) {
        this.tableContainerStyle['overflow-x'] = this.gridConfiguration.css.tableOverflowX;
      }
      if (this.gridConfiguration.css.tableOverflowY) {
        this.tableContainerStyle['overflow-y'] = this.gridConfiguration.css.tableOverflowY;
      }
    }
  }

  /**
   * This function applies sorting for data source
   */
  private applySorting() {
    // applying custom sorting function for nested key data
    if (this.dataSource) {
      this.dataSource.sortingDataAccessor = (item, property) => {
        const column = this.columns.filter(eachColumn => eachColumn.columnDef === property)[0];
        if (property.includes('.')) {
          return property.split('.').reduce((object, key) => object[key], item);
        } else {
          if (column.dataFormat === DataFormat.Date || column.dataFormat === DataFormat.DateAndTime || column.dataFormat === DataFormat.LocalDate || column.dataFormat === DataFormat.LocalDateTime) {
            return new Date(item[property]);
          } else {
            return item[property];
          }
        }
      };
      this.dataSource.sort = this.sort;
    }
  }

  /**
   * This function calculates data and sets to header
   * @param  {boolean} doReset?: if data needs to reset
   */
  private calculateHeader(doReset?: boolean, data?: Array<any>) {
    this.columns.forEach((eachColumn, columnIndex) => {
      if (eachColumn.headerCalculatedDataType) {
        if (doReset) {
          eachColumn.calculatedSubHeaderName = '';
        } else {
          if (data) {
            eachColumn.calculatedSubHeaderName = this.getCalculatedData(columnIndex, 'header', data);
          } else {
            eachColumn.calculatedSubHeaderName = this.getCalculatedData(columnIndex, 'header');
          }
        }
      }
    });
  }

  /**
   * Function dataFormatter:
   *
   * This function applies data formatting from input as `rowdata`
   */
  private dataFormatter() {
    const startTime = performance.now();

    this.rows.forEach(row => {

      if (this.gridConfiguration) {
        if (this.gridConfiguration.checkbox1ColumnDef && row[this.gridConfiguration.checkbox1ColumnDef]) {
          this.selection1.select(row);
        }
        if (this.gridConfiguration.checkbox2ColumnDef && row[this.gridConfiguration.checkbox2ColumnDef]) {
          this.selection2.select(row);
        }
      }

      if (this.columns && this.columns.length > 0) {
        this.columns.forEach((column) => {

          if (row[column.columnDef]) {
            if (!column.dataType) {
              column.dataType = <DataType>typeof row[column.columnDef];
            }
          } else {
            switch (column.dataType) {
              case DataType.String:
                row[column.columnDef] = '';
                break;
              case DataType.Number:
                row[column.columnDef] = 0.0;
                break;
              case DataType.Date:
                row[column.columnDef] = '';
                break;
              case undefined:
                row[column.columnDef] = '';
                break;
              case null:
                row[column.columnDef] = '';
                break;
              default:
                row[column.columnDef] = '';
                break;
            }
          }
        });
      }
    });

    this.dataSource.data = new MatTableDataSource(this.rows).data;
    this.isLoadingData = false;

    const duration = performance.now() - startTime;
    console.log(`dataFormatter took ${duration}ms`);
  }

  /**
   * Function setRowExpansionButton:
   *
   * This function sets row expansion button for column with the specified column name,
   * with an optional icon, if send by the user
   *
   * @param  {string} columnName: name of the column for which icon needs to be added
   * @param  {string} collapsedIcon: material icon name for collapse
   */
  private setRowExpansionButton(columnName: string, collapsedIcon: string) {
    if (this.columns.filter(column => column.columnDef === columnName + this.ROW_ICON_SUFFIX).length > 0) {
      this.columns.push({ columnDef: columnName + this.ROW_ICON_SUFFIX, headerName: columnName + this.ROW_ICON_SUFFIX });
      this.columns.push({ columnDef: columnName + this.ROW_IS_EXPANDED_SUFFIX, headerName: columnName + this.ROW_IS_EXPANDED_SUFFIX });
    }

    // adding icons for each row for expandable columns, if not present
    this.rows.forEach((eachRow) => {
      if (eachRow[columnName + this.ROW_ICON_SUFFIX] === undefined) {
        eachRow[columnName + this.ROW_ICON_SUFFIX] = collapsedIcon;
      }
      if (eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX] === undefined) {
        eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX] = false;
      }
    });
  }

  /**
   * Function validateInnerCellData:
   *
   * This function reads data from `columns` input
   * and checks for valiation for Inner Cell data.
   *
   * 1. It should be 1, as default value `DEFAULT_INNER_CELLS`
   * 2. It should have proper assignment of value,
   *    if failed, accept the prior column data and discards later one.
   */
  private validateInnerCellData() {
    const consoleMessage = '\n Inner Cell Validation: ';
    let tempInnerCellCount: number, counter = 1;

    this.maxInnerCells = 1;

    for (let index = 0; index < this.columns.length; index++) {
      const element = this.columns[index];

      if (element.innerCells) {
        // checking maximum inner cells
        if (element.innerCells > this.maxInnerCells) {
          this.maxInnerCells = element.innerCells;
        }
        if (element.innerCells >= 2) {
          tempInnerCellCount = element.innerCells;

          // checking for index overflow
          if ((this.columns.length - 1 - index) < tempInnerCellCount) {
            if (this.isDebug) {
              console.warn(JSON.stringify(element)
                + consoleMessage
                + 'Inner Cells can\'t overflow index');
            }
            tempInnerCellCount = this.columns.length - index;
          }

          while (tempInnerCellCount >= counter) {
            this.columns[index].innerCells = counter;

            if (tempInnerCellCount !== counter) {
              index++;
            }
            counter++;
          }

          // resetting counter
          counter = 1;
        } else {
          // if inner cells is 0 or less than 0
          if (element.innerCells < 0 && this.isDebug) {
            console.warn(JSON.stringify(element)
              + consoleMessage
              + 'Inner Cells can\'t be less than 0. Setting it to ' + this.DEFAULT_INNER_CELLS);
          }
          this.columns[index].innerCells = 1;
        }
      } else {
        // if inner cells is not defined, setting it to default
        if (this.isDebug) {
          console.warn(JSON.stringify(element)
            + consoleMessage
            + 'No Inner Cells defination found, setting default Inner Cells value, i.e., ' + this.DEFAULT_INNER_CELLS);
        }
        this.columns[index].innerCells = this.DEFAULT_INNER_CELLS;
      }
    }
  }

  /**
   * Function applyFilter:
   *
   * Applies filter to the data source,
   * and sets page to page first, if pagination is available
   * @param  {string} filterValue: text UI input in filter field
   */
  public applyFilter(filterValue: string) {
    if (this.dataSource) {
      this.dataSource.filter = filterValue.trim().toLowerCase();

      if (this.paginator) {
        this.paginator.firstPage();
      }
    }
  }

  /**
   * Function isAllSelected:
   *
   * Whether the number of selected elements matches the total number of rows
   * @param  {number} checkboxNumber: Checkbox number for which all selection is required.
   * @returns boolean: Returns true if all the checkbox is selected, else false
   */
  public isAllSelected(checkboxNumber: number): boolean {
    let numSelected: number;
    let numRows: number;
    switch (checkboxNumber) {
      case 1:
        numSelected = this.selection1.selected.length;
        numRows = this.dataSource.data.length;
        return numSelected === numRows;
      case 2:
        numSelected = this.selection2.selected.length;
        numRows = this.dataSource.data.length;
        return numSelected === numRows;
      default:
        break;
    }
  }

  /**
   * Function clearCheckboxSelection:
   *
   * Clears checkbox selection from each all checkbox.
   */
  public clearCheckboxSelection() {
    this.selection1 = new SelectionModel<any>(true, []);
    this.selection2 = new SelectionModel<any>(true, []);

    this.isMasterCheckbox1Checked = false;
    this.isMasterCheckbox2Checked = false;

    this.isMasterCheckbox1Indeterminate = false;
    this.isMasterCheckbox2Indeterminate = false;
  }

  /**
   * Function masterToggle:
   *
   * Selects all rows if they are not all selected; otherwise clear selection.
   */
  public masterToggle($event: MatCheckboxChange, checkboxNumber: number) {

    switch (checkboxNumber) {
      case 1:
        if ($event.checked) {
          this.dataSource.data.forEach(row => this.selection1.select(row));
        } else {
          this.dataSource.data.forEach(row => this.selection1.deselect(row));
        }

        if (this.isMasterCheckbox1Indeterminate) {
          this.dataSource.data.forEach(row => this.selection1.deselect(row));
          this.isMasterCheckbox1Checked = false;
        }

        this.checkbox1SelectedRow.emit(this.selection1.selected);
        break;
      case 2:
        if ($event.checked) {
          this.dataSource.data.forEach(row => this.selection2.select(row));
        } else {
          this.dataSource.data.forEach(row => this.selection2.deselect(row));
        }

        if (this.isMasterCheckbox2Indeterminate) {
          this.dataSource.data.forEach(row => this.selection2.deselect(row));
          this.isMasterCheckbox2Checked = false;
        }

        this.checkbox2SelectedRow.emit(this.selection2.selected);
        break;
      default:
        break;
    }
  }

  /**
   * Function filterTabClicked:
   *
   * Emits selected tab index for filter.
   * @param  {number} tabIndex: Selected tab index (0 based index).
   */
  public filterTabClicked(tabIndex: number) {
    this.selection1 = new SelectionModel<any>(true, []);
    this.filterTabSelectedIndex.emit(tabIndex);
  }

  /**
   * Function actionExtraButtonClicked:
   *
   * Emits selected extra button index for action buttons.
   * @param  {number} itemIndex: Selected item index
   */
  public actionExtraButtonClicked(itemIndex: number, rowData: any, rowIndex: number) {
    let pageIndex: number;
    if (this.paginator) {
      pageIndex = this.paginator.pageIndex;
    }
    this.actionExtraButtonSelectedIndex.emit({ index: itemIndex, data: rowData, rowIndex: rowIndex, pageIndex: pageIndex });
  }

  /**
   * Function getCalculatedData:
   *
   * This function gets data for Footer,
   * can be count of rows, or sum/average of data of rows.
   *
   * @param  {number} columnIndex: Index of column for which row data is calculated
   * @returns string: returns the calculated data
   */
  public getCalculatedData(columnIndex: number, dataTypeField: string, data: Array<any> = this.rows): string {
    const startTime = performance.now();

    let calculatedDataType: string;

    switch (dataTypeField) {
      case 'header':
        calculatedDataType = this.columns[columnIndex].headerCalculatedDataType;
        break;
      case 'footer':
        calculatedDataType = this.columns[columnIndex].footerCalculatedDataType;
        break;
      default:
        break;
    }

    if (data && data.length > 0) {
      switch (calculatedDataType) {
        case CalculationDataType.Count:
          return data.length.toString();
        case CalculationDataType.Sum:
          const sum = data.map((t) => {
            // Removing extra data from Calculated header
            let isExpandedRow = false;
            Object.keys(t).forEach((eachRowKey) => {
              if (eachRowKey.includes(this.ROW_IS_EXPANDED_ROW_SUFFIX) && t[eachRowKey]) {
                isExpandedRow = true;
              }
            });
            if (t && this.columns[columnIndex].columnDef && t[this.columns[columnIndex].columnDef] && !isExpandedRow) {
              return Number.parseFloat(t[this.columns[columnIndex].columnDef]);
            } else {
              return 0;
            }
          }).reduce((accumulatedSum, eachValue) => {
            if (!isNaN(eachValue)) {
              return accumulatedSum + eachValue;
            } else {
              return accumulatedSum;
            }
          }, 0);
          return this.formatCalculatedData(sum, columnIndex, calculatedDataType);
        case CalculationDataType.RoundedSum:
          const roundedSum = data.map((t) => {
            // Removing extra data from Calculated header
            let isExpandedRow = false;
            Object.keys(t).forEach((eachRowKey) => {
              if (eachRowKey.includes(this.ROW_IS_EXPANDED_ROW_SUFFIX) && t[eachRowKey]) {
                isExpandedRow = true;
              }
            });
            if (t && this.columns[columnIndex].columnDef && t[this.columns[columnIndex].columnDef] && !isExpandedRow) {
              return Number.parseFloat(t[this.columns[columnIndex].columnDef]);
            } else {
              return 0;
            }
          }).reduce((accumulatedSum, eachValue) => {
            if (!isNaN(eachValue)) {
              return accumulatedSum + eachValue;
            } else {
              return accumulatedSum;
            }
          }, 0);
          return this.formatCalculatedData(roundedSum, columnIndex, calculatedDataType);
        case CalculationDataType.Average:
          const avg = (data.map((t) => {
            // Removing extra data from Calculated header
            let isExpandedRow = false;
            Object.keys(t).forEach((eachRowKey) => {
              if (eachRowKey.includes(this.ROW_IS_EXPANDED_ROW_SUFFIX) && t[eachRowKey]) {
                isExpandedRow = true;
              }
            });
            if (t && this.columns[columnIndex].columnDef && t[this.columns[columnIndex].columnDef] && !isExpandedRow) {
              return Number.parseInt(t[this.columns[columnIndex].columnDef]);
            } else {
              return 0;
            }
          }).reduce((accumulatedSum, eachValue) => {
            if (!isNaN(eachValue)) {
              return accumulatedSum + eachValue;
            } else {
              return accumulatedSum;
            }
          }, 0) / data.length);
          return this.formatCalculatedData(avg, columnIndex, calculatedDataType);
        default:
          break;
      }
    } else {
      return '0';
    }

    const duration = performance.now() - startTime;
    console.log(`getCalculatedData took ${duration}ms`);
  }

  /**
   * This function is used to format calculated data according to dataCalculationFormat/dataFormat
   * @param  {number} sum: Sum of all the rows data
   * @param  {number} columnIndex: Column index of the data
   * @returns string: returns the formatted calculation of data
   */
  private formatCalculatedData(sum: number, columnIndex: number, calculatedDataType: CalculationDataType): string {
    let tempSum = 0;

    switch (calculatedDataType) {
      case CalculationDataType.Sum:
      case CalculationDataType.Average:
        tempSum = sum;
        break;
      case CalculationDataType.RoundedSum:
        tempSum = Math.round(sum);
        break;
      default:
        break;
    }

    if (this.columns[columnIndex].dataCalculationFormat) {
      if (this.columns[columnIndex].dataCalculationFormat === DataCalculationFormat.CurrencyInLac) {
        return this.applyPipe(tempSum, this.columns[columnIndex].dataCalculationFormat) + ' L';
      } else {
        return this.applyPipe(tempSum, this.columns[columnIndex].dataCalculationFormat);
      }
    } else {
      if (this.columns[columnIndex].dataFormat) {
        return this.applyPipe(tempSum, this.columns[columnIndex].dataFormat);
      } else {
        return tempSum.toString();
      }
    }
  }

  /**
   * Function setSelectedColumnData:
   *
   * This function calls for extra data, on row expansion
   *
   * @param  {Object} rowData: RowData of the selected cell's row
   * @param  {string} columnName: ColumnName of the selected cell's column
   * @param  {CellActions} action: Type of Action performed
   * @param  {number} rowIndex?: Optional, Row Index of the selected cell's row
   * @param  {boolean} isForExtraData?: Optional, boolean value - if it is for extra data
   * @param  {boolean} rowExpansionLevel?: Optional, level number of expansion
   */
  public setSelectedColumnData(rowData: Object, columnName: string, action: CellActions, rowIndex?: number, isForExtraData?: boolean, rowExpansionLevel?: number) {
    let pageIndex: number;
    if (this.paginator) {
      pageIndex = this.paginator.pageIndex;
    }
    if (rowData[columnName + this.ROW_INNER_DATA_SUFFIX] === undefined) {
      this.cellClick.emit(new CellData(rowData, columnName, action, rowIndex, pageIndex, isForExtraData, rowExpansionLevel));
    } else {
      this.rows.splice(rowIndex + 1, 0, ...this.rows[rowIndex][columnName + this.ROW_INNER_DATA_SUFFIX]);
      this.toggleRowExpansionButton(columnName, rowData, this.gridConfiguration.rowCollapseIcon, this.gridConfiguration.rowExpansionIcon, rowExpansionLevel);
      this.dataSource.data = new MatTableDataSource(this.rows).data;
      this.isLoadingData = false;
    }
  }

  /**
   * This function copies data of cell into clipboard
   * @param  {Object} rowData
   * @param  {Column} column
   */
  public copyCellData(rowData: Object, column: Column) {
    const response: IClipboardResponse = { isSuccess: true, event: null, content: rowData[column.columnDef], successMessage: 'Cell data copied successfully!' };
    this._clipboardService.pushCopyReponse(response);
  }

  /**
   * Function onRowIconClick:
   *
   * This funciton calls on Row's Icon click
   *
   * @param  {Object} rowData: RowData of the selected cell's row
   * @param  {string} columnName: ColumnName of the selected cell's column
   * @param  {CellActions} action: Type of Action performed
   * @param  {number} columnIndex: column number for level
   */
  public onRowIconClick(rowData: Object, columnName: string, action: CellActions, columnIndex: number) {
    if (action === 'data-expand-collapse') {
      this.isLoadingData = true;
    }

    let rowsIndex;
    switch (columnIndex) {
      case 0:
        rowsIndex = this.rows.findIndex((eachRow) => {
          if (eachRow[this.gridConfiguration.uniqueLevel1RowExpansionColumnName] === rowData[this.gridConfiguration.uniqueLevel1RowExpansionColumnName]) {
            return true;
          }
        });
        break;
      case 1:
        rowsIndex = this.rows.findIndex((eachRow) => {
          if (eachRow[this.gridConfiguration.uniqueLevel2RowExpansionColumnName] === rowData[this.gridConfiguration.uniqueLevel2RowExpansionColumnName]) {
            return true;
          }
        });
        break;
      case 2:
        rowsIndex = this.rows.findIndex((eachRow) => {
          if (eachRow[this.gridConfiguration.uniqueLevel3RowExpansionColumnName] === rowData[this.gridConfiguration.uniqueLevel3RowExpansionColumnName]) {
            return true;
          }
        });
        break;
      default:
        rowsIndex = this.rows.findIndex((eachRow) => {
          if (eachRow[this.gridConfiguration.uniqueColumnName] === rowData[this.gridConfiguration.uniqueColumnName]) {
            return true;
          }
        });
        break;
    }

    if (!this.rows[rowsIndex][columnName + this.ROW_IS_EXPANDED_SUFFIX]) {
      this.setSelectedColumnData(rowData, columnName, action, rowsIndex, true, columnIndex);
    } else {
      this.collapseSelectedRow(columnName, rowData, rowsIndex, columnIndex);
      this.isLoadingData = false;
    }
  }

  /**
   * Function collapseSelectedRow:
   *
   * This function will hide expanded rows and change icon for selected row
   *
   * @param  {string} columnName: Name of the collapsing column
   * @param  {Object} rowData: RowData of the selected cell's row
   * @param  {Object} rowIndex: Row Index of the selected cell's row
   * @param  {Object} columnIndex: Column Index of the selected cell's row
   */
  private collapseSelectedRow(columnName: string, rowData: Object, rowIndex: number, columnIndex: number) {
    this.toggleRowExpansionButton(columnName, rowData, this.gridConfiguration.rowCollapseIcon, this.gridConfiguration.rowExpansionIcon, columnIndex);
    if (this.rows[rowIndex] && this.rows[rowIndex][columnName + this.ROW_INNER_DATA_SUFFIX]) {
      let deleteCount = 0;
      switch (columnIndex) {
        case 0:
          deleteCount = this.rows[rowIndex][columnName + this.ROW_INNER_DATA_SUFFIX].length;
          for (let index = 0; index < this.rows[rowIndex][columnName + this.ROW_INNER_DATA_SUFFIX].length; index++) {
            const innerRow = this.rows[rowIndex][columnName + this.ROW_INNER_DATA_SUFFIX][index];
            if (innerRow[this.columns[1].columnDef + this.ROW_IS_EXPANDED_SUFFIX]) {
              this.collapseSelectedRow(this.columns[1].columnDef, innerRow, rowIndex + index + 1, columnIndex + 1);
            }
          }
          break;
        case 1:
          deleteCount = this.rows[rowIndex][columnName + this.ROW_INNER_DATA_SUFFIX].length;
          break;
      }
      this.rows.splice(rowIndex + 1, deleteCount);
    }
    this.dataSource.data = new MatTableDataSource(this.rows).data;
  }

  /**
   * Function toggleRowExpansionButton:
   *
   * This function toggles icon for Cell
   *
   * @param  {string} columnName: Name of selected cell's Column
   * @param  {number} rowIndex: Index of selected cell
   * @param  {string} collapsedIcon: icon passed by user for collapse, e.g. add
   * @param  {string} expandedIcon: icon passed by user for expand, e.g. remove
   * @param  {number} rowExpansionLevel: level of row expansion, e.g. 0, 1, 2
   */
  private toggleRowExpansionButton(columnName: string, selectedRowData: Object, collapsedIcon: string, expandedIcon: string, rowExpansionLevel?: number) {
    if (this.rows && Array.isArray(this.rows)) {
      this.rows.forEach((eachRow) => {
        switch (rowExpansionLevel) {
          case 0:
            if (eachRow[this.gridConfiguration.uniqueLevel1RowExpansionColumnName] === selectedRowData[this.gridConfiguration.uniqueLevel1RowExpansionColumnName]) {
              eachRow[columnName + this.ROW_ICON_SUFFIX] = eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX] ? collapsedIcon : expandedIcon;
              eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX] = !eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX];
              return true;
            }
            break;
          case 1:
            if (eachRow[this.gridConfiguration.uniqueLevel2RowExpansionColumnName] === selectedRowData[this.gridConfiguration.uniqueLevel2RowExpansionColumnName]) {
              eachRow[columnName + this.ROW_ICON_SUFFIX] = eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX] ? collapsedIcon : expandedIcon;
              eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX] = !eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX];
              return true;
            }
            break;
          case 2:
            if (eachRow[this.gridConfiguration.uniqueLevel3RowExpansionColumnName] === selectedRowData[this.gridConfiguration.uniqueLevel3RowExpansionColumnName]) {
              eachRow[columnName + this.ROW_ICON_SUFFIX] = eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX] ? collapsedIcon : expandedIcon;
              eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX] = !eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX];
              return true;
            }
            break;
          default:
            if (eachRow[this.gridConfiguration.uniqueColumnName] === selectedRowData[this.gridConfiguration.uniqueColumnName]) {
              eachRow[columnName + this.ROW_ICON_SUFFIX] = eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX] ? collapsedIcon : expandedIcon;
              eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX] = !eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX];
              return true;
            }
            break;
        }
      });
    }
  }

  /**
   * Function onRadioButtonSelect:
   *
   * This function sends selected radio button's index to parent component.
   */
  public onRadioButtonSelect() {
    this.radioButtonSelectedRow.emit(this.radioSelectedRowIndex);
  }

  public updateCheckedOptions(row: object, checkboxNumber: number) {

    switch (checkboxNumber) {
      case 1:
        this.selection1.toggle(row);

        this.isMasterCheckbox1Checked = false;
        this.isMasterCheckbox1Indeterminate = false;

        if (this.selection1.hasValue() && this.isAllSelected(1)) {
          this.isMasterCheckbox1Indeterminate = null;
          this.isMasterCheckbox1Checked = true;
        }

        if (this.selection1.hasValue() && !this.isAllSelected(1)) {
          this.isMasterCheckbox1Checked = null;
          this.isMasterCheckbox1Indeterminate = true;
        }

        this.checkbox1SelectedRow.emit(this.selection1.selected);
        break;
      case 2:
        this.selection2.toggle(row);

        this.isMasterCheckbox2Checked = false;
        this.isMasterCheckbox2Indeterminate = false;

        if (this.selection2.hasValue() && this.isAllSelected(2)) {
          this.isMasterCheckbox2Indeterminate = null;
          this.isMasterCheckbox2Checked = true;
        }

        if (this.selection2.hasValue() && !this.isAllSelected(2)) {
          this.isMasterCheckbox2Checked = null;
          this.isMasterCheckbox2Indeterminate = true;
        }

        this.checkbox2SelectedRow.emit(this.selection2.selected);
        break;
      default:
        break;
    }
  }

  /**
   * Use to update rows on edit of grid.
   * @param  {any} row: Row which is edited
   * @param  {Column} column: Column data where change is done
   * @param  {any} value: edited value
   */
  public rowEditChanges(row: any, column: Column, value: any, index) {
    row[column.columnDef] = value;
    let editedData = <Array<any>>Util.getObjectCopy(row);
    editedData = this.removeInternalKeys(editedData);
    this.editRows.emit({ row: editedData, column: column, rowIndex: index });
  }

  /**
   * This function checks if a row is editable and return value
   * @param  {Column} column
   * @param  {any} row
   * @returns boolean
   */
  public isEditableGrid(column: Column, row: any): boolean {
    if (column.isExpandableRow) {
      if ((!row[column.columnDef + '_isExtraRow'] && column.editExpandableFieldType === 'main-rows') || (row[column.columnDef + '_isExtraRow'] && column.editExpandableFieldType === 'expanded-rows')) {
        return true;
      }
    } else {
      return true;
    }
  }

  /**
   * To remove internal keys from row data.
   */
  private removeInternalKeys(row: any): any {
    const gridInternalKeys = [
      this.ROW_INNER_DATA_SUFFIX,
      this.ROW_ICON_SUFFIX,
      this.ROW_IS_EXPANDED_SUFFIX,
      this.ROW_IS_EXPANDED_ROW_SUFFIX,
      this.SUB_HEADER_1_COL_DEF,
      this.SUB_HEADER_1_HIDE,
      this.SUB_HEADER_2_COL_DEF,
      this.SUB_HEADER_2_HIDE,
      this.CALCULATED_SUB_HEADER_COL_DEF
    ];

    const dataKeys = Object.getOwnPropertyNames(row);
    dataKeys.forEach((eachDataKey: string) => {
      if (eachDataKey.includes('_') && gridInternalKeys.includes('_' + eachDataKey.split('_')[1])) {
        delete row[eachDataKey];
      }
    });
    return row;
  }

  /**
   * Used to enable/disable paginator
   */
  private controlPaginator(): void {
    if (this.gridConfiguration.isPaginaionEnabled === undefined) {
      let defaultPageSize: number;
      if (this.gridConfiguration.defaultPageSize) {
        defaultPageSize = this.gridConfiguration.defaultPageSize;
      } else {
        if (this.gridConfiguration.pageSizeOptions && Array.isArray(this.gridConfiguration.pageSizeOptions)) {
          defaultPageSize = this.gridConfiguration.pageSizeOptions[0];
          this.gridConfiguration.defaultPageSize = this.gridConfiguration.pageSizeOptions[0];
        }
      }
      if (this.rows && this.rows.length > defaultPageSize) {
        this.displayPaginator = true;
      } else {
        this.displayPaginator = false;
      }
    } else {
      this.displayPaginator = this.gridConfiguration.isPaginaionEnabled;
      if (this.gridConfiguration.pageSizeOptions && Array.isArray(this.gridConfiguration.pageSizeOptions)) {
        this.gridConfiguration.defaultPageSize = this.gridConfiguration.pageSizeOptions[0];
      }
    }
    this.onResize();
  }

  /**
   * trigger changes on Menu Click
   */
  public onMenuClick(row: any) {
    this.actionItemMenuClick.emit(row);
  }

  /**
   * To get formatted date
   * @param  {any} data :data from row
   * @param  {string} dateFormat: format of date required
   * @returns string : Desired date
   */
  private getFormattedDate(data: any, dateFormat: string): string {
    switch (data) {
      case null:
      case undefined:
      case '':
        return '';
      default:
        return this._datePipe.transform(data, dateFormat);
    }
  }
}
