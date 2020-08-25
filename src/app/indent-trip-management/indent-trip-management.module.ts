/*
 * Created on Mon Dec 02 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IndentTripManagementRoutingModule } from './indent-trip-management-routing.module';
import { SharedModule } from '../shared/shared.module';
import { APP_MODULE_INITIALIZER } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { MetadataService } from './services/metadata/metadata.service';
import { IndentDashboardComponent } from './indent-dashboard/indent-dashboard.component';
import { IndentTripService } from './services/indent-trip/indent-trip.service';

export function load_metadata(metadataService: MetadataService) {
  return () => metadataService.loadMetadata();
}
@NgModule({
  imports: [
    CommonModule,
    IndentTripManagementRoutingModule,
    SharedModule
  ],
  declarations: [IndentDashboardComponent],
  entryComponents: [],
  providers: [
    IndentTripService,
    MetadataService,
    { provide: APP_MODULE_INITIALIZER, useFactory: load_metadata, deps: [MetadataService], multi: true },
  ]
})
export class IndentTripManagementModule { }
