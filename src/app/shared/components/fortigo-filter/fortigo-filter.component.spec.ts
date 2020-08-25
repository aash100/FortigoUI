import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FortigoFilterComponent } from './fortigo-filter.component';

describe('FortigoFilterComponent', () => {
  let component: FortigoFilterComponent;
  let fixture: ComponentFixture<FortigoFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FortigoFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FortigoFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
