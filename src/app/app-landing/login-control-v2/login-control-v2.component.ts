import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';
import { UserIdleService } from 'angular-user-idle';
import { CookieService } from 'ngx-cookie-service';

import { LoginControlV2Service } from '../services/login-control-v2/login-control-v2.service';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { environment } from 'src/environments/environment';
import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { LoginControlService } from '../services/login-control.service';
import { AccessDetailRequestPayload } from '../model/access-detail-request-payload.model';

@Component({
  selector: 'app-login-control-v2',
  templateUrl: './login-control-v2.component.html',
  styleUrls: ['./login-control-v2.component.css']
})
export class LoginControlV2Component implements OnInit {

  private phpLoginUrl = environment.phpLoginUrl;

  private userId: string;
  private module: string;
  private queryParameters: Object;
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _loginControlService: LoginControlService,
    private _loginControlV2Service: LoginControlV2Service,
    private _appMetadataService: AppMetadataService,
    private _userIdleService: UserIdleService,
    private _cookieService: CookieService
  ) {
    this._activatedRoute.params.subscribe((params) => {
      this.userId = params['userId'];
      this.module = params['module'];

      if (this.userId === 'null') {
        this.displaySessionTimeoutError();
      }
      // gets query params of url
      this._activatedRoute.queryParams.subscribe(queryParams => { this.queryParameters = queryParams; });
    });
  }

  ngOnInit() {
    this.doLogin();
    this.setIdleTimout();
  }

  private setIdleTimout() {
    // Start watching for user inactivity.
    this._userIdleService.startWatching();

    this._userIdleService.ping$.subscribe(() => {
      if (this._cookieService.check(FortigoConstant.SESSION_COOKIE_NAME)) {
        const expiryDate: Date = new Date();
        expiryDate.setTime(new Date().getTime() + FortigoConstant.SESSION_COOKIE_EXPIRY_IN_SEC * 1000);
        this._cookieService.set(FortigoConstant.SESSION_COOKIE_NAME, (new Date().getTime() + FortigoConstant.SESSION_COOKIE_VALUE_IN_SEC * 1000).toString(), expiryDate, FortigoConstant.SESSION_COOKIE_PATH, FortigoConstant.SESSION_COOKIE_DOMAIN);
      } else {
        // FIXME @Mayur: please enable only localhost, once changes for cookie is ready in pre-prod
        // if (environment.name !== 'localhost') {
        if (environment.name === 'prod') {
          Swal.fire({
            type: 'success',
            title: 'Logging Out',
            showConfirmButton: false,
            timer: 1500
          });

          setTimeout(() => {
            window.open(this.phpLoginUrl, '_self');
          }, 1500);
        }
      }
    });

    let hasTimerStarted = true;
    // Start watching when user idle is starting.
    this._userIdleService.onTimerStart().subscribe((count) => {
      if (hasTimerStarted) {
        let timerInterval;
        Swal.fire({
          title: 'Session timeout alert!',
          html: 'Session will timeout in <strong>'
            + (FortigoConstant.TIMEOUT_TIME_IN_SEC - count)
            + '</strong> seconds.<br>'
            + '<button id="resume" class="btn btn-success">'
            + 'Resume your session!'
            + '</button>',
          timer: (FortigoConstant.TIMEOUT_TIME_IN_SEC - 1) * 1000,
          onBeforeOpen: () => {
            Swal.showLoading();
            const content = Swal.getContent();
            const $ = content.querySelector.bind(content);

            const resume = $('#resume');

            resume.addEventListener('click', () => {
              this._userIdleService.resetTimer();
              hasTimerStarted = true;
              Swal.stopTimer();
              Swal.close();
            });
            timerInterval = setInterval(() => {
              content.querySelector('strong').textContent = (FortigoConstant.TIMEOUT_TIME_IN_SEC - count - 1).toString();
              count++;
            }, 1000);
          },
          onClose: () => {
            clearInterval(timerInterval);
          }
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.timer) {
            console.log(new Date() + 'I was closed by the timer');
          } else {
            console.log('idle timer reset by user');
          }
        });
        hasTimerStarted = false;
      }
    });

    // Start watch when time is up.
    this._userIdleService.onTimeout().subscribe(() => {
      if (this._cookieService.check(FortigoConstant.SESSION_COOKIE_NAME)) {
        this._cookieService.delete(FortigoConstant.SESSION_COOKIE_NAME, FortigoConstant.SESSION_COOKIE_PATH, FortigoConstant.SESSION_COOKIE_DOMAIN);
      }
      Swal.close();
      this.redirectToLogin();
    });
  }

  private doLogin() {
    localStorage.setItem('encodedUserId', this.userId);
    this._loginControlV2Service.verifyLogin(this.userId).subscribe((response) => {
      this._loginControlV2Service.encodedUserId = this.userId;
      this._loginControlService.encodedUserId = this.userId;

      this._loginControlV2Service.accessToken = response['token'];
      this._loginControlV2Service.userId = response['userId'];
      this._loginControlService.accessToken = response['token'];
      this._loginControlService.userId = response['userId'];

      this._loginControlV2Service.roleId = response['roleId'];
      this._loginControlV2Service.userType = response['userType'];
      this._loginControlV2Service.username = response['username'];
      this._loginControlV2Service.name = response['name'];

      const requestPayload = new AccessDetailRequestPayload(this._loginControlV2Service.userId.toString(), this._loginControlV2Service.roleId.toString(), '', '');

      // TODO work on user management - access changes
      // FIXME @Mayur Please fix this once user management changes are done.
      // if (environment.name === 'prod') {
      if (true) {
        this._appMetadataService.setLoggedInUser(this._loginControlV2Service.name);
        this._loginControlV2Service.isUserLoggedIn = true;
        this._loginControlService.isLoggedIn = true;

        if (this._loginControlV2Service.accessToken) {
          this.routeToModule();
        } else {
          this.displayLoginError();
        }

        this._loginControlV2Service.setLoggedIn();
      } else {
        this._loginControlV2Service.getAccessDetails(requestPayload).subscribe((responsePayload) => {
          console.log(responsePayload);
          if (responsePayload.errorCode === 0) {
            this._appMetadataService.setLoggedInUser(this._loginControlV2Service.name);
            this._loginControlV2Service.isUserLoggedIn = true;
            this._loginControlService.isLoggedIn = true;

            if (this._loginControlV2Service.accessToken) {
              this.routeToModule();
            } else {
              this.displayLoginError();
            }

            this._loginControlV2Service.setLoggedIn();
          } else {
            Swal.fire({
              title: 'Unable to Login, try reloading',
              text: responsePayload.errorMessage,
              type: 'error'
            }).then(() => {
              this.refresh();
            });
          }
        });
      }

    }, (error) => {
      console.log(error);
      Swal.fire({
        title: 'Unable to Login!',
        text: 'Reloading the application!',
        type: 'error'
      }).then(() => {
        this.refresh();
      });
    });
  }

  private routeToModule() {
    switch (this.module) {
      case FortigoConstant.ACCOUNT_MANAGEMENT_MODULE:
        this._router.navigate(['/account']);
        break;
      case FortigoConstant.INVOICE_MANAGEMENT_MODULE:
        this._router.navigate(['/invoice']);
        break;
      case FortigoConstant.EXAMPLE_MODULE:
        this._router.navigate(['/example']);
        break;
      case FortigoConstant.CONTRACT_MANAGEMENT_MODULE:
        this._router.navigate(['/contract-management']);
        break;
      case FortigoConstant.COLLECTION_MANAGEMENT_MODULE:
        this._router.navigate(['/collection']);
        break;
      case FortigoConstant.INDENT_TRIP_MANAGEMENT_MODULE:
        this._router.navigate(['/indent']);
        break;
      case FortigoConstant.CUSTOMER_COLLECTION_MANAGEMENT_MODULE:
        this._router.navigate(['/collection/customer-detail']);
        break;
      case FortigoConstant.TRIP_MANAGEMENT_MODULE:
        this._router.navigate(['/trip']);
        break;
      case FortigoConstant.MEDIA_MANAGEMENT_MODULE:
        this._router.navigate(['/media']);
        break;
      case FortigoConstant.TRIP_DOC_VIEW_PAGE:
        this._router.navigate(['/trip/' + FortigoConstant.TRIP_DOC_VIEW_PAGE]);
        break;
      case FortigoConstant.INVENTORY_MANAGEMENT_MODULE:
        this._router.navigate(['/inventory-management']);
        break;
      case FortigoConstant.INVENTORY_MANAGEMENT_ASSOCIATE_DISSOCIATE_PAGE:
        this._router.navigate(['/inventory-management/inventory'], { queryParams: this.queryParameters });
        break;
      case FortigoConstant.SUPPORT_MANAGEMENT_MODULE:
        this._router.navigate(['/support']);
        break;
      case FortigoConstant.EC_ACCOUNT_DASHBOARD_PAGE:
        this._router.navigate(['/dashboard/ec_account'], { queryParams: this.queryParameters });
        break;
      case FortigoConstant.COLLECTION_CYCLE_TIME_REPORT_PAGE:
        this._router.navigate(['/dashboard/' + FortigoConstant.COLLECTION_CYCLE_TIME_REPORT_PAGE]);
        break;
      case FortigoConstant.UNBILLED_REVENUE_DASHBOARD_PAGE:
        this._router.navigate(['/dashboard/' + FortigoConstant.UNBILLED_REVENUE_DASHBOARD_PAGE]);
        break;
      default:
        break;
    }
  }

  private displayLoginError() {
    Swal.fire({
      title: 'Login failed, unauthorized access.',
      type: 'error',
      showCancelButton: false,
    }).then(result => {
      if (result.value) {
        this.redirectToLogin();
      }
    });
  }

  private displaySessionTimeoutError() {
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

  private refresh(): void {
    window.location.reload();
  }

}
