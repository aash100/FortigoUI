import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccessGuard } from '../router-guards/access-guard';
import { CompanyControllerComponent } from './company-controller/company-controller.component';
import { AccountSummaryComponent } from './account-summary/account-summary.component';
import { MeetingListComponent } from './meeting/meeting-list/meeting-list.component';
import { DocUploadComponent } from './doc-upload/doc-upload.component';
import { ContactsListComponent } from './contacts/contacts-list/contacts-list.component';
import { CustomerAccountComponent } from './account/customer-account/customer-account.component';
import { TargetFormComponent } from './targets/target-form/target-form.component';
import { TargetListComponent } from './targets/target-list/target-list.component';

const routes: Routes = [
  {
    path: 'overview',
    component: CustomerAccountComponent, canActivate: [AccessGuard]
  },
  {
    path: 'target',
    component: TargetFormComponent, canActivate: [AccessGuard]
  },
  {
    path: 'target/:id',
    component: TargetFormComponent, canActivate: [AccessGuard]
  },
  {
    path: 'company', component: CompanyControllerComponent, canActivate: [AccessGuard], children: [
      {
        path: 'accsummary/:id', component: AccountSummaryComponent, children: [
          { path: '#', component: AccountSummaryComponent }
        ]
      },
      {
        path: 'meetings/:id', component: MeetingListComponent, canActivate: [AccessGuard], children: [
          { path: '#', component: MeetingListComponent }
        ]
      },
      {
        path: 'documents/:id', component: DocUploadComponent, canActivate: [AccessGuard], children: [
          { path: '#', component: DocUploadComponent }
        ]
      },
      {
        path: 'contacts/:id', component: ContactsListComponent, canActivate: [AccessGuard], children: [
          { path: '#', component: ContactsListComponent }
        ]
      },
      {
        path: 'targets/:id', component: TargetListComponent, canActivate: [AccessGuard]
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountManagementRoutingModule { }
