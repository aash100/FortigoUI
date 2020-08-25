export class Contact {
    contactId: number;
    userId: number;
    companyId: string;
    companyStringId: string;
    contactFirstName: string;
    contactMiddleName: string;
    contactLastName: string;
    contactMobileNumber: string;
    contactPhoneNumber: string;
    contactMobileAltNumber: string;
    contactPhoneAltNumber: string;
    contactEmail: string;
    contactDesignation: string;
    locationId: number;
    createdOn: Date;
    contactPersonalEmail: string;
    contactAlias: string;
    contactStatus: string;
    contactCategory: string;
    contactOrientation: string;
    contactDepartment: string;
    contactRole: string;
    contactRoleAdditionalDetails: string;
    contactLocationMapStatus: string;
    postalAddress: string;
    googleAddress: string;
    otherAddressDetails: string;
    pinCode: string;
    contactLocationRole: string;

    constructor(
        contactId: number,
        userId: number,
        companyId: string,
        companyStringId: string,
        contactFirstName: string,
        contactMiddleName: string,
        contactLastName: string,
        contactMobileNumber: string,
        contactPhoneNumber: string,
        contactMobileAltNumber: string,
        contactPhoneAltNumber: string,
        contactEmail: string,
        contactDesignation: string,
        locationId: number,
        createdOn: Date,
        contactPersonalEmail: string,
        contactAlias: string,
        contactStatus: string,
        contactCategory: string,
        contactOrientation: string,
        contactDepartment: string,
        contactRole: string,
        contactRoleAdditionalDetails: string,
        contactLocationMapStatus: string,
        postalAddress: string,
        googleAddress: string,
        otherAddressDetails: string,
        pinCode: string,
        contactLocationRole: string
    ) {
        this.contactId = contactId;
        this.userId = userId;
        this.companyId = companyId;
        this.companyStringId = companyStringId;
        this.contactFirstName = contactFirstName;
        this.contactMiddleName = contactMiddleName;
        this.contactLastName = contactLastName;
        this.contactMobileNumber = contactMobileNumber;
        this.contactPhoneNumber = contactPhoneNumber;
        this.contactMobileAltNumber = contactMobileAltNumber;
        this.contactPhoneAltNumber = contactPhoneAltNumber;
        this.contactEmail = contactEmail;
        this.contactDesignation = contactDesignation;
        this.locationId = locationId;
        this.createdOn = createdOn;
        this.contactPersonalEmail = contactPersonalEmail;
        this.contactAlias = contactAlias;
        this.contactStatus = contactStatus;
        this.contactCategory = contactCategory;
        this.contactOrientation = contactOrientation;
        this.contactDepartment = contactDepartment;
        this.contactRole = contactRole;
        this.contactRoleAdditionalDetails = contactRoleAdditionalDetails;
        this.contactLocationMapStatus = contactLocationMapStatus;
        this.postalAddress = postalAddress;
        this.googleAddress = googleAddress;
        this.otherAddressDetails = otherAddressDetails;
        this.pinCode = pinCode;
        this.contactLocationRole = contactLocationRole;
    }
}
