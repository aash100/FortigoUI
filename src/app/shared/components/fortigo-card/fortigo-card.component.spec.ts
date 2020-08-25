/*
 * Created on Wed Jul 10 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FortigoCardComponent } from './fortigo-card.component';

describe('FortigoCardComponent', () => {
  let component: FortigoCardComponent;
  let fixture: ComponentFixture<FortigoCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FortigoCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FortigoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
