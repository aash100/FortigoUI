/*
 * Created on Tue Feb 19 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { TestBed } from '@angular/core/testing';

import { AppMetadataService } from './app-metadata.service';

describe('AppMetadataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppMetadataService = TestBed.get(AppMetadataService);
    expect(service).toBeTruthy();
  });
});
