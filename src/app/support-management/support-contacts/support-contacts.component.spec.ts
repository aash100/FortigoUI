import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportContactsComponent } from './support-contacts.component';

describe('SupportContactsComponent', () => {
  let component: SupportContactsComponent;
  let fixture: ComponentFixture<SupportContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupportContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
