/*
 * Created on Tue Jan 22 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FortigoGridComponent } from './fortigo-grid.component';
import { MaterialModule } from 'src/app/material.module';

describe('FortigoGridComponent', () => {
  let component: FortigoGridComponent;
  let fixture: ComponentFixture<FortigoGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FortigoGridComponent],
      imports: [MaterialModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FortigoGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.rows = [{ 'id': 1, 'name': 'Aashish' }];
    expect(component.applyFilter('AASHISH'));
  });

});
