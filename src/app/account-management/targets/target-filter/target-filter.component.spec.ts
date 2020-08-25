import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetFilterComponent } from './target-filter.component';

describe('TargetFilterComponent', () => {
  let component: TargetFilterComponent;
  let fixture: ComponentFixture<TargetFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
