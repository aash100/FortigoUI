/*
 * Created on Wed Feb 27 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AccountDashboardComponent } from './account-dashboard.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { AccountService } from '../services/account/account.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { MatDialog } from '@angular/material';
import { MetadataService } from '../services/metadata/metadata.service';
import { MeetingService } from '../services/meeting/meeting.service';
import { HotkeysService, HotkeyModule } from 'angular2-hotkeys';

describe('AccountDashboardComponent', () => {
  let component: AccountDashboardComponent;
  let fixture: ComponentFixture<AccountDashboardComponent>;

  const fakeActivatedRoute = {
    snapshot: { data: {} }
  } as ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountDashboardComponent],
      imports: [SharedModule, HttpClientTestingModule, HotkeyModule],
      providers: [
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); } },
        AppMetadataService,
        MetadataService,
        AccountService,
        LoginControlV2Service,
        MatDialog,
        MeetingService,
        HotkeysService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
