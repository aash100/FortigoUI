import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccessGuard } from '../router-guards/access-guard';
import { SupportWorkComponent } from './support-work/support-work.component';
import { SupportDashboardComponent } from './support-dashboard/support-dashboard.component';
import { FortigoModuleLoaderComponent } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';

const routes: Routes = [
  {
    path: '', component: FortigoModuleLoaderComponent, canActivate: [AccessGuard],
    children: [
      {
        path: '', component: SupportDashboardComponent, canActivate: [AccessGuard]
      },
      {
        path: 'work/:id', component: SupportWorkComponent, canActivate: [AccessGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupportManagementRoutingModule { }
