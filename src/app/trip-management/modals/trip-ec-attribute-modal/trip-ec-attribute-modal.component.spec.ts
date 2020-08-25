/*
 * Created on Fri Oct 04 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripEcAttributeModalComponent } from './trip-ec-attribute-modal.component';

describe('TripEcAttributeModalComponent', () => {
  let component: TripEcAttributeModalComponent;
  let fixture: ComponentFixture<TripEcAttributeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripEcAttributeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripEcAttributeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
