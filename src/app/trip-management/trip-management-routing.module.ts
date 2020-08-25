import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TripDashboardComponent } from './trip-dashboard/trip-dashboard.component';
import { AccessGuard } from '../router-guards/access-guard';
import { FortigoModuleLoaderComponent } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { TripDocViewerComponent } from './trip-doc-viewer/trip-doc-viewer.component';

const routes: Routes = [

  {
    path: 'trip-doc-view', component: TripDocViewerComponent, canActivate: [AccessGuard]
  },
  {
    path: '', component: FortigoModuleLoaderComponent, canActivate: [AccessGuard],
    children: [
      {
        path: '', component: TripDashboardComponent, canActivate: [AccessGuard]
      },
      {
        path: ':companyId', component: TripDashboardComponent, canActivate: [AccessGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TripManagementRoutingModule { }
