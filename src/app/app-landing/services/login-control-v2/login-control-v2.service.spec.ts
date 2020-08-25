/*
 * Created on Thu Feb 28 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { TestBed } from '@angular/core/testing';

import { LoginControlV2Service } from './login-control-v2.service';

describe('LoginControlV2Service', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoginControlV2Service = TestBed.get(LoginControlV2Service);
    expect(service).toBeTruthy();
  });
});
