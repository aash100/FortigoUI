/*
 * Created on Thu Oct 10 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit } from '@angular/core';

import { SaveResponseDataModel } from '../models/save-response-data.model';

@Component({
  selector: 'app-data-validator',
  templateUrl: './data-validator.component.html',
  styleUrls: ['./data-validator.component.css']
})
export class DataValidatorComponent implements OnInit {

  public pageTitle: string;
  public successErrorData: SaveResponseDataModel;
  public validationData: Array<any>;
  public page: 'validationPage' | 'successErrorPage';

  constructor() { }

  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.

    this.pageTitle = 'Contract Management';
    this.page = 'validationPage';
  }

  public onSavingData(data: SaveResponseDataModel) {
    this.successErrorData = data;
    this.page = 'successErrorPage';
  }

  public onDataFailure(data: Array<any>) {
    this.validationData = data;
    this.page = 'validationPage';
  }
}
