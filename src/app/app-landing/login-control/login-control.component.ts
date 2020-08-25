import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { LoginControlService } from 'src/app/app-landing/services/login-control.service';
import { CustomerService } from 'src/app/account-management/services/customer.service';
import { DocUploadService } from 'src/app/account-management/services/doc-upload.service';
import Swal from 'sweetalert2';
import { MeetingService } from 'src/app/account-management/services/meeting.service';
import { MetadataService } from 'src/app/account-management/services/metadata.service';
import { ContactService } from 'src/app/account-management/services/contact.service';
import { HeaderCalculationRequest, HeaderCalculationResponse } from 'src/app/account-management/models/header-calculation.model';
import { UserIdleService } from 'angular-user-idle';
import { CookieService } from 'ngx-cookie-service';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { environment } from 'src/environments/environment';
import { LoginControlV2Service } from '../services/login-control-v2/login-control-v2.service';
import { DatePipe } from '@angular/common';

const timeOutTime = 20000; // in milli seconds - 20 seconds

@Component({
  selector: 'app-login-control',
  templateUrl: './login-control.component.html',
  styleUrls: ['./login-control.component.css'],
  providers: [DatePipe]
})
export class LoginControlComponent implements OnInit {

  private phpLoginUrl = environment.phpLoginUrl;

  userId: string;
  salesManagerListSubscription: Subscription;
  customerTypeSubscription: Subscription;
  entityTypeSubscription: Subscription;
  categoryTypeSubscription: Subscription;
  industyTypeSubscription: Subscription;
  commoditiesTypeSubscription: Subscription;
  documentTypesSubscription: Subscription;
  headerCalculationSubscription: Subscription;
  userListSubscription: Subscription;
  cycleTimeCalculationSubscription: Subscription;
  listRMasNAMCompanyViewSubscription: Subscription;
  public loadingEvent = new Subject<void>();
  private goodToGoCount = 0;
  private numOfServices = 17;
  public loadingPercent = 0;

