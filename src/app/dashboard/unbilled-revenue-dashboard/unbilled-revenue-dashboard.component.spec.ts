/*
 * Created on Sun Aug 18 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnbilledRevenueDashboardComponent } from './unbilled-revenue-dashboard.component';

describe('UnbilledRevenueDashboardComponent', () => {
  let component: UnbilledRevenueDashboardComponent;
  let fixture: ComponentFixture<UnbilledRevenueDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UnbilledRevenueDashboardComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnbilledRevenueDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
