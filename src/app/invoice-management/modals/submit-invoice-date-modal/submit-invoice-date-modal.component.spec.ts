/*
 * Created on Thu Jun 13 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitInvoiceDateModalComponent } from './submit-invoice-date-modal.component';

describe('SubmitInvoiceDateModalComponent', () => {
  let component: SubmitInvoiceDateModalComponent;
  let fixture: ComponentFixture<SubmitInvoiceDateModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitInvoiceDateModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitInvoiceDateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
