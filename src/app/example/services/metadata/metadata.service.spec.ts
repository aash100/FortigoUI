/*
 * Created on Sun Oct 13 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { TestBed } from '@angular/core/testing';

import { MetadataService } from './metadata.service';

describe('MetadataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MetadataService = TestBed.get(MetadataService);
    expect(service).toBeTruthy();
  });
});
