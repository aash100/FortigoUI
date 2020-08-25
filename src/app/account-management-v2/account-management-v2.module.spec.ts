/*
 * Created on Wed Feb 13 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { AccountManagementV2Module } from './account-management-v2.module';

describe('AccountManagementV2Module', () => {
  let accountManagementV2Module: AccountManagementV2Module;

  beforeEach(() => {
    accountManagementV2Module = new AccountManagementV2Module();
  });

  it('should create an instance', () => {
    expect(accountManagementV2Module).toBeTruthy();
  });
});
