/*
 * Created on Fri Sep 06 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetListComponent } from './target-list.component';

describe('TargetListComponent', () => {
  let component: TargetListComponent;
  let fixture: ComponentFixture<TargetListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TargetListComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
