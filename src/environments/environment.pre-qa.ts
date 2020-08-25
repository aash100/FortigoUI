export const environment = {
  name: 'pre-qa',

  production: false,

  baseUrl: 'https://plataccpttest.4tigo.com:7112',
  baseUIUrl: 'https://plataccpttest.4tigo.com:4211',

  phpLoginUrl: 'https://plataccpttest.4tigo.com/index.php?action=login',
  baseUrlPHP: 'https://plataccpttest.4tigo.com/app/index.php',
  basePHPUIUrl: 'https://plataccpttest.4tigo.com/',

  baseUrlUserJava: 'https://plataccpttest.4tigo.com:9422/user_mgmt',
  baseUrlJava: 'https://plataccpttest.4tigo.com:9422/container_acct_mgmt',
  baseUrlInvoiceJava: 'https://plataccpttest.4tigo.com:9422/invoices',
  baseUrlTripJava: 'https://plataccpttest.4tigo.com:9422/trips',
  baseUrlInventoryJava: 'https://plataccpttest.4tigo.com:9422/container_inventory_mgmt',
  baseUrlCollectionJava: 'https://plataccpttest.4tigo.com:9422/collections',
  baseUrlReportsJava: 'https://plataccpttest.4tigo.com:9422/reports',
  baseUrlContractJava: 'https://plataccpttest.4tigo.com:9442/contract_mgmt',
  baseUrlMediaJava: 'https://plataccpttest.4tigo.com:9442/news_blog',
  baseUrlNotificationJava: 'https://plataccpttest.4tigo.com:9422/notificationservice',

  baseSessionManagementPath: '/session_management',
  baseUserManagementPath: '/user_management',
  baseAccountManagementPath: '/account_management',
  baseInvoiceManagementPath: '/invoice_management',
  baseContractManagementPath: '/contract_management',
  baseReportsPath: '/reports',
  baseCollectionManagementPath: '/collection_management',
  baseTripInvoicingPath: '/trip_invoicing',
  baseInventoryManagementPath: '/inventory_management',
  baseSupportManagementPath: '/support_management',
  baseMediaManagementPath: '/news_blog',
  baseNotifactionManagementPath: '/notifications',
  basePHPPath: '/php',
  baseTermsPath: '/terms'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.
