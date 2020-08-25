import { TestBed } from '@angular/core/testing';

import { CollectionCycleTimeService } from './collection-cycle-time.service';

describe('CollectionCycleTimeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CollectionCycleTimeService = TestBed.get(CollectionCycleTimeService);
    expect(service).toBeTruthy();
  });
});
