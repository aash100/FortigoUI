import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocFilterComponent } from './doc-filter.component';

describe('DocFilterComponent', () => {
  let component: DocFilterComponent;
  let fixture: ComponentFixture<DocFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
