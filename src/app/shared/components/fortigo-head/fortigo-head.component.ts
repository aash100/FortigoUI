/*
 * Created on Tue Aug 09 2019
 * Created by - 1191: Ritesh Kant
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { Note } from '../../models/note.model';
import { FortigoButton } from '../../abstracts/button.model';
import { FortigoFilterService } from '../../services/fortigo-filter.service';
import { FortigoValidators } from '../../models/fortigo-validators.model';
import { Style } from '../../models/style.model';

export type IconFontStyleType = 'fa' | 'material';

@Component({
  selector: 'app-fortigo-head',
  templateUrl: './fortigo-head.component.html',
  styleUrls: ['./fortigo-head.component.css']
})
export class FortigoHeadComponent implements OnInit, OnChanges {

  // Takes input as `title` for the tile of header eg: INVOICE MANAGEMENT, ACCOUNT MANAGEMENT
  @Input() title: string;
  // Takes input to display tile inline
  @Input() displayTitleInline = false;
  // Takes input to set the text in search field, can be used to clear the text
  @Input() searchText: string;
  // Takes input as `subTitle` for the subTile of header eg: Exide , IOCL
  @Input() subTitle = '';
  // Takes input of search text and their validations.
  @Input() searchTextValidation: FortigoValidators;
  // Takes input as `miniNotes` for the mininotes to be displayed in head
  @Input() miniNotes: Array<Note>;
  // Takes filter name for material icons to be displayed in head filter
  @Input() filterIconName = 'filter_list';
  // Takes font style name eg: fa, material icons
  @Input() fontStyleType: IconFontStyleType = 'fa';
  // Controls whether filter is disabled or not
  @Input() isFilterDisabled = false;
  // Takes header message to be dispalyed on header
  @Input() headerMessage = '';
  // Take header style from user
  @Input() headerStyle: Style;
  /*
  * Takes array of objects of Button type  eg:   buttons = [
  *   { name : 'Button 1', action :  'openButton1'},
  *   { name : 'Button 2', action :  'openButton2'},
  * ]; */
  @Input() buttons: Array<FortigoButton>;
  // This flag is used to hide the filter, by default it is true
  @Input() isFilterVisible = true;
  // This flag is used to hide the search, by default it is true
  @Input() isSearchVisible = true;
  // This flag is used to hide the refresh, by default it is true
  @Input() isRefreshVisible = true;
  // boolean vaiable to maintain filter applied status
  @Input() isFilterApplied: boolean;
  // identify clear clicked in filter form
  @Input() isClearClicked: boolean;
  // Input search regex pattern.
  @Input() pattern: string;
  // triggers `searchClicked` event whenever search is clicked
  // Takes input to set the max length for search field
  @Input() searchTextMinLength = 3;
  // Takes input to set the max length for search field
  @Input() searchTextMaxLength = 20;

  @Output() searchClicked = new EventEmitter();
  // triggers `refreshClicked` event whenever refresh button is clicked
  @Output() refreshClicked = new EventEmitter();
  //  triggers `filterClicked` event whenever filter button is clicked
  @Output() filterClicked = new EventEmitter();
  //  triggers `buttonClicked` event whenever button is clicked
  @Output() buttonClicked = new EventEmitter();
  // triggers `hasCommaValue` event whenever search text contains comma
  @Output() hasCommaValue = new EventEmitter<string>();
  // ErrorMessage
  public errorMessage = 'Invalid search text';
  public isSearchClicked = false;
  public paddingButtonRight: any;
  // variable to store filter applied data which is passed by emitting through filter service
  private appliedFilter: any;
  // Stores keys of appliedFilter fields which is a json object
  private appliedFilterKeys: any;
  // Stores values of appliedFilter fields which is a json object
  private appliedFilterValues: any;

  // identify appliedFilter values date field and store its index
  private appliedFilterDateTypeIndex = new Array<any>();
  // store filter placeholder to display in chips
  private filterPlaceholder = new Array<string>();
  // for value binding purpose.

  // injecting FortigoFilterService to pass the event
  constructor(private filterService: FortigoFilterService, private _snackBar: MatSnackBar) { }

  ngOnInit() {
    /**
     * subscribe filter data event emitter whenever filter is applied
     */
    this.filterService.filterData.subscribe(
      (data: any) => {
        this.appliedFilter = null;
        this.appliedFilterDateTypeIndex.length = 0;
        this.appliedFilter = data;
        this.appliedFilterKeys = Object.keys(this.appliedFilter);
        /** set filter applied status */
        for (let element = 0; element < this.appliedFilterKeys.length; element++) {
          if (this.appliedFilter[this.appliedFilterKeys[element]] && this.appliedFilter[this.appliedFilterKeys[element]].trim() && this.appliedFilter[this.appliedFilterKeys[element]].trim().length !== 0) {
            this.isFilterApplied = true;
            break;
          } else {
            this.isFilterApplied = false;
          }
        }
      }
    );
    this.filterService.clearFilter.subscribe(
      () => {
        this.isFilterApplied = false;
      }
    );
    if (!this.searchText) {
      this.searchText = '';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // detect and apply changes on data
    if (changes.button) {
      this.buttons = changes.button.currentValue;
    }
    if (changes.title) {
      this.title = changes.title.currentValue;
    }
    if (changes.subTitle) {
      this.subTitle = changes.subTitle.currentValue;
    }
    if (changes.searchText) {
      this.searchText = changes.searchText.currentValue;
    }
    if (changes.isFilterApplied) {
      this.isFilterApplied = changes.isFilterApplied.currentValue;
    }
    if (changes.headerStyle) {
      this.headerStyle = changes.headerStyle.currentValue;
    }
  }

  // this method is called on search click
  public searchIsClicked(value: any) {
    this.isSearchClicked = false;
    const searchText = value.value.trim();
    if (this.searchTextValidation && this.searchTextValidation.pattern && this.searchTextValidation.pattern.regex) {
      this.pattern = this.searchTextValidation.pattern.regex.toString();
    }
    // checking min-length
    if (this.isSearchLessThanMinLength(searchText)) {
      return;
    } else if (!new RegExp(this.pattern).test(searchText)) {
      if (this.searchTextValidation && this.searchTextValidation.pattern && this.searchTextValidation.pattern.description) {
        this.errorMessage = this.searchTextValidation.pattern.description;
      }
      this._snackBar.open(this.errorMessage);
      return;
    }
    // ANCHOR put the hasCommaValue event and searchClicked event in single event.
    this.searchClicked.emit(searchText);
    // Emit comma value.
    if (searchText.toString().includes(',')) {
      this.hasCommaValue.emit(',');
    }
    // Toaster for Notifying Search Applied
    this._snackBar.open('Search Applied');
  }


  /**
   * this function checks and notifies user if search character is less than min length
   * @param  {string} searchText: search text
   * @returns boolean: returns true if search text is less than min length
   */
  private isSearchLessThanMinLength(searchText: string): boolean {
    if (searchText.length < this.searchTextMinLength) {
      this._snackBar.open('Search should be minimum of ' + this.searchTextMinLength + ' character');
      return true;
    } else {
      return false;
    }
  }

  // this method is called on button click
  public buttonIsClicked(value: FortigoButton) {
    this.buttonClicked.emit(value.placeholder);
  }

  // this method is called on refresh click
  public refreshIsClicked() {
    this.searchText = '';
    this.refreshClicked.emit();
    // Snackbar for Notifying Refreshing Data
    this._snackBar.open('Refreshing Data');
  }

  // this method is called on filter click
  public filterIsClicked() {
    if (!this.isFilterDisabled) {
      this.filterService.showFiller.emit();
      this.filterClicked.emit();
    }
  }

  /**
   * Perform actions on click of search box.
   * @param  {boolean} isSearchClicked: isSearchClicked
   * @param  {ClipboardEvent} event?:event passed om search click.
   */
  public onSearchBoxClick(isSearchClicked: boolean, event?: ClipboardEvent) {
    this.isSearchClicked = isSearchClicked;
    // adding padding for elements on right of buttons
    this.paddingButtonRight = { 'padding-right': this.isSearchClicked ? '21.3%' : '0%' };
    if (event) {
      const clipboardData = event.clipboardData;
      this.searchText = clipboardData.getData('text').toString();
    }
  }
}
