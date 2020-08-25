import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountManagementRoutingModule } from './account-management-routing.module';
import { SharedModule } from '../shared/shared.module';
import { CompanyControllerComponent } from './company-controller/company-controller.component';
import { AccountSummaryComponent } from './account-summary/account-summary.component';
import { MeetingListComponent } from './meeting/meeting-list/meeting-list.component';
import { DocUploadComponent } from './doc-upload/doc-upload.component';
import { ContactsListComponent } from './contacts/contacts-list/contacts-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { SidebarModule } from 'primeng/sidebar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { CustomerAccountComponent } from './account/customer-account/customer-account.component';
import { CustomerFilterComponent } from './account/customer-filter/customer-filter.component';
import { AccountAddEditComponent } from './account/account-add-edit/account-add-edit.component';
import { MeetingFilterComponent } from './meeting/meeting-filter/meeting-filter.component';
import { ContactFilterComponent } from './contacts/contact-filter/contact-filter.component';
import { DocFilterComponent } from './doc-upload/doc-filter/doc-filter.component';
import { MeetingViewComponent } from './meeting-view/meeting-view.component';
import { TargetFormComponent } from './targets/target-form/target-form.component';
import { HierarchyRmViewComponent } from './rm-view/hierarchy-rm-view/hierarchy-rm-view.component';
import { TargetListComponent } from './targets/target-list/target-list.component';
import { TargetFilterComponent } from './targets/target-filter/target-filter.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    AccountManagementRoutingModule,
    TableModule,
    TreeTableModule,
    SidebarModule,
    OverlayPanelModule,
    Ng2SmartTableModule,
    NgxMaterialTimepickerModule,
    NgxMatSelectSearchModule,
    SelectDropDownModule,
  ],
  declarations: [
    CustomerAccountComponent,
    CompanyControllerComponent,
    AccountSummaryComponent,
    MeetingListComponent,
    DocUploadComponent,
    ContactsListComponent,
    CustomerFilterComponent,
    AccountAddEditComponent,
    MeetingFilterComponent,
    ContactFilterComponent,
    DocFilterComponent,
    MeetingViewComponent,
    TargetFormComponent,
    HierarchyRmViewComponent,
    TargetListComponent,
    TargetFilterComponent,
  ]
})
export class AccountManagementModule { }
