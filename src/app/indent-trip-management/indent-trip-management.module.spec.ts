/*
 * Created on Mon Feb 04 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { IndentTripManagementModule } from './indent-trip-management.module';

describe('IndentTripManagementModule', () => {
  let indentTripManagementModule: IndentTripManagementModule;

  beforeEach(() => {
    indentTripManagementModule = new IndentTripManagementModule();
  });

  it('should create an instance', () => {
    expect(indentTripManagementModule).toBeTruthy();
  });
});
