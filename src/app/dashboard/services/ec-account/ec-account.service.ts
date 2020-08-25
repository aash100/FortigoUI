import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';

@Injectable()

export class EcAccountService {
  baseUrlPhp = environment.baseUrlPHP;
  userId: any;
  constructor(private http: HttpClient,
    private loginService: LoginControlV2Service) {
    this.userId = this.loginService.userId;
  }

  public getEndCustomer() {
    return this.http.get(this.baseUrlPhp + '/index.php?action=findAllEC&bpId=Xghdt7i0945');
  }

  public getECDetails(paymentLocationId: string, customer_id: string, startDate: string, endDate?: string) {
    return this.http.get(this.baseUrlPhp + '?action=ecAccountDetailsData&startDate=' + startDate + '&endDate=' + endDate + '&customer_id=' + customer_id + '&userId=' + this.userId + '&payment_loc_id=' + paymentLocationId + '&bpId=Xghdt7i0945');
  }

  public getSummaryDetails(paymentLocationId: string, customer_id: string, startDate: string, endDate?: string) {
    return this.http.get(this.baseUrlPhp + '?action=ecAccountSummeryData&startDate=' + startDate + '&endDate=' + endDate + '&customer_id=' + customer_id + '&userId=' + this.userId + '&payment_loc_id=' + paymentLocationId + '&bpId=Xghdt7i0945');
  }

  /** returns string to export to excel */
  public openSummaryExportToExcel(customer_id: string, startDate: string, endDate?: string, paymentLocationId?: string) {
    const excelUrl = this.baseUrlPhp + '?action=ecAccountSummeryExport&startDate=' + startDate + '&endDate=' + endDate + '&customer_id=' + customer_id + '&userId=' + this.userId + '&payment_loc_id=' + paymentLocationId + '&bpId=Xghdt7i0945';
    return excelUrl;
  }

  public openDetailsExportToExcel(customer_id: string, startDate: string, endDate?: string, paymentLocationId?: string) {
    const excelUrl = this.baseUrlPhp + '?action=ecAccountDetailsExport&startDate=' + startDate + '&endDate=' + endDate + '&customer_id=' + customer_id + '&userId=' + this.userId + '&payment_loc_id=' + paymentLocationId + '&bpId=Xghdt7i0945';
    return excelUrl;
  }

  public getAllEcLoc(customer_id: string) {
    const ecLoc = this.baseUrlPhp + '?action=getAllEcLoc&eccompId=' + customer_id + '&bpId=Xghdt7i0945&type=4';
    return this.http.post(ecLoc, '');
  }

  public openBulkDetailsExportToExcel() {
    const excelUrl = this.baseUrlPhp + '?action=ecAccountDetailsBulkExport' + '&userId=' + this.userId + '&bpId=Xghdt7i0945';
    return excelUrl;
  }
}

