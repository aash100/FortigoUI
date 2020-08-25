/*
 * Created on Mon Dec 23 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import Swal from 'sweetalert2';

import { environment } from 'src/environments/environment';
import { LoginControlService } from '../app-landing/services/login-control.service';
import { LoginControlV2Service } from '../app-landing/services/login-control-v2/login-control-v2.service';
import { FortigoConstant } from '../core/constants/FortigoConstant';

const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private phpLoginUrl = environment.phpLoginUrl;

  constructor(private loginService: LoginControlService, private _loginControlV2Service: LoginControlV2Service) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.headers.has(InterceptorSkipHeader)) {
      const headers = req.headers.delete(InterceptorSkipHeader);
      return next.handle(req.clone({ headers }));
    }

    let authReq1: HttpRequest<any>, authReq2: HttpRequest<any>, authReq3: HttpRequest<any>, authReq4: HttpRequest<any>;

    if (this.loginService.accessToken) {
      // adding logged in access token
      authReq1 = req.clone({ headers: req.headers.set(FortigoConstant.TOKEN_HEADER_NAME, this.loginService.accessToken) });
      // adding user hierarchy in request header
      authReq2 = authReq1.clone({ headers: authReq1.headers.set(FortigoConstant.CHILDREN_HEADER_NAME, this.loginService.getChildren()) });
      // adding logged in user userId
      authReq3 = authReq2.clone({ headers: authReq2.headers.set(FortigoConstant.USER_ID_HEADER_NAME, this.loginService.userId) });
      // adding channel type for API
      authReq4 = authReq3.clone({ headers: authReq3.headers.set(FortigoConstant.CHANNEL_TYPE_HEADER_NAME, FortigoConstant.CHANNEL_TYPE_HEADER_VALUE) });
    }
    if (this._loginControlV2Service.accessToken) {
      // adding logged in access token
      authReq1 = req.clone({ headers: req.headers.set(FortigoConstant.TOKEN_HEADER_NAME, this._loginControlV2Service.accessToken) });
      // adding logged in user userId
      authReq3 = authReq1.clone({ headers: authReq1.headers.set(FortigoConstant.USER_ID_HEADER_NAME, this._loginControlV2Service.userId) });
      // adding channel type for API
      authReq4 = authReq3.clone({ headers: authReq3.headers.set(FortigoConstant.CHANNEL_TYPE_HEADER_NAME, FortigoConstant.CHANNEL_TYPE_HEADER_VALUE) });
    }

    return next.handle(authReq4).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          if (event.body && event.body['Error'] === 'user not found') {
            this.displaySessionTimeoutError();
          }
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        let data = {};
        data = {
          reason: error && error.error && error.error.reason ? error.error.reason : '',
          status: error.status
        };
        console.log('Data: ', data);
        console.log('Error: ', error);
        return throwError(error);
      }));

  }

  displaySessionTimeoutError() {
    Swal.fire({
      title: 'Session timed out.',
      type: 'error',
      showCancelButton: false,
    }).then(result => {
      if (result.value) {
        this.redirectToLogin();
      }
    });
  }

  private redirectToLogin() {
    window.open(this.phpLoginUrl, '_self');
  }
}
