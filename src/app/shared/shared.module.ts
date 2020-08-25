/*
 * Created on Sun Feb 10 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { MarginToPerPipe } from './pipes/margin-to-per.pipe';
import { RsToLakhPipe } from './pipes/rs-to-lakh.pipe';
import { MaterialModule } from '../material.module';
import { TruncateTextPipe } from './pipes/truncate-text/truncate-text.pipe';
import { FortigoGridComponent } from './components/fortigo-grid/fortigo-grid.component';
import { FortigoFilterComponent } from './components/fortigo-filter/fortigo-filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FortigoInputValidatorDirective } from './directives/fortigo-safe-search.directive';
import { FortigoActionitemsComponent } from './components/fortigo-action-items/fortigo-action-items.component';
import { FortigoTabsComponent } from './components/fortigo-tabs/fortigo-tabs.component';
import { FortigoFormComponent } from './components/fortigo-form/fortigo-form.component';
import { HotkeyModule } from 'angular2-hotkeys';
import { FortigoButtonGroupComponent } from './components/fortigo-button-group/fortigo-button-group.component';
import { FortigoClearButtonDirective } from './directives/buttons/fortigo-clear-button.directive';
import { FortigoSubmitButtonDirective } from './directives/buttons/fortigo-submit-button.directive';
import { FortigoNavigationButtonDirective } from './directives/buttons/fortigo-navigation-button.directive';
import { AutofocusDirective } from './directives/autofocus.directive';
import { RouterModule } from '@angular/router';
import { FortigoModuleLoaderComponent } from './components/fortigo-module-loader/fortigo-module-loader.component';
import { FortigoSearchableSelectComponent } from './components/fortigo-searchable-select/fortigo-searchable-select.component';
import { FortigoGridBetaComponent } from './components/fortigo-grid-beta/fortigo-grid.component';
import { FortigoFilterService } from './services/fortigo-filter.service';
import { TargetFormCardComponent } from '../account-management/targets/target-form-card/target-form-card.component';
import { ReplaceStringPipe } from './pipes/replace-string.pipe';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FortigoConstant } from '../core/constants/FortigoConstant';
import { ModalTitleDirective } from './directives/modal-title.directive';
import { FortigoModalHeaderComponent } from './components/fortigo-modal-header/fortigo-modal-header.component';
import { FortigoEditGridComponent } from './components/fortigo-edit-grid/fortigo-edit-grid.component';
import { FortigoCardComponent } from './components/fortigo-card/fortigo-card.component';
import { FortigoHeadComponent } from './components/fortigo-head/fortigo-head.component';
import { FortigoDocViewerComponent } from './components/fortigo-doc-viewer/fortigo-doc-viewer.component';
import { FortigoImageCropperComponent } from './components/fortigo-image-cropper/fortigo-image-cropper.component';
import { FortigoSnackbarComponent } from './components/fortigo-snackbar/fortigo-snackbar.component';

export const MY_FORMATS = {
  parse: {
    dateInput: FortigoConstant.INDIAN_DATE_FORMAT_DATE_PICKER
  },
  display: {
    dateInput: FortigoConstant.INDIAN_DATE_FORMAT_DATE_PICKER,
    monthYearLabel: FortigoConstant.INDIAN_MONTH_YEAR_FORMAT_DATE_PICKER,
    dateA11yLabel: FortigoConstant.INDIAN_DATE_FORMAT_DATE_PICKER,
    monthYearA11yLabel: FortigoConstant.INDIAN_MONTH_YEAR_FORMAT_DATE_PICKER
  }
};

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    SidebarModule,
    FormsModule,
    ReactiveFormsModule,
    HotkeyModule,
    RouterModule
  ],
  entryComponents: [
    FortigoSnackbarComponent
  ],
  declarations: [
    MarginToPerPipe,
    RsToLakhPipe,
    TruncateTextPipe,
    FortigoGridComponent,
    FortigoFilterComponent,
    FortigoInputValidatorDirective,
    FortigoTabsComponent,
    FortigoFormComponent,
    FortigoActionitemsComponent,
    FortigoButtonGroupComponent,
    FortigoClearButtonDirective,
    FortigoSubmitButtonDirective,
    FortigoNavigationButtonDirective,
    AutofocusDirective,
    FortigoModuleLoaderComponent,
    ModalTitleDirective,
    FortigoModalHeaderComponent,
    FortigoModuleLoaderComponent,
    FortigoSearchableSelectComponent,
    FortigoGridBetaComponent,
    TargetFormCardComponent,
    ReplaceStringPipe,
    FortigoEditGridComponent,
    FortigoCardComponent,
    FortigoHeadComponent,
    FortigoDocViewerComponent,
    FortigoImageCropperComponent,
    FortigoSnackbarComponent
  ],
  exports: [
    MarginToPerPipe,
    RsToLakhPipe,
    TruncateTextPipe,
    MaterialModule,
    FortigoGridComponent,
    FortigoFilterComponent,
    FortigoInputValidatorDirective,
    FortigoTabsComponent,
    FortigoFormComponent,
    FortigoActionitemsComponent,
    FortigoClearButtonDirective,
    FortigoSubmitButtonDirective,
    FortigoNavigationButtonDirective,
    AutofocusDirective,
    FortigoModuleLoaderComponent,
    FortigoButtonGroupComponent,
    FortigoGridBetaComponent,
    TargetFormCardComponent,
    FortigoSearchableSelectComponent,
    ReplaceStringPipe,
    ModalTitleDirective,
    FortigoModalHeaderComponent,
    FortigoCardComponent,
    FortigoHeadComponent,
    FortigoDocViewerComponent,
    FortigoSnackbarComponent
  ],
  providers: [
    RsToLakhPipe,
    TruncateTextPipe,
    FortigoFilterService,
    // Date Format
    { provide: MAT_DATE_LOCALE, useValue: 'en-IN' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class SharedModule { }
