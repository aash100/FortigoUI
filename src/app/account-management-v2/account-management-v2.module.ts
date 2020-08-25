/*
 * Created on Wed Feb 13 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AccountManagementV2RoutingModule } from './account-management-v2-routing.module';
import { AccountDashboardComponent } from './account-dashboard/account-dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { MetadataService } from './services/metadata/metadata.service';
import { AccountService } from './services/account/account.service';
import { AccountFormComponent } from './account/account-form/account-form.component';
import { ContactFormComponent } from './contact/contact-form/contact-form.component';
import { ContactListComponent } from './contact/contact-list/contact-list.component';
import { MeetingListComponent } from './meeting/meeting-list/meeting-list.component';
import { MeetingFormComponent } from './meeting/meeting-form/meeting-form.component';
import { DocumentFormComponent } from './document/document-form/document-form.component';
import { DocumentListComponent } from './document/document-list/document-list.component';
import { MeetingService } from './services/meeting/meeting.service';
import { DocumentService } from './services/document/document.service';
import { ContactService } from './services/contact/contact.service';
import { AccountLandingComponent } from './account-landing/account-landing.component';
import { APP_MODULE_INITIALIZER } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { TargetFormComponent } from './target/target-form/target-form.component';
import { ViewAccountComponent } from './account-landing/view-account/view-account.component';
import { TargetListComponent } from '../account-management-v2/target/target-list/target-list.component';
import { TargetService } from './services/target/target.service';
import { ManagerViewComponent } from './manager-view/manager-view.component';
import { CustomerViewComponent } from './customer-view/customer-view.component';
import { MeetingViewComponent } from './meeting-view/meeting-view.component';
import { TargetFormCardComponent } from './target/target-form-card/target-form-card.component';

export function load_metadata(metadataService: MetadataService) {
  return () => metadataService.loadMetadata();
}

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AccountManagementV2RoutingModule,
    FormsModule
  ],
  declarations: [
    AccountDashboardComponent,
    AccountFormComponent,
    ContactFormComponent,
    ContactListComponent,
    MeetingListComponent,
    MeetingFormComponent,
    DocumentFormComponent,
    DocumentListComponent,
    AccountLandingComponent,
    TargetFormComponent,
    ViewAccountComponent,
    TargetListComponent,
    ManagerViewComponent,
    CustomerViewComponent,
    MeetingViewComponent,
    TargetFormCardComponent
  ],
  entryComponents: [
    AccountFormComponent,
    ContactFormComponent,
    MeetingFormComponent,
    DocumentFormComponent
  ],
  providers: [
    MetadataService,
    AccountService,
    MeetingService,
    DocumentService,
    ContactService,
    TargetService,
    { provide: APP_MODULE_INITIALIZER, useFactory: load_metadata, deps: [MetadataService], multi: true },
  ]
})
export class AccountManagementV2Module { }
