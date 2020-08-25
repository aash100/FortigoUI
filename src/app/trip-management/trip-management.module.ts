import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TripManagementRoutingModule } from './trip-management-routing.module';
import { SharedModule } from '../shared/shared.module';
import { TripDashboardComponent } from './trip-dashboard/trip-dashboard.component';
import { TripModalComponent } from './modals/trip-modal/trip-modal.component';
import { TripService } from './services/trip/trip.service';
import { FormsModule } from '@angular/forms';
import { ViewReserveInvoiceModalComponent } from './modals/view-reserve-invoice-modal/view-reserve-invoice-modal.component';
import { MetadataService } from './services/metadata/metadata.service';
import { APP_MODULE_INITIALIZER } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { UploadManualInvoiceModalComponent } from './modals/upload-manual-invoice-modal/upload-manual-invoice-modal.component';
import { InvoiceService } from '../invoice-management/services/invoice/invoice.service';
import { TripDocViewerComponent } from './trip-doc-viewer/trip-doc-viewer.component';
import { TripEcAttributeModalComponent } from './modals/trip-ec-attribute-modal/trip-ec-attribute-modal.component';
import { ViewGeneratedInvoiceModalComponent } from './modals/view-generated-invoice-modal/view-generated-invoice-modal.component';
import { TripEcAdjustmentDetailsModalComponent } from './modals/trip-ec-adjustment-details-modal/trip-ec-adjustment-details-modal.component';

export function load_metadata(metadataService: MetadataService) {
  return () => metadataService.loadMetadata();
}

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TripManagementRoutingModule,
    FormsModule
  ],
  declarations: [
    TripDashboardComponent,
    TripModalComponent,
    ViewReserveInvoiceModalComponent,
    UploadManualInvoiceModalComponent,
    TripDocViewerComponent,
    TripEcAttributeModalComponent,
    ViewGeneratedInvoiceModalComponent,
    TripEcAdjustmentDetailsModalComponent
  ],
  entryComponents: [
    TripModalComponent,
    ViewReserveInvoiceModalComponent,
    UploadManualInvoiceModalComponent,
    TripEcAttributeModalComponent,
    ViewGeneratedInvoiceModalComponent,
    TripEcAdjustmentDetailsModalComponent
  ],
  providers: [
    TripService,
    InvoiceService, // added for invoice releated modal window to open -- do not delete/remove
    MetadataService,
    { provide: APP_MODULE_INITIALIZER, useFactory: load_metadata, deps: [MetadataService], multi: true },
  ]
})
export class TripManagementModule { }
