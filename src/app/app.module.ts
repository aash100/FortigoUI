import { NgModule, APP_INITIALIZER, LOCALE_ID, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, MAT_SNACK_BAR_DEFAULT_OPTIONS, MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig, MAT_HAMMER_OPTIONS } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import localeIn from '@angular/common/locales/en-IN';
import localeInExtra from '@angular/common/locales/extra/en-IN';

import { AppRoutingModule } from './app-routing.module';
import { AccessGuard } from './router-guards/access-guard';
import { AppComponent } from './app.component';
import { LoginControlComponent } from './app-landing/login-control/login-control.component';
import { HeaderNavbarComponent } from './header-navbar/header-navbar.component';

import { SharedModule } from './shared/shared.module';

import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { CookieService } from 'ngx-cookie-service';
import { ToastrModule } from 'ngx-toastr';
import { HotkeyModule } from 'angular2-hotkeys';
import { ClipboardModule } from 'ngx-clipboard';
import { UserIdleModule } from 'angular-user-idle';

import { MeetingItemComponent } from './account-management/meeting/meeting-item/meeting-item.component';
import { ContactsItemComponent } from './account-management/contacts/contacts-item/contacts-item.component';
import { DocUploadModalComponent } from './account-management/doc-upload/doc-upload-modal/doc-upload-modal.component';
import { DocUploadEditModalComponent } from './account-management/doc-upload/doc-upload-edit-modal/doc-upload-edit-modal.component';

import { CustomerService } from './account-management/services/customer.service';
import { LoginControlService } from './app-landing/services/login-control.service';
import { AppMetadataService } from './core/services/metadata/app-metadata.service';
import { CoreModule } from './core/core.module';
import { MeetingService } from './account-management/services/meeting.service';
import { LoginControlV2Component } from './app-landing/login-control-v2/login-control-v2.component';
import { FortigoConstant } from './core/constants/FortigoConstant';
import { LoginControlV2Service } from './app-landing/services/login-control-v2/login-control-v2.service';
import { TargetModalComponent } from './account-management/targets/target-modal/target-modal.component';
import { TargetRemarksModalComponent } from './account-management/targets/target-remarks-modal/target-remarks-modal.component';

registerLocaleData(localeIn, 'en-IN', localeInExtra);

export function load_metadata(metadataService: AppMetadataService) {
  return () => metadataService.loadMetadata();
}

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
  declarations: [
    AppComponent,
    LoginControlComponent,
    LoginControlV2Component,
    HeaderNavbarComponent,
    MeetingItemComponent,
    ContactsItemComponent,
    DocUploadModalComponent,
    DocUploadEditModalComponent,
    TargetModalComponent,
    TargetRemarksModalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgbModule,
    AngularFontAwesomeModule,
    AccordionModule,
    ButtonModule,
    NgxMaterialTimepickerModule.forRoot(),
    Ng2SmartTableModule,
    NgxMaterialTimepickerModule,
    NgxMatSelectSearchModule,
    SelectDropDownModule,
    ToastrModule.forRoot({
      timeOut: 1000,
      maxOpened: 5,
      preventDuplicates: true
    }),
    HotkeyModule.forRoot(),
    CoreModule.forRoot(),
    // Optionally you can set time for `idle`, `timeout` and `ping` in seconds.
    // Default values: `idle` is 600 (10 minutes), `timeout` is 300 (5 minutes)
    // and `ping` is 120 (2 minutes).
    UserIdleModule.forRoot({
      idle: FortigoConstant.IDLE_TIME_IN_SEC,
      timeout: FortigoConstant.TIMEOUT_TIME_IN_SEC,
      ping: FortigoConstant.PING_TIME_IN_SEC
    }),
    ClipboardModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  entryComponents: [
    MeetingItemComponent,
    ContactsItemComponent,
    DocUploadModalComponent,
    DocUploadEditModalComponent,
    TargetModalComponent,
    TargetRemarksModalComponent
  ],
  providers: [
    CustomerService,
    NgbActiveModal,
    AccessGuard,
    AppMetadataService,
    CustomerService,
    MeetingService,
    LoginControlService,
    CookieService,
    LoginControlV2Service,
    // Date Format
    { provide: MAT_DATE_LOCALE, useValue: 'en-IN' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: FortigoConstant.SNACKBAR_DEFAULT_DURATION_IN_SEC * 1000 } },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    Title,
    { provide: APP_INITIALIZER, useFactory: load_metadata, deps: [AppMetadataService], multi: true },
    { provide: LOCALE_ID, useValue: 'en-IN' },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { ...new MatDialogConfig(), disableClose: true } },
    { provide: MAT_HAMMER_OPTIONS, useValue: { cssProps: { userSelect: true } } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
