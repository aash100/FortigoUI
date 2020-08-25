import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

import Swal from 'sweetalert2';

import { TextInputField, SelectOption, SelectInputField, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { InventoryService } from '../services/inventory/inventory.service';
import { MetadataService } from '../services/metadata/metadata.service';
import { GridConfiguration, GridActionIcon } from 'src/app/shared/models/grid-configuration.model';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})

export class ManagerComponent implements OnInit {
  public fields: Array<any> = null;
  public title: string;
  public jobsGridconfiguration: GridConfiguration = new GridConfiguration();

  private vehicleNo: string;
  private selectedProvider: any;
  private deviceType: string;
  private extDeviceId: string;

  private inventories: Array<any>;
  private internalUsers: Array<any>;
  private gpsUnassocVehicle: Array<any>;
  private assocVehicles: Array<any>;

  public addInvFields: Array<any>;
  public updtInvFields: Array<any>;
  public assocInvFields: Array<any>;
  public dissocInvFields: Array<any>;
  public fetchInvFields: Array<any>;

  private providerOptions: Array<any>;
  private managerServiceStatus: Array<any>;
  private invType: Array<any>;

  constructor(
    public _inventoryService: InventoryService,
    public _loginService: LoginControlV2Service,
    private _metadataService: MetadataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.setTitle(this.data.mode);

    this.gpsUnassocVehicle = this._metadataService.gpsUnassocVehicle;
    this.internalUsers = this._metadataService.users;
    this.inventories = this._metadataService.inventories;
    this.assocVehicles = this._metadataService.assocVehicles;

    this.addInvFields = new Array<any>();
    this.updtInvFields = new Array<any>();
    this.assocInvFields = new Array<any>();
    this.dissocInvFields = new Array<any>();
    this.fetchInvFields = new Array<any>();

    this.getDropdownValues();

    this.getGridConfiguration();
    this.createFields(this.data.mode);

    if (this.data.inventoryData) {
      switch (this.data.mode) {
        case 'update':
          this.updateInventories(this.data.inventoryData);
          break;
        case 'associate':
          this.associateInventoryFields(this.data.inventoryData);
          break;
        case 'dissociate':
          this.dissociateInventoryFields(this.data.inventoryData);
          break;
        default:
          break;
      }
    }
  }

  private getGridConfiguration() {
    this.jobsGridconfiguration.isSortingEnabled = true;
    this.jobsGridconfiguration.isFilterEnabled = false;
    this.jobsGridconfiguration.isPaginaionEnabled = true;
    this.jobsGridconfiguration.isActionButtonEnabled = true;
    this.jobsGridconfiguration.actionIconList.length = 0;
    this.jobsGridconfiguration.actionIconList.push(new GridActionIcon('assignment', 'View History Runs'));
    this.jobsGridconfiguration.actionIconList.push(new GridActionIcon('directions_run', 'Execute Job'));
    this.jobsGridconfiguration.defaultPageSize = 50;
    this.jobsGridconfiguration.css.tableRowHeight = '20px';
    this.jobsGridconfiguration.isActionIconEnabled = true;
  }

  private setTitle(mode: string) {
    switch (mode.trim()) {
      case 'add':
        this.title = 'ADD INVENTORY';
        break;
      case 'update':
        this.title = 'UPDATE INVENTORY';
        break;
      case 'associate':
        this.title = 'ASSOCIATE INVENTORY';
        break;
      case 'dissociate':
        this.title = 'DISSOCIATE INVENTORY';
        break;
      case 'fetch':
        this.title = 'FETCH INVENTORY DETAILS';
        break;
      default:
        break;
    }
  }

  private createFields(mode: string) {
    this.setFields(mode);
  }

  private setFields(mode: string) {
    switch (mode.trim()) {
      case 'add':
        this.setAddInventoryFields();
        this.fields = this.addInvFields;
        break;
      case 'update':
        this.setUpdateInventoryFields();
        this.fields = this.updtInvFields;
        break;
      case 'associate':
        this.setAssociateInventoryFields();
        this.fields = this.assocInvFields;
        break;
      case 'dissociate':
        this.setDeassociateInventoryFields();
        this.fields = this.dissocInvFields;
        break;
      case 'fetch':
        this.setFetchInventoryFields();
        this.fields = this.fetchInvFields;
        break;
      default:
        break;
    }
  }

