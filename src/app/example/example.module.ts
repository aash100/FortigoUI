/*
 * Created on Sun Oct 13 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExampleRoutingModule } from './example-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MetadataService } from './services/metadata/metadata.service';
import { APP_MODULE_INITIALIZER } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';

export function load_metadata(metadataService: MetadataService) {
  return () => metadataService.loadMetadata();
}

@NgModule({
  imports: [
    CommonModule,
    ExampleRoutingModule,
    SharedModule
  ],
  declarations: [
  ],
  providers: [
    MetadataService,
    { provide: APP_MODULE_INITIALIZER, useFactory: load_metadata, deps: [MetadataService], multi: true }
  ]
})
export class ExampleModule { }
