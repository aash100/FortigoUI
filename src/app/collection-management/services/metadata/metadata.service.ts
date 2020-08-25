/*
 * Created on Tue Aug 20 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */


import { Injectable } from '@angular/core';

import { ReplaySubject } from 'rxjs';

import { CollectionService } from '../collection/collection.service';
import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { CollectionManagementConstant } from '../../constants/CollectionManagementConstant';
import { CollectionListRequestPayload } from '../../models/collection-list-request-payload.model';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { Util } from 'src/app/core/abstracts/util';
import { CollectionFilterStorage } from '../../models/collection-filter-storage.model';
import { CollectionListResponsePayload, StatusCount } from '../../models/collection-list-response-payload.model';
import { RoleId } from 'src/app/core/constants/FortigoConstant';
import { CollectionFilter } from '../../models/collection-filter';

@Injectable()
export class MetadataService {
  public filterTabLoaderSubject = new ReplaySubject<any>(1);

  constructor(
    private _collectionService: CollectionService,
    private _appMetadataService: AppMetadataService,
    private _loginControlService: LoginControlV2Service
  ) {
    this._appMetadataService.getModuleLoader().subscribe((data) => {
      if (data['start']) {
        this._appMetadataService.setModuleLoaderTotalCount(7);
        this.loadMetadata();
      }
    });
  }

  /**
   * Loads metadata for collection dashboard
   */
  public loadMetadata() {
    const roleId = Number.parseInt(this._loginControlService.roleId.toString());
    if (RoleId.FORTIGO_FINANCE_ROLES.includes(roleId)) {
      this.getTabData(new CollectionListRequestPayload(CollectionManagementConstant.CLAIMED_ENCASHED_KEY, undefined, undefined, undefined, undefined, undefined), true);
    } else if (roleId === RoleId.FORTIGO_READ_ONLY_USER) {
      this.getTabData(new CollectionListRequestPayload(CollectionManagementConstant.CLAIMED_CHEQUE_RECEIVED_KEY, undefined, undefined, undefined, undefined, undefined), true);
    } else {
      this.getTabData(new CollectionListRequestPayload(CollectionManagementConstant.CLAIMED_SUSPENSE_KEY, undefined, undefined, undefined, undefined, undefined), true);
    }

    this.getFilterData();
  }

  public getTabData(requestPayload: CollectionListRequestPayload, isDefaultTab?: boolean) {
    // get collection list
    this._collectionService.getCompaniesList(this._loginControlService.userId).subscribe((eachdata: Array<any>) => {
      let collectionIds = [];

      if (eachdata && eachdata['results']) {
        collectionIds = eachdata['results'].split(',');
        this._collectionService.collectionIds = collectionIds;
      }
      requestPayload.collection_ids = collectionIds;
      this.getAllFilterTabData(requestPayload, isDefaultTab);
    });
  }

  /**
   * To fetch all filter Tab Data
   * @param CollectionListRequestPayload: collectionIds
   */
  private getAllFilterTabData(data: CollectionListRequestPayload, isDefaultTab?: boolean) {
    const currentTabKey = (<CollectionListRequestPayload>Util.getObjectCopy(data)).tab_filter;

    switch (currentTabKey) {
      case CollectionManagementConstant.CLAIMED_REQUESTED_KEY:
        this.processData(data, CollectionManagementConstant.CLAIMED_REQUESTED_KEY, isDefaultTab);
        break;
      case CollectionManagementConstant.CLAIMED_CHEQUE_RECEIVED_KEY:
        this.processData(data, CollectionManagementConstant.CLAIMED_CHEQUE_RECEIVED_KEY, isDefaultTab);
        break;
      case CollectionManagementConstant.CLAIMED_ENCASHED_KEY:
        this.processData(data, CollectionManagementConstant.CLAIMED_ENCASHED_KEY, isDefaultTab);
        break;
      case CollectionManagementConstant.CLAIMED_REJECTED_KEY:
        this.processData(data, CollectionManagementConstant.CLAIMED_REJECTED_KEY, isDefaultTab);
        break;
      case CollectionManagementConstant.CLAIMED_SUSPENSE_KEY:
        this.processData(data, CollectionManagementConstant.CLAIMED_SUSPENSE_KEY, isDefaultTab);
        break;
      case CollectionManagementConstant.APPROPRIATION_REQUEST_KEY:
        this.processData(data, CollectionManagementConstant.APPROPRIATION_REQUEST_KEY, isDefaultTab);
        break;
      case CollectionManagementConstant.APPROPRIATION_APPROPRIATED_KEY:
        this.processData(data, CollectionManagementConstant.APPROPRIATION_APPROPRIATED_KEY, isDefaultTab);
        break;
      case CollectionManagementConstant.ALL_KEY:
        this.processData(data, CollectionManagementConstant.ALL_KEY, isDefaultTab);
        break;
    }
  }

