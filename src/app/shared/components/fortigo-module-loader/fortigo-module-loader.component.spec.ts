/*
 * Created on Thu Nov 21 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FortigoModuleLoaderComponent } from './fortigo-module-loader.component';

describe('FortigoModuleLoaderComponent', () => {
  let component: FortigoModuleLoaderComponent;
  let fixture: ComponentFixture<FortigoModuleLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FortigoModuleLoaderComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FortigoModuleLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
