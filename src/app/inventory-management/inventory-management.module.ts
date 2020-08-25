import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryManagementRoutingModule } from './inventory-management-routing.module';
import { MetadataService } from './services/metadata/metadata.service';
import { InventoryService } from './services/inventory/inventory.service';
import { InventoryDashboardComponent } from './inventory-dashboard/inventory-dashboard.component';
import { AssociateComponent } from './associate/associate.component';
import { ManagerComponent } from './manager/manager.component';
import { APP_MODULE_INITIALIZER } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { SharedModule } from '../shared/shared.module';

export function load_metadata(metadataService: MetadataService) {
  return () => metadataService.loadMetadata();
}

@NgModule({
  imports: [
    CommonModule,
    InventoryManagementRoutingModule,
    SharedModule
  ],
  declarations: [
    InventoryDashboardComponent,
    AssociateComponent,
    ManagerComponent
  ],
  entryComponents: [
    ManagerComponent
  ],
  providers: [
    MetadataService,
    InventoryService,
    { provide: APP_MODULE_INITIALIZER, useFactory: load_metadata, deps: [MetadataService], multi: true },
  ]
})
export class InventoryManagementModule { }
