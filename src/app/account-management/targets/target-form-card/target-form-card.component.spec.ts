import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetFormCardComponent } from './target-form-card.component';

describe('TargetFormCardComponent', () => {
  let component: TargetFormCardComponent;
  let fixture: ComponentFixture<TargetFormCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetFormCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetFormCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
