import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FortigoSnackbarComponent } from './fortigo-snackbar.component';

describe('FortigoSnackbarComponent', () => {
  let component: FortigoSnackbarComponent;
  let fixture: ComponentFixture<FortigoSnackbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FortigoSnackbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FortigoSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
