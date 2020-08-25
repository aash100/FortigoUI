/*
 * Created on Thu Jan 02 2020
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FortigoModuleLoaderComponent } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { MediaDashboardComponent } from './media-dashboard/media-dashboard.component';
import { AccessGuard } from '../router-guards/access-guard';

const routes: Routes = [
  {
    path: '', component: FortigoModuleLoaderComponent, canActivate: [AccessGuard],
    children: [
      {
        path: '', component: MediaDashboardComponent, canActivate: [AccessGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MediaManagementRoutingModule { }