  constructor(private route: ActivatedRoute,
    private loginService: LoginControlService,
    private loginV2Service: LoginControlV2Service,
    private router: Router,
    private customerService: CustomerService,
    private metadataService: MetadataService,
    private meetingService: MeetingService,
    private docService: DocUploadService,
    private contactService: ContactService,
    private _userIdleService: UserIdleService,
    private _cookieService: CookieService,
    private _datePipe: DatePipe) {
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
      if (this.userId === 'null') {
        this.displaySessionTimeoutError();
      }
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.pageReloadConfirmation();
    }, timeOutTime);

    localStorage.setItem('encodedUserId', this.userId);

    this.loginService.verifyLogin(this.userId).subscribe((response) => {
      this.loginV2Service.encodedUserId = this.userId;
      this.loginService.encodedUserId = this.userId;

      this.loginService.accessToken = response['token'];
      this.loginService.userId = response['userId'];
      this.loginService.roleId = response['roleId'];
      this.loginV2Service.accessToken = response['token'];
      this.loginV2Service.userId = response['userId'];
      this.loginV2Service.roleId = response['roleId'];
      this.customerService.userId = this.loginService.userId;

      if (this.loginService.accessToken !== undefined) {
        this.loginService.isLoggedIn = true;
        this.loginV2Service.isUserLoggedIn = true;
        this.loginService.childUsersLoaded.subscribe(
          (_) => {
            this.fetchData();
          }
        );
        this.loginService.loadChildren(this.loginService.userId);
        this.loginV2Service.setLoggedIn();

        this.loadingEvent.subscribe(
          () => {
            this.setIdleTimout();
            this.router.navigate(['/customer/overview']);
            Swal.close();
          }
        );
      } else {
        this.displayLoginError();
      }
    },
      (error) => {
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

  private setIdleTimout() {
    // Start watching for user inactivity.
    this._userIdleService.startWatching();

    this._userIdleService.ping$.subscribe(() => {
      if (this._cookieService.check(FortigoConstant.SESSION_COOKIE_NAME)) {
        const expiryDate: Date = new Date();
        expiryDate.setTime(new Date().getTime() + FortigoConstant.SESSION_COOKIE_EXPIRY_IN_SEC * 1000);
        this._cookieService.set(FortigoConstant.SESSION_COOKIE_NAME, (new Date().getTime() + FortigoConstant.SESSION_COOKIE_VALUE_IN_SEC * 1000).toString(), expiryDate, FortigoConstant.SESSION_COOKIE_PATH, FortigoConstant.SESSION_COOKIE_DOMAIN);
      } else {
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

  private pageReloadConfirmation() {
    if (this.goodToGoCount < this.numOfServices) {
      Swal.fire({
        title: 'Request timed out!',
        text: 'Oops! Something went wrong, Try reloading the application or wait more.',
        type: 'info',
        showCancelButton: true,
        cancelButtonText: 'Wait more!',
        confirmButtonText: 'Reload'
      }).then((result) => {
        if (result.value) {
          this.refresh();
        } else {
          setTimeout(() => { this.pageReloadConfirmation(); }, timeOutTime);
        }
      });
    }
  }

  private fetchData() {
    const headerCalculationRequests: Array<HeaderCalculationRequest> = new Array<HeaderCalculationRequest>();
    headerCalculationRequests.push(new HeaderCalculationRequest('company_name', 'count'));
    headerCalculationRequests.push(new HeaderCalculationRequest('primary_contact_name', 'count'));
    headerCalculationRequests.push(new HeaderCalculationRequest('primary_contact_number', 'count'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_annual_expected_revenue', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_annual_expected_margin', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_annual_revenue', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_revenue_mtd', 'sum', 'targetRevenueMTD'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_margin_mtd', 'sum', 'targetMarginMTD'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_revenue_m2', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_margin_m2', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_revenue_m1', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_margin_m1', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_revenue_q2', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_margin_q2', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_revenue_q1', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('target_margin_q1', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_r2', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_m2', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_r1', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_m1', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_mtd', 'sum', 'actualMTD'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_rtd', 'sum', 'actualRTD'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_revenue_q2', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('actual_revenue_q1', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('billed', 'sum', 'actualBilled'));
    headerCalculationRequests.push(new HeaderCalculationRequest('collection', 'sum', 'actualCollection'));
    headerCalculationRequests.push(new HeaderCalculationRequest('due', 'sum', 'actualDue'));
    headerCalculationRequests.push(new HeaderCalculationRequest('overdue', 'sum', 'actualOverdue'));
    headerCalculationRequests.push(new HeaderCalculationRequest('total_outstanding', 'sum'));
    headerCalculationRequests.push(new HeaderCalculationRequest('post_meeting_remarks', 'count'));

    this.headerCalculationSubscription =
      this.customerService.getGridHeaderValues(headerCalculationRequests).subscribe(
        (data: Array<HeaderCalculationResponse>) => {
          this.customerService.headerCalculatedValues = this.customerService.headerCalculatedValues.concat(data);
          this.checkLoadingStatus();
        }
      );
    this.userListSubscription =
      this.customerService.getUsers().subscribe(
        (data: Array<any>) => {
          this.customerService.users = data;
          this.checkLoadingStatus();
        }
      );

    this.cycleTimeCalculationSubscription =
      this.customerService.getSummaryCycleTime().subscribe(
        (data) => {
          this.customerService.headerCalculatedValues.push(new HeaderCalculationResponse('cycle_time', 'weightedAverage', data['cycleTime']));
          this.checkLoadingStatus();
        }
      );
    this.customerTypeSubscription =
      this.customerService.getCustomerType().subscribe(
        (data) => {
          this.customerService.customerType = data;
          this.checkLoadingStatus();
        }
      );
    this.salesManagerListSubscription =
      this.customerService.getSalesManager().subscribe(
        (data) => {
          this.customerService.salesManagerList = data;
          this.checkLoadingStatus();
        });
    this.entityTypeSubscription =
      this.customerService.getLegalType().subscribe(
        (data) => {
          this.customerService.legalType = data;
          this.checkLoadingStatus();
        }
      );
    this.categoryTypeSubscription =
      this.customerService.getCompanyCategory().subscribe(
        (data) => {
          this.customerService.companyCategory = data;
          this.checkLoadingStatus();
        }
      );
    this.industyTypeSubscription =
      this.customerService.getIndustryType().subscribe(
        (data) => {
          this.customerService.industryType = data;
          this.checkLoadingStatus();
        }
      );
    this.commoditiesTypeSubscription =
      this.customerService.getCommodities().subscribe(
        (data) => {
          this.customerService.commodities = data;
          this.checkLoadingStatus();
        }
      );
    this.customerService.getUserName(this.customerService.userId).subscribe(
      (data: string) => {
        this.customerService.userName = data;
        this.checkLoadingStatus();
        this.customerService.userNameAvailable.next();
      }
    );
    this.customerService.getLocationTypeList().subscribe(
      (response: any[]) => {
        this.customerService.locationTypeList = response;

      },
      (error) => {
        console.log(error);
      });
    this.contactService.getLocationList().subscribe(data => {
      this.contactService.locationList = data;
    });

    this.docService.getDocTypes().subscribe(
      (docTypes) => {
        this.docService.setDocTypes(docTypes);
        this.checkLoadingStatus();
      }
    );
    this.docService.getDocStatuses().subscribe(
      (docStatuses) => {
        this.docService.setDocStatusMap(docStatuses);
        this.checkLoadingStatus();
      }
    );
    this.docService.getInternalCompanies().subscribe(
      (data) => {
        this.docService.internalCompList = data;
        this.checkLoadingStatus();
      }
    );
    this.metadataService.getMeetingType().subscribe((response) => {
      this.meetingService.meetingType = response;
      this.checkLoadingStatus();
    });
    this.loginService.checkIfUserIsReadOnly().subscribe((result) => {
      this.loginService.isReadOnlyUser = result;
      this.getMeetingViewList();

      if (result) {
        this.loginService.loadCompanies(true).subscribe((data) => {
          this.loginService.companyList = data;
          this.loginService.parseCompanyIdAndCompanyName(data);
          this.checkLoadingStatus();
        });
      } else {
        this.loginService.getCompanyIds(this.loginService.userId).subscribe((data) => {
          const temp: JSON = data['results'];
          let companyIds = '';
          if (temp['nationalCompanyIds']) {
            companyIds += temp['nationalCompanyIds'];
          }
          if (temp['regionalCompanyIds']) {
            if (temp['nationalCompanyIds'] !== null) {
              companyIds += ',';
            }
            companyIds += temp['regionalCompanyIds'];
          }

          this.loginService.hierarchyCompanyIds = companyIds;

          // FIXME: Implement user hierarchy
          const companyListAndUserId = { 'companyIds': companyIds, 'userIds': this.loginService.userId.toString() };
          this.loginService.HierarchyCompanies = companyListAndUserId;
          this.loginService.loadCompanies(false, companyListAndUserId).subscribe((response) => {
            this.loginService.companyList = response;
            this.loginService.parseCompanyIdAndCompanyName(response);
            this.checkLoadingStatus();
          });
        });
      }

      this.customerService.listRMsForLoggedInUser({ 'loggedInUserId': this.loginService.userId.toString(), 'isReadOnly': this.loginService.isReadOnlyUser }).subscribe(
        (data: Array<any>) => {
          if (data && data.length > 0) {
            this.customerService.rMDetails = data.filter((eachRM) => {
              return eachRM['userAsNAM'] === false;
            });
            this.customerService.rmAsNamData = data.filter((eachRM) => {
              return eachRM['userAsNAM'] === true;
            });

            let nAMs = '';
            this.customerService.rmAsNamData.forEach((eachNAM, index) => {
              if (index === this.customerService.rmAsNamData.length - 1) {
                nAMs += eachNAM['rmAccountManagerId'];
              } else {
                nAMs += eachNAM['rmAccountManagerId'] + ',';
              }
            });
          }
          this.checkLoadingStatus();
        }
      );

      this.checkLoadingStatus();

    });
  }

  checkLoadingStatus() {
    if (++this.goodToGoCount >= this.numOfServices) {
      this.loadingEvent.next();
    }
    this.loadingPercent += Math.round(100 / this.numOfServices);
  }

  displayLoginError() {
    Swal.fire({
      title: 'Login failed, unauthorized access.',
      type: 'error',
      showCancelButton: false,
      confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
      cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR
    }).then(result => {
      if (result.value) {
        this.redirectToLogin();
      }
    });
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

  public redirectToLogin() {
    window.open(this.phpLoginUrl, '_self');
  }

  refresh(): void {
    window.location.reload();
  }

  getMeetingViewList() {
    // load meeting view
    const end = this._datePipe.transform(new Date(), 'yyyy-MM-dd');
    const start = this._datePipe.transform(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd');
    this.customerService.meetingViewFrom = start;
    this.customerService.meetingViewTo = end;
    this.customerService.getMeetingView([this.loginService.userId, this.loginService.childUsers], start, end).subscribe(
      (data) => {
        if (Array.isArray(data)) {
          this.loginService.meetingListView = data;

        } else {
          this.loginService.meetingListView = [];
        }
        this.meetingService.meetingReload.next();

      }
    );
  }
}
