import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { TextInputField, SelectOption, SelectInputField, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { InventoryService } from '../services/inventory/inventory.service';
import { MetadataService } from '../services/metadata/metadata.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-associate',
  templateUrl: './associate.component.html',
  styleUrls: ['./associate.component.css']
})
export class AssociateComponent implements OnInit, AfterViewInit {

  public inputFields: any[];

  private tripId: string;
  private vehicleNo: string;
  private mode: string;
  private inventories: any;
  private providerOptions: any[];
  private associateData: any;
  private internalUsers: any[];
  private selectedProvider: any;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _loginService: LoginControlV2Service,
    private _inventoryService: InventoryService,
    private _metadataService: MetadataService
  ) { }

  ngOnInit() {
    this.inventories = this._metadataService.inventories;
    this.associateData = this._metadataService.assocVehicles;
    this.internalUsers = this._metadataService.users;
  }

  ngAfterViewInit(): void {
    // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    // Add 'implements AfterViewInit' to the class.
    this.getParamFromUrl();
  }

  // gets query params and makes related rest calls
  private getParamFromUrl() {
    this._activatedRoute.queryParamMap.subscribe((params) => {
      this.tripId = params.get('tripId');
      this.vehicleNo = params.get('vehicleNo');
      this.mode = params.get('mode');

      switch (this.mode.trim()) {
        case 'dissociate':
          this.createDissocField();
          break;
        case 'associate':
          this.createAssocField();
          break;
        default:
          break;
      }
    });
  }

  private createAssocField() {
    this.providerOptions = [
      { name: 'Yatis', action: 'yatis', extra: 'extra' },
      { name: 'Transglobal Geomatics', action: 'transglobal_geomatics_pvt_ltd', extra: 'extra' },
    ];
    const extDeviceOptions = new SelectOption('extInventoryId', 'extInventoryId', this.inventories);
    const extDeviceId = new SearchableSelectInputField('Device Id', 'ext_device_id', extDeviceOptions, undefined, false, false, {}, -1, 0, this.associateData.extInventoryId);
    const deviceType = new TextInputField('Inventory Type', 'device_type', undefined, true, {}, -1, 0, this.associateData.deviceType);
    const vehicleNo = new TextInputField('Vehicle No', 'vehicle_num', undefined, true, {}, -1, 0, this.vehicleNo);
    const providerEntityOptions = new SelectOption('name', 'action', this.providerOptions);
    const provider = new SelectInputField('Provider', 'provider', providerEntityOptions, undefined, false, {}, -1, 0, this.associateData.provider);
    const tripIdField = new TextInputField('Trip Id', 'tripId', undefined, true, {}, -1, 0, this.tripId);

    this.inputFields = [
      extDeviceId,
      deviceType,
      provider,
      vehicleNo,
      tripIdField
    ];
  }

  private createDissocField() {
    const invType = [{ name: 'GPS', action: 'gps', extra: 'extra' }];
    const invTypeOptions = new SelectOption('name', 'action', invType);
    const deviceTypeSelect = new SelectInputField('Inventory Type', 'device_type', invTypeOptions);
    const vehicleNo = new TextInputField('Vehicle No.', 'vehicle_num', undefined, true, {}, -1, 0, this.vehicleNo);
    const internalUsersOptions = new SelectOption('user_name', 'user_id', this.internalUsers);
    const internalUsersSelect = new SelectInputField('Owner Name', 'owner_id', internalUsersOptions);

    this.inputFields = [
      deviceTypeSelect,
      vehicleNo,
      internalUsersSelect
    ];
  }

  public onInventorySubmit(value) {
    value['user_id'] = this._loginService.userId;
    value['device_type'] = 'gps';
    value['trip_id'] = this.tripId;
    value['device_type'] = 'gps';
    value['provider'] = this.selectedProvider;
    value['vehicle_num'] = this.vehicleNo;

    this._inventoryService.addInventory(value, this.mode).subscribe((data) => {
      this.displayResponsePopup(data);
    });
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
    this.inventories.map((eachInventory) => {
      if (eachInventory.extInventoryId === selected && value.name === 'ext_device_id') {
        this.selectedProvider = eachInventory.provider;
        const extDeviceOptions = new SelectOption('extInventoryId', 'extInventoryId', this.inventories);
        const extDeviceId = new SearchableSelectInputField('Device Id', 'ext_device_id', extDeviceOptions, undefined, false, false, {}, -1, 0, value.value);
        const deviceType = new TextInputField('Inventory Type', 'device_type', undefined, true, {}, -1, 0, eachInventory.deviceType);
        const vehicleNo = new TextInputField('Vehicle No', 'vehicle_num', undefined, true, {}, -1, 0, this.vehicleNo);
        const providerEntityOptions = new SelectOption('name', 'action', this.providerOptions);
        const provider = new SelectInputField('Provider', 'provider', providerEntityOptions, undefined, true, {}, -1, 0, this.selectedProvider);
        const tripIdField = new TextInputField('Trip Id', 'tripId', undefined, true, {}, -1, 0, this.tripId);

        this.inputFields = [
          extDeviceId,
          deviceType,
          provider,
          vehicleNo,
          tripIdField
        ];
      }
    });
  }
}
