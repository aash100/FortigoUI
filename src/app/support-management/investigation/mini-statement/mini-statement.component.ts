import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { SupportService } from '../../services/support/support.service';
import { Column, DataType, DataFormat } from 'src/app/shared/models/column.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';

class Statement {
  cardNumber: string;
  position: number;
  amount: number;
  status: string;
  date: any;
}
@Component({
  selector: 'app-mini-statement',
  templateUrl: './mini-statement.component.html',
  styleUrls: ['./mini-statement.component.css']
})
export class MiniStatementComponent implements OnInit {


  public fuelMiniStatement: Statement[];
  public tollMiniStatement: Statement[];
  public displayedColumns: string[] = ['position', 'amount', 'date', 'status'];
  public fuelCardNumber: string;
  public fastagNumber: string;
  public vehicleNumber: string;

  public columnsData: Array<Column>;
  public tollGridconfiguration: GridConfiguration = new GridConfiguration();
  public fuelGridconfiguration: GridConfiguration = new GridConfiguration();

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private _supportService: SupportService
  ) { }

  ngOnInit() {
    this.fuelCardNumber = this.data.vehicle.fuelCardNumber;
    this.fastagNumber = this.data.vehicle.fastagNumber;
    this.vehicleNumber = this.data.vehicle.vehiclePlateNumber;
    this.getMiniStatement();
    this.getTollGridConfiguration();
    this.getFuelGridConfiguration();
    this.setColumnData();
  }

  private getTollGridConfiguration() {
    this.tollGridconfiguration.isSortingEnabled = true;
    this.tollGridconfiguration.isFilterEnabled = false;
    this.tollGridconfiguration.isPaginaionEnabled = true;
  }
  private getFuelGridConfiguration() {
    this.fuelGridconfiguration.isSortingEnabled = true;
    this.fuelGridconfiguration.isFilterEnabled = false;
    this.fuelGridconfiguration.isPaginaionEnabled = true;
  }

  private setColumnData() {
    this.columnsData = [
      { columnDef: 'position', headerName: 'No.', dataType: DataType.String },
      { columnDef: 'amount', headerName: 'Amount', dataType: DataType.Number, dataFormat: DataFormat.Currency },
      { columnDef: 'date', headerName: 'Date', dataType: DataType.Date, dataFormat: DataFormat.DateAndTimeInSec, css: { horizontalAlign: 'left' } },
      { columnDef: 'status', headerName: 'Status', dataType: DataType.String },
    ];
  }
  private getMiniStatement() {
    this._supportService.getMiniStatement('fuel', this.data.vehicle.fuelCardNumber, 10).subscribe((resp) => {
      let arr;
      if (resp['result']) {
        arr = resp['result'];
      } else {
        arr = new Array();
      }
      this.fuelMiniStatement = this.readStatementObj(arr);
    });
    this._supportService.getMiniStatement('toll', this.data.vehicle.fastagNumber, 10).subscribe((resp) => {
      const arr = resp['result'];
      this.tollMiniStatement = this.readStatementObj(arr);
    });
  }
  private readStatementObj(arr: any): Statement[] {
    let obj = new Array<Statement>();
    let count = 0;
    arr.forEach(element => {
      count++;
      let statement = new Statement();
      statement.position = count;
      statement.cardNumber = element['cardNumber'];
      statement.amount = element['rechargeAmount'];
      statement.date = element['rechargeDate'];
      statement.status = element['status'];
      obj.push(statement);
    });
    return obj;
  }

}
