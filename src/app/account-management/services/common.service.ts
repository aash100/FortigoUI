import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Company } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient) {
  }

  baseUrl = environment.baseUrl + environment.baseAccountManagementPath;

  getCompanyList() {
    return this.http.get<Company[]>(this.baseUrl + '/meeting/list/companies');
  }

}
