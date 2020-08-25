import { Injectable } from '@angular/core';
import { SupportService } from '../support/support.service';
import { Issue } from '../../models/issue.model';
import { IssueType } from '../../models/issue-type.model';
import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';

@Injectable()
export class MetadataService {

  public issueList: Array<Issue>;
  public issueTypeList: Array<IssueType>;
  public issueTypeMap: any;
  public companyDropdownList: any;

  constructor(private _supportService: SupportService, private _appMetadataService: AppMetadataService) {

    this._appMetadataService.getModuleLoader().subscribe((data) => {
      if (data['start']) {
        this._appMetadataService.setModuleLoaderTotalCount(3);
        this.loadMetadata();
      }
    });

    this._supportService.issueListReloadEvent.subscribe((response) => {
      if (response === 'fetchData') {
        this.getIssues('internal');
      }
    });
  }

  // runs at module load
  public loadMetadata() {
    this.getIssueType();
    this.getCompanyList();
  }

  private getIssues(type?: string) {
    if (type === 'internal') {
      this._supportService.getIssues().subscribe((response) => {
        response = response['result'];

        response.forEach(eachIssue => {
          eachIssue.closedOn = this.formatDate(eachIssue.closedOn);
          eachIssue.createdOn = this.formatDate(eachIssue.createdOn);
          eachIssue.issueType = this.bindIssueType(eachIssue.issueType);
        });
        this.issueList = response;
        this._supportService.issueListReloadEvent.next('reload');
      });
    } else {
      this._supportService.getIssues().subscribe((response) => {
        response = response['result'];

        response.forEach(eachIssue => {
          eachIssue.closedOn = this.formatDate(eachIssue.closedOn);
          eachIssue.createdOn = this.formatDate(eachIssue.createdOn);
          eachIssue.issueType = this.bindIssueType(eachIssue.issueType);
        });
        this.issueList = response;
        this._appMetadataService.setModuleLoaderServiceLoaded();
      });
    }
  }

  private getIssueType() {
    this._supportService.getIssueTypes().subscribe((response) => {
      response = response['result'];

      this.issueTypeList = response;
      this.setIssueTypeMap();
      // called after issue type map is built
      this.getIssues();
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

  private setIssueTypeMap() {
    const map = new Map();
    this.issueTypeList.forEach(function (value) {
      map.set(value.id, value.description);
    });
    this.issueTypeMap = map;
  }

  private formatDate(value: Object): string {
    if (value) {
      return value['dayOfMonth'] + '-' + value['monthValue'] + '-' + value['year'] + ' ' + value['hour'] + ':' + value['minute'] + ':' + value['second'];
    } else {
      return '--';
    }
  }

  private bindIssueType(value: string): string {
    return this.issueTypeMap ? this.issueTypeMap.get(value) : undefined;
  }

  private getCompanyList() {
    this._supportService.getCompanyList().subscribe((response) => {
      this.companyDropdownList = response['result'];
      this._appMetadataService.setModuleLoaderServiceLoaded();
    });
  }

}
