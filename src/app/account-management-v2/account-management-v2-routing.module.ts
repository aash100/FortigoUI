/*
 * Created on Wed Feb 13 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountDashboardComponent } from './account-dashboard/account-dashboard.component';
import { AccountFormComponent } from './account/account-form/account-form.component';
import { DocumentListComponent } from './document/document-list/document-list.component';
import { ContactListComponent } from './contact/contact-list/contact-list.component';
import { MeetingListComponent } from './meeting/meeting-list/meeting-list.component';
import { AccountLandingComponent } from './account-landing/account-landing.component';
import { AccessGuard } from '../router-guards/access-guard';
import { FortigoModuleLoaderComponent } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { TargetFormComponent } from './target/target-form/target-form.component';

const routes: Routes = [
  {
    path: '', component: FortigoModuleLoaderComponent, canActivate: [AccessGuard],
    children:
      [
        {
          path: '', component: AccountDashboardComponent, canActivate: [AccessGuard]
        },
        {
          path: 'target', component: TargetFormComponent, canActivate: [AccessGuard]
        },
        {
          path: 'account-summary/:companyId', component: AccountFormComponent, canActivate: [AccessGuard]
        },
        {
          path: 'documents/:companyId', component: DocumentListComponent, canActivate: [AccessGuard]
        },
        {
          path: 'meetings/:companyId', component: MeetingListComponent, canActivate: [AccessGuard]
        },
        {
          path: 'contacts/:companyId', component: ContactListComponent, canActivate: [AccessGuard]
        },
        {
          path: 'landing/:companyId', component: AccountLandingComponent, canActivate: [AccessGuard]
        }
      ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountManagementV2RoutingModule { }
