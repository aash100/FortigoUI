/*
 * Created on Sun Oct 20 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subscription } from 'rxjs';

import { AutoUnsubscribe } from './shared/decorators/auto-unsubscribe.decorator';
import { ClipboardService, IClipboardResponse } from 'ngx-clipboard';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
@AutoUnsubscribe()
export class AppComponent {

  private navigationSubscription: Subscription;

  constructor(
    private _router: Router,
    private _clipboardService: ClipboardService,
    private _snackBar: MatSnackBar
  ) {
    // subscribe to the router events - storing the subscription so
    // we can unsubscribe later.
    this.navigationSubscription = this._router.events.subscribe((event: Event) => {
      // If it is a NavigationEnd event re-initalise the component
      if (event instanceof NavigationEnd) {
        sessionStorage.setItem('landing-url', event.url);
        this.navigationSubscription.unsubscribe();
      }
    });
    this._clipboardService.configure({ cleanUpAfterCopy: true });
    this.handleClipboardResponse();
  }

  /**
   * This function add subscription for copying and shows snackbar
   */
  private handleClipboardResponse() {
    this._clipboardService.copyResponse$.subscribe((res: IClipboardResponse) => {
      if (res.isSuccess) {
        this._clipboardService.copyFromContent(res.content);
        // Snackbar for Notifying Search Applied
        this._snackBar.open(res.successMessage);
      }
    });
  }
}
