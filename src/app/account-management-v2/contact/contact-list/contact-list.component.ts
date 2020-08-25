/*
* Created on Wed Sep 04 2019
* Created by - 1214: Sachin Sehgal
*
* Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material';

import Swal from 'sweetalert2';

import { Column, DataType, DataFormat } from 'src/app/shared/models/column.model';
import { ContactService } from 'src/app/account-management-v2/services/contact/contact.service';
import { GridConfiguration, GridActionIcon } from 'src/app/shared/models/grid-configuration.model';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { AutoUnsubscribe } from 'src/app/shared/decorators/auto-unsubscribe.decorator';
import { AccountManagementConstant } from '../../constants/AccountManagementConstant';
import { Util } from 'src/app/core/abstracts/util';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
@AutoUnsubscribe()
export class ContactListComponent implements OnInit {

  private companyId: number;
  public rowsData: Array<any>;
  public columnsData: Array<Column>;
  public gridConfiguration: GridConfiguration = new GridConfiguration();
  private globalRowsData: Array<any>;

  private contactFormModalReference: MatDialogRef<ContactFormComponent>;

  constructor(private _activatedRoute: ActivatedRoute, private _contactService: ContactService, private _dialog: MatDialog) {
    this._activatedRoute.params.subscribe((params) => {
      if (params['companyId']) {
        this.companyId = params['companyId'];
        console.log('compId', params['companyId']);
      } else {
        Swal.fire('Error');
      }
    });
    this.getColumnData();
  }

  ngOnInit() {
    this.loadRowData();
    this.getGridConfiguration();

    this._contactService.reloadContacts.subscribe(data => {
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
   *performs search for the query in the row data
   * @param  {any} query
   */
  private searchData(query: any) {
    this.rowsData = this.globalRowsData.filter((row) => {
      if (row.contactFirstName.includes(query) > 0 || row.contactLastName.includes(query) > 0 || row.contactAlias.includes(query) > 0 || row.contactMobileNumber.includes(query) > 0 || row.contactDepartment.includes(query) > 0 || row.contactOrientation.includes(query) > 0) {
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
          const createdOn = new Date(row.createdOn);
          createdOn.setHours(0, 0, 0, 0);
          if (createdOn >= fromDate && createdOn <= toDate) {
            return true;
          }
        });
      } else {
        this.loadRowData();
      }

    }
  }
  /**
   * loads the contacts data from the DB
   */
  private loadRowData() {
    this._contactService.getContactList(this.companyId).subscribe((response: Array<any>) => {
      this.rowsData = response;
      this.globalRowsData = <Array<object>>Util.getObjectCopy(this.rowsData);
    });
  }

  /**
   * Added grid Configuration
   */
  private getGridConfiguration() {
    this.gridConfiguration.isSortingEnabled = true;
    this.gridConfiguration.sortColumnName = 'createdOn';
    this.gridConfiguration.sortOrder = 'desc';
    this.gridConfiguration.isPaginaionEnabled = true;
    this.gridConfiguration.actionIconList.length = 0;
    this.gridConfiguration.showLoader = false;
    this.gridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfiguration.actionIconList.push(new GridActionIcon('visibility', 'View'));
    this.gridConfiguration.actionIconList.push(new GridActionIcon('edit', 'Edit'));
    this.gridConfiguration.actionIconList.push(new GridActionIcon('delete', 'Delete'));
  }

  /**
   * Set data table properties.
   */
  private getColumnData() {
    this.columnsData = [
      { columnDef: 'contactFirstName', headerName: 'First Name', dataType: DataType.String },
      { columnDef: 'contactLastName', headerName: 'Last Name', dataType: DataType.String },
      { columnDef: 'contactAlias', headerName: 'Contact Alias', dataType: DataType.String },
      { columnDef: 'contactMobileNumber', headerName: 'Mobile Number', dataType: DataType.String },
      { columnDef: 'contactDepartment', headerName: 'Contact Department', dataType: DataType.String },
      { columnDef: 'contactDesignation', headerName: 'Contact Designation', dataType: DataType.String },
      { columnDef: 'contactCategory', headerName: 'Contact Classification', dataType: DataType.String },
      { columnDef: 'contactOrientation', headerName: 'Contact Orientation', dataType: DataType.String },
      { columnDef: 'contactStatus', headerName: 'Contact Status', dataType: DataType.String },
      { columnDef: 'createdOn', headerName: 'Created On', dataType: DataType.Date, dataFormat: DataFormat.DateAndTime, css: { horizontalAlign: 'left' } }
    ];
  }

  /**
   * Trigger on click delete button
   * @param  {any} data
   */
  public onActionExtraButtonClick(data: any) {
    switch (data.index) {
      case 0:
        this.contactFormModalReference = this._dialog.open(ContactFormComponent, {
          data: {
            mode: FortigoConstant.FORM_VIEW_MODE,
            defaultData: data['data']
          }
        });
        break;
      case 1:
        this.contactFormModalReference = this._dialog.open(ContactFormComponent, {
          data: {
            mode: FortigoConstant.FORM_EDIT_MODE,
            defaultData: data['data']

          }

        });
        break;
      case 2:
        this.deleteContact(data['data']);
        break;
      default:
        break;
    }
  }
  /**
   * Delete contact
   * @param  string data: contact of the selected row
   */
  private deleteContact(data: string) {
    Swal.fire({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
      cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.value) {
        this._contactService.deleteContact(data)
          .subscribe(response => {
            if (!response['errorCode']) {
              Swal.fire('Successful', 'Deleted successfully', 'success');
              this._contactService.reloadContacts.next(response);
            } else {
              Swal.fire('Failed', 'Failed to Delete', 'error');
            }
          });
      }
    });
  }

}
