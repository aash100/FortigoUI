import { TripManagementModule } from './trip-management.module';

describe('TripManagementModule', () => {
  let tripManagementModule: TripManagementModule;

  beforeEach(() => {
    tripManagementModule = new TripManagementModule();
  });

  it('should create an instance', () => {
    expect(tripManagementModule).toBeTruthy();
  });
});
