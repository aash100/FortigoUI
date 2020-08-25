import { TestBed } from '@angular/core/testing';
import { LoginControlService } from './login-control.service';

describe('LoginControlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoginControlService = TestBed.get(LoginControlService);
    expect(service).toBeTruthy();
  });
});
