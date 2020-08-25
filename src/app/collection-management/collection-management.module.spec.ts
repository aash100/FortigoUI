/*
 * Created on Mon Feb 04 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { CollectionManagementModule } from './collection-management.module';

describe('CollectionManagementModule', () => {
  let collectionManagementModule: CollectionManagementModule;

  beforeEach(() => {
    collectionManagementModule = new CollectionManagementModule();
  });

  it('should create an instance', () => {
    expect(collectionManagementModule).toBeTruthy();
  });
});
