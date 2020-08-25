/*
 * Created on Thu Oct 17 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessGuard } from './router-guards/access-guard';

import { LoginControlComponent } from './app-landing/login-control/login-control.component';
import { LoginControlV2Component } from './app-landing/login-control-v2/login-control-v2.component';

const routes: Routes = [
  { path: '', redirectTo: '/customer/overview', pathMatch: 'full', canActivate: [AccessGuard] },
  { path: 'landing/:id', component: LoginControlComponent },
  { path: 'landing/:module/:userId', component: LoginControlV2Component },
  { path: 'landing/:module/:userId/:mode/:tripId/:vehicleNo', component: LoginControlV2Component },
  {
    path: 'customer', loadChildren: './account-management/account-management.module#AccountManagementModule', data: { title: 'Account Management' }, canActivate: [AccessGuard]
  },
  {
    path: 'account', loadChildren: './account-management-v2/account-management-v2.module#AccountManagementV2Module', data: { title: 'Account Management' }, canActivate: [AccessGuard]
  },
  {
    path: 'invoice', loadChildren: './invoice-management/invoice-management.module#InvoiceManagementModule', data: { title: 'Invoice Management' }, canActivate: [AccessGuard]
  },
  {
    path: 'example', loadChildren: './example/example.module#ExampleModule', data: { title: 'Example' }, canActivate: [AccessGuard]
  },
  {
    path: 'contract-management', loadChildren: './contract-management/contract-management.module#ContractManagementModule', data: { title: 'Contract Management' }, canActivate: [AccessGuard]
  },
  {
    path: 'indent', loadChildren: './indent-trip-management/indent-trip-management.module#IndentTripManagementModule', data: { title: 'Indent & Trip Management' }, canActivate: [AccessGuard]
  },
  {
    path: 'collection', loadChildren: './collection-management/collection-management.module#CollectionManagementModule', data: { title: 'Trip Collections' }, canActivate: [AccessGuard]
  },
  {
    path: 'collection/:submodule', loadChildren: './collection-management/collection-management.module#CollectionManagementModule', data: { title: 'Trip Collections' }, canActivate: [AccessGuard]
  },
  {
    path: 'trip', loadChildren: './trip-management/trip-management.module#TripManagementModule', data: { title: 'Trip Invoicing' }, canActivate: [AccessGuard]
  },
  {
    path: 'user', loadChildren: './user-management/user-management.module#UserManagementModule', data: { title: 'User Management' }
  },
  {
    path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule', data: { title: 'Dashboard' }, canActivate: [AccessGuard]
  },
  {
    path: 'inventory-management', loadChildren: './inventory-management/inventory-management.module#InventoryManagementModule', data: { title: 'Inventory Management' }, canActivate: [AccessGuard]
  },
  {
    path: 'support', loadChildren: './support-management/support-management.module#SupportManagementModule', data: { title: 'Support Dashboard' }, canActivate: [AccessGuard]
  },
  {
    path: 'media', loadChildren: './media-management/media-management.module#MediaManagementModule', data: { title: 'Media Dashboard' }, canActivate: [AccessGuard]
  }
];

@NgModule({
  exports: [
    RouterModule
  ],
  imports: [
    RouterModule.forRoot(routes)
  ],
  declarations: []
})
export class AppRoutingModule { }
