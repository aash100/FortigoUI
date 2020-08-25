import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FortigoTabsComponent } from './fortigo-tabs.component';

describe('FortigoTabsComponent', () => {
  let component: FortigoTabsComponent;
  let fixture: ComponentFixture<FortigoTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FortigoTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FortigoTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
