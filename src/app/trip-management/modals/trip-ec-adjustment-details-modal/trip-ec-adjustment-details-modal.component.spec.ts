/*
 * Created on Tue Nov 19 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripEcAdjustmentDetailsModalComponent } from './trip-ec-adjustment-details-modal.component';

describe('TripEcAdjustmentDetailsModalComponent', () => {
  let component: TripEcAdjustmentDetailsModalComponent;
  let fixture: ComponentFixture<TripEcAdjustmentDetailsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripEcAdjustmentDetailsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripEcAdjustmentDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
