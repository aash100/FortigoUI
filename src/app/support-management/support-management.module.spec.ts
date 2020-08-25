import { SupportManagementModule } from './support-management.module';

describe('SupportManagementModule', () => {
  let supportManagementModule: SupportManagementModule;

  beforeEach(() => {
    supportManagementModule = new SupportManagementModule();
  });

  it('should create an instance', () => {
    expect(supportManagementModule).toBeTruthy();
  });
});
