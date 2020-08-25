import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvoiceDashboardComponent } from './invoice-dashboard/invoice-dashboard.component';
import { AccessGuard } from '../router-guards/access-guard';
import { FortigoModuleLoaderComponent } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';

const routes: Routes = [
  {
    path: '', component: FortigoModuleLoaderComponent, canActivate: [AccessGuard],
    children: [
      {
        path: '', component: InvoiceDashboardComponent, canActivate: [AccessGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceManagementRoutingModule { }
