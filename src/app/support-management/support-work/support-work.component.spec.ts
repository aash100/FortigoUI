import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportWorkComponent } from './support-work.component';

describe('SupportWorkComponent', () => {
  let component: SupportWorkComponent;
  let fixture: ComponentFixture<SupportWorkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupportWorkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
