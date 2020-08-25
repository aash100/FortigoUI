import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingFilterComponent } from './meeting-filter.component';

describe('MeetingFilterComponent', () => {
  let component: MeetingFilterComponent;
  let fixture: ComponentFixture<MeetingFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
