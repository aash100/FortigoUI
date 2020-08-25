/*
 * Created on Sun Aug 18 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { TestBed } from '@angular/core/testing';

import { UnbilledRevenueService } from './unbilled-revenue.service';

describe('UnbilledRevenueService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UnbilledRevenueService = TestBed.get(UnbilledRevenueService);
    expect(service).toBeTruthy();
  });
});
