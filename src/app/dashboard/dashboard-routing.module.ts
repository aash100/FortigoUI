import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EcAccountDashboardComponent } from './ec-account-dashboard/ec-account-dashboard.component';
import { AccessGuard } from '../router-guards/access-guard';
import { FortigoModuleLoaderComponent } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { CollectionCycleTimeReportComponent } from './collection-cycle-time-report/collection-cycle-time-report.component';
import { UnbilledRevenueDashboardComponent } from './unbilled-revenue-dashboard/unbilled-revenue-dashboard.component';

const routes: Routes = [
  {
    path: '', component: FortigoModuleLoaderComponent, canActivate: [AccessGuard],
    children: [
      { path: 'ec_account', component: EcAccountDashboardComponent, data: { title: 'EC Statement of Accounts | Dashboard' }, canActivate: [AccessGuard] },
      { path: 'collection-cycle-time-report', component: CollectionCycleTimeReportComponent, data: { title: 'Collection Cycle Time Report | Dashboard' }, canActivate: [AccessGuard] },
      { path: 'unbilled-revenue', component: UnbilledRevenueDashboardComponent, data: { title: 'Unbilled Revenue | Dashboard' }, canActivate: [AccessGuard] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
