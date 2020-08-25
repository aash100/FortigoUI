import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountLandingComponent } from './account-landing.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Router } from '@angular/router';
import { AccountFormComponent } from '../account/account-form/account-form.component';
import { MeetingListComponent } from '../meeting/meeting-list/meeting-list.component';
import { DocumentListComponent } from '../document/document-list/document-list.component';
import { ContactListComponent } from '../contact/contact-list/contact-list.component';

describe('AccountLandingComponent', () => {
  let component: AccountLandingComponent;
  let fixture: ComponentFixture<AccountLandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountLandingComponent, AccountFormComponent, MeetingListComponent, DocumentListComponent, ContactListComponent],
      imports: [SharedModule, RouterModule],
      providers: [Router]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
