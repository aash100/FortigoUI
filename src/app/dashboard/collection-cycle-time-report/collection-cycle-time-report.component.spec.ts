/*
 * Created on Fri Aug 09 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionCycleTimeReportComponent } from './collection-cycle-time-report.component';

describe('CollectionCycleTimeReportComponent', () => {
  let component: CollectionCycleTimeReportComponent;
  let fixture: ComponentFixture<CollectionCycleTimeReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CollectionCycleTimeReportComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionCycleTimeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
