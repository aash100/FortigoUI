/*
 * Created on Mon Dec 02 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { TestBed } from '@angular/core/testing';

import { IndentTripService } from './indent-trip.service';

describe('IndentTripService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IndentTripService = TestBed.get(IndentTripService);
    expect(service).toBeTruthy();
  });
});