  private setAddInventoryFields() {
    const extDeviceId = new TextInputField('Device Id', 'ext_device_id');
    const invTypeOptions = new SelectOption('name', 'action', this.invType);
    const deviceType = new SelectInputField('Inventory Type', 'device_type', invTypeOptions);
    const internalUsersOptions = new SelectOption('user_name', 'user_id', this.internalUsers);
    const internalUsersSelect = new SearchableSelectInputField('4Tigo Owner Name', 'owner_id', internalUsersOptions);
    const invStatusEntityOptions = new SelectOption('name', 'action', this.managerServiceStatus);
    const invStatus = new SelectInputField('Status', 'status', invStatusEntityOptions);
    const providerEntityOptions = new SelectOption('name', 'action', this.providerOptions);
    const provider = new SelectInputField('Provider', 'provider', providerEntityOptions);
    this.addInvFields =
      [
        extDeviceId,
        deviceType,
        invStatus,
        provider,
        internalUsersSelect
      ];
  }

  private setUpdateInventoryFields() {
    const unassocVehicles = new SelectOption('vehicle_number', 'vehicle_number', this.gpsUnassocVehicle);
    const vehicleNo = new SearchableSelectInputField('Vehicle No', 'vehicle_num', unassocVehicles, undefined, false, false, ['required']);
    const invTypeOptions = new SelectOption('name', 'action', this.invType);
    const deviceType = new SelectInputField('Inventory Type', 'device_type', invTypeOptions);
    const internalUsersOptions = new SelectOption('user_name', 'user_id', this.internalUsers);
    const internalUsersSelect = new SearchableSelectInputField('4Tigo Owner Name', 'owner_id', internalUsersOptions);
    const invStatusEntityOptions = new SelectOption('name', 'action', this.managerServiceStatus);
    const invStatus = new SelectInputField('Status', 'status', invStatusEntityOptions);
    const providerEntityOptions = new SelectOption('name', 'action', this.providerOptions);
    const provider = new SelectInputField('Provider', 'provider', providerEntityOptions);
    const extDeviceIdOptions = new SelectOption('extInventoryId', 'extInventoryId', this.inventories);
    const inventoryIdOptions = new SearchableSelectInputField('Device Id', 'ext_device_id', extDeviceIdOptions);
    this.updtInvFields =
      [
        inventoryIdOptions,
        deviceType,
        invStatus,
        provider,
        vehicleNo,
        internalUsersSelect
      ];
  }

  private setAssociateInventoryFields() {
    const unassocVehicles = new SelectOption('vehicle_number', 'vehicle_number', this.gpsUnassocVehicle);
    const vehicleNo = new SearchableSelectInputField('Vehicle No', 'vehicle_num', unassocVehicles, undefined, false, false, ['required']);
    const invTypeOptions = new SelectOption('name', 'action', this.invType);
    const deviceType = new SelectInputField('Inventory Type', 'device_type', invTypeOptions);
    const providerEntityOptions = new SelectOption('name', 'action', this.providerOptions);
    const provider = new SelectInputField('Provider', 'provider', providerEntityOptions);
    const extDeviceIdOptions = new SelectOption('extInventoryId', 'extInventoryId', this.inventories);
    const inventoryIdOptions = new SearchableSelectInputField('Device Id', 'ext_device_id', extDeviceIdOptions);
    this.assocInvFields =
      [
        inventoryIdOptions,
        deviceType,
        provider,
        vehicleNo
      ];
  }

  private setDeassociateInventoryFields() {
    const invTypeOptions = new SelectOption('name', 'action', this.invType);
    const deviceType = new SelectInputField('Inventory Type', 'device_type', invTypeOptions);
    const assocVehicleOptions = new SelectOption('vehicle_number', 'vehicle_number', this.assocVehicles);
    const assocVehicleSelect = new SearchableSelectInputField('Vehicle Number', 'vehicle_num', assocVehicleOptions);
    const internalUsersOptions = new SelectOption('user_name', 'user_id', this.internalUsers);
    const internalUsersSelect = new SearchableSelectInputField('Owner Name', 'owner_id', internalUsersOptions);
    this.dissocInvFields =
      [
        deviceType,
        assocVehicleSelect,
        internalUsersSelect
      ];
  }

  private setFetchInventoryFields() {
    const unassocVehicles = new SelectOption('vehicle_number', 'vehicle_number', this.gpsUnassocVehicle);
    const vehicleNo = new SearchableSelectInputField('Vehicle No', 'vehicle_num', unassocVehicles, undefined, false, false, ['required']);
    const invTypeOptions = new SelectOption('name', 'action', this.invType);
    const deviceType = new SelectInputField('Inventory Type', 'device_type', invTypeOptions);
    this.fetchInvFields =
      [
        deviceType,
        vehicleNo
      ];
  }

