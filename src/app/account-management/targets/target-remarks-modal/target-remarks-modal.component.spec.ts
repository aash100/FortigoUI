import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetRemarksModalComponent } from './target-remarks-modal.component';

describe('TargetRemarksModalComponent', () => {
  let component: TargetRemarksModalComponent;
  let fixture: ComponentFixture<TargetRemarksModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetRemarksModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetRemarksModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
