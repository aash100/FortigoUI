import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FortigoSearchableSelectComponent } from './fortigo-searchable-select.component';

describe('FortigoSearchableSelectComponent', () => {
  let component: FortigoSearchableSelectComponent;
  let fixture: ComponentFixture<FortigoSearchableSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FortigoSearchableSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FortigoSearchableSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
