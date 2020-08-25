import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { CookieService } from 'ngx-cookie-service';

import { environment } from 'src/environments/environment';
import { CustomerService } from '../account-management/services/customer.service';
import { AppMetadataService } from '../core/services/metadata/app-metadata.service';
import { FortigoConstant } from '../core/constants/FortigoConstant';
import { LoginControlV2Service } from '../app-landing/services/login-control-v2/login-control-v2.service';
import { LoginControlService } from '../app-landing/services/login-control.service';
import { Util } from '../core/abstracts/util';

@Component({
  selector: 'app-header-navbar',
  templateUrl: './header-navbar.component.html',
  styleUrls: ['./header-navbar.component.css'],
})
export class HeaderNavbarComponent implements OnInit {

  private baseUIUrl = environment.baseUIUrl;
  private basePHPUIUrl = environment.basePHPUIUrl;
  private phpLoginUrl = environment.phpLoginUrl;

  public userName: string;
  public hideMenu: boolean;
  public menuList: Array<MenuItem>;
  public menuListCopy: Array<MenuItem>;
  private disabledMenuItems: any;

  private environmentName = environment.name;

  @ViewChild('drawer', { static: false }) drawer: MatSidenav;

  @ViewChild('container', { static: false }) container: any;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    public _customerService: CustomerService,
    private _appMetadataService: AppMetadataService,
    private _cookieService: CookieService,
    private _loginControlV2Service: LoginControlV2Service,
    private _loginControlService: LoginControlService
  ) { }

  ngOnInit() {
    this._customerService.userNameAvailable.subscribe(
      () => {
        if (this._customerService && this._customerService.userName) {
          this.userName = this._customerService.userName;
        }
      }
    );
    this._appMetadataService.getAsyncMessage().subscribe((message) => {
      if (message['name']) {
        const userDisplayName = message['name'].split(' ');
        this.userName = userDisplayName[0];
      }
    });

    // hide menu based on URL
    // if (location.pathname.includes(FortigoConstant.INVENTORY_MANAGEMENT_MODULE)) {
    //   this.hideMenu = true;
    // } else {
    //   this.hideMenu = false;
    // }

    this._loginControlV2Service.getLoginStatus().subscribe(() => {
      this.loadSideMenu();
      if (this._loginControlV2Service.roleId) {
        this.loadDisabledMenuItems(this._loginControlV2Service.roleId);
      } else {
        this.loadDisabledMenuItems(Number.parseInt(this._loginControlService.roleId));
      }
    });
  }

  private loadDisabledMenuItems(roleId: number) {
    this.menuListCopy = <Array<MenuItem>>Util.getObjectCopy(this.menuList);
    this._loginControlV2Service.filteredMenuList(roleId).subscribe((response) => {
      this.disabledMenuItems = response['results']['id'];
      if (this.disabledMenuItems && Array.isArray(this.disabledMenuItems) && this.disabledMenuItems.length > 0) {
        const hideMenu = this.disabledMenuItems.filter((eachDisabledMenuItem) => {
          return eachDisabledMenuItem === 'showMenu';
        });
        if (hideMenu && Array.isArray(hideMenu) && hideMenu.length >= 1) {
          this.hideMenu = true;
        } else {
          this.disabledMenuItems.forEach((eachDisabledMenuItem) => {
            this.menuListCopy = this.removeDisabledMenu(this.menuListCopy, eachDisabledMenuItem);
          });
        }
      }
    });
  }

  private removeDisabledMenu(menuItems: Array<MenuItem>, disabledMenuItemId: string): Array<MenuItem> {
    return menuItems.filter((eachMenu) => {
      const notFound = eachMenu.id !== disabledMenuItemId;
      if (notFound && eachMenu.subMenuItems && eachMenu.subMenuItems.length > 0) {
        eachMenu.subMenuItems = this.removeDisabledMenu(eachMenu.subMenuItems, disabledMenuItemId);
      }
      return notFound;
    });
  }

  private loadSideMenu() {
    const uId = this._loginControlV2Service.userId;

    const contactList = new MenuItem('Contact List', 'gohome', 'index.php?action=dashboardNew&bpId=Xghdt7i0945&uid=' + uId);
    const txnValidationPayment = new MenuItem('Txn Validation & Payment', 'BulkPay');
    const fuelUsageReconciliation = new MenuItem('Fuel Usage Reconciliation', 'fuelUsageReconciliation', 'onboarding/index.php?action=fuelcard&bpId=Xghdt7i0945&uid=' + uId);
    const invPymntsBalance = new MenuItem('Inv, Pymnts, 4TiGO Balance', 'accountStatep');
    const creditNote = new MenuItem('Credit Note', 'creditNote', 'onboarding/index.php?action=creditNote&bpId=Xghdt7i0945&uid=' + uId);
    const invoicesPayments = new MenuItem('Invoices & Payments', 'fortigoAccountsNew', 'onboarding/index.php?action=4tigoaccountlistNew&bpId=Xghdt7i0945&uid=' + uId + '&from=BO');
    const scheduledTrips = new MenuItem('Scheduled Trips', 'scduldMenu');
    const ongoingTrips = new MenuItem('Ongoing Trips', 'compTripsMenu');
    const cancelledTrips = new MenuItem('Cancelled Trips', 'canceledTrip', 'onboarding/index.php?action=cancelledTrip&bpId=Xghdt7i0945&uid=' + uId);
    const txnFaciTruck = new MenuItem('Transaction Trucks', 'txnFaciTruck', 'onboarding/index.php?action=transactionTruck&bpId=Xghdt7i0945&uid=' + uId);
    const transactionLoads = new MenuItem('Transaction Loads', 'txnFaciLoad', 'onboarding/index.php?action=Transaction&bpId=Xghdt7i0945&uid=' + uId);
    const confirmedTrips = new MenuItem('Confirmed Trips', 'confrimedTrip');
    const completeTrips = new MenuItem('Completed Trips', 'completeTrip', 'onboarding/index.php?action=completedTrips&bpId=Xghdt7i0945&uid=' + uId);
    const truckdriverMobile = new MenuItem('Truck | Driver | Mobile', 'controlDash', 'index.php?action=newdashboard&bpId=Xghdt7i0945&uType=BO');
    const truckTracker = new MenuItem('Truck Tracker', 'trucksTrack', 'onboarding/index.php?action=trucksTrack&bpId=Xghdt7i0945&uid=' + uId);
    const availableTrucks = new MenuItem('Available Trucks', 'availTrksMenu');
    const truckInfo = new MenuItem('Truck Info', 'truckInfo', 'onboarding/index.php?action=trucksinfo&bpId=Xghdt7i0945&uid=' + uId);
    const acctMgmt = new MenuItem('Account Management', 'AcctMgmt', '/customer/overview', undefined, undefined, false, '');
    const contractDocuments = new MenuItem('Contract Documents', 'Contract', 'onboarding/index.php?action=contractpage&bpId=Xghdt7i0945');
    const transactionDashboard = new MenuItem('Transaction Dashboard', 'transactionPage', 'onboarding/index.php?action=transaction&bpId=Xghdt7i0945');
    const shortTrips = new MenuItem('Short Trips PrePayment', 'shortTrips', 'onboarding/index.php?action=shortTrips&bpId=Xghdt7i0945&uid=' + uId);
    const shortTripsApprop = new MenuItem('Short Trips Creation & Appropriation', 'shortTripsSetup', 'onboarding/index.php?action=shortTripSetup&bpId=Xghdt7i0945&uid=' + uId);
    const openNOC = new MenuItem('NOC', 'openNOC', 'index.php?action=noc&bpId=Xghdt7i0945&uid=' + uId);
    const customerSettle = new MenuItem('Customer Settlements', 'customerSettleK', 'onboarding/index.php?action=customerstlment&bpId=Xghdt7i0945&uid=' + uId);
    const expiredTrucks = new MenuItem('Expired Trucks', 'futureAvailableTruck');

    const assetInvent = new MenuItem('Asset Inventory', 'assetInvent', 'onboarding/index.php?action=assetInventory&bpId=Xghdt7i0945');
    const nrolistp = new MenuItem('NRO List', 'nrolistp', 'onboarding/index.php?action=nrolist&bpId=Xghdt7i0945');
    const nroDashboard = new MenuItem('NRO Dashboard', 'nroDashboard', 'onboarding/index.php?action=nroDashboard&bpId=Xghdt7i0945');
    const trkFlwUp = new MenuItem('Truck Follow Up', 'trkFlwUp', 'onboarding/index.php?action=TruckFollowUp&bpId=Xghdt7i0945');

    const termsDashboard = new MenuItem('TERMS Dashboard', 'termsDashPage', 'onboarding/index.php?action=termsCustomerRevenue&bpId=Xghdt7i0945');
    const termsCustomerRevenue = new MenuItem('TERMS Customer Revenue', 'termsCustomerRevenue');
    const rmcDashboard = new MenuItem('RMC Dashboard', 'rmcDashboard', 'onboarding/index.php?action=rmcDashboard&bpId=Xghdt7i0945&uid=' + uId);
    const onboardingMaster = new MenuItem('Onboarding Master', 'onbMaster');
    const contactBook = new MenuItem('Contact Book', 'cbook', 'index.php?action=contacts&bpId=Xghdt7i0945&uid=' + uId);
    const collectionCycleTimeDashboard = new MenuItem('Collection Cycle Time Report', 'collCyTimeReport', '/dashboard/collection-cycle-time-report', undefined, undefined, false, '/collection-cycle-time-report');
    const unbilledRevDash = new MenuItem('Unbilled Revenue Dashboard', 'unbilledRevDash', '/dashboard/unbilled-revenue', undefined, undefined, false, '/unbilled-revenue');
    const enquiries = new MenuItem('Enquiries', 'Enquiries', 'onboarding/index.php?action=postIndent&bpId=Xghdt7i0945&uid=' + uId);
    const ecEnquiryDashboard = new MenuItem('EC Enquiry Dashboard', 'enquiryDashboard', 'onboarding/index.php?action=enquiryDashboard&bpId=Xghdt7i0945&uid=' + uId);
    const collectionSummaryReport = new MenuItem('Collection Summary Report', 'collRepDashboard', 'onboarding/index.php?action=collectionReportDashboard&bpId=Xghdt7i0945&uid=' + uId);
    const postIndent = new MenuItem('Indents & Trips', 'postIndent', 'onboarding/index.php?action=postIndent&bpId=Xghdt7i0945&uid=' + uId);
    const unConfirmedTrips = new MenuItem('Unconfirmed Trips', 'UnconfirmedTrip', 'onboarding/index.php?action=unconfirmedTrip&bpId=Xghdt7i0945&uid=' + uId);
    const indentsTrips = new MenuItem('Indents & Trips', 'tripsMenu', undefined, [postIndent, scheduledTrips, ongoingTrips, completeTrips, cancelledTrips, txnFaciTruck, transactionLoads, confirmedTrips, unConfirmedTrips]);
    const ecDashboard = new MenuItem('EC Dashboard', 'ecDashboard', 'onboarding/index.php?action=endCustomerdashboard&bpId=Xghdt7i0945&uid=' + uId);
    const accountState = new MenuItem('EC Statement of Account', 'ecAccSt', '/dashboard/ec_account', undefined, undefined, false, '/ec_account_dashboard');
    const documentAssociation = new MenuItem('Document Association', 'trpDocAson', 'onboarding/index.php?action=documentAssociation&bpId=Xghdt7i0945');
    const trucks = new MenuItem('Trucks', 'trucks', undefined, [truckdriverMobile, truckTracker, availableTrucks, truckInfo]);
    const terms = new MenuItem('TERMS', 'TERMS', undefined, [termsDashboard, termsCustomerRevenue, assetInvent, nrolistp, nroDashboard, trkFlwUp]);
    const inventoryManagement = new MenuItem('Inventory Management', 'inventoryMgmt', '/inventory-management', undefined, undefined, false);
    const tripAccView = new MenuItem('4TiGO Nodal Account', 'tripAccView', 'onboarding/index.php?action=nodalAccount&bpId=Xghdt7i0945&uid=' + uId);
    const financeBO = new MenuItem('Finance BO', 'finBO', undefined, [fuelUsageReconciliation, invPymntsBalance, creditNote, tripAccView, invoicesPayments]);
    const routePlan = new MenuItem('Route plan', 'routeplan', 'fleetowner/index.php?action=routeplane&bpId=Xghdt7i0945');

    const archive = new MenuItem('Archive', 'Archive', undefined, [transactionDashboard, shortTrips, shortTripsApprop, openNOC, customerSettle, expiredTrucks, contactList, contactBook]);
    const tripInvCreate = new MenuItem('Trip Invoicing', 'tripInvCreate', '/trip', undefined, undefined, false);
    const invMgmt = new MenuItem('Invoice Management', 'invMgmt', '/invoice', undefined, undefined, false);
    const tripCollections = new MenuItem('Trip Collections', 'tripCollections', '/collection', undefined, undefined, false);
    const tripCollectionsSummary = new MenuItem('EC Customer Summary', 'tripCollectionsSummary', '/customer-detail', undefined, undefined, false);
    const accountManagement = new MenuItem('Account Management', 'AcctMgmtMain', undefined, [acctMgmt, contractDocuments]);
    const reportsDashboard = new MenuItem('Reports and Dashboard', 'reportsDashboard', undefined, [ecDashboard, rmcDashboard, collectionSummaryReport, collectionCycleTimeDashboard, unbilledRevDash, onboardingMaster, ecEnquiryDashboard, accountState]);
    const paymentCollections = new MenuItem('Invoice, Payments & Collections', 'paymentCollections', undefined, [txnValidationPayment, tripCollections, tripInvCreate, invMgmt, tripCollectionsSummary]);
    const podCollFollowup = new MenuItem('POD & Collection Follow up', 'collectionFollowup', 'onboarding/index.php?action=otcFollowDashboard&bpId=Xghdt7i0945&uid=' + uId);
    const internalUsersContacts = new MenuItem('Internal Users & Contacts', 'ManageUsers', 'onboarding/index.php?action=manageUsers&bpId=Xghdt7i0945');

    this.menuList = [accountManagement, reportsDashboard, enquiries, indentsTrips, paymentCollections, podCollFollowup, documentAssociation, trucks, terms, inventoryManagement, financeBO, routePlan, internalUsersContacts, archive];
  }

  public logout() {
    if (this._cookieService.check(FortigoConstant.SESSION_COOKIE_NAME)) {
      this._cookieService.delete(FortigoConstant.SESSION_COOKIE_NAME, FortigoConstant.SESSION_COOKIE_PATH, FortigoConstant.SESSION_COOKIE_DOMAIN);
    }

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

  public onClick(menuItem: MenuItem) {
    if (menuItem.hyperLink) {
      if (menuItem.isExternalLink) {
        window.open(this.basePHPUIUrl + menuItem.hyperLink, '_blank');
      } else {
        let link: string;
        if (menuItem.externalhyperLink || menuItem.externalhyperLink === '') {
          link = menuItem.externalhyperLink;
        } else {
          link = menuItem.hyperLink;
        }
        if (this.environmentName === 'localhost') {
          window.open(this.baseUIUrl + '/landing' + link + '/' + this._loginControlV2Service.encodedUserId, '_blank');
        } else {
          window.open(this.baseUIUrl + '/web/landing' + link + '/' + this._loginControlV2Service.encodedUserId, '_blank');
        }
        if (window.location.href.includes(menuItem.hyperLink)) {
          this.drawer.close();
        }
      }
    } else {
      this.drawer.close();
    }
    this.container.close();
  }

}