  /**
   * This function storing tab data and error
   * @param  {CollectionListRequestPayload} requestPayload
   * @param  {string} key
   * @param  {CollectionListResponsePayload} response
   * @returns void
   */
  private processData(requestPayload: CollectionListRequestPayload, key: string, isDefaultTab: boolean): void {
    requestPayload.tab_filter = key;
    this._collectionService.getCollectionList(requestPayload).subscribe((response: CollectionListResponsePayload) => {
      requestPayload.tab_filter = key;
      if (response['errorCode']) {
        this._collectionService.collectionListByTab[requestPayload.tab_filter].errorMessage = response.errorMessage;
        this._collectionService.collectionListByTab[requestPayload.tab_filter].errorCode = response.errorCode;
      } else {
        this._collectionService.collectionListByTab[requestPayload.tab_filter].data = response.collectionList;
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
    Object.keys(this._collectionService.collectionListByTab).forEach((eachTab) => {
      // resetting count badge
      this._collectionService.collectionListByTab[eachTab].count = 0;

      if (statusCountList && Array.isArray(statusCountList) && statusCountList.length > 0) {
        statusCountList.forEach((eachStatusCount: StatusCount) => {
          if (eachStatusCount.collectionStatus === eachTab) {
            this._collectionService.collectionListByTab[eachTab].count = eachStatusCount.receiptCount;
          }
        });
      }
    });
  }

  /**
   * this function call when it apply the on data.
   */
  private getFilterData() {
    let filterData = <CollectionFilterStorage>this._appMetadataService.getFilterData(CollectionManagementConstant.MODULE_FILTER_KEY);
    if (filterData) {
      this._collectionService.collectionFilter.internalCompanyList = filterData.value.internalCompanyList;
      this._collectionService.collectionFilter.ecCompanyList = filterData.value.ecCompanyList;
      this._collectionService.collectionFilter.collectionManagerList = filterData.value.collectionManagerList;
      this._collectionService.collectionFilter.bankList = filterData.value.bankList;
      this._collectionService.collectionFilter.fortigoUsers = filterData.value.fortigoUsers;
      this._collectionService.collectionFilter.companyCategory = filterData.value.companyCategory;
      this._appMetadataService.setModuleLoaderServiceLoaded(6);
    } else {
      filterData = new CollectionFilterStorage(CollectionManagementConstant.MODULE_FILTER_KEY, new CollectionFilter());
      // get internal company list
      this._collectionService.listInternalCustomerName().subscribe(
        (data: Array<any>) => {
          this._collectionService.collectionFilter.internalCompanyList = data;
          filterData.value.internalCompanyList = this._collectionService.collectionFilter.internalCompanyList;
          this._appMetadataService.setFilterData(filterData);
          this._appMetadataService.setModuleLoaderServiceLoaded();
        }
      );

      // get ec company list
      this._collectionService.listEndCustomerName().subscribe(
        (data: Array<any>) => {
          this._collectionService.collectionFilter.ecCompanyList = data;
          filterData.value.ecCompanyList = this._collectionService.collectionFilter.ecCompanyList;
          this._appMetadataService.setFilterData(filterData);
          this._appMetadataService.setModuleLoaderServiceLoaded();
        }
      );

      // get collection manager list
      this._collectionService.listCollectionManager().subscribe(
        (data: Array<any>) => {
          // format the data
          this._collectionService.collectionFilter.collectionManagerList = data.map((x) => {
            let name = Object.values(x['name']);
            name = name.filter(eachName => eachName !== null);
            const fullName = name.join(' ');
            return { 'managerId': x.id, 'managerName': fullName };
          });
          filterData.value.collectionManagerList = this._collectionService.collectionFilter.collectionManagerList;
          this._appMetadataService.setFilterData(filterData);
          this._appMetadataService.setModuleLoaderServiceLoaded();
        }
      );

      // Get company list for collection field
      this._collectionService.getCompanyCategories().subscribe((response: Array<any>) => {
        this._collectionService.collectionFilter.companyCategory = response;
        filterData.value.companyCategory = this._collectionService.collectionFilter.companyCategory;
        this._appMetadataService.setFilterData(filterData);
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });

      // Get collection bank list
      this._collectionService.getBankLists().subscribe((response: Array<any>) => {
        this._collectionService.collectionFilter.bankList = response;
        filterData.value.bankList = this._collectionService.collectionFilter.bankList;
        this._appMetadataService.setFilterData(filterData);
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });

      // Get fortigo user to create receipt.
      this._collectionService.getFortigoSubmittedByUsers().subscribe((response: Array<any>) => {
        this._collectionService.collectionFilter.fortigoUsers = response.map(user => {
          return { userName: user['name']['firstName'] + ' ' + user['name']['lastName'], userId: user['id'] };
        });
        filterData.value.fortigoUsers = this._collectionService.collectionFilter.fortigoUsers;
        this._appMetadataService.setFilterData(filterData);
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });
    }
  }
}
