import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginControlV2Component } from './login-control-v2.component';

describe('LoginControlV2Component', () => {
  let component: LoginControlV2Component;
  let fixture: ComponentFixture<LoginControlV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginControlV2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginControlV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
