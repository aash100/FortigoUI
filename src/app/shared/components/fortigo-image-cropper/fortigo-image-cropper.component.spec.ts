/*
 * Created on Mon Sep 30 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FortigoImageCropperComponent } from './fortigo-image-cropper.component';

describe('FortigoImageCropperComponent', () => {
  let component: FortigoImageCropperComponent;
  let fixture: ComponentFixture<FortigoImageCropperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FortigoImageCropperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FortigoImageCropperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
