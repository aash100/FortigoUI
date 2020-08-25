/*
 * Created on Fri Sep 06 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { TestBed } from '@angular/core/testing';

import { TargetService } from './target.service';

describe('TargetService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TargetService = TestBed.get(TargetService);
    expect(service).toBeTruthy();
  });
});
