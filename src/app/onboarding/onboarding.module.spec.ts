/*
 * Created on Sun May 19 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { OnboardingModule } from './onboarding.module';

describe('OnboardingModule', () => {
  let onboardingModule: OnboardingModule;

  beforeEach(() => {
    onboardingModule = new OnboardingModule();
  });

  it('should create an instance', () => {
    expect(onboardingModule).toBeTruthy();
  });
});
