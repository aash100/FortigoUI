export class Account {
  userId: number;
  accountId: string;
  accountStringId: string;
  addressId: number;
  accountName: string;
  accountcustomerTypeName: string;
  accountLegalEntityType: string;
  accountCategoryName: string;
  accountParentId: number;
  accountAlias: string;
  accountAnnualRevenue: string;
  accountAnnualLogisticSpent: string;
  accountLTL: string;
  accountFTL: string;
  accountParcel: string;
  accountStatus: string;
  accountIndustryType: string;
  accountCommodityType: string;
  accountGrade: string;
  accountGeographicScope: string;
  accountNationalManagerID: number;
  accountAddressableFreightValue: string;
  accountNationalManagerName: string;
  accountAddressableFTL: string;
  accountExpectedMonthlyBusiness: string;
  accountTruckType: string;
  routesOperated: string;
  expectedDateOfBusinessCommencement: Date;
  biddingDate: Date;
  // Range Values
  accountAnnualRevenueLowerRange: number;
  accountAnnualRevenueUpperRange: number;
  accountAnnualLogisticSpentLowerRange: number;
  accountAnnualLogisticSpentUpperRange: number;
  accountLTLLowerRange: number;
  accountLTLUpperRange: number;
  accountFTLLowerRange: number;
  accountFTLUpperRange: number;
  accountParcelLowerRange: number;
  accountParcelUpperRange: number;
  accountAddressableFreightValueLowerRange: number;
  accountAddressableFreightValueUpperRange: number;
  accountAddressableFTLLowerRange: number;
  accountAddressableFTLUpperRange: number;
  accountExpectedMonthlyBusinessLowerRange: number;
  accountExpectedMonthlyBusinessUpperRange: number;
  // location fields
  accountLocationTypeName: string;
  accountLocationName: string;
  accountLocationGSTIN: string;
  accountPhoneNumber: number;
  accountAltPhoneNumber: number;
  accountMobileNumber: number;
  accountAltMobileNumber: number;
  accountEmailAddress: string;

  // address fields
  accountLocationId: number;
  accountPinCode: string;
  accountPostalAddress: string;
  accountGoogleAddress: string;
  accountLatitude: number;
  accountLongitude: number;
  otherAddressDetails: string;
  accountLandmark: string;
  this: any;
}
