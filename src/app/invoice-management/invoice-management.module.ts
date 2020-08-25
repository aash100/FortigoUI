import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceManagementRoutingModule } from './invoice-management-routing.module';
import { SharedModule } from '../shared/shared.module';
import { InvoiceDashboardComponent } from './invoice-dashboard/invoice-dashboard.component';
import { InvoicingTripListComponent } from './modals/invoicing-trip-list/invoicing-trip-list.component';
import { InvoiceService } from './services/invoice/invoice.service';
import { CancelInvoiceModalComponent } from './modals/cancel-invoice-modal/cancel-invoice-modal.component';
import { FormsModule } from '@angular/forms';
import { APP_MODULE_INITIALIZER } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { MetadataService } from './services/metadata/metadata.service';
import { SubmitInvoiceDateModalComponent } from './modals/submit-invoice-date-modal/submit-invoice-date-modal.component';
import { DiscardInvoiceNumberModalComponent } from './modals/discard-invoice-number-modal/discard-invoice-number-modal.component';

export function load_metadata(metadataService: MetadataService) {
  return () => metadataService.loadMetadata();
}

@NgModule({
  imports: [
    CommonModule,
    InvoiceManagementRoutingModule,
    SharedModule,
    FormsModule
  ],
  declarations: [
    InvoiceDashboardComponent,
    InvoicingTripListComponent,
    CancelInvoiceModalComponent,
    SubmitInvoiceDateModalComponent,
    DiscardInvoiceNumberModalComponent
  ],
  entryComponents: [
    InvoicingTripListComponent,
    CancelInvoiceModalComponent,
    SubmitInvoiceDateModalComponent,
    DiscardInvoiceNumberModalComponent
  ],
  providers: [
    InvoiceService,
    MetadataService,
    { provide: APP_MODULE_INITIALIZER, useFactory: load_metadata, deps: [MetadataService], multi: true }
  ]
})
export class InvoiceManagementModule { }