  private getDropdownValues() {
    this.providerOptions = [
      { name: 'Yatis', action: 'yatis', extra: 'extra' },
      { name: 'Transglobal Geomatics', action: 'transglobal_geomatics_pvt_ltd', extra: 'extra' },
    ];

    this.managerServiceStatus = [
      { name: 'In Stock', action: 'in_stock', extra: 'extra' },
      { name: 'In Transit', action: 'in_transit', extra: 'extra' },
      { name: 'Recieved', action: 'received', extra: 'extra' },
      { name: 'Allocated', action: 'allocated', extra: 'extra' },
      { name: 'Lost', action: 'lost', extra: 'extra' },
      { name: 'Damaged', action: 'damaged', extra: 'extra' },
    ];

    this.invType = [
      { name: 'GPS', action: 'gps', extra: 'extra' },
      { name: 'FASTag', action: 'fastag', extra: 'extra' },
      { name: 'Fuel Card', action: 'fuel_card', extra: 'extra' },
    ];
  }

  public onInventorySubmit(value) {
    value['user_id'] = this._loginService.userId;

    if (this.deviceType !== null && this.deviceType !== undefined && this.deviceType !== '') {

      if (this.deviceType !== null && this.deviceType !== undefined && this.deviceType !== '') {
        value['device_type'] = this.deviceType;
      }

      if (this.extDeviceId !== null && this.extDeviceId !== undefined && this.extDeviceId !== '') {
        value['ext_device_id'] = this.extDeviceId;
      }

      if (this.selectedProvider !== null && this.selectedProvider !== undefined && this.selectedProvider !== '') {
        value['provider'] = this.selectedProvider;
      }

      if (this.vehicleNo !== null && this.vehicleNo !== undefined && this.vehicleNo !== '') {
        value['vehicle_num'] = this.vehicleNo;
      }
    }
    this._inventoryService.addInventory(value, this.data.mode).subscribe((data) => {
      this.displayResponsePopup(data);
    });

    this.deviceType = null;
    this.selectedProvider = null;
    this.vehicleNo = null;
    this.extDeviceId = null;
  }

  private displayResponsePopup(data) {
    if (data.status === 'success') {
      Swal.fire(data.message, '', 'success');
    } else {
      Swal.fire('Failed', data.message, 'error');
    }
  }

  public onSelectChange(value) {
    const selected = value.value;

    if (value.name === 'ext_device_id') {
      const selectedInventory = this.inventories.filter((eachInventory) => {
        return eachInventory.extInventoryId === selected;
      })[0];

      let vehicleNo: SearchableSelectInputField;
      let unassocVehicles: SelectOption;
      if (!selectedInventory.vehicleNumber || selectedInventory.vehicleNumber === 'NA') {
        unassocVehicles = new SelectOption('vehicle_number', 'vehicle_number', this.gpsUnassocVehicle);
        vehicleNo = new SearchableSelectInputField('Vehicle No', 'vehicle_num', unassocVehicles, undefined, false, true, ['required']);
      } else {
        const assocVehicleOptions = new SelectOption('vehicle_number', 'vehicle_number', this.assocVehicles);
        vehicleNo = new SearchableSelectInputField('Vehicle No', 'vehicle_num', assocVehicleOptions, undefined, false, true, {}, -1, 0, selectedInventory.vehicleNumber);
      }
      const extDeviceIdOptions = new SelectOption('extInventoryId', 'extInventoryId', this.inventories);
      const inventoryIdOptions = new SearchableSelectInputField('Device Id', 'ext_device_id', extDeviceIdOptions, undefined, false, false, {}, -1, 0, selected);
      const invTypeOptions = new SelectOption('name', 'action', this.invType);
      const deviceType = new SelectInputField('Inventory Type', 'device_type', invTypeOptions, undefined, false, {}, -1, 0, selectedInventory.deviceType);
      const providerEntityOptions = new SelectOption('name', 'action', this.providerOptions);
      const provider = new SelectInputField('Provider', 'provider', providerEntityOptions, undefined, false, {}, -1, 0, selectedInventory.provider);

      switch (this.data.mode) {
        case 'update':
          const invStatusEntityOptions = new SelectOption('name', 'action', this.managerServiceStatus);
          const invStatus = new SelectInputField('Status', 'status', invStatusEntityOptions, undefined, false, {}, -1, 0, selectedInventory.status);
          const internalUsersOptions = new SelectOption('user_name', 'user_id', this.internalUsers);
          const internalUsersSelect = new SearchableSelectInputField('4Tigo Owner Name', 'owner_id', internalUsersOptions);
          this.fields = [
            inventoryIdOptions,
            deviceType,
            invStatus,
            provider,
            vehicleNo,
            internalUsersSelect
          ];
          break;
        case 'associate':
          unassocVehicles = new SelectOption('vehicle_number', 'vehicle_number', this.gpsUnassocVehicle);
          vehicleNo = new SearchableSelectInputField('Vehicle No', 'vehicle_num', unassocVehicles, undefined, false, false, ['required']);
          this.fields = [
            inventoryIdOptions,
            deviceType,
            provider,
            vehicleNo
          ];
          break;
        default:
          break;
      }
    }
  }

