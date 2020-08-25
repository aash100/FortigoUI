/*
 * Created on Thu Jan 02 2020
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MediaManagementRoutingModule } from './media-management-routing.module';
import { MediaDashboardComponent } from './media-dashboard/media-dashboard.component';
import { MediaService } from './service/media/media.service';
import { MetadataService } from './service/metadata/metadata.service';
import { APP_MODULE_INITIALIZER } from '../shared/components/fortigo-module-loader/fortigo-module-loader.component';
import { SharedModule } from '../shared/shared.module';
import { NewsBlogComponent } from './news-blog/news-blog.component';
import { MAT_DIALOG_DATA } from '@angular/material';

export function load_metadata(metadataService: MetadataService) {
  return () => metadataService.loadMetadata();
}

@NgModule({
  declarations: [
    MediaDashboardComponent,
    NewsBlogComponent
  ],
  entryComponents: [
    NewsBlogComponent
  ],
  imports: [
    CommonModule,
    MediaManagementRoutingModule,
    SharedModule
  ],
  providers: [
    MediaService,
    MetadataService,
    { provide: APP_MODULE_INITIALIZER, useFactory: load_metadata, deps: [MetadataService], multi: true },
    { provide: MAT_DIALOG_DATA, useValue: {}}
  ]
})
export class MediaManagementModule { }
