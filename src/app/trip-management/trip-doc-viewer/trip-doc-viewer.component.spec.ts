/*
 * Created on Wed Oct 09 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripDocViewerComponent } from './trip-doc-viewer.component';

describe('TripDocViewerComponent', () => {
  let component: TripDocViewerComponent;
  let fixture: ComponentFixture<TripDocViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripDocViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripDocViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
