/*
 * Created on Wed Oct 16 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessErrorDataPreviewComponent } from './success-error-data-preview.component';

describe('SuccessErrorDataPreviewComponent', () => {
  let component: SuccessErrorDataPreviewComponent;
  let fixture: ComponentFixture<SuccessErrorDataPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SuccessErrorDataPreviewComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessErrorDataPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
