/*
 * Created on Tue Jan 22 2019
 * Created by - 1191: Ritesh Kant
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Component, OnInit, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { MatSidenav, MatSnackBar } from '@angular/material';

import { FortigoFilterService } from '../../services/fortigo-filter.service';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { FieldGroup } from '../../models/field-group.model';
import { UserMode } from '../fortigo-form/fortigo-form.component';
import { CardConfiguration } from '../../models/card-configuration.model';
import { FormConfiguration } from '../../models/form-configuration.model';
import { FortigoSnackbarComponent } from '../fortigo-snackbar/fortigo-snackbar.component';
import { SnackbarModel } from '../../models/snackbar.model';

@Component({
  selector: 'app-fortigo-filter',
  templateUrl: './fortigo-filter.component.html',
  styleUrls: ['./fortigo-filter.component.css']
})
export class FortigoFilterComponent implements OnInit {
  // takes array of objects ( eg: TextInputField, NumberInputField) in an ordered way
  @Input() fields: Array<any>;
  // takes theme
  @Input() userMode: UserMode = 'filter-theme1';
  // controls the display/visibility of filter. This accepts boolean value.
  @Input() showFiller = false;
  // take data input i.e json data to auto-populate form
  @Input() data: any;
  // take input for font size of filter fields
  @Input() filterFontSize: number = FortigoConstant.FONT_MEDIUM;
  //  this attribute will disable by default behaviour of clear button such as removing filter notification
  @Input() disableClearClick = false;
  // for grouping of filter fields.
  @Input() groups: Array<FieldGroup>;

  // trigger event whenever clear button is clicked
  @Output() clearClicked = new EventEmitter();
  // return applied filters field
  @Output() filterSubmit = new EventEmitter<any>();
  // return on select change field
  @Output() selectChange = new EventEmitter<any>();

  // capture the reference of filter.
  @ViewChild('sidenav', { static: false }) sidenav: MatSidenav;

  // inject the fortigo filter service to pass the triggered event to fortigo filter component.
  public selectedItem: any;
  public doFormClear = false;

  public cardConfiguration: CardConfiguration;
  public formConfiguration: FormConfiguration;

  private snackbarData: SnackbarModel;

  // to show focus overlay on mouse over
  public showFocusOverlay = true;

  constructor(private filterService: FortigoFilterService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    // this method opens the filter whenever filter icon is clicked on fortigo head component
    this.filterService.showFiller.subscribe(() => {
      this.sidenav.open();
      this.showFocusOverlay = true;
    });

    if (!this.cardConfiguration) {
      this.cardConfiguration = new CardConfiguration();
      this.cardConfiguration.css.fontSize = FortigoConstant.FONT_MEDIUM + 'px';
      this.cardConfiguration.css.marginTop = '2px';
      this.cardConfiguration.css.marginBottom = '2px';
      this.cardConfiguration.css.paddingTop = '8px';
      this.cardConfiguration.css.marginBottomCard = '5px';
    }

    if (!this.formConfiguration) {
      this.formConfiguration = new FormConfiguration();
      this.formConfiguration.css.containerMaxWidth = '100%';
    }
  }

  /**
   *  this method close the filter
   */
  close() {
    this.sidenav.close();
  }

  public onSubmit(value: any) {
    this.filterSubmit.emit(value);
    this.filterService.isFilterApplied.emit(true);
    this.filterService.filterData.emit(value);
    // Snackbar for Notifying Filter Applied
    this.snackbarData = new SnackbarModel('Filter Applied');
    // REVIEW @Mayur apply after review
    // this.snackbarData.icon.name = 'filter';
    // this.snackbarData.icon.alignment = 'left';
    this._snackBar.openFromComponent(FortigoSnackbarComponent, { data: this.snackbarData });
  }

  public clear() {
    this.clearClicked.emit();
    if (!this.disableClearClick) {
      this.filterService.clearFilter.emit();
    }
    // Toaster for Notifying Filter Removed
    this._snackBar.open('Filter Removed');
    // clearing filter form
    this.doFormClear = true;
  }

  public inputChanged(value) {
    this.selectChange.emit(value);
  }

  public onMouseHover() {
    this.showFocusOverlay = false;
  }
}
