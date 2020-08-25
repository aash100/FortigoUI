/*
 * Created on Wed Feb 27 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { TestBed } from '@angular/core/testing';

import { MeetingService } from './meeting.service';

describe('MeetingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MeetingService = TestBed.get(MeetingService);
    expect(service).toBeTruthy();
  });
});
