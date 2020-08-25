import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FortigoModuleLoaderComponent } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { AccessGuard } from '../router-guards/access-guard';

import { AssociateComponent } from './associate/associate.component';
import { InventoryDashboardComponent } from './inventory-dashboard/inventory-dashboard.component';

const routes: Routes = [{
  path: '', component: FortigoModuleLoaderComponent, canActivate: [AccessGuard],
  children: [
    { path: 'inventory', component: AssociateComponent, canActivate: [AccessGuard] },
    { path: '', component: InventoryDashboardComponent, canActivate: [AccessGuard] },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryManagementRoutingModule { }
