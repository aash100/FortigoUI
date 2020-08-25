import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Column, DataType, DataFormat } from 'src/app/shared/models/column.model';
import { GridConfiguration, GridActionIcon } from 'src/app/shared/models/grid-configuration.model';
import { MetadataService } from '../services/metadata/metadata.service';
import { CellData } from 'src/app/shared/models/cell-data.model';
import { ExtraRowsData } from 'src/app/shared/models/extra-rows-data.model';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MeetingService } from '../services/meeting/meeting.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';

@Component({
  selector: 'app-meeting-view',
  templateUrl: './meeting-view.component.html',
  styleUrls: ['./meeting-view.component.css']
})
export class MeetingViewComponent implements OnInit, OnChanges {
  @Input() isRefresh = false;
  @Input() searchText: any;
  @Input() filterData: any;
  public columnsData: Array<Column> = new Array<Column>();
  public rowsData: Array<Object>;
  public gridconfiguration: GridConfiguration = new GridConfiguration();
  public meetingDataWithUserId = new Array<Object>();
  extraRows: ExtraRowsData;

  constructor(
    private _metadataService: MetadataService,
    private _router: Router,
    private _datePipe: DatePipe,
    private _meetingServie: MeetingService,
    private _loginControlV2Service: LoginControlV2Service

  ) { }

