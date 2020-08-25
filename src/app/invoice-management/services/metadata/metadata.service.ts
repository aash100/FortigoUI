/*
 * Created on Tue Jan 07 2020
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { InvoiceService } from '../invoice/invoice.service';
import { InvoiceManagementConstant } from '../../constants/InvoiceManagementConstant';
import { InvoiceListRequestPayload } from '../../models/invoice-list-request-payload.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { InvoiceFilterStorage } from '../../models/invoice-filter-storage';
import { Util } from 'src/app/core/abstracts/util';
import { InvoiceListResponsePayload, StatusCount } from '../../models/invoice-list-response-payload.model';

@Injectable()
export class MetadataService {
  // To catch all the emitted events ie. tripIds for future listing of trips.
  public filterTabLoaderSubject = new Subject<any>();
  public requestPayload = new InvoiceListRequestPayload();

  constructor(private _appMetadataService: AppMetadataService, private _invoiceService: InvoiceService) {
    this._appMetadataService.getModuleLoader().subscribe((data) => {
      if (data['start']) {
        this._appMetadataService.setModuleLoaderTotalCount(7);
        this.loadMetadata();
      }
    });
  }

  // runs at module load
  public loadMetadata() {
    this.getTabData(this.requestPayload);
    this.getFilterData();
    this.getOtherData();
  }

  public getTabData(requestPayload: InvoiceListRequestPayload) {
    this.processData(<InvoiceListRequestPayload>Util.getObjectCopy(requestPayload), requestPayload.tab_filter, true);
  }

  /**
   * This function storing tab data and error
   * @param  {InvoiceListRequestPayload} requestPayload
   * @param  {string} key
   * @param  {isDefaultTab} boolean
   * @returns void
   */
  private processData(requestPayload: InvoiceListRequestPayload, key: string, isDefaultTab: boolean): void {
    requestPayload.tab_filter = key;
    this._invoiceService.getInvoiceList(requestPayload).subscribe((response: InvoiceListResponsePayload) => {
      requestPayload.tab_filter = key;
      if (response['errorCode']) {
        this._invoiceService.invoiceListByTab[requestPayload.tab_filter === null ? InvoiceManagementConstant.ALL_KEY : requestPayload.tab_filter].errorMessage = response.errorMessage;
        this._invoiceService.invoiceListByTab[requestPayload.tab_filter === null ? InvoiceManagementConstant.ALL_KEY : requestPayload.tab_filter].errorCode = response.errorCode;
      } else {
        this._invoiceService.invoiceListByTab[requestPayload.tab_filter === null ? InvoiceManagementConstant.ALL_KEY : requestPayload.tab_filter].data = response.invoicingList;
      }
      this.applyCountBadge(response.statusCount);
      this.filterTabLoaderSubject.next({ filter: requestPayload.tab_filter });
      if (isDefaultTab) {
        this._appMetadataService.setModuleLoaderServiceLoaded();
      }
    });
  }

  private getFilterData() {
    let filterData = <InvoiceFilterStorage>this._appMetadataService.getFilterData(InvoiceManagementConstant.MODULE_FILTER_KEY);
    const invoiceFilter = this._invoiceService.invoiceFilter;
    if (filterData) {
      invoiceFilter.locationList = filterData.value.locationList;
      invoiceFilter.internalCustomerList = filterData.value.internalCustomerList;
      invoiceFilter.invoicingStatus = filterData.value.invoicingStatus;
      invoiceFilter.collectionManagerList = filterData.value.collectionManagerList;
      invoiceFilter.endCustomerList = filterData.value.endCustomerList;
      invoiceFilter.accountManagerList = filterData.value.accountManagerList;
      this._appMetadataService.setModuleLoaderServiceLoaded(6);
    } else {
      filterData = new InvoiceFilterStorage(InvoiceManagementConstant.MODULE_FILTER_KEY, { locationList: undefined, internalCustomerList: undefined, invoicingStatus: undefined, collectionManagerList: undefined, accountManagerList: undefined, endCustomerList: undefined });
      this._invoiceService.getLocationList().subscribe((response: any) => {
        invoiceFilter.locationList = response;
        filterData.value.locationList = invoiceFilter.locationList;
        this._appMetadataService.setFilterData(filterData);
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });
      this._invoiceService.listInternalCustomerName().subscribe((response: any) => {
        invoiceFilter.internalCustomerList = response;
        filterData.value.internalCustomerList = invoiceFilter.internalCustomerList;
        this._appMetadataService.setFilterData(filterData);
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });
      this._invoiceService.getInvoicingStatus().subscribe((response: any) => {
        invoiceFilter.invoicingStatus = response;
        filterData.value.invoicingStatus = invoiceFilter.invoicingStatus;
        this._appMetadataService.setFilterData(filterData);
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });
      this._invoiceService.listCollectionManager().subscribe((response: any) => {
        invoiceFilter.collectionManagerList = response.map((eachResponse) => {
          const collectionManager = { name: '', id: '' };
          collectionManager.id = eachResponse.id;
          if (eachResponse.name) {
            if (eachResponse.name.firstName) {
              collectionManager.name += eachResponse.name.firstName;
            }
            if (eachResponse.name.middleName) {
              collectionManager.name += ' ' + eachResponse.name.middleName;
            }
            if (eachResponse.name.lastName) {
              collectionManager.name += ' ' + eachResponse.name.lastName;
            }
            return collectionManager;
          }
        });
        filterData.value.collectionManagerList = invoiceFilter.collectionManagerList;
        this._appMetadataService.setFilterData(filterData);
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });
      this._invoiceService.listEndCustomerName().subscribe((response: any) => {
        invoiceFilter.endCustomerList = response;
        filterData.value.endCustomerList = invoiceFilter.endCustomerList;
        this._appMetadataService.setFilterData(filterData);
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });
      this._invoiceService.accountManagerDetail().subscribe((response: any) => {
        invoiceFilter.accountManagerList = response;
        filterData.value.accountManagerList = invoiceFilter.accountManagerList;
        this._appMetadataService.setFilterData(filterData);
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });
    }
  }

  /**
   * Method used for extracting the user view data from the data coming from server side.
   * @param  {Array<any>} rowsData : each line item (invoice) data.
   * @returns Array of line items i.e. to be displayed on grid.
   */
  public dataExtractor(rowsData: Array<any>): Array<any> {
    if (rowsData && Array.isArray(rowsData)) {
      rowsData.forEach((eachData) => {
        if (eachData && eachData.servicedByName) {
          switch (eachData.servicedByName.toString().trim()) {
            case '(FTAPL) Fortigo Transport Agency Pvt. Ltd':
            case FortigoConstant.FTAPL_VALUE:
              eachData.servicedByName = 'FTAPL';
              break;
            case 'FNLPL Net Partner':
            case FortigoConstant.FNLPL_VALUE:
              eachData.servicedByName = 'FNLPL';
              break;
            default:
              break;
          }
        }
        if (eachData && eachData.tripType && eachData.tripType.toString().toLowerCase() === 'to be billed') {
          eachData.tripType = '';
        }
      });
    }
    return rowsData;
  }

  private getOtherData() {
    this._invoiceService.listInvoiceSubmittedBy().subscribe((response: any) => {
      if (response && Array.isArray(response)) {
        this._invoiceService.submittedByList = response.map((eachResponse) => {
          const submittedBy = { name: '', id: '' };
          submittedBy.id = eachResponse.id;
          if (eachResponse.name) {
            if (eachResponse.name.firstName) {
              submittedBy.name += eachResponse.name.firstName;
            }
            if (eachResponse.name.middleName) {
              submittedBy.name += ' ' + eachResponse.name.middleName;
            }
            if (eachResponse.name.lastName) {
              submittedBy.name += ' ' + eachResponse.name.lastName;
            }
            return submittedBy;
          }
        });
      }
    });
  }

  /**
   * Apply badge(total number of rows under the tab) on the tab.
   */
  private applyCountBadge(statusCountList: Array<StatusCount>) {
    Object.keys(this._invoiceService.invoiceListByTab).forEach((eachTab) => {
      // resetting count badge
      this._invoiceService.invoiceListByTab[eachTab].count = 0;

      if (statusCountList && Array.isArray(statusCountList) && statusCountList.length > 0) {
        statusCountList.forEach((eachStatusCount: StatusCount) => {
          if (eachStatusCount.invoiceStatus === eachTab) {
            this._invoiceService.invoiceListByTab[eachTab].count = eachStatusCount.invoiceCount;
          }
        });
      }
    });
  }
}
