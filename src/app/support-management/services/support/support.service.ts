import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Issue } from '../../models/issue.model';
import { IssueRemark } from '../../models/issue-remark.model';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class SupportService {
  private baseUrl = environment.baseUrl + environment.baseSupportManagementPath;
  private baseUrlTerms = environment.baseUrl + environment.baseTermsPath;

  constructor(private http: HttpClient) { }

  private getIssuesUrl = this.baseUrl + '/support/getIssues';
  private createIssueUrl = this.baseUrl + '/support/addIssue';
  private getIssueByIdUrl = this.baseUrl + '/support/getIssueById';
  private closeIssueByIdUrl = this.baseUrl + '/support/closeIssueById';
  private getIssueTypeUrl = this.baseUrl + '/support/getAllIssueTypes';
  private getDiagnosisUrl = this.baseUrl + '/support/getDiagnonsisByTypeId';
  private runDiagnosisUrl = this.baseUrl + '/support/runDiagnosis';
  private saveRemarkUrl = this.baseUrl + '/support/addIssueRemark';
  private getSavedRemarksUrl = this.baseUrl + '/support/getIssueRemarks';
  private checkPlatformHealthUrl = this.baseUrl + '/support/health/checkPlatformHealth';
  private getMemoryUsageUrl = this.baseUrl + '/support/health/getSystemInfo';
  private getDBProcessUrl = this.baseUrl + '/support/health/getDBProcessList';
  private getFastagAutoRechargeStatusUrl = this.baseUrl + '/support/investigation/getFastagAutoRechargeStatus';
  private getFuelAutoRechargeStatusUrl = this.baseUrl + '/support/investigation/getFuelAutoRechargeStatus';
  private getMiniStatementUrl = this.baseUrl + '/support/investigation/getCardTransactions';
  private getCompanyListUrl = this.baseUrl + '/support/getCompanyList';

  private getJobsListUrl = this.baseUrl + '/support/jobs/getAllJobs';
  private getJobTxnsUrl = this.baseUrl + '/support/jobs/getJobHistory';

  // private fedBankUrl = 'https://4tigo.com/app/pymt.php?action=balanceEnquiry&userid=1111111111111111';
  // private idfcUrl = 'https://etoll.idfcbank.com/dimtspay_services_web/reqBulkBalance';
  private idfcUrl = this.baseUrl + '/support/getFastagBalance';
  private ioclUrl = this.baseUrl + '/support/getFuelCardBalance';
  private fedBankUrl = this.baseUrl + '/support/checkFedbank';
  // private ioclUrl = 'https://login.iocxtrapower.com/FundTransferAPI/FundTransfer/GetCustomerBalance?UserName=ioc_fort_0059_prod&Password=Ftog@blr-09o9&CustomerId=';


  private walletBalanceUrl = this.baseUrlTerms + '/accounts/walletbalance';
  private linkedAccountBalanceUrl = this.baseUrlTerms + '/accounts/bankbalance';
  private revenueReportJobUrl = this.baseUrlTerms + '/reports/revenuereport/construct';
  // private getTruckDetailsUrl = this.baseUrlTerms + '/company/vehicles';
  private getTruckDetailsUrl = this.baseUrl + '/support/investigation/getVehicles';


  private getFastagDetailsUrl = this.baseUrl + '/support/getFastagDetails';
  private getFuelCardDetailsUrl = this.baseUrl + '/support/getFuelCardDetails';

  public issueListReloadEvent = new Subject<string>();
  public remarkListReloadEvent = new Subject<string>();

  public getIssues(): Observable<Issue[]> {
    return this.http.get<Issue[]>(this.getIssuesUrl);
  }

  public createIssue(issue: Issue): Observable<any> {
    return this.http.post(this.createIssueUrl, issue);
  }

  public getIssueById(id: number): Observable<Issue> {
    return this.http.get<Issue>(this.getIssueByIdUrl + '?id=' + id);
  }

  public closeIssueById(id: number): Observable<any> {
    console.log('id:' + id);
    return this.http.get(this.closeIssueByIdUrl + '?id=' + id);
  }

  public getIssueTypes(): Observable<any> {
    return this.http.get(this.getIssueTypeUrl);
  }

  public getDiagnosisByIssueType(typeId: number): Observable<any> {
    return this.http.get(this.getDiagnosisUrl + '?id=' + typeId);
  }

  public runDiagnosis(customerId: string, diagnosisId: number): Observable<any> {
    return this.http.get(this.runDiagnosisUrl + '?customerId=' + customerId + '&diagnosisId=' + diagnosisId);
  }

  public saveRemark(issueRemark: IssueRemark): Observable<any> {
    return this.http.post(this.saveRemarkUrl, issueRemark);
  }

  public getSavedRemarks(issueId: number): Observable<any> {
    return this.http.get(this.getSavedRemarksUrl + '?id=' + issueId);
  }

  public checkFedBankHealth(): Observable<any> {
    return this.http.get(this.fedBankUrl);
  }

  public checkIDFCHealth(): Observable<any> {
    return this.http.get(this.idfcUrl + '?cardNumber=34161FA820328EE802079440');
  }

  public getFastagBalance(fastagCardNumber: string): Observable<any> {
    return this.http.get(this.idfcUrl + '?cardNumber=' + fastagCardNumber);
  }

  public checkIOCLHealth(): Observable<any> {
    return this.http.get(this.ioclUrl + '?customerId=1001729324');
  }

  public getFuelCardBalance(customerId: string): Observable<any> {
    return this.http.get(this.ioclUrl + '?customerId=' + customerId);
  }

  public checkPlatformHealth(): Observable<any> {
    return this.http.get(this.checkPlatformHealthUrl);
  }

  public getWalletBalance(companyId: number): Observable<any> {
    const body = { 'company_id': companyId };
    return this.http.post(this.walletBalanceUrl, body);
  }

  public getTruckDetails(companyId: number): Observable<any> {
    return this.http.get(this.getTruckDetailsUrl + '?companyId=' + companyId);
  }

  public getLinkedAccountBalance(companyId: number): Observable<any> {
    const body = { 'company_id': companyId };
    return this.http.post(this.linkedAccountBalanceUrl, body);
  }

  public getFastagDetails(companyId: number): Observable<any> {
    return this.http.get(this.getFastagDetailsUrl + '?customerId=' + companyId);
  }

  public getFuelCardDetails(companyId: number): Observable<any> {
    return this.http.get(this.getFuelCardDetailsUrl + '?customerId=' + companyId);
  }

  public getMemoryUsages(): Observable<any> {
    return this.http.get(this.getMemoryUsageUrl);
  }

  public getDBProcessList(): Observable<any> {
    return this.http.get(this.getDBProcessUrl);
  }

  public getFastagAutoRechargeStatus(tagNumber: string): Observable<any> {
    return this.http.get(this.getFastagAutoRechargeStatusUrl + '?tagNumber=' + tagNumber);
  }

  public getFuelAutoRechargeStatus(customerId: string): Observable<any> {
    return this.http.get(this.getFuelAutoRechargeStatusUrl + '?customerId=' + customerId);
  }
  public getMiniStatement(type: string, cardNumber: string, count: number): Observable<any> {
    return this.http.get(this.getMiniStatementUrl + '?type=' + type + '&cardNumber=' + cardNumber + '&count=' + count);
  }

  public getCompanyList(): Observable<any> {
    return this.http.get(this.getCompanyListUrl);
  }
  public getJobsList(): Observable<any> {
    return this.http.get(this.getJobsListUrl);
  }
  public getJobTxns(jobCode: string): Observable<any> {
    return this.http.get(this.getJobTxnsUrl + '?jobCode=' + jobCode);
  }
  public triggerRevenueReportJob(): Observable<any> {
    return this.http.get(this.revenueReportJobUrl);
  }
}
