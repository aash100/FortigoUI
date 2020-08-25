import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscribable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CustomerService } from './customer.service';
import { ContactService } from './contact.service';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {

  baseUrl = environment.baseUrl + environment.baseAccountManagementPath;
  baseUrlPHP = environment.baseUrlPHP;

  constructor(private _http: HttpClient,
    private _customerService: CustomerService,
    private _contactService: ContactService
  ) { }

  public loadMetadata() {
    this.getNationalManagerList();
    this.getCompaniesList();
    this.getRegionalManagerList();
    this.getSalesPerson();
  }

  private getNationalManagerList() {
    this._customerService.getNationalAccountManagerList().subscribe(
      (response: any[]) => {
        this._customerService.nationalManagerList = response;
      },
      (error) => {
        // Swal.fire('Error', error, 'error');
      });
  }
  public getMeetingType(): Subscribable<any> {
    return this._http.get(this.baseUrl + '/meeting/meetingtype');
  }
  private getCompaniesList() {
    this._contactService.getCompaniesList().subscribe(
      (data) => {
        this._customerService.companyList = data;
      }
    );
  }
  private getRegionalManagerList() {
    this._customerService.getRegionalManagerList().subscribe(
      (data) => {
        this._customerService.rmList = data;
      }
    );
  }
  // public getManagerName() {
  //   this._customerService.getNationalAccountManagerList().subscribe(
  //     (response: any[]) => {
  //       this.managerList = response;
  //       this.filteredManagers.next(this.managerList.slice());
  //       this.managerFilterCtrl.valueChanges
  //         .pipe(takeUntil(this._onDestroy))
  //         .subscribe(() => {
  //           this.filterManagers(this.selectKey);
  //         });
  //     },
  //     (error) => {
  //       // Swal.fire('Error', error, 'error');
  //     });
  // }
  private getSalesPerson() {
    /**load sales person list for dropdown */
    this._customerService.getSalesManagerList().subscribe(
      (data) => {
        this._customerService.salesCustomerList = data;
      }
    );
  }
}
