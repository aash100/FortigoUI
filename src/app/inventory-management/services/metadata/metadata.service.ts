import { Injectable } from '@angular/core';
import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { InventoryService } from '../inventory/inventory.service';
import { Inventory } from '../../models/inventory.model';

@Injectable()
export class MetadataService {

  public gpsUnassocVehicle: any;
  public users: any;
  public inventories: any;
  public details: any;
  public assocVehicles: any;

  constructor(private _inventoryService: InventoryService, private _appMetadataService: AppMetadataService) {
    this._appMetadataService.getModuleLoader().subscribe((data) => {
      if (data['start']) {
        this._appMetadataService.setModuleLoaderTotalCount(1);
        this.loadMetadata();
      }
    });
  }

  // runs at module load
  public loadMetadata() {
    this.getInvInfo();
  }

  private getInvInfo() {
    this._inventoryService.getInvInfo(new Inventory('abc', 'def', 'ghi', 'jkl')).subscribe(
      (response: any) => {
        response.vehicle_number = response.vehicle_number.filter((eachVehicle) => eachVehicle.vehicle_number !== '');
        this.gpsUnassocVehicle = response.vehicle_number;
        this.users = response.users;
        this.assocVehicles = response.assoc_vehicles;
        this.inventories = response.inventory;
        this.details = response;

        this._appMetadataService.setModuleLoaderServiceLoaded();
      });
  }
}
