/*
 * Created on Tue Nov 19 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Component, OnInit, Inject } from '@angular/core';
import { TextInputField } from 'src/app/shared/abstracts/field-type.model';
import { Column, DataFormat, DataType } from 'src/app/shared/models/column.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TripModalComponent } from '../trip-modal/trip-modal.component';
import { TripService } from '../../services/trip/trip.service';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';

@Component({
  selector: 'app-trip-ec-adjustment-details-modal',
  templateUrl: './trip-ec-adjustment-details-modal.component.html',
  styleUrls: ['./trip-ec-adjustment-details-modal.component.css']
})
export class TripEcAdjustmentDetailsModalComponent implements OnInit {

  public columnData: Array<Column>;
  public rowsData: Array<any>;
  public gridConfiguration: GridConfiguration;
  public title = 'EC Adjustments Details';
  public showModalLoader: boolean;
  constructor(public _dialogRef: MatDialogRef<TripModalComponent>,
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _tripService: TripService) { }

  ngOnInit() {
    this.getColumnData();
    this.gridConfiguration = new GridConfiguration();
    this.gridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfiguration.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.fixedTableHeight = 'max-content';
    this.gridConfiguration.css.tableOverflow = 'hidden';
    this.showModalLoader = true;
    this._tripService.getTripAdjustmentDetails({ 'service_ref_id': this._data.rowData.tripId.toString() }).subscribe((response: Array<any>) => {
      this.rowsData = response;
      this.showModalLoader = false;

    });
  }
  private getColumnData() {
    this.columnData = [
      { columnDef: 'serviceName', headerName: 'Adjustment Type' },
      { columnDef: 'itemTotal', headerName: 'Adjustment Amount', dataType: DataType.Number, dataFormat: DataFormat.Currency },
      { columnDef: 'status', headerName: 'Approval Status' },
    ];
  }

}
