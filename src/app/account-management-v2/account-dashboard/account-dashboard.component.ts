/*
 * Created on Wed Feb 27 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { Column } from 'src/app/shared/models/column.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { CellData } from 'src/app/shared/models/cell-data.model';
import { AccountService } from '../services/account/account.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { ExtraRowsData } from 'src/app/shared/models/extra-rows-data.model';
import { FortigoButton } from 'src/app/shared/abstracts/button.model';
import { AccountFormComponent } from '../account/account-form/account-form.component';
import { DocumentFormComponent } from '../document/document-form/document-form.component';
import { ContactFormComponent } from '../contact/contact-form/contact-form.component';
import { MeetingFormComponent } from '../meeting/meeting-form/meeting-form.component';
import { SelectOption, TextInputField, SearchableSelectInputField, DateInputField, SelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { MetadataService } from '../services/metadata/metadata.service';
import { DatePipe, formatDate } from '@angular/common';
import { AutoUnsubscribe } from 'src/app/shared/decorators/auto-unsubscribe.decorator';

@Component({
  selector: 'app-account-dashboard',
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.css'],
  providers: [DatePipe]
})
@AutoUnsubscribe()
export class AccountDashboardComponent implements OnInit {

  public pageTitle: string;
  public filterFields: Array<any>;

  public headButtonList: Array<FortigoButton>;

  public columnsData: Array<Column> = new Array<Column>();
  public rowsData: Array<Object>;
  public meetingDataWithUserId = new Array<Object>();
  public companyViewRowsData: Array<Object>;
  public rmViewRowsData: Array<Object>;
  public gridconfiguration: GridConfiguration;

  public selectedTabIndex: number;

  public expandedRowIndex: number;
  public extraRows: ExtraRowsData;

  private accountFormModalReference: MatDialogRef<AccountFormComponent>;
  private documentFormModalReference: MatDialogRef<DocumentFormComponent>;
  private contactFormModalReference: MatDialogRef<ContactFormComponent>;
  private meetingFormModalReference: MatDialogRef<MeetingFormComponent>;

  private searchSubscription: Subscription;

  private chunkInterval: any;
  public rMDetails: Object[];
  public namDetails: Object[];
  public smList: Set<string>;
  public sMDetails: any[];
  public smData: any[];
  public smAsNamData: any[];
  public rmSmMap: Object;
  public filterTabList: { label: string; }[];
  public refreshManagerView: boolean;
  public refreshCustomerView: boolean;
  public refreshMeetingView: boolean;
  public customerSearchText: any;
  public managerSearchText: any;
  public meetingSearchText: any;
  public customerFilterData: any;
  public managerFilterData: any;
  public meetingFilterData: any;
  public searchText = '';

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _appMetadataService: AppMetadataService,
    private _metadataService: MetadataService,
    private _accountService: AccountService,
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.

    this.pageTitle = this._activatedRoute.snapshot.data['title'];
    this.filterTabList = [{ label: 'Manager View' }, { label: 'Customer View' }, { label: 'Meeting View' }];
    this.selectedTabIndex = 0;
    this.headButtonList = [
      new FortigoButton('Account'),
      new FortigoButton('Meeting'),
      new FortigoButton('Contact'),
      new FortigoButton('Document'),
      new FortigoButton('Target')
    ];

    this.gridconfiguration = new GridConfiguration(this._appMetadataService);
    // this.gridconfiguration.isFilterTabEnabled = true;
    this.rowsData = new Array<Object>();

    this.configureFilter();
  }

  /**
   * Trigger on table click
   * @param  {number} tabIndex: tab number
   */
  public onGridFilterTabSelection(tabIndex: number) {
    this.selectedTabIndex = tabIndex;
    this.configureFilter();
  }

  /**
   * Get data for extra RM rows
   * @param  {string} columnName
   * @param  {any} rowData
   */
  private setRMViewExtraRowsData(columnName: string, rowData: any) {
    this._accountService.getRMDasboardWithCompanies(rowData.rmAccountManagerId).subscribe((response: Array<any>) => {
      const data = response.filter((eachResponse) => {
        eachResponse.rmAccountManager = '';
        return eachResponse !== null;
      });
      this.extraRows = new ExtraRowsData(rowData, data, columnName);
    });
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
   * This method set the extra rows onclick datagrid cell
   * @param  {CellData} event: Selected cell
   */
  private getExpandedRowData(event: CellData) {
    switch (this.selectedTabIndex) {
      case 1:
        // TODO for 1st tab data
        break;
      case 2:
        if (event.columnName === 'name') {
          // this.setCustomerViewExtraRowsData(event.rowData.id, event.columnName, event.rowData, event.rowExpansionLevel);
        }
    }
  }

  /**
   * This method call on click event of datagrid cell
   * @param  {} event: selected row
   */
  private openLink(event) {
    switch (this.selectedTabIndex) {
      case 1:
        if (event.columnName.toLowerCase() === 'nationalAccountManager'.toLowerCase()) {
          this._router.navigate(['account/landing', event.rowData['companyStringId']]);
        }
        break;
      case 2:
        switch (event.columnName) {
          case 'rmAccountManager':
            this.setRMViewExtraRowsData(event.columnName, event.rowData);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }

  /**
   * Trigger on click head button
   * @param  {string} data
   */
  public onHeaderButtonClick(data: string) {
    switch (data) {
      case this.headButtonList[0].placeholder:
        this.accountFormModalReference = this._dialog.open(AccountFormComponent, {
          data: {
            mode: FortigoConstant.FORM_CREATE_MODE
          }
        });
        break;
      case this.headButtonList[1].placeholder:
        this.meetingFormModalReference = this._dialog.open(MeetingFormComponent, {
          data: {
            mode: FortigoConstant.FORM_CREATE_MODE
          }
        });
        break;
      case this.headButtonList[2].placeholder:
        this.contactFormModalReference = this._dialog.open(ContactFormComponent, {
          data: {
            mode: FortigoConstant.FORM_CREATE_MODE
          }
        });
        break;
      case this.headButtonList[3].placeholder:
        this.documentFormModalReference = this._dialog.open(DocumentFormComponent, {
          data: {
            mode: FortigoConstant.FORM_CREATE_MODE
          }
        });
        break;
      case this.headButtonList[4].placeholder:
        this._router.navigate(['account/target']);
        break;
      default:
        break;
    }
  }

  /**
   * @param  {any} data
   */
  public onActionExtraButtonClick(data: any) {
    switch (data.index) {
      case 0:
        this.accountFormModalReference = this._dialog.open(AccountFormComponent, {
          data: {
            mode: FortigoConstant.FORM_EDIT_MODE,
            companyId: data.data.companyStringId
          }
        });
        break;
      case 1:
        this.deactivateAccount(data.data);
        break;
      default:
        break;
    }
  }

  /**
   * Delete account
   * @param  {any} account
   */
  private deactivateAccount(account: any) {
    Swal.fire({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
      cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.value) {
        // this.loading = true;
        this._accountService
          .deleteAccount(account.companyStringId)
          .subscribe(
            () => {
              this.clearData();
              // this.setCustomerViewRowsData();
            },
            (error) => {
              Swal.fire('Faied to delete account', '', 'error');
            },
            () => {
              // this.loading = false;
            });
      }
    });
  }

  /**
   * Clear form data
   */
  private clearData() {
    clearInterval(this.chunkInterval);
    if (this.companyViewRowsData) {
      this.companyViewRowsData.length = 0;
    }
    if (this.rmViewRowsData) {
      this.rmViewRowsData.length = 0;
    }
  }

  /**
   * Trigger on search text
   * @param  {string} searchText
   */
  public onSearchClick(searchText: string) {
    this.searchText = searchText;
    switch (this.selectedTabIndex) {
      case 0:
        this.managerSearchText = searchText;
        break;
      case 1:
        this.customerSearchText = searchText;
        break;
      case 2:
        this.meetingSearchText = searchText;
        break;
      default:
        break;
    }
  }

  /**
   * Filter confuguration
   */
  private configureFilter() {
    const accountManager = this._metadataService.nationalAMList;
    const accountManagerOption = new SelectOption('accountNationalManagerName', 'accountNationalManagerID', accountManager);
    const accountManagerName = new SearchableSelectInputField('Account Manager', 'accountManagerName', accountManagerOption);
    switch (this.selectedTabIndex) {
      case 0:
        let showDataList = [];
        showDataList = [
          { key: 'As SM', value: 'asSM' },
          { key: 'As NAM', value: 'asNAM' },
          { key: 'As Both(SM & NAM)', value: 'asBoth' }
        ];
        const showDataOption = new SelectOption('key', 'value', showDataList);
        const showData = new SelectInputField('Show Data', 'showData', showDataOption, undefined, false, {}, -1, 0,showDataList[0].value );
        this.filterFields = [accountManagerName, showData];
        break;
      case 1:
        const contactPerson = new TextInputField('Contact Person', 'contactPerson');
        this.filterFields = [contactPerson, accountManagerName];
        break;
      case 2:
        const endDate = new Date();
        const startDate = formatDate(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd', 'en');
        const salesPersonList = this._metadataService.salesManagerList;
        const salesPersonOption = new SelectOption('salesManagerName', 'salesManagerId', salesPersonList);
        const salesPerson = new SearchableSelectInputField('Sales Person', 'salesManagerId', salesPersonOption);
        const fromDate = new DateInputField('From date', 'fromDate', 6, false, undefined, undefined, undefined, new Date(startDate));
        const toDate = new DateInputField('To Date', 'toDate', 6, false, undefined, undefined, undefined, endDate);
        this.filterFields = [salesPerson, fromDate, toDate];
        break;
    }

  }

  /**
   * Refresh data table
   */
  public onRefreshClick() {
    this.searchText = '';
    this.refreshManagerView = false;
    this.refreshCustomerView = false;
    this.refreshMeetingView = false;

    switch (this.selectedTabIndex) {
      case 0:
        this.refreshManagerView = true;
        break;
      case 1:
        this.refreshCustomerView = true;
        break;
      case 2:
        this.refreshMeetingView = true;
        break;
      default:
        break;
    }
  }

  /**
   * ANCHOR : to be implemented
   * @param  {any} event
   */
  public onFilterClick(event: any) {

  }

  /**
   * Apply filter
   * @param  {} data
   */
  public onFilterSubmit(data: any) {
    switch (this.selectedTabIndex) {
      case 0:
        this.managerFilterData = data;
        break;
      case 1:
        this.customerFilterData = data;
        break;
      case 2:
        this.meetingFilterData = data;
        break;
    }
  }
}
