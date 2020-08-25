import { TestBed } from '@angular/core/testing';

import { EcAccountService } from './ec-account.service';

describe('EcAccountService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EcAccountService = TestBed.get(EcAccountService);
    expect(service).toBeTruthy();
  });
});
