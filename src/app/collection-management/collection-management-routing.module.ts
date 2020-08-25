/*
 * Created on Mon Feb 04 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CollectionDashboardComponent } from './collection-dashboard/collection-dashboard.component';
import { AccessGuard } from '../router-guards/access-guard';
import { FortigoModuleLoaderComponent } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { CustomerCollectionSummaryComponent } from './customer-collection-summary/customer-collection-summary.component';

const routes: Routes = [
  { path: 'customer-detail', component: CustomerCollectionSummaryComponent, canActivate: [AccessGuard] },
  {
    path: '', component: FortigoModuleLoaderComponent, canActivate: [AccessGuard],
    children:
      [
        {
          path: '', component: CollectionDashboardComponent, canActivate: [AccessGuard]
        },
      ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectionManagementRoutingModule { }
