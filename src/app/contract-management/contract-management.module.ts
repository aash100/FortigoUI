/*
 * Created on Fri Oct 18 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractManagementRoutingModule } from './contract-management-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DataValidatorComponent } from './data-validator/data-validator.component';
import { SuccessErrorDataPreviewComponent } from './data-validator/success-error-data-preview/success-error-data-preview.component';
import { ValidationDataPreviewComponent } from './data-validator/validation-data-preview/validation-data-preview.component';
import { MetadataService } from './services/metadata/metadata.service';
import { APP_MODULE_INITIALIZER } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { ValidationService } from './services/validation/validation.service';

export function load_metadata(metadataService: MetadataService) {
  return () => metadataService.loadMetadata();
}

@NgModule({
  imports: [
    CommonModule,
    ContractManagementRoutingModule,
    SharedModule
  ],
  declarations: [
    DataValidatorComponent,
    SuccessErrorDataPreviewComponent,
    ValidationDataPreviewComponent
  ],
  providers: [
    ValidationService,
    MetadataService,
    { provide: APP_MODULE_INITIALIZER, useFactory: load_metadata, deps: [MetadataService], multi: true }
  ]
})
export class ContractManagementModule { }
