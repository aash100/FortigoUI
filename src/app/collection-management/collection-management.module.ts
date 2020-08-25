/*
 * Created on Mon Feb 04 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollectionManagementRoutingModule } from './collection-management-routing.module';
import { CollectionDashboardComponent } from './collection-dashboard/collection-dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { CollectionModalComponent } from './modals/collection-modal/collection-modal.component';
import { CollectionService } from './services/collection/collection.service';
import { MetadataService } from './services/metadata/metadata.service';
import { APP_MODULE_INITIALIZER } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { CustomerCollectionSummaryComponent } from './customer-collection-summary/customer-collection-summary.component';

export function load_metadata(metadataService: MetadataService) {
  return () => metadataService.loadMetadata();
}
@NgModule({
  imports: [
    CommonModule,
    CollectionManagementRoutingModule,
    SharedModule
  ],
  declarations: [CollectionDashboardComponent, CollectionModalComponent, CustomerCollectionSummaryComponent],
  entryComponents: [CollectionModalComponent],
  providers: [
    CollectionService,
    MetadataService,
    { provide: APP_MODULE_INITIALIZER, useFactory: load_metadata, deps: [MetadataService], multi: true },
  ]
})
export class CollectionManagementModule { }
