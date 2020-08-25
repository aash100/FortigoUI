import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGeneratedInvoiceModalComponent } from './view-generated-invoice-modal.component';

describe('ViewGeneratedInvoiceModalComponent', () => {
  let component: ViewGeneratedInvoiceModalComponent;
  let fixture: ComponentFixture<ViewGeneratedInvoiceModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewGeneratedInvoiceModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewGeneratedInvoiceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
