import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginControlComponent } from './login-control.component';

describe('LoginControlComponent', () => {
  let component: LoginControlComponent;
  let fixture: ComponentFixture<LoginControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginControlComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
