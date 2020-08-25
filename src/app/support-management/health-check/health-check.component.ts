import { Component, OnInit } from '@angular/core';
import { SupportService } from '../services/support/support.service';
import { Health } from '../models/health.model';
import { environment } from 'src/environments/environment';
import { SupportManagementConstant } from '../constants/SupportManagementConstant';

@Component({
  selector: 'app-health-check',
  templateUrl: './health-check.component.html',
  styleUrls: ['./health-check.component.css']
})
export class HealthCheckComponent implements OnInit {

  public internalHealthList: Array<Health>;
  public externalHealthList: Array<Health>;
  public diskHealthList: Array<Health>;
  public ramHealthList: Array<Health>;

  private environmentName = environment.name;

  constructor(private _supportService: SupportService) { }

  ngOnInit() {
    this.initializeValues();
    this.setDefaultStatus();
    this.checkStatus();
  }

  public initializeValues() {

    const platformHealth = new Health();
    const databaseHealth = new Health();
    const dbCountHealth = new Health();
    databaseHealth.item = SupportManagementConstant.HEALTH_CHECK_DATABASE;
    dbCountHealth.item = SupportManagementConstant.HEALTH_CHECK_DATABASE_COUNT;
    platformHealth.item = SupportManagementConstant.HEALTH_CHECK_PLATFORM;
    this.internalHealthList = [platformHealth, databaseHealth, dbCountHealth];

    const idfcHealth = new Health();
    const fedBankHealth = new Health();
    const ioclHealth = new Health();
    idfcHealth.item = SupportManagementConstant.HEALTH_CHECK_IDFC;
    fedBankHealth.item = SupportManagementConstant.HEALTH_CHECK_FED_BANK;
    ioclHealth.item = SupportManagementConstant.HEALTH_CHECK_IOCL;
    this.externalHealthList = [idfcHealth, fedBankHealth, ioclHealth];

    const diskUtilization = new Health();
    diskUtilization.item = SupportManagementConstant.HEALTH_CHECK_DISK_SPACE;
    this.diskHealthList = [diskUtilization];

    const ramUtilization = new Health();
    ramUtilization.item = SupportManagementConstant.RAM_USAGE;
    this.ramHealthList = [ramUtilization];
  }

  public getDBProcessList() {
    this._supportService.getDBProcessList().subscribe((data) => {
      const dbProcessList = data['result'];

      const dbCountObj = this.internalHealthList[2];
      if (dbProcessList.length < SupportManagementConstant.DB_COUNT_VALUE) {
        dbCountObj.result = SupportManagementConstant.HEALTH_CHECK_STATUS_HEALTHY;
      } else {
        dbCountObj.result = SupportManagementConstant.HEALTH_CHECK_STATUS_UNHEALTHY;
      }
      dbCountObj.resultDisplay = dbProcessList.length;
    });
  }

  public setDefaultStatus() {
    this.internalHealthList.forEach(value => {
      value.result = SupportManagementConstant.HEALTH_CHECK_STATUS_CHECKING;
    });
    this.externalHealthList.forEach(value => {
      value.result = SupportManagementConstant.HEALTH_CHECK_STATUS_CHECKING;
    });
    this.diskHealthList.forEach(value => {
      value.result = SupportManagementConstant.HEALTH_CHECK_STATUS_CHECKING;
    });
    this.ramHealthList.forEach(value => {
      value.result = SupportManagementConstant.HEALTH_CHECK_STATUS_CHECKING;
    });
  }

  public checkAgain(healthItem: string) {
    switch (healthItem) {
      case SupportManagementConstant.HEALTH_CHECK_PLATFORM:
        this.checkPlatform();
        break;
      case SupportManagementConstant.HEALTH_CHECK_DATABASE:
        this.checkDatabase();
        break;
      case SupportManagementConstant.HEALTH_CHECK_IDFC:
        this.checkIDFC();
        break;
      case SupportManagementConstant.HEALTH_CHECK_FED_BANK:
        this.checkFedBank();
        break;
      case SupportManagementConstant.HEALTH_CHECK_IOCL:
        this.checkIOCL();
        break;
      default:
        break;
    }
  }

  public checkStatus() {
    if (this.environmentName === 'prod') {
      // external
      this.checkFedBank();
      this.checkIOCL();
      this.checkIDFC();
    }

    // internal
    this.checkDatabase();
    this.checkPlatform();
    this.getDBProcessList();

    // disk and ram
    this.getMemoryReport();
  }

  private checkFedBank() {
    this._supportService.checkFedBankHealth().subscribe((response) => {
      const data = response['result'];
      const error = data['error'];
      const fedObj = this.externalHealthList[1];
      if (error['errCode'] === 0) {
        fedObj.result = SupportManagementConstant.HEALTH_CHECK_STATUS_HEALTHY;
        fedObj.resultDisplay = SupportManagementConstant.HEALTH_CHECK_STATUS_HEALTHY;
      } else {
        fedObj.result = SupportManagementConstant.HEALTH_CHECK_STATUS_UNHEALTHY;
        fedObj.resultDisplay = SupportManagementConstant.HEALTH_CHECK_STATUS_UNHEALTHY;
      }
    });
  }

