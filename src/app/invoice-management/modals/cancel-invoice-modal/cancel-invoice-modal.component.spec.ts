/*
 * Created on Thu Jun 13 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelInvoiceModalComponent } from './cancel-invoice-modal.component';

describe('CancelInvoiceModalComponent', () => {
  let component: CancelInvoiceModalComponent;
  let fixture: ComponentFixture<CancelInvoiceModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelInvoiceModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelInvoiceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
