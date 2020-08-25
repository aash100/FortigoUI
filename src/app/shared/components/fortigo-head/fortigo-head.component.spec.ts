import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FortigoHeadComponent } from './fortigo-head.component';

describe('FortigoHeadV2Component', () => {
  let component: FortigoHeadComponent;
  let fixture: ComponentFixture<FortigoHeadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FortigoHeadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FortigoHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