  private updateInventories(data: any) {
    this.updateData(data);

    const invTypeOptions = new SelectOption('name', 'action', this.invType);
    const deviceType = new SelectInputField('Inventory Type', 'device_type', invTypeOptions, undefined, false, false, undefined, undefined, data['deviceType']);
    const internalUsersOptions = new SelectOption('user_name', 'user_id', this.internalUsers);
    const internalUsersSelect = new SearchableSelectInputField('4Tigo Owner Name', 'owner_id', internalUsersOptions);
    const invStatusEntityOptions = new SelectOption('name', 'action', this.managerServiceStatus);
    const invStatus = new SelectInputField('Status', 'status', invStatusEntityOptions, undefined, undefined, undefined, undefined, undefined, data['status']);
    const providerEntityOptions = new SelectOption('name', 'action', this.providerOptions);
    const provider = new SelectInputField('Provider', 'provider', providerEntityOptions, undefined, true, undefined, undefined, undefined, data['provider']);
    const extDeviceIdOptions = new SelectOption('extInventoryId', 'extInventoryId', this.inventories);
    const inventoryIdOptions = new SearchableSelectInputField('Device Id', 'ext_device_id', extDeviceIdOptions, undefined, undefined, true, {}, -1, 0, data['extInventoryId'], undefined);

    this.fields = [
      inventoryIdOptions,
      deviceType,
      invStatus,
      provider,
      internalUsersSelect
    ];
  }

  private associateInventoryFields(data: any) {
    this.updateData(data);

    const unassocVehicles = new SelectOption('vehicle_number', 'vehicle_number', this.gpsUnassocVehicle);
    const vehicleNo = new SearchableSelectInputField('Vehicle No', 'vehicle_num', unassocVehicles, undefined, false, false, ['required']);
    const invTypeOptions = new SelectOption('name', 'action', this.invType);
    const deviceType = new SelectInputField('Inventory Type', 'device_type', invTypeOptions, undefined, true, undefined, undefined, undefined, data['deviceType']);
    const providerEntityOptions = new SelectOption('name', 'action', this.providerOptions);
    const provider = new SelectInputField('Provider', 'provider', providerEntityOptions, undefined, true, undefined, undefined, undefined, data['provider']);
    const extDeviceIdOptions = new SelectOption('extInventoryId', 'extInventoryId', this.inventories);
    const inventoryIdOptions = new SearchableSelectInputField('Device Id', 'ext_device_id', extDeviceIdOptions, undefined, undefined, true, undefined, undefined, undefined, data['extInventoryId'], undefined);

    this.fields =
      [
        inventoryIdOptions,
        deviceType,
        provider,
        vehicleNo
      ];
  }

  private dissociateInventoryFields(data: any) {
    this.updateData(data);

    const invTypeOptions = new SelectOption('name', 'action', this.invType);
    const deviceType = new SelectInputField('Inventory Type', 'device_type', invTypeOptions, undefined, true, undefined, undefined, undefined, data['deviceType']);
    const assocVehicles = new SelectOption('vehicle_number', 'vehicle_number', this.assocVehicles);
    const vehicleNo = new SearchableSelectInputField('Vehicle No', 'vehicle_num', assocVehicles, undefined, undefined, true, undefined, undefined, undefined, data['vehicleNumber'], undefined);
    const internalUsersOptions = new SelectOption('user_name', 'user_id', this.internalUsers);
    const internalUsersSelect = new SearchableSelectInputField('Owner Name', 'owner_id', internalUsersOptions);

    this.fields =
      [
        deviceType,
        vehicleNo,
        internalUsersSelect
      ];
  }

  private updateData(data: any) {
    this.deviceType = data['deviceType'];
    this.selectedProvider = data['provider'];
    if (data['vehicleNumber']) {
      this.vehicleNo = data['vehicleNumber'];
    }
    if (data['extInventoryId']) {
      this.extDeviceId = data['extInventoryId'];
    }
  }
}
