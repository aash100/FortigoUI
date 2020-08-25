/*
 * Created on Fri Jan 25 2019
 * Created by - 1191: Ritesh Kant
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FortigoFilterService {
  /**
   * emits event from fortigo-head to fortigo-filter to display filter component
   */
  showFiller = new EventEmitter();
  /**
   * emits data of applied filter inputs
   */
  filterData = new EventEmitter<any>();
    /**
   * emits whenever filter is applied 
   */
  isFilterApplied = new EventEmitter<any>();
  /** emits event whenever filter is cleared */
  clearFilter = new EventEmitter();
  constructor() { }
}