class MenuItem {
  name: string;
  id: string;
  hyperLink: string;
  // url for opening angular page as external link
  externalhyperLink: string;
  subMenuItems: Array<MenuItem>;
  icon: string;
  isExternalLink: boolean;
  tooltipText: string;

  constructor(name: string, id: string, hyperLink?: string,
    subMenuItems?: Array<MenuItem>, icon?: string, isExternalLink?: boolean, externalhyperLink?: string, tooltipText?: string) {

    this.name = name;
    this.id = id;

    if (hyperLink) {
      this.hyperLink = hyperLink;
    }
    if (externalhyperLink || externalhyperLink === '') {
      this.externalhyperLink = externalhyperLink;
    } else {
      this.externalhyperLink = this.hyperLink;
    }
    if (subMenuItems && subMenuItems.length > 0) {
      this.subMenuItems = subMenuItems;
      this.hyperLink = undefined;
      this.externalhyperLink = undefined;
    }
    if (icon) {
      this.icon = icon;
    } else {
      this.icon = FortigoConstant.SIDE_NAV_DEFAULT_ICON;
    }
    if (isExternalLink) {
      this.isExternalLink = isExternalLink;
    }
    if (isExternalLink === undefined) {
      // by default exernal link is true
      this.isExternalLink = true;
    }

    if (tooltipText) {
      this.tooltipText = tooltipText;
    } else {
      this.tooltipText = '';
    }
  }

}
