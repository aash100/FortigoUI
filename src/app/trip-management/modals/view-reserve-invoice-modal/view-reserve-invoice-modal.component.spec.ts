/*
 * Created on Fri Jul 05 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewReserveInvoiceModalComponent } from './view-reserve-invoice-modal.component';

describe('ViewReserveInvoiceModalComponent', () => {
  let component: ViewReserveInvoiceModalComponent;
  let fixture: ComponentFixture<ViewReserveInvoiceModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewReserveInvoiceModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewReserveInvoiceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
