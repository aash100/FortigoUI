/*
 * Created on Tue Jun 04 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LoginControlV2Service } from '../app-landing/services/login-control-v2/login-control-v2.service';
import { Injectable } from '@angular/core';
import { FortigoConstant } from '../core/constants/FortigoConstant';

@Injectable()
export class ModuleInterceptor implements HttpInterceptor {

    constructor(private _loginControlV2Service: LoginControlV2Service) { }

    /**
     * used to append roleId and userId in req body from req header.
     * @param  {HttpRequest<any>} req
     * @param  {HttpHandler} next
     * @returns Observable
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.headers.get(FortigoConstant.MODULE_INTERCEPTOR_HEADER_KEY)) {
            const module = req.headers.get(FortigoConstant.MODULE_INTERCEPTOR_HEADER_KEY);
            switch (module) {
                case FortigoConstant.TRIP_MANAGEMENT_MODULE:
                case FortigoConstant.INVOICE_MANAGEMENT_MODULE:
                case FortigoConstant.COLLECTION_MANAGEMENT_MODULE:
                case FortigoConstant.MEDIA_MANAGEMENT_MODULE:
                    req.body['role_id'] = Number.parseInt(this._loginControlV2Service.roleId.toString());
                    req.body['user_id'] = Number.parseInt(this._loginControlV2Service.userId.toString());
                    break;
                case FortigoConstant.ACCOUNT_MANAGEMENT_MODULE:
                    // Please apply module specific request.
                    break;
                case FortigoConstant.INVENTORY_MANAGEMENT_MODULE:
                    // Please apply module specific request.
                    break;
                case FortigoConstant.SUPPORT_MANAGEMENT_MODULE:
                    // Please apply module specific request.
                    break;
                case FortigoConstant.INDENT_TRIP_MANAGEMENT_MODULE:
                    // Please apply module specific request.
                    break;
                case FortigoConstant.DASHBOARD_MODULE:
                    // Please apply module specific request.
                    break;
                case FortigoConstant.EC_ACCOUNT_DASHBOARD_PAGE:
                    // Please apply module specific request.
                    break;
                case FortigoConstant.COLLECTION_CYCLE_TIME_REPORT_PAGE:
                    req.body['userId'] = this._loginControlV2Service.userId;
                    break;
            }
        }
        return next.handle(req);
    }
}