  ngOnInit() {
    this.setMeetingViewGridConfiguration();
    this.setMeetingViewColumnsData();
    this.setMeetingViewRowsData();
  }
  /**
   * Performs search operation
   * @param  {any} searchText
   */
  private onSearch(searchText: any) {
    this.rowsData = this.rowsData.filter((row) => {
      if (row['name'].toString().toLowerCase().includes(searchText.toLowerCase()) ||
        row['companyName'].toString().toLowerCase().includes(searchText.toLowerCase()) ||
        row['meetingEndTime'].toString().toLowerCase().includes(searchText.toLowerCase()) ||
        row['meetingTitle'].toString().toLowerCase().includes(searchText.toLowerCase()) ||
        row['meetingSetupByUserName'].toString().toLowerCase().includes(searchText.toLowerCase()) ||
        row['meetingStatus'].toString().toLowerCase().includes(searchText.toLowerCase()) ||
        row['externalParticipants'].toString().toLowerCase().includes(searchText.toLowerCase()) ||
        row['meetingSetupRemarks'].toString().toLowerCase().includes(searchText.toLowerCase()) ||
        row['postMeetingRemarks'].toString().toLowerCase().includes(searchText.toLowerCase()) ||
        row['nextActionItemDate'].toString().toLowerCase().includes(searchText.toLowerCase()) ||
        row['meetingType'].toString().toLowerCase().includes(searchText.toLowerCase())) {
        return true;
      }
    });

  }
  /**
   * Filters the data based on the various criteria
   */
  private onFilterApply() {
    const salesManagerName = this._metadataService.salesManagerList.filter((salesmanager) => {
      if (salesmanager.salesManagerId === this.filterData.salesManagerId) {
        return true;
      }
    });

    if (this.filterData.salesManagerId !== '' && !this.filterData.fromDate && !this.filterData.toDate) {
      this.filterByManager(salesManagerName[0]['salesManagerName']);
    } else if (this.filterData.salesManagerId !== '' && this.filterData.fromDate && this.filterData.toDate) {
      const fromDate = this._datePipe.transform(this.filterData.fromDate, 'yyyy-MM-dd');
      const toDate = this._datePipe.transform(this.filterData.toDate, 'yyyy-MM-dd');
      this._meetingServie.getMeetingView([this._loginControlV2Service.userId, this._loginControlV2Service.childUsers], fromDate, toDate).subscribe((response) => {
        if (response) {
          this.transFormMeetingData(response);
          this.filterByManager(salesManagerName[0]['salesManagerName']);
        }
      });
    } else if (this.filterData.salesManagerId === '' && this.filterData.fromDate && this.filterData.toDate) {
      const fromDate = this._datePipe.transform(this.filterData.fromDate, 'yyyy-MM-dd');
      const toDate = this._datePipe.transform(this.filterData.toDate, 'yyyy-MM-dd');
      this._meetingServie.getMeetingView([this._loginControlV2Service.userId, this._loginControlV2Service.childUsers], fromDate, toDate).subscribe((response) => {
        if (response) {
          this.transFormMeetingData(response);
        }
      });
    }


  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isRefresh) {
      this.isRefresh = changes.isRefresh.currentValue;
      if (this.isRefresh) {
        this.setMeetingViewRowsData();
      }
    }
    if (changes.searchText) {
      this.searchText = changes.searchText.currentValue;
      this.onSearch(this.searchText);
    }
    if (changes.filterData) {
      this.filterData = changes.filterData.currentValue;
      this.onFilterApply();
    }
  }

  /**
   * Set Data table fields for Meeting view
   */
  private setMeetingViewColumnsData() {
    this.columnsData = [];
    this.columnsData = [
      { columnDef: 'name', headerName: '4TiGO Contact', dataType: DataType.String, dataFormat: DataFormat.BigText, bigTextLength: 15, action: 'data-expand-collapse', css: { horizontalAlign: 'left' }, isExpandableRow: true, calculatedSubHeaderName: '10' },
      { columnDef: 'companyName', headerName: 'Company Name', action: 'click', dataType: DataType.String, dataFormat: DataFormat.BigText, bigTextLength: 10, css: { textColor: 'blue' } },
      { columnDef: 'meetingStartTime', headerName: 'When', action: 'click', dataType: DataType.Date, dataFormat: DataFormat.DateAndTimeInSec, css: { horizontalAlign: 'left' } },
      // Target and Actual: Revenue - Annually
      { columnDef: 'locationName', headerName: 'Place Met', dataType: DataType.Number, dataFormat: DataFormat.BigText, rowToolTipTextFormat: DataFormat.Currency, css: { textColor: 'blue', horizontalAlign: 'left' }, subHeader1Colspan: 3 },
      { columnDef: 'meetingTitle', headerName: 'Purpose', dataType: DataType.Number, dataFormat: DataFormat.BigText, rowToolTipTextFormat: DataFormat.Currency, css: { textColor: 'blue', horizontalAlign: 'left' } },
      // Target and Actual: Revenue - Last Quarter
      { columnDef: 'meetingSetupByUserName', headerName: 'Meeting Setup by', dataType: DataType.Number, dataFormat: DataFormat.BigText, rowToolTipTextFormat: DataFormat.Currency, subHeader1Colspan: 0, css: { horizontalAlign: 'left' } },
      { columnDef: 'meetingStatus', headerName: 'Status', dataType: DataType.Number, dataFormat: DataFormat.BigText, rowToolTipTextFormat: DataFormat.Currency, css: { horizontalAlign: 'left' } },
      // Target and Actual: Revenue - Second Last Quarter
      { columnDef: 'externalParticipants', headerName: 'Customer Contact', dataType: DataType.String, dataFormat: DataFormat.BigText, rowToolTipTextFormat: DataFormat.Currency, subHeader1Colspan: 0, css: { horizontalAlign: 'left' } },
      { columnDef: 'meetingSetupRemarks', headerName: 'What Transpired', dataType: DataType.String, dataFormat: DataFormat.BigText, rowToolTipTextFormat: DataFormat.Currency, css: { horizontalAlign: 'left' } },
      // Target and Actual: Revenue - Monthly
      { columnDef: 'postMeetingRemarks', headerName: 'Next Step', dataType: DataType.String, dataFormat: DataFormat.BigText, rowToolTipTextFormat: DataFormat.Currency, css: { textColor: 'blue', horizontalAlign: 'left' }, subHeader1Colspan: 3 },
      { columnDef: 'nextActionItemDate', headerName: 'By When', dataType: DataType.Date, dataFormat: DataFormat.DateAndTimeInSec, rowToolTipTextFormat: DataFormat.Currency, css: { textColor: 'blue', horizontalAlign: 'left' } },
      // Target and Actual: Revenue - Last Month
      { columnDef: 'meetingType', headerName: 'Meeting Type', dataType: DataType.Number, dataFormat: DataFormat.BigText, rowToolTipTextFormat: DataFormat.Currency, subHeader1Colspan: 0, calculatedSubHeaderName: '10', css: { horizontalAlign: 'left' } },
    ];
  }
  /**
 * Trigger on click cells
 * @param  {CellData} event
 */
  public onCellClick(event: CellData) {
    switch (event.action.toLowerCase()) {
      case 'data-expand-collapse'.toLowerCase():
        if (event.isForExtraData) {
          this.getExpandedRowData(event);
        }
        break;
      case 'click'.toLowerCase():
        this.openLink(event);
        break;
      default:
        break;
    }
  }
  /**
* This method call on click event of datagrid cell
* @param  {} event: selected row
*/
  private openLink(event) {
    if (event.columnName.toLowerCase() === 'companyName'.toLowerCase()) {
      this._router.navigate(['account/landing', event.rowData['companyStringId']]);
    }
  }
  /**
     * This method set the extra rows onclick datagrid cell
     * @param  {CellData} event: Selected cell
     */
  private getExpandedRowData(event: CellData) {
    if (event.columnName === 'name') {
      this.setMeetingViewExtraRowsData(event.rowData.id, event.columnName, event.rowData, event.rowExpansionLevel);

    }

  }
  /**
   * set meeting extra row data
   * @param  {any} id
   * @param  {string} columnName
   * @param  {any} rowData
   * @param  {number} rowExpansionLevel
   */
  private setMeetingViewExtraRowsData(id: any, columnName: string, rowData: any, rowExpansionLevel: number) {
    let extraData = [];
    extraData = this.meetingDataWithUserId.filter(element => element['id'] === id);
    extraData = (extraData[0]) ? extraData[0]['meeting'] : [];
    this.extraRows = new ExtraRowsData(rowData, extraData, columnName, rowExpansionLevel);

  }
  /**
   * filters the meeting data by manager
   * @param  {any} manager
   */
  private filterByManager(manager: any) {
    this.rowsData = this.rowsData.filter((row) => {
      if (row['name'].toString().toLowerCase().includes(manager.toString().toLowerCase())) {
        return true;
      }
      return false;
    });
  }
  /**
 * Set data for Meeting view
 */
  private setMeetingViewRowsData() {
    this.transFormMeetingData(this._metadataService.meetingUsers);
  }
  /**
   * Transforms the meetingUsers as per the front view requirement
   * @param  {any} meetingUsers
   */
  private transFormMeetingData(meetingUsers: any) {
    this.rowsData = [];
    let count = 0;
    const initialRowData = meetingUsers;
    const userArray = [];
    initialRowData.forEach(meetingData => {
      meetingData.internalParticipants = meetingData.internalParticipants.trim();
      meetingData.allUserArray = meetingData.internalParticipants.split(',');
      meetingData.allUserArray.forEach(user => {
        user = user.trim();
        if (user !== '') {
          if (userArray.indexOf(user) === -1) {
            userArray.push(user);
          }
        }
      });
    });
    userArray.forEach(eachUser => {
      this.rowsData.push({ name: eachUser, id: count++ });
    });
    userArray.forEach((eachUser, index) => {
      this.meetingDataWithUserId.push({ id: index, meeting: [] });
      initialRowData.forEach(meetingData => {
        if (meetingData.allUserArray.indexOf(eachUser) !== -1) {
          this.meetingDataWithUserId[index]['meeting'].push(meetingData);
        }
      });
    });
  }

  /**
   * Set Meeting datatable configuration
   */
  private setMeetingViewGridConfiguration() {
    this.gridconfiguration.uniqueColumnName = 'name';
    this.gridconfiguration.uniqueLevel1RowExpansionColumnName = 'name';
    this.gridconfiguration.actionIconList.length = 0;
    this.gridconfiguration.actionExtraButtonLabelList.length = 0;
    this.gridconfiguration.showLoader = false;
    this.gridconfiguration.rowExpansionIcon = 'remove_circle';
    this.gridconfiguration.rowCollapseIcon = 'add_circle';
  }

}
