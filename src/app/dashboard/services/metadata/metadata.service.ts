/*
 * Created on Sat Nov 09 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { EcAccountService } from '../ec-account/ec-account.service';
import { CollectionCycleTimeService } from '../collection-cycle-time/collection-cycle-time.service';
import { UnbilledRevenueService } from '../unbilled-revenue/unbilled-revenue.service';

@Injectable()
export class MetadataService {
  ecDetails: any;
  ecAccountDetails: Object;
  public summaryData = [
    {
      'MainDate': 'Starting Balance',
    },
    {
      'MainDate': 'Closing Balance',
    },
  ];

  constructor(private _appMetadataService: AppMetadataService,
    private _ecAccountService: EcAccountService,
    private _collectionCycleTimeService: CollectionCycleTimeService,
    private _unbilledRevenueService: UnbilledRevenueService
  ) {

    this._appMetadataService.getModuleLoader().subscribe((data) => {
      if (data['start']) {
        if (environment.name === 'prod') {
          this._appMetadataService.setModuleLoaderTotalCount(6);
        } else {
          this._appMetadataService.setModuleLoaderTotalCount(3);
        }
        this.loadMetadata();
      }
    });
  }

  // runs at module load
  public loadMetadata() {
    this.loadECAccountDashboard();
    this.loadCollectionDashboard();
    this.loadUnBilledRevenueDashboard();
  }

  // calls all the rest calls related to ec account stmt dashboard
  public loadECAccountDashboard() {
    this.getEndCustomerForECAccountDashboard();
  }

  public getEndCustomerForECAccountDashboard() {
    this._ecAccountService.getEndCustomer().subscribe(
      (data: any) => {
        data.forEach((e) => {
          if (e.companyname.trim().length === 0) {
            e.companyname = e.uname;
          }
        }
        );
        this.ecDetails = data;
        this._appMetadataService.setModuleLoaderServiceLoaded();
      }
    );
  }

  private loadCollectionDashboard() {
    this._collectionCycleTimeService.getFilterRMList().subscribe((data: Array<Object>) => {
      this._collectionCycleTimeService.regionalManager = data;
      this._unbilledRevenueService.regionalManager = data;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
    this._collectionCycleTimeService.getFilterCMList().subscribe((data: Array<Object>) => {
      this._collectionCycleTimeService.collectionManager = data;
      this._unbilledRevenueService.collectionManager = data;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
    this._collectionCycleTimeService.getFilterSMList().subscribe((data: Array<Object>) => {
      this._collectionCycleTimeService.tripSourcingManager = data;
      this._unbilledRevenueService.tripSourcingManager = data;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
    this._collectionCycleTimeService.getFilterCompaniesList().subscribe((data: Array<Object>) => {
      this._collectionCycleTimeService.customerName = data;
      this._unbilledRevenueService.customerName = data;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });

  }

  private loadUnBilledRevenueDashboard() {
    this._unbilledRevenueService.getFilterTripSMList().subscribe((data: Array<Object>) => {
      this._unbilledRevenueService.tripSourcingManager = data;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });

  }
}
