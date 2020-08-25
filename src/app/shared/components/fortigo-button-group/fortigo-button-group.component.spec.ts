import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FortigoButtonGroupComponent } from './fortigo-button-group.component';

describe('FortigoButtonGroupComponent', () => {
  let component: FortigoButtonGroupComponent;
  let fixture: ComponentFixture<FortigoButtonGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FortigoButtonGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FortigoButtonGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
