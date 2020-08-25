/*
 * Created on Thu Dec 26 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcAccountDashboardComponent } from './ec-account-dashboard.component';

describe('EcAccountDashboardComponent', () => {
  let component: EcAccountDashboardComponent;
  let fixture: ComponentFixture<EcAccountDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EcAccountDashboardComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcAccountDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
