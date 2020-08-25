import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { Inventory } from '../../models/inventory.model';

@Injectable()
export class InventoryService {

  private baseUrl = environment.baseUrl + environment.baseInventoryManagementPath;

  constructor(private _http: HttpClient) { }

  public addInventory(inventory: any, mode: string) {
    let url: string;
    switch (mode) {
      case 'add':
        url = this.baseUrl + '/inventory/add';
        break;
      case 'update':
        url = this.baseUrl + '/inventory/update';
        break;
      case 'associate':
        url = this.baseUrl + '/inventory/associate';
        break;
      case 'dissociate':
        url = this.baseUrl + '/inventory/dissociate';
        break;
      case 'fetch':
        url = this.baseUrl + '/inventory/associatedDevice';
        break;
      default:
        break;
    }
    return this._http.post<any>(url, inventory);
  }

  public getInvInfo(inventory: Inventory) {
    return this._http.post(this.baseUrl + '/inventory/fetch/all', inventory);
  }
}
