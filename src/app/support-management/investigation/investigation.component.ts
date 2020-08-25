import { Component, OnInit } from '@angular/core';
import { SelectOption, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import { MetadataService } from '../services/metadata/metadata.service';
import { SupportService } from '../services/support/support.service';
import { TruckDetails } from '../models/truck-details';
import { Column, DataType } from 'src/app/shared/models/column.model';
import { GridConfiguration, GridActionIcon } from 'src/app/shared/models/grid-configuration.model';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MiniStatementComponent } from './mini-statement/mini-statement.component';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-investigation',
  templateUrl: './investigation.component.html',
  styleUrls: ['./investigation.component.css']
})
export class InvestigationComponent implements OnInit {

  public fields: Array<any>;
  public walletBalance: number;
  public linkedAccountBalance: number;
  public truckList: TruckDetails[] = new Array<TruckDetails>();
  public fuelMiniStatement: any[];
  public tollMiniStatement: any[];
  private environmentName = environment.name;
  public isLoading: boolean = false;

  private miniStatementModalReference: MatDialogRef<MiniStatementComponent>;

  columnsData: Array<Column>;

  public investigationGridconfiguration: GridConfiguration = new GridConfiguration();
  constructor(
    private _metadataService: MetadataService,
    private _supportService: SupportService,
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getFields();
    this.getGridConfiguration();
  }

  private getGridConfiguration() {
    this.investigationGridconfiguration.isSortingEnabled = true;
    this.investigationGridconfiguration.isFilterEnabled = false;
    this.investigationGridconfiguration.isPaginaionEnabled = true;
    this.investigationGridconfiguration.isActionButtonEnabled = true;
    this.investigationGridconfiguration.actionIconList.push(new GridActionIcon('assignment', 'get mini statement'));
    this.investigationGridconfiguration.defaultPageSize = 50;
    this.investigationGridconfiguration.css.tableRowHeight = '25px';
  }

  private setColumnData() {
    this.columnsData = [
      { columnDef: 'vehiclePlateNumber', headerName: 'Vehicle No.', dataType: DataType.String },
      { columnDef: 'subType', headerName: 'Vehicle Type', dataType: DataType.String },
      { columnDef: 'truckStatus', headerName: 'Vehicle Status', dataType: DataType.String },
      { columnDef: 'fastagNumber', headerName: 'Fastag Number', dataType: DataType.String },
      { columnDef: 'fastagBalance', headerName: 'Fastag Balance', dataType: DataType.String },
      { columnDef: 'tollAutoRechargeStatus', headerName: 'Fastag Auto R status', dataType: DataType.String },
      { columnDef: 'fastagLinkingStatus', headerName: 'Fastag Linking status', dataType: DataType.String },
      { columnDef: 'fuelCardNumber', headerName: 'Fuelcard No.', dataType: DataType.String },
      { columnDef: 'fuelCardBalance', headerName: 'Fuelcard Bal', dataType: DataType.String },
      { columnDef: 'fuelAutoRechargeStatus', headerName: 'Fuel Auto R Status', dataType: DataType.String },
      { columnDef: 'fuelCardLinkingStatus', headerName: 'Fuelcard linking status', dataType: DataType.String }
    ];
  }

  private getFields() {
    const companyList = this._metadataService.companyDropdownList;
    const companyListOptions = new SelectOption('name', 'id', companyList);
    const issueList = new SearchableSelectInputField('Select Company', 'selectedCompanyId', companyListOptions, undefined, false, false, undefined, undefined, undefined, undefined, 100);

    this.fields = [];
    this.fields =
      [
        issueList
      ];
  }

  public onSubmit(value: any) {
    if (value.name === 'selectedCompanyId') {
      console.log(value.value);
      this.getWalletBalance(value.value);
      this.getLinkedAccountBalance(value.value);
      this.getTruckDetails(value.value);
    }
  }
  private getTruckDetails(companyId: number) {
    this.truckList.length = 0;
    this.isLoading = true;
    this._supportService.getTruckDetails(companyId).subscribe((response) => {
      this.isLoading = false;
      const data = response['result'];
      data.forEach(element => {
        const truck = new TruckDetails();
        truck.vehiclePlateNumber = element['vehiclePlateNumber'];
        truck.subType = element['subType'];
        truck.truckStatus = element['status'];
        const fastag = element['fastag'];
        if (fastag) {
          truck.fastagNumber = fastag['cardNumber'];
        }
        truck.fastagLinkingStatus = element['fastagLinkingStatus'];
        truck.fuelCardLinkingStatus = element['fuelCardLinkingStatus'];
        const fuelCard = element['fuelCard'];
        if (fuelCard) {
          truck.fuelCardNumber = fuelCard['cardNumber'];
          truck.fuelCardCustomerId = fuelCard['customerId'];
        }
        this.truckList.push(truck);
      });

      this.setColumnData();
      this.truckList.forEach((truck) => {
        if (truck.fuelCardCustomerId) {
          if (this.environmentName === 'prod') {
            this._supportService.getFuelCardBalance(truck.fuelCardCustomerId).subscribe((response) => {
              const innerData = response['result'];
              if (innerData['ResponseStatus'] === 0) {
                const obj = innerData['CustomerBalances'];
                const obj2 = obj[0];
                truck.fuelCardBalance = obj2['Balance'];
              }
            });
          }
          this._supportService.getFuelAutoRechargeStatus(truck.fuelCardCustomerId).subscribe((innerData) => {
            if (innerData['errCode'] === 0) {
              const result = innerData['result'];
              truck.fuelAutoRechargeStatus = result['status'];
            }
          });
        }
        // get fastag balance
        if (truck.fastagNumber) {
          if (this.environmentName === 'prod') {
            this._supportService.getFastagBalance(truck.fastagNumber).subscribe((response) => {
              const innerData = response['result'];
              if (innerData['resCode'] === '700') {
                const arr1 = innerData['tagId'];
                const obj = arr1[0];
                const obj2 = obj[truck.fastagNumber];
                truck.fastagBalance = obj2['availableBal'];
              }
            });
          }
          this._supportService.getFastagAutoRechargeStatus(truck.fastagNumber).subscribe((innerData) => {
            if (innerData['errCode'] === 0) {
              const result = innerData['result'];
              truck.tollAutoRechargeStatus = result['status'];
            }
          });
        }
      });
    });
  }

  private getWalletBalance(companyId: number) {
    this._supportService.getWalletBalance(companyId).subscribe((data) => {
      if (data) {
        this.walletBalance = data['balance'];
        console.log('wallet balance:' + this.walletBalance);
      }
    });
  }

  private getLinkedAccountBalance(companyId: number) {
    this._supportService.getLinkedAccountBalance(companyId).subscribe((data) => {
      if (data) {
        this.linkedAccountBalance = data['availableBalance'];
        console.log('linked account balalnce:' + this.linkedAccountBalance);
      }
    });
  }

  public onActionExtraButtonClick(data: any) {
    console.log(data.data.vehiclePlateNumber);
    this._supportService.getMiniStatement('fuel', data.data.fuelCardNumber, 10).subscribe((resp) => {
      this.fuelMiniStatement = resp['result'];
    });
    this._supportService.getMiniStatement('toll', data.data.fastagNumber, 10).subscribe((resp) => {
      this.tollMiniStatement = resp['result'];
    });
  }

  public viewMiniStatement(data: any) {
    this.miniStatementModalReference = this._dialog.open(MiniStatementComponent, {
      data: {
        mode: FortigoConstant.FORM_VIEW_MODE,
        vehicle: data.data
      }
    });
  }

}
