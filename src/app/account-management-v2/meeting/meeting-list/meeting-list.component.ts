/*
 * Created on Wed Sep 04 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material';

import Swal from 'sweetalert2';

import { MeetingService } from 'src/app/account-management-v2/services/meeting/meeting.service';
import { Column, DataType, DataFormat } from 'src/app/shared/models/column.model';
import { GridConfiguration, GridActionIcon } from 'src/app/shared/models/grid-configuration.model';
import { MeetingFormComponent } from '../meeting-form/meeting-form.component';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { MetadataService } from '../../services/metadata/metadata.service';
import { AccountManagementConstant } from '../../constants/AccountManagementConstant';
import { Util } from 'src/app/core/abstracts/util';

@Component({
  selector: 'app-meeting-list',
  templateUrl: './meeting-list.component.html',
  styleUrls: ['./meeting-list.component.css']
})
export class MeetingListComponent implements OnInit, OnChanges {
  private companyId: string;
  public gridConfiguration: GridConfiguration = new GridConfiguration();
  public rowsData: Array<any>;
  private globalRowsData: Array<any>;
  public columnsData: Array<Column>;

  @Input() searchText: string;

  private meetingFormModalReference: MatDialogRef<MeetingFormComponent>;

  constructor(private _activatedRoute: ActivatedRoute, private _meetingService: MeetingService, private _dialog: MatDialog, private _metadataService: MetadataService) {
    this._activatedRoute.params.subscribe((params) => {
      if (params['companyId']) {
        this.companyId = params['companyId'];
      }
    });
    this.getColumnData();
  }

  ngOnInit() {
    this.loadRowData();
    this.getGridConfiguration();
    this._meetingService.reloadMeetings.subscribe(data => {
      if (data) {
        switch (data[AccountManagementConstant.HEADER_ACTION]) {
          case AccountManagementConstant.FILTER:
            if (data['data'] != null) {
              this.loadFilteredData(data['data']);
            }
            break;
          case AccountManagementConstant.SEARCH:
            this.searchData(data['data']);
            break;
          default:
            break;

        }
      } else {
        this.loadRowData();
      }

      this.getGridConfiguration();

    });
  }

  /**
   * Search string
   * @param query searchable string
   */
  private searchData(query: any) {
    this.rowsData = this.rowsData.filter((row) => {
      if (row.locationName.toString().toLowerCase().includes(query.toString().toLowerCase()) || row.meetingTitle.toString().toLowerCase().includes(query.toString().toLowerCase()) || row.meetingStatus.toString().toLowerCase().includes(query.toString().toLowerCase()) || row.internalParticipants.toString().toLowerCase().includes(query.toString().toLowerCase()) || row.customerContacts.toString().toLowerCase().includes(query.toString().toLowerCase()) || row.postMeetingRemarks.toString().toLowerCase().includes(query.toString().toLowerCase()) || row.meetingType.toString().toLowerCase().includes(query.toString().toLowerCase())) {
        return true;
      }
    });
  }
  /**
  * Filters the row data based on the given data
  * @param  {any} filterData
  */
  private loadFilteredData(filterData: any) {
    if (filterData) {
      if (filterData.fromDate !== '') {

        const fromDate = new Date(filterData.fromDate);
        const toDate = (filterData.toDate !== '') ? new Date(filterData.toDate) : new Date();
        this.rowsData = this.globalRowsData.filter((row) => {
          const meetingStartTime = new Date(row.meetingStartTime);
          meetingStartTime.setHours(0, 0, 0, 0);
          if ((meetingStartTime >= fromDate) && (meetingStartTime <= toDate)) {
            return true;
          }
        });

      } else {
        this.loadRowData();
      }

    }
  }

  private loadRowData() {
    this._meetingService.getMeetingList(this.companyId).subscribe((response: Array<any>) => {
      this.rowsData = response;
      this.rowsData.forEach(meeting => {
        this._metadataService.meetingType.forEach(meetingType => {
          if (meeting.meetingType === meetingType.meetingTypeName) {
            meeting.meetingType = meetingType.meetingTypeAlias;
          }
        });
      });
      this.globalRowsData =  <Array<object>>Util.getObjectCopy(this.rowsData);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // ANCHOR: search is not reflecting. 
    if (this.searchText) {
      const tempData = this.rowsData;
      tempData.forEach(eachRow => {
        if ((eachRow.locationName.toLowerCase()).includes(this.searchText.toLocaleLowerCase())) {
          this.rowsData.push(eachRow);
          console.log(eachRow);
        }
      });
    }
  }

  /**
   * Add datatable configuration.
   */
  private getGridConfiguration() {
    this.gridConfiguration.isSortingEnabled = true;
    this.gridConfiguration.showLoader = false;
    this.gridConfiguration.isPaginaionEnabled = true;
    this.gridConfiguration.actionIconList.length = 0;
    this.gridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfiguration.actionIconList.push(new GridActionIcon('visibility', 'View'));
    this.gridConfiguration.actionIconList.push(new GridActionIcon('edit', 'Edit'));
    this.gridConfiguration.actionIconList.push(new GridActionIcon('delete', 'Delete'));
  }

  /**
   * Add data table properties
   */
  private getColumnData() {
    this.columnsData = [
      { columnDef: 'meetingStartTime', headerName: 'When', dataType: DataType.String, dataFormat: DataFormat.Date },
      { columnDef: 'locationName', headerName: 'Place Met', dataType: DataType.String },
      { columnDef: 'meetingTitle', headerName: 'Purpose', dataType: DataType.String },
      { columnDef: 'meetingStatus', headerName: 'Status', dataType: DataType.String },
      { columnDef: 'internalParticipants', headerName: '4TiGO Contacts', dataType: DataType.String },
      { columnDef: 'customerContacts', headerName: 'Customer Contacts', dataType: DataType.String },
      { columnDef: 'postMeetingRemarks', headerName: 'Next Steps', dataType: DataType.String },
      { columnDef: 'nextActionItemDate', headerName: 'By When', dataType: DataType.String, dataFormat: DataFormat.Date },
      { columnDef: 'meetingType', headerName: 'Meeting Type', dataType: DataType.String }
    ];
  }

  /**
   * Trigger on click delete button
   * @param  {any} data
   */
  public onActionExtraButtonClick(data: any) {
    switch (data.index) {
      case 0:
        this.meetingFormModalReference = this._dialog.open(MeetingFormComponent, {
          data: {
            mode: FortigoConstant.FORM_VIEW_MODE,
            meetingId: data.data.meetingId
          }
        });
        break;
      case 1:
        this.meetingFormModalReference = this._dialog.open(MeetingFormComponent, {
          data: {
            mode: FortigoConstant.FORM_EDIT_MODE,
            meetingId: data.data.meetingId
          }
        });
        break;
      case 2:
        this.deleteMeeting(data['data']['companyId'], data['data']['meetingId']);
        break;
      default:
        break;
    }
  }

  /**
   * Delete meeting
   * @param  {} companyId: selected meeting's comapany id
   * @param  {} meetingId: selected meeting id
   */
  private deleteMeeting(companyId: string, meetingId: string) {
    Swal.fire({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
      cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.value) {
        this._meetingService.deleteMeeting(companyId, meetingId)
          .subscribe(response => {
            if (!response['errorCode']) {
              Swal.fire('Successful', 'Deleted successfully', 'success');
            } else {
              Swal.fire('Failed', 'Failed to Delete', 'error');
            }
          });
      }
    });
  }
}
