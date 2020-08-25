/*
 * Created on Wed Oct 15 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscardInvoiceNumberModalComponent } from './discard-invoice-number-modal.component';

describe('DiscardInvoiceNumberModalComponent', () => {
  let component: DiscardInvoiceNumberModalComponent;
  let fixture: ComponentFixture<DiscardInvoiceNumberModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscardInvoiceNumberModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscardInvoiceNumberModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
