/*
 * Created on Thu Sep 05 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { formatDate } from '@angular/common';

import { AccountService } from '../account/account.service';
import { MeetingService } from '../meeting/meeting.service';
import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { DocumentService } from '../document/document.service';
import { TargetService } from '../target/target.service';

@Injectable()
export class MetadataService {
  public summaryCycleTime: any;
  public companyDropdownList: any;
  public meetingType: any;
  public customerType: any;
  public legalType: any;
  public companyCategory: any;
  public industryType: any;
  public commodities: any;
  public nationalAMList: any;
  public locationType: any;
  public locationList: any;
  public userName: any;
  public routesOperatedData: any;
  public documentType: any;
  public documentStatus: any;
  public internalCompanyList: any;
  public rmList: any;
  public meetingUsers: any;
  public salesManagerList: any;
  public hierarchyCompanyIds: any;

  constructor(
    private _accountService: AccountService,
    private _meetingService: MeetingService,
    private _appMetadataService: AppMetadataService,
    private _loginControlV2Service: LoginControlV2Service,
    private _documentService: DocumentService,
    private _targetService: TargetService,
    @Inject(LOCALE_ID) private locale: string
  ) {

    this._appMetadataService.getModuleLoader().subscribe((data) => {
      if (data['start']) {
        this._appMetadataService.setModuleLoaderTotalCount(19);
        this.loadMetadata();
      }
    });
  }

  // runs at module load
  public loadMetadata() {

    this.getCycleTime();
    this.getCompanyList();
    this.getMeetingType();
    this.getCustomerType();
    this.getLegalType();
    this.getCompanyCategory();
    this.getIndustryType();
    this.getCommodities();
    this.getNationalAccountManagerList();
    this.getLocationType();
    this.getLocationList();
    // this.getRoutesOperated();
    this.getParticipantList();
    this.getHierarchyCompanyIds();
    this.getDocumentType();
    this.getDocumentStatus();
    this.getDocumentInternalCompany();
    this.getRMList();
    this.getMeetingUsers();
    this.checkReadOnlyUser();
    this.getSalesManagerList();
  }
  /**
   * Get the hierarchy compnayIds for the user
   *
   */
  private getHierarchyCompanyIds() {
    this._accountService.getCompanyIds(this._loginControlV2Service.userId).subscribe((response) => {
      const temp: JSON = response['results'];
      let companyIds = '';
      if (temp['nationalCompanyIds']) {
        companyIds += temp['nationalCompanyIds'];
      }
      if (temp['regionalCompanyIds']) {
        if (temp['nationalCompanyIds'] !== null) {
          companyIds += ',';
        }
        companyIds += temp['regionalCompanyIds'];
      }

      this.hierarchyCompanyIds = companyIds;

    });

  }

  /**
   * Get Participant data
   */
  private getParticipantList() {
    //this._meetingService.getParticipantList(conpanyId).subscribe(response=>{})
  }

  /**
   * Get data for Document internal company
   */
  private getDocumentInternalCompany() {
    this._documentService.getDocumentInternalCompany().subscribe(response => {
      this.internalCompanyList = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get data for Document Type data
   */
  private getDocumentType() {
    this._documentService.getDocumentType().subscribe(response => {
      this.documentType = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get Document status data
   */
  private getDocumentStatus() {
    this._documentService.getDocumentStatus().subscribe(response => {
      this.documentStatus = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get data for Routes operated data
   */
  private getRoutesOperated() {
    this._accountService.getRoutesOprated().subscribe(response => {
      this.routesOperatedData = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get data for cycle time data
   */
  private getCycleTime() {
    this._accountService.getSummaryCycleTime().subscribe((response) => {
      this.summaryCycleTime = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get data for Company List data
   */
  private getCompanyList() {
    this._accountService.getCompaniesList().subscribe((response) => {
      this.companyDropdownList = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get data for Meeting Type data
   */
  public getMeetingType() {
    this._meetingService.getMeetingType().subscribe((response) => {
      this.meetingType = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get data for Customer Type data
   */
  public getCustomerType() {
    this._accountService.getCustomerType().subscribe((response) => {
      this.customerType = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get data for Legal Type data
   */
  public getLegalType() {
    this._accountService.getLegalType().subscribe((response) => {
      this.legalType = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get data for Company Category data
   */
  public getCompanyCategory() {
    this._accountService.getCompanyCategory().subscribe((response) => {
      this.companyCategory = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
 * Get data for Industry Type data
 */
  public getIndustryType() {
    this._accountService.getIndustryType().subscribe((response) => {
      this.industryType = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get data for Commodities data
   */
  public getCommodities() {
    this._accountService.getCommodities().subscribe((response) => {
      this.commodities = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get data for National AccountManager List data
   */
  public getNationalAccountManagerList() {
    this._accountService.getNationalAccountManagerList().subscribe((response) => {
      this.nationalAMList = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get data for Location Type data
   */
  public getLocationType() {
    this._accountService.getLocationTypeList().subscribe((response) => {
      this.locationType = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get data for Location List data
   */
  public getLocationList() {
    this._meetingService.getLocationList().subscribe((response) => {
      this.locationList = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get data for User Name data
   */
  public getUserName() {
    this._accountService.getUserName(this._loginControlV2Service.userId).subscribe((response) => {
      this.userName = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get RM manager data
   */
  public getRMList() {
    this._accountService.getRegionalManagerList().subscribe(response => {
      this.rmList = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  /**
   * Get data got meeting users
   */
  public getMeetingUsers() {
    const end = formatDate(new Date(), 'yyyy-MM-dd', this.locale);
    const start = formatDate(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd', this.locale);
    this._meetingService.getMeetingView([this._loginControlV2Service.userId, this._loginControlV2Service.childUsers], start, end).subscribe(responce => {
      this.meetingUsers = responce;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }
  /*
   * Checks for read only user
   */
  public checkReadOnlyUser() {
    this._loginControlV2Service.checkIfUserIsReadOnly().subscribe((result: boolean) => {
      this._loginControlV2Service.isReadOnlyUser = result;
      this._appMetadataService.setModuleLoaderServiceLoaded();
      this.getRms();
    });
  }

  /**
   * Get rms for logged in user
   */
  private getRms() {
    this._accountService.listRMsForLoggedInUser({ 'loggedInUserId': this._loginControlV2Service.userId.toString(), 'isReadOnly': this._loginControlV2Service.isReadOnlyUser }).subscribe(
      (data: Array<any>) => {
        if (data && data.length > 0) {
          this._accountService.rMDetails = data.filter((eachRM) => {
            return eachRM['userAsNAM'] === false;
          });
          this._accountService.rmAsNamData = data.filter((eachRM) => {
            return eachRM['userAsNAM'] === true;
          });
          let nAMs = '';
          this._accountService.rmAsNamData.forEach((eachNAM, index) => {
            if (index === this._accountService.rmAsNamData.length - 1) {
              nAMs += eachNAM['rmAccountManagerId'];
            } else {
              nAMs += eachNAM['rmAccountManagerId'] + ',';
            }
          });
        }
        this._appMetadataService.setModuleLoaderServiceLoaded();
        // this.checkLoadingStatus();
      }
    );
  }

  /**
   * This function get the list of Sales Manager List
   */
  private getSalesManagerList() {
    this._targetService.getSalesManagerList().subscribe(response => {
      this.salesManagerList = response;
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }
}
