/*
 * Created on Thu Nov 21 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Inject, InjectionToken } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';

export const APP_MODULE_INITIALIZER = new InjectionToken<(() => void)[]>('Metadata Loader');

@Component({
  selector: 'app-fortigo-module-loader',
  templateUrl: './fortigo-module-loader.component.html',
  styleUrls: ['./fortigo-module-loader.component.css']
})
export class FortigoModuleLoaderComponent implements OnInit {

  public isLoading: boolean;
  private totalNoOfServices: number;
  private noOfServicesLoaded: number;

  color = FortigoConstant.PROGRESS_BAR_COLOR;
  mode = FortigoConstant.PROGRESS_BAR_MODE;
  value = FortigoConstant.PROGRESS_BAR_INITIAL_VALUE;
  bufferValue = FortigoConstant.PROGRESS_BAR_INITIAL_BUFFER_VALUE;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _title: Title,
    private _appMetadataService: AppMetadataService,
    @Inject(APP_MODULE_INITIALIZER) public _moduleMetadataService: string
  ) {
    this.isLoading = true;
    this._appMetadataService.getModuleLoader().subscribe((data) => {
      if (data['total']) {
        this.clearData();
        this.totalNoOfServices = data['total'];
      } else {
        if (data['total'] === 0) {
          this.isLoading = false;
          this.value = 100;
        }
      }
      if (data['loaded']) {
        this.noOfServicesLoaded += 1;
        if (this.totalNoOfServices === this.noOfServicesLoaded) {
          this.isLoading = false;
        }
        this.value = (this.noOfServicesLoaded / this.totalNoOfServices) * 100;
      }
    });

    this._appMetadataService.startModuleLoaderService();
  }

  ngOnInit() {
    this._title.setTitle(this._activatedRoute.snapshot.data['title']);
  }

  private clearData() {
    this.totalNoOfServices = 0;
    this.noOfServicesLoaded = 0;
    this.value = 0;
  }

}
