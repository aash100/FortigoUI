/*
 * Created on Mon Jan 21 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, Input, SimpleChanges, OnChanges, OnInit, ViewChild, Output, EventEmitter, HostListener } from '@angular/core';
import { TitleCasePipe, CurrencyPipe, DatePipe, SlicePipe, UpperCasePipe } from '@angular/common';
import { MatSort, MatTableDataSource, MatPaginator, MatTable, MatCheckboxChange } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { style, trigger, state, transition, animate } from '@angular/animations';

import Swal from 'sweetalert2';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';

import { Column, CalculationDataType, DataType, DataFormat, CellActions } from '../../models/column.model';
import { GridConfiguration, GridConfigValidation } from '../../models/grid-configuration.model';

import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { CellData } from '../../models/cell-data.model';
import { RsToLakhPipe } from '../../pipes/rs-to-lakh.pipe';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { TruncateTextPipe } from '../../pipes/truncate-text/truncate-text.pipe';
import { ExtraRowsData } from '../../models/extra-rows-data.model';
import { Util } from 'src/app/core/abstracts/util';

@Component({
  selector: 'app-fortigo-grid-beta',
  templateUrl: './fortigo-grid.component.html',
  styleUrls: ['./fortigo-grid.component.css'],
  providers: [UpperCasePipe, TitleCasePipe, CurrencyPipe, DatePipe, SlicePipe],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class FortigoGridBetaComponent implements OnInit, OnChanges {
  // takes input for sticky top row to display
  @Input() stickyTopData: any;
  // takes input for sticky top row to display
  @Input() stickyBottomData: any;
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

  // gives output for filter tab selection
  @Output() filterTabSelectedIndex = new EventEmitter<number>();
  // gives output for action extra button click
  @Output() actionExtraButtonSelectedIndex = new EventEmitter<Object>();
  // gives output for radio button selection
  @Output() multiselectRow = new EventEmitter<Array<number>>();
  // gives output for radio button selection
  @Output() radioButtonSelectedRow = new EventEmitter<number>();
  // gives output for clicked cell
  @Output() cellClick = new EventEmitter<CellData>();

  // binds UI element MatTable to table
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  // binds UI element MatSort to sort
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  // binds UI element MatPaginator to paginator
  private paginator: MatPaginator;
  public expandedElement: any;
  innerKeys: any;
  @ViewChild(MatPaginator, { static: false }) set content(content: MatPaginator) {
    this.paginator = content;
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
  }

  // do not change, any value other than 1 is not handled
  public readonly DEFAULT_INNER_CELLS: number = 1;

  public readonly DEFAULT_MULTISELECT_POSITION: number = 1;
  public readonly DEFAULT_MULTISELECT_COL_DEF: string = 'select';
  public readonly DEFAULT_RADIO_BUTTON_POSITION: number = 1;
  public readonly DEFAULT_RADIO_BUTTON_COL_DEF: string = 'radio';
  public readonly ROW_INNER_DATA_SUFFIX: string = '_innerData';
  public readonly ROW_ICON_SUFFIX: string = '_icon';
  public readonly ROW_IS_EXPANDED_SUFFIX: string = '_isExpanded';
  public readonly ROW_IS_EXPANDED_ROW_SUFFIX: string = '_isExpandedRow';

  public readonly ACTION_BUTTON_COL_DEF: string = 'actionButtons';

  public displayedColumns: Array<string>;
  public dataSource: MatTableDataSource<any>;
  public selection = new SelectionModel<any>(true, []);
  public radioSelectedRowIndex: number;
  public isLoadingData: boolean;
  private rawColumnData: Array<Column>;
  private rawRowData: Array<Object>;
  private isHavingNestedData: boolean;
  public checkedRowsIndex: Array<number>;
  public expandedRow: any;
  // Used to enable/disable paginator
  public displayPaginator: boolean;
  // calculated table height
  public calcTableHeight: any;
  constructor(
    private _titleCasePipe: TitleCasePipe,
    private _upperCasePipe: UpperCasePipe,
    private _rsToLakhPipe: RsToLakhPipe,
    private _truncateTextPipe: TruncateTextPipe,
    private _currencyPipe: CurrencyPipe,
    private _datePipe: DatePipe,
    private _slicePipe: SlicePipe,
    private _hotkeysService: HotkeysService,
    private _metadataService: AppMetadataService
  ) {
    this.setDefaultGridConfiguration();
    this.applyGridConfiguration();
    this.setKeyboardShortcuts();

    this.dataSource = new MatTableDataSource<any>();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    // Used to enable/disable paginator
    const defaultPageSize = this.gridConfiguration.defaultPageSize ? this.gridConfiguration.defaultPageSize : this.gridConfiguration.pageSizeOptions[0];
    if (this.rows !== null && this.rows.length > defaultPageSize) {
      this.displayPaginator = true;
    } else {
      this.displayPaginator = false;
    }
    // ends here
    const height = this.gridConfiguration.css.fixedTableHeight;
    let tableOuterHeight: number;

    if (height) {
      this.calcTableHeight = height;
      return;
    }
    if (this.gridConfiguration.css.tableOuterHeight) {
      tableOuterHeight = +(this.gridConfiguration.css.tableOuterHeight.substr(0, this.gridConfiguration.css.tableOuterHeight.length - 2));
    } else {
      if (this.gridConfiguration.isFilterTabEnabled) {
        tableOuterHeight = 40;
      } else {
        tableOuterHeight = 0;
      }
    }
    this.calcTableHeight = window.innerHeight - tableOuterHeight;
    this.calcTableHeight = this.calcTableHeight + 'px';
    // }
  }
  ngOnInit(): void {
    // this.columns = [];
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.onResize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.onResize();
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.
    console.log('grid changes', this.gridConfiguration);
    if (changes.columns) {
      this.columns = changes.columns.currentValue;
    }
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
          console.info('Column object before Inner Cell Validation: ' + JSON.stringify(this.columns));
        }
        this.validateInnerCellData();
        this.rawColumnData = <Array<Column>>Util.getObjectCopy(this.columns);
        if (this.isDebug) {
          console.info('Column object after Inner Cell Validation: ' + JSON.stringify(this.columns));
        }
      }
      this.isLoadingData = false;
    }

    // when row data is given as input
    if (this.rows) {
      if (this.rows.length > 0) {
        if (this.compareData(this.rawRowData, this.rows)) {
          // same object, do nothing
          if (this.isDebug) {
            console.warn('Same Row input found.');
          }
        } else {
          this.dataFormatter();
          this.buildColumns();
          this.columns.filter((eachColumn) => {
            return eachColumn.isExpandableRow;
          }).forEach((eachExpandableRow) => {
            this.setRowExpansionButton(eachExpandableRow.columnDef);
          });
        }
      }

      if (this.rows.length === 0) {
        this.dataSource.data = new MatTableDataSource(this.rows).data;
        this.isLoadingData = false;
      }

      this.rawRowData = <Array<Object>>Util.getObjectCopy(this.rows);
    }

    if (this.extraRows && this.extraRows.selectedRowData && this.extraRows.data && this.extraRows.columnName) {
      this.toggleRowExpansionButton(this.extraRows.columnName, this.extraRows.selectedRowData);
      this.extraRows.data.forEach((eachData) => { eachData[this.extraRows.columnName + '_isExtraRow'] = true; });
      let rowIndex: number;

      // adding extra row identification
      this.extraRows.data.forEach((eachData) => {
        eachData[this.ROW_IS_EXPANDED_ROW_SUFFIX] = true;
      });

      this.rows.forEach((row, index) => {
        if (row[this.gridConfiguration.uniqueColumnName] === this.extraRows.selectedRowData[this.gridConfiguration.uniqueColumnName]) {
          row[this.ROW_INNER_DATA_SUFFIX] = this.extraRows.data;
          rowIndex = index;
          return true;
        }
      });
      if (this.rows[rowIndex] && this.rows[rowIndex][this.ROW_INNER_DATA_SUFFIX] && this.rows[rowIndex][this.ROW_INNER_DATA_SUFFIX].length > 0) {
        this.rows.splice(rowIndex + 1, 0, ...this.rows[rowIndex][this.ROW_INNER_DATA_SUFFIX]);
      }

      this.dataFormatter();
      this.buildColumns();
    }

    if (this.gridConfiguration) {
      if (this.columns && this.columns.length > 0) {
        this.gridConfiguration.isFooterEnabled = this.checkIfFooterRequired();
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
    }
  }

  /**
   * Function compareData:
   *
   * This function comparestwo object and returns true, if equal, else false
   *
   * @param  {any} oldData: Old Obbject
   * @param  {any} newData: New Obbject
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
   * Funciton setKeyboardShortcuts:
   *
   * This function will set Keyboard Shortcut for Fortigo-Grid
   */
  private setKeyboardShortcuts() {
    // Next Page
    this._hotkeysService.add(new Hotkey('ctrl+right', (event: KeyboardEvent): boolean => {
      this.paginator.nextPage();
      return false; // Prevent bubbling
    }, undefined, 'Grid: Next Page'));
    // Previous Page
    this._hotkeysService.add(new Hotkey('ctrl+left', (event: KeyboardEvent): boolean => {
      this.paginator.previousPage();
      return false; // Prevent bubbling
    }, undefined, 'Grid: Previous Page'));
    // Last Page
    this._hotkeysService.add(new Hotkey('ctrl+shift+right', (event: KeyboardEvent): boolean => {
      this.paginator.lastPage();
      return false; // Prevent bubbling
    }, undefined, 'Grid: Last Page'));
    // First Page
    this._hotkeysService.add(new Hotkey('ctrl+shift+left', (event: KeyboardEvent): boolean => {
      this.paginator.firstPage();
      return false; // Prevent bubbling
    }, undefined, 'Grid: First Page'));
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
    // checking for reserved keywords in columnDef
    this.checkIfReserveKeywords();

    this.columns.forEach((column) => {

      column = this.settingColumnTitle(column);

      if (column.columnDef.includes('.')) {
        this.isHavingNestedData = true;
        // applying data function
        column['cell'] = (element: any) => {
          column.columnDef.split('.').forEach((eachKey) => {
            element = element[eachKey];
          });
          element = this.applyPipe(element, column.dataFormat, column.bigTextLength);
          return `${element}`;
        };
        // applying tootlip text function
        column['cellToolTipText'] = (element: any) => {
          column.columnDef.split('.').forEach((eachKey) => {
            element = element[eachKey];
          });
          if (column.dataFormat !== DataFormat.BigText) {
            element = this.applyPipe(element, column.rowToolTipTextFormat ? column.rowToolTipTextFormat : column.dataFormat);
          }
          return `${element}`;
        };
      } else {
        // applying data function
        column['cell'] = (element: any) => {
          element = this.applyPipe(element[column.columnDef], column.dataFormat, column.bigTextLength);
          // changes done for showing lesser text in cell and the complete text in tooltip text.
          let splittedElement = element;

          if (element && element.toString().includes('(')) {
            splittedElement = element.toString().split('(')[0];
          }
          return `${splittedElement}`;
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
      }
      // applying css classes
      column = this.applyCSS(column);

      // setting icon
      if (column.isExpandableRow) {
        column['cellIcon'] = (element: any) => {
          element = element[column.columnDef + this.ROW_ICON_SUFFIX];
          return `${element}`;
        };
      }
    });
    this.displayedColumns = this.columns.map(c => c.columnDef);
  }

  private applyCSS(column: Column): Column {
    column['cssClass'] = new Array<string>();

    if (column.css) {
      // applying horizontal align css
      switch (column.css.horizontalAlign) {
        case 'left':
          column['cssClass'].push('align-left');
          break;
        case 'center':
          column['cssClass'].push('align-center');
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
    console.log('=============', column);
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
  private applyPipe(data: any, dataFormat: DataFormat, bigTextLength?: number): string {
    switch (dataFormat) {
      case DataFormat.Currency:
        if (!this._currencyPipe.transform(data, FortigoConstant.INDIAN_CUR_SYM, 'symbol', '0.2-2')) {
          return '';
        }
        return this._currencyPipe.transform(data, FortigoConstant.INDIAN_CUR_SYM, 'symbol', '0.2-2');

      case DataFormat.CurrencyInLac:
        return this._currencyPipe.transform(this._rsToLakhPipe.transform(data), FortigoConstant.INDIAN_CUR_SYM, 'symbol', '0.2-2');
      case DataFormat.Date:
        if (data === undefined || data === '') {
          return data;
        } else {
          return this._datePipe.transform(data, FortigoConstant.INDIAN_DATE_FORMAT_GRID);
        }
      case DataFormat.BigText:
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
    this.columns.forEach((column) => {
      // checking for reserve keywords
      switch (column.columnDef) {
        case this.DEFAULT_MULTISELECT_COL_DEF:
          Swal.fire('Error', 'Can\'t use reverve keyword: ' + this.DEFAULT_MULTISELECT_COL_DEF, 'error');
          return true;
        case this.ACTION_BUTTON_COL_DEF:
          Swal.fire('Error', 'Can\'t use reverve keyword: ' + this.ACTION_BUTTON_COL_DEF, 'error');
          return true;
        default:
          break;
      }
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
    // applying soring configuration
    if (this.gridConfiguration.isSortingEnabled) {
      // applying custom sorting function for nested key data
      // if (this.isHavingNestedData) {
      this.dataSource.sortingDataAccessor = (item, property) => {
        if (property.includes('.')) {
          property.split('.').forEach((eachKey) => {
            item = item[eachKey];
          });
          return item;
        } else {
          return item[property];
        }
      };
      // }

      this.dataSource.sortData = (data: any[], sort: MatSort): any[] => {
        if (sort.direction !== undefined && sort.direction !== '') {
          data = data.filter((eachData) => {
            if (eachData[this.ROW_IS_EXPANDED_ROW_SUFFIX]) {
              return false;
            } else {
              return true;
            }
          });
        }

        data.sort((a, b) => {
          const aData = a[sort.active], bData = b[sort.active];
          switch (sort.direction) {
            case 'asc':
              return ((aData < bData) ? -1 : ((aData > bData) ? 1 : 0));
            case 'desc':
              return ((aData > bData) ? -1 : ((aData < bData) ? 1 : 0));
            default:
              return;
          }
        });

        return data;
      };
      this.dataSource.sort = this.sort;
    }

    // applying checkbox configuration
    if (this.gridConfiguration.isCheckbox1Enabled && !this.displayedColumns.includes(this.DEFAULT_MULTISELECT_COL_DEF)) {
      if (this.gridConfiguration.isCheckbox1AtStart || this.gridConfiguration.isCheckbox1AtEnd || this.gridConfiguration.checkbox1Postion) {
        if (this.gridConfiguration.isCheckbox1AtStart) {
          this.displayedColumns.unshift(this.DEFAULT_MULTISELECT_COL_DEF);
        }
        if (this.gridConfiguration.isCheckbox1AtEnd) {
          this.displayedColumns.push(this.DEFAULT_MULTISELECT_COL_DEF);
        }
        if (this.gridConfiguration.checkbox1Postion) {
          this.displayedColumns.splice(this.gridConfiguration.checkbox1Postion, 0, this.DEFAULT_MULTISELECT_COL_DEF);
        }
      } else {
        this.displayedColumns.unshift(this.DEFAULT_MULTISELECT_COL_DEF);
      }
    }

    // applying radio button configuration
    if (this.gridConfiguration.isRadioButtonEnabled && !this.displayedColumns.includes(this.DEFAULT_RADIO_BUTTON_COL_DEF)) {
      if (this.gridConfiguration.isRadioButtonAtStart || this.gridConfiguration.isRadioButtonAtEnd || this.gridConfiguration.radioButtonPostion) {
        if (this.gridConfiguration.isRadioButtonAtStart) {
          this.displayedColumns.unshift(this.DEFAULT_RADIO_BUTTON_COL_DEF);
        }
        if (this.gridConfiguration.isRadioButtonAtEnd) {
          this.displayedColumns.push(this.DEFAULT_RADIO_BUTTON_COL_DEF);
        }
        if (this.gridConfiguration.radioButtonPostion) {
          this.displayedColumns.splice(this.gridConfiguration.radioButtonPostion, 0, this.DEFAULT_RADIO_BUTTON_COL_DEF);
        }
      } else {
        this.displayedColumns.unshift(this.DEFAULT_RADIO_BUTTON_COL_DEF);
      }
    }

    // applying action button configuration
    if (this.gridConfiguration.isActionButtonEnabled && !this.displayedColumns.includes(this.ACTION_BUTTON_COL_DEF)) {
      this.displayedColumns.push(this.ACTION_BUTTON_COL_DEF);
    }

    // applying sticky property
    // if (this.gridConfiguration.isStickyHeader) {

    // }

    if (this.gridConfiguration.css) {
      const bodyStyles = document.body.style;
      bodyStyles.setProperty('--table-font', this.gridConfiguration.css.tableFont);
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
  }

  /**
   * Function dataFormatter:
   *
   * This function applies data formatting from input as `rowdata`
   */
  private dataFormatter() {
    this.rows.forEach(eachRow => {
      if (this.columns && this.columns.length > 0) {
        this.columns.forEach(eachColumn => {
          if (eachRow[eachColumn.columnDef]) {
            if (!eachColumn.dataType) {
              eachColumn.dataType = <DataType>typeof eachRow[eachColumn.columnDef];
            }
          } else {
            switch (eachColumn.dataType) {
              case DataType.String:
              case DataType.Number:
              case DataType.Date:
              case undefined:
              case null:
              default:
                eachRow[eachColumn.columnDef] = '';
                break;
            }
          }
        });
      }
    });

    this.dataSource.data = new MatTableDataSource(this.rows).data;
    // this.table.dataSource = this.dataSource;
    // this.table.setHeaderRowDef(new CdkHeaderRowDef());
    // this.table.renderRows();
    this.isLoadingData = false;
  }

  private setRowExpansionButton(columnName: string, collpasedUserIcon?: string) {
    const collapsedIcon: string = collpasedUserIcon ? collpasedUserIcon : 'add';

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

    for (let index = 0; index < this.columns.length; index++) {
      const element = this.columns[index];

      if (element.innerCells) {
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

      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

  /**
   * Function isAllSelected:
   *
   * Whether the number of selected elements matches the total number of rows
   * @returns boolean: Returns true if all the checkbox is selected, else false
   */
  public isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /**
   * Function masterToggle:
   *
   * Selects all rows if they are not all selected; otherwise clear selection.
   */
  public masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));

    let i = 0;
    this.checkedRowsIndex = [];
    if (this.isAllSelected()) {
      while (i < this.paginator.pageSize) {
        this.checkedRowsIndex.push(this.paginator.pageIndex * this.paginator.pageSize + i);
        i++;
      }
    }
  }

  /**
   * Function filterTabClicked:
   *
   * Emits selected tab index for filter.
   * @param  {number} tabIndex: Selected tab index (0 based index).
   */
  public filterTabClicked(tabIndex: number) {
    this.filterTabSelectedIndex.emit(tabIndex);
  }

  /**
   * Function actionExtraButtonClicked:
   *
   * Emits selected extra button index for action buttons.
   * @param  {number} itemIndex: Selected item index
   */
  public actionExtraButtonClicked(itemIndex: number, rowData: any, rowIndex: number) {
    this.actionExtraButtonSelectedIndex.emit({ index: itemIndex, data: rowData, rowIndex: rowIndex, pageIndex: this.paginator.pageIndex });
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
  public getCalculatedData(columnIndex: number): string {
    switch (this.columns[columnIndex].footerCalculatedDataType) {
      case CalculationDataType.Count:
        return this.rows.length.toString();
      case CalculationDataType.Sum:
        const sum = this.rows.map(t => t[this.columns[columnIndex].columnDef]).reduce((acc, value) => acc + value, 0);
        if (this.columns[columnIndex].dataFormat) {
          return this.applyPipe(sum, this.columns[columnIndex].dataFormat);
        } else {
          return sum;
        }
      case CalculationDataType.Average:
        return (this.rows.map(t => t[this.columns[columnIndex].columnDef]).reduce((acc, value) => acc + value, 0) / this.rows.length).toString();
      default:
        break;
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
   */
  public setSelectedColumnData(rowData: Object, columnName: string, action: CellActions, rowIndex?: number, isForExtraData?: boolean) {
    const pageIndex = this.paginator.pageIndex;
    this.cellClick.emit(new CellData(rowData, columnName, action, rowIndex, pageIndex, isForExtraData));
  }

  /**
   * Function onRowIconClick:
   *
   * This funciton calls on Row's Icon click
   *
   * @param  {Object} rowData: RowData of the selected cell's row
   * @param  {string} columnName: ColumnName of the selected cell's column
   * @param  {CellActions} action: Type of Action performed
   */
  public onRowIconClick(rowData: Object, columnName: string, action: CellActions) {
    if (action === 'data-expand-collapse') {
      this.isLoadingData = true;
    }

    const rowIndex = this.rows.findIndex((eachRow) => {
      if (eachRow[this.gridConfiguration.uniqueColumnName] === rowData[this.gridConfiguration.uniqueColumnName]) {
        return true;
      }
    });

    if (!this.rows[rowIndex][columnName + this.ROW_IS_EXPANDED_SUFFIX]) {
      this.setSelectedColumnData(rowData, columnName, action, rowIndex, true);
    } else {
      this.collapseSelectedRow(columnName, rowData, rowIndex);
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
   */
  private collapseSelectedRow(columnName: string, rowData: Object, rowIndex: number) {
    this.toggleRowExpansionButton(columnName, rowData);
    if (this.rows[rowIndex] && this.rows[rowIndex][this.ROW_INNER_DATA_SUFFIX]) {
      this.rows.splice(rowIndex + 1, this.rows[rowIndex][this.ROW_INNER_DATA_SUFFIX].length);
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
   * @param  {string} collpasedUserIcon?: Optional, icon passed by user for collapse, e.g. add
   * @param  {string} expandedUserIcon?: Optional, icon passed by user for expand, e.g. remove
   */
  private toggleRowExpansionButton(columnName: string, selectedRowData: Object, collpasedUserIcon?: string, expandedUserIcon?: string) {
    const collapsedIcon: string = collpasedUserIcon ? collpasedUserIcon : 'add';
    const expandedIcon: string = expandedUserIcon ? expandedUserIcon : 'remove';

    this.rows.forEach((eachRow) => {
      if (eachRow[this.gridConfiguration.uniqueColumnName] === selectedRowData[this.gridConfiguration.uniqueColumnName]) {
        eachRow[columnName + this.ROW_ICON_SUFFIX] = eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX] ? collapsedIcon : expandedIcon;
        eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX] = !eachRow[columnName + this.ROW_IS_EXPANDED_SUFFIX];
        return true;
      }
    });
  }

  /**
   * Function onRadioButtonSelect:
   *
   * This function sends selected radio button's index to parent component.
   */
  public onRadioButtonSelect() {
    this.radioButtonSelectedRow.emit(this.radioSelectedRowIndex);
  }

  public updateCheckedOptions(rowIndex: number, $event: MatCheckboxChange) {
    // checking if undefined, assign new Array object
    if (!this.checkedRowsIndex) {
      this.checkedRowsIndex = new Array<number>();
    }
    if ($event.checked) {
      this.checkedRowsIndex.push((this.paginator.pageIndex * 5) + rowIndex);
    } else {
      const index = this.checkedRowsIndex.indexOf(this.paginator.pageIndex * 5 + rowIndex);
      this.checkedRowsIndex.splice(index, 1);
    }
  }

  setinnerData() {
    if (this.expandedElement) {
      this.innerKeys = Object.keys(this.expandedElement.inner[0]);
    }
    // console.log('s.dkjgnas', this.innerKeys);
  }
  public setTrValue(value) {
    console.log('s.dkjgnas', value);

  }
}
