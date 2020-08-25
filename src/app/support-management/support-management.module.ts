import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FormsModule } from '@angular/forms';
import { SupportWorkComponent } from './support-work/support-work.component';
import { SupportService } from './services/support/support.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { HealthCheckComponent } from './health-check/health-check.component';
import { SupportDashboardComponent } from './support-dashboard/support-dashboard.component';
import { SupportManagementRoutingModule } from './support-management-routing.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from '../http-interceptors/token-interceptor';
import { MetadataService } from './services/metadata/metadata.service';
import { APP_MODULE_INITIALIZER } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { CreateIssueComponent } from './create-issue/create-issue.component';
import { InvestigationComponent } from './investigation/investigation.component';
import { AccountService } from '../account-management-v2/services/account/account.service';
import { CreateRemarkComponent } from './create-remark/create-remark.component';
import { JobsComponent } from './jobs/jobs.component';
import { MiniStatementComponent } from './investigation/mini-statement/mini-statement.component';
import { JobTxnHistoryComponent } from './jobs/job-txn-history/job-txn-history.component';
import { SupportContactsComponent } from './support-contacts/support-contacts.component';

export function load_metadata(metadataService: MetadataService) {
  return () => metadataService.loadMetadata();
}

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    SupportManagementRoutingModule
  ],
  entryComponents: [
    CreateIssueComponent,
    CreateRemarkComponent,
    MiniStatementComponent,
    JobTxnHistoryComponent
  ],
  declarations: [
    SupportWorkComponent,
    HealthCheckComponent,
    SupportDashboardComponent,
    CreateIssueComponent,
    InvestigationComponent,
    CreateRemarkComponent,
    JobsComponent,
    MiniStatementComponent,
    JobTxnHistoryComponent,
    SupportContactsComponent
  ],
  providers: [
    MetadataService,
    SupportService,
    AccountService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    { provide: APP_MODULE_INITIALIZER, useFactory: load_metadata, deps: [MetadataService], multi: true },
  ]
})
export class SupportManagementModule { }
