/*
 * Created on Sun Oct 20 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { LoginControlService } from '../app-landing/services/login-control.service';

import Swal from 'sweetalert2';

import { environment } from 'src/environments/environment';
import { LoginControlV2Service } from '../app-landing/services/login-control-v2/login-control-v2.service';
import { RoleId } from '../core/constants/FortigoConstant';
import { Util } from '../core/abstracts/util';

@Injectable()
export class AccessGuard implements CanActivate {

    constructor(
        private _loginService: LoginControlService,
        private _loginControlV2Service: LoginControlV2Service,
        private _router: Router
    ) { }

    canActivate() {
        // REVIEW @Mayur: added role based module access
        let roleId: number;
        if (this._loginService && this._loginService.roleId !== undefined) {
            roleId = Number.parseInt(this._loginService.roleId.toString());
        } else {
            if (Util.isNumber(this._loginControlV2Service.roleId)) {
                roleId = this._loginControlV2Service.roleId;
            } else {
                if (this._loginControlV2Service.roleId !== undefined) {
                    roleId = Number.parseInt(this._loginControlV2Service.roleId.toString());
                }
            }
        }
        switch (roleId) {
            // REVIEW @Mayur added role based check for Finance Users - Removed for release - 09-10-2019
            case RoleId.FBO_TEAM_LEADER:
            case RoleId.FBO_TEAM_MEMBER:
            case RoleId.FBO_WITH_FUEL_PAYMENT:
            case RoleId.FBO_AR:
                if (environment.name === 'prod' && (window.location.href.toString().includes('invoice') || window.location.href.toString().includes('trip'))) {
                    // Swal.fire('Error', 'Unauthorized access', 'error');
                    // return false;
                }
                break;
            default:
                break;
        }

        if (this._loginService.isLoggedIn) {
            return true;
        }
        if (this._loginControlV2Service.isUserLoggedIn) {
            return true;
        }

        if (sessionStorage.getItem('landing-url')) {
            const landingUrl = sessionStorage.getItem('landing-url');
            this._router.navigate([landingUrl]);
        } else {
            Swal.fire('Error', 'Unable to load, please close the Tab and open again.', 'error');
        }

        return false;
    }
}
