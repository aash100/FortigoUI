export const environment = {
  name: 'localhost',

  production: false,

  baseUrl: 'https://pltprdprlltest.4tigo.com:3001',
  baseUIUrl: 'https://pltprdprlltest.4tigo.com:4001',

  phpLoginUrl: 'https://pltprdprlltest.4tigo.com/index.php?action=login',
  baseUrlPHP: 'https://pltprdprlltest.4tigo.com/app/index.php',
  basePHPUIUrl: 'https://www.pltprdprlltest.4tigo.com/',

  baseUrlUserJava: 'https://pltprdprlltest.4tigo.com:9422/user_mgmt',
  baseUrlJava: 'https://pltprdprlltest.4tigo.com:9422/container_acct_mgmt',
  baseUrlInvoiceJava: 'https://pltprdprlltest.4tigo.com:9422/invoices',
  baseUrlTripJava: 'https://pltprdprlltest.4tigo.com:9422/trips',
  baseUrlInventoryJava: 'https://pltprdprlltest.4tigo.com:9422/container_inventory_mgmt',
  baseUrlCollectionJava: 'https://pltprdprlltest.4tigo.com:9422/collections',
  baseUrlReportsJava: 'https://pltprdprlltest.4tigo.com:9422/reports',
  baseUrlContractJava: 'https://pltprdprlltest.4tigo.com:9442/contract_mgmt',
  baseUrlMediaJava: 'https://pltprdprlltest.4tigo.com:9442/news_blog',
  baseUrlNotificationJava: 'https://pltprdprlltest.4tigo.com:9422/notificationservice',

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
