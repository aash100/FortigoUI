/*
 * Created on Tue Feb 19 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'src/environments/environment';

import { FortigoURL } from '../../constants/FotigoURL';
import { FortigoConstant } from '../../constants/FortigoConstant';
import { Icons } from '../../models/icon.model';
import { Subject, Observable } from 'rxjs';
import { FilterStorage } from '../../models/filter-storage.model';

const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable()
export class AppMetadataService {

  private baseUrl = environment.baseUrl;
  private errorMessage = 'Metadata Service Failure: ';

  private moduleLoaderSubject = new Subject<any>();
  private asyncMessageSubject = new Subject<any>();

  public iconList: Object;
  public username: Object;

  constructor(private http: HttpClient) {
    this.iconList = new Object();
  }

  // runs by APP_INITIALIZER, loaded at APP Start-up
  public loadMetadata() {
    this.getIconList();
  }

  private isFilterStored(moduleName: string): boolean {
    if (localStorage.getItem(moduleName)) {
      return true;
    } else {
      return false;
    }
  }

  private isFilterDataExpired(filterData: FilterStorage): boolean {
    if (new Date().getMilliseconds() - new Date(filterData.time).getMilliseconds() > FortigoConstant.FILTER_DEFAULT_EXPIRY_IN_HOUR * 3600000) {
      return true;
    } else {
      return false;
    }
  }

  private invalidateFilterData(moduleName: string) {
    localStorage.removeItem(moduleName);
  }

  public setFilterData(filterData: FilterStorage) {
    localStorage.setItem(filterData.name, btoa(JSON.stringify(filterData)));
  }

  public getFilterData(moduleName: string): FilterStorage {
    if (this.isFilterStored(moduleName)) {
      const filter = <FilterStorage>JSON.parse(atob(localStorage.getItem(moduleName)));
      if (!this.isFilterDataExpired(filter)) {
        return filter;
      } else {
        this.invalidateFilterData(moduleName);
        return null;
      }

    } else {
      return null;
    }
  }

  public getInterceptorSkipHeader(): HttpHeaders {
    return new HttpHeaders().set(InterceptorSkipHeader, '');
  }

  public setModuleLoaderTotalCount(totalNoOfServices: number) {
    return this.moduleLoaderSubject.next({ total: totalNoOfServices });
  }

  public startModuleLoaderService() {
    return this.moduleLoaderSubject.next({ start: true });
  }

  public setModuleLoaderServiceLoaded(count?: number) {
    if (count) {
      while (count > 0) {
        this.moduleLoaderSubject.next({ loaded: true });
        count--;
      }
    } else {
      this.moduleLoaderSubject.next({ loaded: true });
    }

  }

  public setModuleLoaderAllServiceLoaded() {
    return this.moduleLoaderSubject.next(true);
  }

  public getModuleLoader(): Observable<any> {
    return this.moduleLoaderSubject.asObservable();
  }

  public setLoggedInUser(name: string) {
    return this.asyncMessageSubject.next({ name: name });
  }

  public getAsyncMessage(): Observable<any> {
    return this.asyncMessageSubject.asObservable();
  }

  public getIconList() {
    const headers: HttpHeaders = this.getInterceptorSkipHeader();
    this.http.get<any>(FortigoURL.JSON_DATA_URL + FortigoConstant.ICON_FILE_NAME, { headers }).subscribe((response: Icons) => {
      this.prepareIconList(response);
    }, (error) => {
      console.error(this.errorMessage + error);
    });
  }

  private prepareIconList(category: Icons) {
    category.categories.forEach((eachCategory) => {
      this.iconList[eachCategory.name] = new Object();
      eachCategory.icons.forEach((eachIcon) => {
        this.iconList[eachCategory.name][eachIcon.id] = eachIcon.id;
      });
    });
  }
}
