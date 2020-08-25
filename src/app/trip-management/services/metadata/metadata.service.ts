/*
 * Created on Fri Jul 05 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { TripService } from '../trip/trip.service';
import { TripManagementConstant } from '../../constants/TripManagementConstant';
import { TripInvoicingListRequestPayload } from '../../models/trip-invoicing-list-request-payload.model';
import { Util } from 'src/app/core/abstracts/util';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { StatusCount, TripInvoicingListResponsePayload } from '../../models/trip-invoicing-list-response-payload.model';
import { TripInvoicingFilterStorage } from '../../models/trip-invoicing-filter-storage';

@Injectable()
export class MetadataService {
  // To catch all the emitted events ie. tripIds for future listing of trips.
  public filterTabLoaderSubject = new Subject<any>();
  // To store payload of trip listing.
  public requestPayload = new TripInvoicingListRequestPayload();

  constructor(private _appMetadataService: AppMetadataService, private _tripService: TripService) {
    this._appMetadataService.getModuleLoader().subscribe((data) => {
      if (data['start']) {
        this._appMetadataService.setModuleLoaderTotalCount(6);
        this.loadMetadata();
      }
    });
  }

  /**
   *  runs at module load
   */
  public loadMetadata() {
    this.getTabData(this.requestPayload);
    this.getFilterData();
  }

  public getTabData(requestPayload: TripInvoicingListRequestPayload) {
    this.processData(<TripInvoicingListRequestPayload>Util.getObjectCopy(requestPayload), requestPayload.tab_filter, true);
  }

  /**
   * Method used to get all the data required for filter fields.
   */
  private getFilterData() {
    let filterData = <TripInvoicingFilterStorage>this._appMetadataService.getFilterData(TripManagementConstant.MODULE_FILTER_KEY);
    if (filterData) {
      this._tripService.tripFilter.locationList = filterData.value.locationList;
      this._tripService.tripFilter.internalCustomerList = filterData.value.internalCustomerList;
      this._tripService.tripFilter.endCustomerList = filterData.value.endCustomerList;
      this._tripService.tripFilter.invoicingStatusList = filterData.value.invoicingStatusList;
      this._tripService.tripFilter.allStateCodeList = filterData.value.allStateCodeList;

      this._appMetadataService.setModuleLoaderServiceLoaded(5);
    } else {
      filterData = new TripInvoicingFilterStorage(TripManagementConstant.MODULE_FILTER_KEY, { locationList: undefined, internalCustomerList: undefined, endCustomerList: undefined, invoicingStatusList: undefined, allStateCodeList: undefined, shipmentLocationList: undefined });

      this._tripService.getLocationList().subscribe((response: any) => {
        this._tripService.tripFilter.locationList = response;
        filterData.value.locationList = this._tripService.tripFilter.locationList;
        this._appMetadataService.setFilterData(filterData);
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });
      this._tripService.listInternalCustomerName().subscribe((response: any) => {
        this._tripService.tripFilter.internalCustomerList = response;
        filterData.value.internalCustomerList = this._tripService.tripFilter.internalCustomerList;
        this._appMetadataService.setFilterData(filterData);
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });
      this._tripService.listEndCustomerName().subscribe((response: any) => {
        this._tripService.tripFilter.endCustomerList = response;
        filterData.value.endCustomerList = this._tripService.tripFilter.endCustomerList;
        this._appMetadataService.setFilterData(filterData);
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });
      this._tripService.getInvoicngStatus().subscribe((response: any) => {
        this._tripService.tripFilter.invoicingStatusList = response;
        filterData.value.invoicingStatusList = this._tripService.tripFilter.invoicingStatusList;
        this._appMetadataService.setFilterData(filterData);
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });

      this._tripService.getAllStateCodes().subscribe((response: any) => {
        // TODO @Vinayak  Change the forEach
        const stateArray = new Array();
        if (response) {
          response.forEach((eachRow) => {
            stateArray.push({ name: eachRow });
          });
        }
        this._tripService.tripFilter.allStateCodeList = stateArray;
        filterData.value.allStateCodeList = this._tripService.tripFilter.allStateCodeList;
        this._appMetadataService.setFilterData(filterData);
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });
    }
  }

  /**
   * Method used for extracting the user view data from the data coming from server side.
   * @param  {Array<any>} rowsData : each line item (trip) data.
   * @returns Array of line items i.e. to be displayed on grid.
   */
  public dataExtractor(rowsData: Array<any>): Array<any> {
    if (rowsData && Array.isArray(rowsData)) {
      rowsData.forEach((eachData) => {
        if (eachData) {
          if (eachData.servicedBy && eachData.servicedBy.name) {
            switch (eachData.servicedBy.name.toString().trim()) {
              case '(FTAPL) Fortigo Transport Agency Pvt. Ltd':
              case FortigoConstant.FTAPL_VALUE:
                eachData.servicedBy.name = 'FTAPL';
                break;
              case 'FNLPL Net Partner':
              case FortigoConstant.FNLPL_VALUE:
                eachData.servicedBy.name = 'FNLPL';
                break;
              default:
                break;
            }
          }
          if (eachData.invoicingStatus) {
            switch (eachData.invoicingStatus.toString().trim()) {
              case 'invoiced':
                eachData.invoicingStatus = 'Generated';
                break;
              case 'partially_invoiced':
                eachData.invoicingStatus = 'Generated - Partial';
                break;
            }
          }
          if (!eachData.vehicleNumber) {
            eachData.vehicleNumber = '';
          }
        }
      });
    }
    return rowsData;
  }

  /**
   * This function storing tab data and error
   * @param  {TripInvoicingListRequestPayload} requestPayload
   * @param  {string} key
   * @param  {isDefaultTab} boolean
   * @returns void
   */
  private processData(requestPayload: TripInvoicingListRequestPayload, key: string, isDefaultTab: boolean): void {
    requestPayload.tab_filter = key;
    this._tripService.getTripInvoicingList(requestPayload).subscribe((response: TripInvoicingListResponsePayload) => {
      requestPayload.tab_filter = key;
      if (response['errorCode']) {
        this._tripService.tripInvoicingListByTab[requestPayload.tab_filter === null ? TripManagementConstant.ALL_KEY : requestPayload.tab_filter].errorMessage = response.errorMessage;
        this._tripService.tripInvoicingListByTab[requestPayload.tab_filter === null ? TripManagementConstant.ALL_KEY : requestPayload.tab_filter].errorCode = response.errorCode;
      } else {
        this._tripService.tripInvoicingListByTab[requestPayload.tab_filter === null ? TripManagementConstant.ALL_KEY : requestPayload.tab_filter].data = response.tripInvoicingList;
      }

      this.applyCountBadge(response.statusCount);
      this.filterTabLoaderSubject.next({ filter: requestPayload.tab_filter });
      if (isDefaultTab) {
        this._appMetadataService.setModuleLoaderServiceLoaded();
      }
    });
  }

  /**
   * Apply badge(total number of rows under the tab) on the tab.
   */
  private applyCountBadge(statusCountList: Array<StatusCount>) {
    Object.keys(this._tripService.tripInvoicingListByTab).forEach((eachTab) => {
      // resetting count badge
      this._tripService.tripInvoicingListByTab[eachTab].count = 0;

      if (statusCountList && Array.isArray(statusCountList) && statusCountList.length > 0) {
        statusCountList.forEach((eachStatusCount: StatusCount) => {
          if (eachStatusCount.tripInvoicingStatus === eachTab) {
            this._tripService.tripInvoicingListByTab[eachTab].count = eachStatusCount.tripCount;
          }
        });
      }
    });
  }
}
