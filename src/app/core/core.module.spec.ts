/*
 * Created on Tue Feb 19 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { CoreModule } from './core.module';

describe('CoreModule', () => {
  let coreModule: CoreModule;

  beforeEach(() => {
    coreModule = new CoreModule(coreModule);
  });

  it('should create an instance', () => {
    expect(coreModule).toBeTruthy();
  });
});
