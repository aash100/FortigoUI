/*
 * Created on Sun Oct 13 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable } from '@angular/core';
import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';

@Injectable()
export class MetadataService {

  constructor(private _appMetadataService: AppMetadataService) {
    this._appMetadataService.getModuleLoader().subscribe((data) => {
      if (data['start']) {
        this._appMetadataService.setModuleLoaderTotalCount(0);
      }
    });
  }

  // runs at module load
  public loadMetadata() {
  }
}
