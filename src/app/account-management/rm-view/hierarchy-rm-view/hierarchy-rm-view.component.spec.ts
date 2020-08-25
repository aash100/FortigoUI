import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyRmViewComponent } from './hierarchy-rm-view.component';

describe('HierarchyRmViewComponent', () => {
  let component: HierarchyRmViewComponent;
  let fixture: ComponentFixture<HierarchyRmViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HierarchyRmViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchyRmViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
