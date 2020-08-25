/*
 * Created on Fri Oct 18 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { ContractManagementModule } from './contract-management.module';

describe('ContractManagementModule', () => {
  let contractManagementModule: ContractManagementModule;

  beforeEach(() => {
    contractManagementModule = new ContractManagementModule();
  });

  it('should create an instance', () => {
    expect(contractManagementModule).toBeTruthy();
  });
});
