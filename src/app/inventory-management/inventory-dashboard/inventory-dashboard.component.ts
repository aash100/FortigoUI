import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ManagerComponent } from '../manager/manager.component';
import { FortigoButton } from 'src/app/shared/abstracts/button.model';
import { MetadataService } from '../services/metadata/metadata.service';
import { Column, DataType, DataFormat } from 'src/app/shared/models/column.model';
import { GridConfiguration, GridActionIcon } from 'src/app/shared/models/grid-configuration.model';

@Component({
  selector: 'app-inventory-dashboard',
  templateUrl: './inventory-dashboard.component.html',
  styleUrls: ['./inventory-dashboard.component.css']
})
export class InventoryDashboardComponent implements OnInit {

  private globalData: any;
  private mode: string;

  public headButtonList: Array<FortigoButton>;
  public gridconfiguration: GridConfiguration = new GridConfiguration();
  public columnsData: Array<Column> = [
    { columnDef: 'extInventoryId', headerName: 'Device Id', dataType: DataType.String, css: { userSelect: 'text' } },
    { columnDef: 'deviceType', headerName: 'Inventory Type', dataType: DataType.String },
    { columnDef: 'status', headerName: 'Status', dataType: DataType.String, dataFormat: DataFormat.Title, rowToolTipTextFormat: DataFormat.Title },
    { columnDef: 'provider', headerName: 'Provider', dataType: DataType.String },
    { columnDef: 'vehicleNumber', headerName: 'Vehicle No.', dataType: DataType.String },
    { columnDef: 'owner', headerName: 'Owner Name', dataType: DataType.String },
  ];
  public rowsData: any[];

  constructor(
    private _dialog: MatDialog,
    private _metadataService: MetadataService
  ) { }

  ngOnInit() {
    this.headButtonList = [
      new FortigoButton('ADD'),
      new FortigoButton('UPDATE'),
      new FortigoButton('ASSOCIATE'),
      new FortigoButton('DISSOCIATE')
    ];

    this.setGridConfiguration();

    this.globalData = this._metadataService.details;
    this.rowsData = this._metadataService.inventories;
  }

  private setGridConfiguration() {
    this.gridconfiguration.isSortingEnabled = true;
    this.gridconfiguration.isActionIconEnabled = true;
    this.gridconfiguration.actionIconList.push(new GridActionIcon('edit', 'Edit'));
    this.gridconfiguration.actionIconList.push(new GridActionIcon('gps_fixed', 'Associate'));
    this.gridconfiguration.actionIconList.push(new GridActionIcon('gps_off', 'Dissociate'));
    this.gridconfiguration.css.tableRowHeight = '25px';
    this.gridconfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
  }

  public openModal(modeValue: string) {
    this._dialog.closeAll();
    this._dialog.open(ManagerComponent,
      {
        data: { mode: modeValue, inventories: this.rowsData, unnassociatedVehicles: this.globalData.vehicle_number },
      });
  }

  public onSearchClick(value: string) {
    if (value.trim().length === 0) {
      this.rowsData = this._metadataService.inventories;
    } else {
      this.rowsData = this._metadataService.inventories.filter(
        (eachRowData) => {
          if (eachRowData.owner && eachRowData.owner.toLowerCase().includes(value.trim().toLowerCase()) ||
            eachRowData.vehicleNumber && eachRowData.vehicleNumber.toLowerCase().includes(value.trim().toLowerCase()) ||
            eachRowData.extInventoryId && eachRowData.extInventoryId.toLowerCase().includes(value.trim().toLowerCase())) {
            return true;
          }
        }
      );
    }
  }

  public onActionClick(data: any) {

    switch (data.index) {
      case 0:
        this.mode = 'update';
        break;
      case 1:
        this.mode = 'associate';
        break;
      case 2:
        this.mode = 'dissociate';
        break;
      default:
        break;
    }

    this._dialog.closeAll();
    this._dialog.open(ManagerComponent,
      {
        data: { mode: this.mode, inventoryData: data.data },
      });
  }

  public onRefreshClick() {
    this.onSearchClick('');
  }

  public onHeaderButtonClick(value) {
    switch (value) {
      case 'ADD':
        this.openModal('add');
        break;
      case 'UPDATE':
        this.openModal('update');
        break;
      case 'ASSOCIATE':
        this.openModal('associate');
        break;
      case 'DISSOCIATE':
        this.openModal('dissociate');
        break;
      case 'FETCH':
        this.openModal('fetch');
        break;
      default:
        break;
    }
  }

}
