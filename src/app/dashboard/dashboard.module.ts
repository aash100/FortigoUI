import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { APP_MODULE_INITIALIZER } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { MetadataService } from './services/metadata/metadata.service';
import { EcAccountService } from './services/ec-account/ec-account.service';
import { EcAccountDashboardComponent } from './ec-account-dashboard/ec-account-dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { CollectionCycleTimeReportComponent } from './collection-cycle-time-report/collection-cycle-time-report.component';
import { CollectionCycleTimeService } from './services/collection-cycle-time/collection-cycle-time.service';
import { UnbilledRevenueDashboardComponent } from './unbilled-revenue-dashboard/unbilled-revenue-dashboard.component';
import { UnbilledRevenueService } from './services/unbilled-revenue/unbilled-revenue.service';

export function load_metadata(metadataService: MetadataService) {
  return () => metadataService.loadMetadata();
}

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    DashboardRoutingModule
  ],
  declarations: [
    EcAccountDashboardComponent,
    CollectionCycleTimeReportComponent,
    UnbilledRevenueDashboardComponent
  ],
  providers: [
    EcAccountService,
    MetadataService,
    CollectionCycleTimeService,
    UnbilledRevenueService,
    { provide: APP_MODULE_INITIALIZER, useFactory: load_metadata, deps: [MetadataService], multi: true, },
  ]
})
export class DashboardModule { }
