/*
 * Created on Thu Jan 02 2020
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable } from '@angular/core';
import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { MediaService } from '../media/media.service';

@Injectable()
export class MetadataService {

  private roleId: number;

  constructor(
    private _appMetadataService: AppMetadataService,
    private _mediaService: MediaService,
    private _loginControlV2Service: LoginControlV2Service
  ) {
    this.roleId = Number.parseInt(this._loginControlV2Service.roleId.toString());
    this._appMetadataService.getModuleLoader().subscribe((data) => {
      if (data['start']) {
        this._appMetadataService.setModuleLoaderTotalCount(0);
        this.loadMetadata();
      }
    });
  }

  // runs at module load
  public loadMetadata() {
    this.getTabData();
    this.getFilterData();
  }

  private getTabData() {

  }

  private getFilterData() {

  }
}
