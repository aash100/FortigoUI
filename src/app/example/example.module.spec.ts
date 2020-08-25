/*
 * Created on Sun Oct 13 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { ExampleModule } from './example.module';

describe('ExampleModule', () => {
  let exampleModule: ExampleModule;

  beforeEach(() => {
    exampleModule = new ExampleModule();
  });

  it('should create an instance', () => {
    expect(exampleModule).toBeTruthy();
  });
});
