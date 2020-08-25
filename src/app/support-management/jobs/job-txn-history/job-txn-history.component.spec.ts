import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTxnHistoryComponent } from './job-txn-history.component';

describe('JobTxnHistoryComponent', () => {
  let component: JobTxnHistoryComponent;
  let fixture: ComponentFixture<JobTxnHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobTxnHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTxnHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
