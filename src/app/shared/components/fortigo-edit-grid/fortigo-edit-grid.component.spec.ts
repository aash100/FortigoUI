/*
 * Created on Tue Jun 11 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FortigoEditGridComponent } from './fortigo-edit-grid.component';

describe('FortigoEditGridComponent', () => {
  let component: FortigoEditGridComponent;
  let fixture: ComponentFixture<FortigoEditGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FortigoEditGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FortigoEditGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
