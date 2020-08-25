import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCollectionSummaryComponent } from './customer-collection-summary.component';

describe('CustomerCollectionSummaryComponent', () => {
  let component: CustomerCollectionSummaryComponent;
  let fixture: ComponentFixture<CustomerCollectionSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerCollectionSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerCollectionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
