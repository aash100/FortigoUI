/*
 * Created on Mon Dec 02 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable } from '@angular/core';

import { IndentTripService } from '../indent-trip/indent-trip.service';
import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';

@Injectable()
export class MetadataService {

  constructor(
    private _indentTripService: IndentTripService,
    private _appMetadataService: AppMetadataService,
    private _loginControlService: LoginControlV2Service
  ) {
    this._appMetadataService.getModuleLoader().subscribe((data) => {
      if (data['start']) {
        this._appMetadataService.setModuleLoaderTotalCount(0);
        this.loadMetadata();
      }
    });
  }

  /**
   * Loads metadata for Indent dashboard
   */
  public loadMetadata() {

  }
}