  private checkIOCL() {
    this._supportService.checkIOCLHealth().subscribe((response) => {
      const data = response['result'];
      const errCode = data['ResponseStatus'];
      const ioclObj = this.externalHealthList[2];
      if (errCode === 0) {
        ioclObj.result = SupportManagementConstant.HEALTH_CHECK_STATUS_HEALTHY;
        ioclObj.resultDisplay = SupportManagementConstant.HEALTH_CHECK_STATUS_HEALTHY;
      } else {
        ioclObj.result = SupportManagementConstant.HEALTH_CHECK_STATUS_UNHEALTHY;
        ioclObj.resultDisplay = SupportManagementConstant.HEALTH_CHECK_STATUS_UNHEALTHY;
      }
    });
  }

  private checkIDFC() {
    this._supportService.checkIDFCHealth().subscribe((response) => {
      const data = response['result'];
      const errCode = data['resCode'];
      const idfcObj = this.externalHealthList[0];
      if (errCode === '700') {
        idfcObj.result = SupportManagementConstant.HEALTH_CHECK_STATUS_HEALTHY;
        idfcObj.resultDisplay = SupportManagementConstant.HEALTH_CHECK_STATUS_HEALTHY;
      } else {
        idfcObj.result = SupportManagementConstant.HEALTH_CHECK_STATUS_UNHEALTHY;
        idfcObj.resultDisplay = SupportManagementConstant.HEALTH_CHECK_STATUS_UNHEALTHY;
      }
    });
  }

  private checkPlatform() {
    this._supportService.checkPlatformHealth().subscribe((data) => {
      const errCode = data['errCode'];
      const platformObj = this.internalHealthList[0];
      if (errCode === 0) {
        platformObj.result = SupportManagementConstant.HEALTH_CHECK_STATUS_HEALTHY;
        platformObj.resultDisplay = SupportManagementConstant.HEALTH_CHECK_STATUS_HEALTHY;
      } else {
        platformObj.result = SupportManagementConstant.HEALTH_CHECK_STATUS_UNHEALTHY;
        platformObj.resultDisplay = SupportManagementConstant.HEALTH_CHECK_STATUS_UNHEALTHY;
      }
    });
  }

  private checkDatabase() {
    this._supportService.getIssueTypes().subscribe((data) => {
      const errCode = data['errCode'];
      const dbObj = this.internalHealthList[1];
      if (errCode === 0) {
        dbObj.result = SupportManagementConstant.HEALTH_CHECK_STATUS_HEALTHY;
        dbObj.resultDisplay = SupportManagementConstant.HEALTH_CHECK_STATUS_HEALTHY;
      } else {
        dbObj.result = SupportManagementConstant.HEALTH_CHECK_STATUS_UNHEALTHY;
        dbObj.resultDisplay = SupportManagementConstant.HEALTH_CHECK_STATUS_UNHEALTHY;
      }
    });
  }

  public getMemoryReport() {
    this._supportService.getMemoryUsages().subscribe((data) => {
      const diskReport = data['result']['disk'];
      const ramReport = data['result']['RAM'];

      // disk utilization
      const diskUtilization = this.diskHealthList[0];
      const distUtlizationPercentage = diskReport['used'].replace('%', '');
      if (distUtlizationPercentage <= SupportManagementConstant.DISK_THRESHOLD_PERCENTAGE) {
        diskUtilization.result = SupportManagementConstant.HEALTH_CHECK_STATUS_HEALTHY;
      } else {
        diskUtilization.result = SupportManagementConstant.HEALTH_CHECK_STATUS_UNHEALTHY;
      }
      diskUtilization.resultDisplay = 'Mount Point: ' + diskReport['filesystem'] + ', Used: ' + diskReport['used'] + ', Total: ' + diskReport['total'];
      diskUtilization.percentage = distUtlizationPercentage;

      // ram utilization
      const ramUtilization = this.ramHealthList[0];
      const ramUtlizationPercentage = (Number.parseInt(ramReport['used']) / Number.parseInt(ramReport['total'])) * 100;
      if (ramUtlizationPercentage <= SupportManagementConstant.RAM_THRESHOLD_PERCENTAGE) {
        ramUtilization.result = SupportManagementConstant.HEALTH_CHECK_STATUS_HEALTHY;
      } else {
        ramUtilization.result = SupportManagementConstant.HEALTH_CHECK_STATUS_UNHEALTHY;
      }
      ramUtilization.resultDisplay = 'Used: ' + ramReport['used'] + ', Total: ' + ramReport['total'];
      ramUtilization.percentage = ramUtlizationPercentage;
    });
  }

}
