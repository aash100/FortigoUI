/*
 * Created on Mon Dec 02 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit } from '@angular/core';
import { DataType, Column } from 'src/app/shared/models/column.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { FortigoButton } from 'src/app/shared/abstracts/button.model';

@Component({
  selector: 'app-indent-dashboard',
  templateUrl: './indent-dashboard.component.html',
  styleUrls: ['./indent-dashboard.component.css']
})
export class IndentDashboardComponent implements OnInit {
  public columnsData: Array<Column>;
  public tabList: Array<any>;
  public rowsData: Array<any>;
  public gridConfiguration: GridConfiguration;
  public headButtonList: Array<FortigoButton>;

  constructor() {
    this.columnsData = new Array<Column>();
    this.gridConfiguration = new GridConfiguration();
  }

  ngOnInit() {
    this.tabList = [
      { label: 'My Indents' },
      { label: 'My Region' },
      { label: 'All Indents' },
      { label: 'Trips' },
    ];
    this.createGrid();
    this.headButtonList = [
      new FortigoButton('Add Indents'),
    ];
  }

  /**
   * Function to create grid
   */
  private createGrid() {
    this.columnsData = [
      { columnDef: 'ecName', headerName: 'EC Name', dataType: DataType.String, innerCells: 2 },
      { columnDef: 'ecAlias', headerName: 'EC Alias', dataType: DataType.String },
      { columnDef: 'PickupDate', headerName: 'Pickup Date Time', innerCells: 2 },
      { columnDef: 'rcm', headerName: 'RCM-FCM' },
      { columnDef: 'from', headerName: 'From(I/O)', dataType: DataType.String, innerCells: 2 },
      { columnDef: 'to', headerName: 'To (I/O)', dataType: DataType.String },
      { columnDef: 'weight', headerName: 'Weight' },
      { columnDef: 'truckType', headerName: 'Truck Type', dataType: DataType.String, innerCells: 2 },
      { columnDef: 'dhala', headerName: 'Dhala | Length', dataType: DataType.String },
      { columnDef: 'commodity', headerName: 'Commodity', dataType: DataType.String, innerCells: 2 },
      { columnDef: 'packingType', headerName: 'Packing Type', dataType: DataType.String },
      { columnDef: 'ecPrice', headerName: 'EC Price', innerCells: 2 },
      { columnDef: 'targetPrice', headerName: 'Target Price' },
      { columnDef: 'paymentTerms', headerName: 'Payment Terms', dataType: DataType.String, innerCells: 2 },
      { columnDef: 'expCollDate', headerName: 'Exp Coll Date', dataType: DataType.String },
      { columnDef: 'specialInst', headerName: 'Special Instruction', innerCells: 2 },
      { columnDef: 'onBehalf', headerName: 'On Behalf Of' },
      { columnDef: 'b', headerName: '', css: { horizontalAlign: 'center' }, width: '10px', icon: { isIconOnly: true } },
      { columnDef: 'truck', headerName: '', css: { horizontalAlign: 'center' }, width: '15px', icon: { isIconOnly: true } },
      { columnDef: 'linkToDocs', headerName: '', css: { horizontalAlign: 'center' }, width: '15px', icon: { isIconOnly: true } },
    ];

    this.rowsData = [{
      'ecName': 'demo',
      'ecAlias': 'demo',
      'PickupDate': 'demo',
      'rcm': 'demo',
      'from': 'demo',
      'to': 'demo',
      'weight': 'demo',
      'truckType': 'demo',
      'dhala': 'demo',
      'commodity': 'demo',
      'packingType': 'demo',
      'ecPrice': 'demo',
      'targetPrice': 'demo',
      'paymentTerms': 'demo',
      'expCollDate': 'demo',
      'specialInst': 'demo',
      'onBehalf': 'demo',
      'b_icon': '',
      'truck_icon': 'airport_shuttle',
      'linkToDocs_icon': 'arrow_forward',
    },
    {
      'ecName': 'demo',
      'ecAlias': 'demo',
      'PickupDate': 'demo',
      'rcm': 'demo',
      'from': 'demo',
      'to': 'demo',
      'weight': 'demo',
      'truckType': 'demo',
      'dhala': 'demo',
      'commodity': 'demo',
      'packingType': 'demo',
      'ecPrice': 'demo',
      'targetPrice': 'demo',
      'paymentTerms': 'demo',
      'expCollDate': 'demo',
      'specialInst': 'demo',
      'onBehalf': 'demo',
      'b_icon': '',
      'truck_icon': 'airport_shuttle',
      'linkToDocs_icon': 'arrow_forward',
    },
    {
      'ecName': 'demo',
      'ecAlias': 'demo',
      'PickupDate': 'demo',
      'rcm': 'demo',
      'from': 'demo',
      'to': 'demo',
      'weight': 'demo',
      'truckType': 'demo',
      'dhala': 'demo',
      'commodity': 'demo',
      'packingType': 'demo',
      'ecPrice': 'demo',
      'targetPrice': 'demo',
      'paymentTerms': 'demo',
      'expCollDate': 'demo',
      'specialInst': 'demo',
      'onBehalf': 'demo',
      'b_icon': '',
      'truck_icon': 'airport_shuttle',
      'linkToDocs_icon': 'arrow_forward',
    }];

    this.gridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfiguration.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    this.gridConfiguration.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfiguration.css.tableFont = '12px';
    this.gridConfiguration.isSortingEnabled = true;
  }

}
