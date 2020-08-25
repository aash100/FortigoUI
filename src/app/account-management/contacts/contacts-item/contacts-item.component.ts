import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Contact } from '../contact';
import * as _ from 'lodash';
import { MatTabGroup } from '@angular/material';
import { ContactService } from '../../services/contact.service';
import { ContactStatus } from '../../models/contact-status.model';
import { ContactLocationMapStatus } from '../../models/contact-locationmap-status.model';
import { ContactOrientation } from '../../models/contact-orientation.model';
import { ContactCategory } from '../../models/contact-category.model';
import { CustomerService } from '../../services/customer.service';
import { ContactRole } from '../../models/contact-role.model';
import Swal from 'sweetalert2';
import { Company } from '../../models/company.model';
import { Router } from '@angular/router';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-contacts-item',
  templateUrl: './contacts-item.component.html',
  styleUrls: ['./contacts-item.component.css']
})
export class ContactsItemComponent implements OnInit {
  @ViewChild('matTabGroup',{static:false}) matTabGroup: MatTabGroup;
  mode = '';
  readOnlyContact = false;
  selectedCompanyId: any;
  data: any;
  name: any;
  alias: any;
  topicHasError = true;
  companyId: string;
  locationId: number;
  userId: number;
  cityId: any;
  stateId: any;
  companyList: any[] = [];
  locationList: any[] = [];
  stateList: any[] = [];
  userList: any[];
  selectedState: any = null;
  selectedCity: any = null;
  selectedCompany: any = null;
  selectedLocation: any = null;
  selectedUser: any = null;
  editContact: Contact;
  title: String = '';
  isCallback = false;


  public isCompanySelectDisabled: boolean;
  public isCompanySelected: boolean;
  public isLocationSelected: boolean;

  contact: Contact = {
    contactId: undefined,
    userId: undefined,
    companyId: undefined,
    companyStringId: undefined,
    contactFirstName: undefined,
    contactMiddleName: undefined,
    contactLastName: undefined,
    contactMobileNumber: undefined,
    contactPhoneNumber: undefined,
    contactMobileAltNumber: undefined,
    contactPhoneAltNumber: undefined,
    contactEmail: undefined,
    contactDesignation: undefined,
    locationId: undefined,
    createdOn: null,
    contactPersonalEmail: undefined,
    contactAlias: undefined,
    contactStatus: '#',
    contactCategory: '#',
    contactOrientation: '#',
    contactDepartment: undefined,
    contactRole: '#',
    contactRoleAdditionalDetails: undefined,
    contactLocationMapStatus: '#',
    postalAddress: undefined,
    googleAddress: undefined,
    otherAddressDetails: undefined,
    pinCode: undefined,
    contactLocationRole: undefined
  };

  ContactStatus: Array<ContactStatus> = new Array<ContactStatus>();
  ContactCategory: Array<ContactCategory> = new Array<ContactCategory>();
  ContactOrientation: Array<ContactOrientation> = new Array<ContactOrientation>();
  ContactRole: Array<ContactRole> = new Array<ContactRole>();
  ContactLocationMapStatus: Array<ContactLocationMapStatus> = new Array<ContactLocationMapStatus>();
  CompanyFilter = {
    displayKey: 'companyName',
    search: true,
    height: '200px',
    // limitTo: 30,
    placeholder: 'Please Select a company',
    noResultsFound: 'No Company found',
    searchPlaceholder: 'Please enter the company name'
  };

  UserFilter = {
    displayKey: 'userFirstName',
    search: true,
    height: '200px',
    limitTo: 10,
    placeholder: 'Please Select a User',
    noResultsFound: 'No User found',
    searchPlaceholder: 'Please enter the User name'
  };

  LocationFilter = {
    displayKey: 'locationName',
    search: true,
    height: '200px',
    limitTo: 10,
    placeholder: 'Please Select a city',
    noResultsFound: 'No Location found',
    searchPlaceholder: 'Please enter the location name'
  };

  CityFilter = {
    displayKey: 'locationName',
    search: true,
    height: '200px',
    limitTo: 10,
    placeholder: 'Please Select a City',
    noResultsFound: 'No City found',
    searchPlaceholder: 'Please enter the City name'
  };

  StateFilter = {
    displayKey: 'locationName',
    search: true,
    height: '200px',
    limitTo: 10,
    placeholder: 'Please select a state',
    noResultsFound: 'No state found',
    searchPlaceholder: 'Please enter the state name'
  };

  constructor(
    public activeModal: NgbActiveModal,
    private contactService: ContactService,
    private _customerService: CustomerService,
    private router: Router
  ) {
    this.ContactStatus.push(new ContactStatus('active', 'Active', true));
    this.ContactStatus.push(new ContactStatus('inactive', 'Inactive'));
    this.ContactStatus.push(new ContactStatus('other', 'Others'));

    this.ContactCategory.push(new ContactCategory('primary', 'Primary', true));
    this.ContactCategory.push(new ContactCategory('secondary', 'Secondary'));
    this.ContactCategory.push(new ContactCategory('escalation', 'Escalation'));
    this.ContactCategory.push(new ContactCategory('unknown', 'Unknown'));

    this.ContactOrientation.push(new ContactOrientation('positive', 'Positive'));
    this.ContactOrientation.push(new ContactOrientation('negative', 'Negative'));
    this.ContactOrientation.push(new ContactOrientation('neutral', 'Neutral', true));
    this.ContactOrientation.push(new ContactOrientation('unknown', 'Unknown'));

    this.ContactRole.push(new ContactRole('decision_maker', 'Decision Maker'));
    this.ContactRole.push(new ContactRole('decision_influencer', 'Decision Influencer'));
    this.ContactRole.push(new ContactRole('process_owner', 'Process Owner'));
    this.ContactRole.push(new ContactRole('end_user', 'End User', true));

    this.ContactLocationMapStatus.push(new ContactLocationMapStatus('active', 'Active', true));
    this.ContactLocationMapStatus.push(new ContactLocationMapStatus('inactive', 'Inactive'));
  }

  ngOnInit() {
    this.getCompaniesList();
    this.getLocationList();
    if (this.mode === 'create') {
      this.editContact = this.contact;
      if (this.selectedCompanyId) {
        this.isCompanySelected = true;
        this.isCompanySelectDisabled = true;
      }
      this.setDefautValues();
    } else if (this.mode === 'edit') {
      this.editContactDetails();
      this.isCompanySelectDisabled = true;
      this.isCompanySelected = true;
      this.isLocationSelected = true;
    } else if (this.mode === 'view') {
      this.editContactDetails();
      this.readOnlyContact = true;
    }
  }

  editContactDetails() {
    this.editContact = this.contactService.getEditContactDetails();
  }

  getLocationList() {
    this.contactService.getLocationList().subscribe(data => {
      this.locationList = data;
      const list = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].locationTypeId === 3) {
          this.stateList.push(data[i]);
        }
      }
      if (this.editContact && (this.mode === 'edit' || this.mode === 'view')) {
        const locationId = this.editContact.locationId;
        const selectedLocationObj = _.find(this.locationList, function (
          location
        ) {
          return location.locationId === locationId;
        });
        this.selectedLocation = '';
        this.selectedLocation = selectedLocationObj;

        const cityId = this.editContact.locationId;
        const selectedCityObj = _.find(this.locationList, function (city) {
          return city.locationId === cityId;
        });
        this.selectedCity = [];
        this.selectedCity.push(selectedCityObj);

        const stateId = this.editContact.locationId;
        const selectedStateObj = _.find(this.locationList, function (state) {
          return state.locationId === stateId;
        });
        this.selectedState = [];
        this.selectedState.push(selectedStateObj);

      }
    });
  }

  getCompaniesList() {
    this.contactService.getCompaniesList().subscribe(data => {
      this.companyList = data;

      if (this.editContact && this.mode === 'create' && this.selectedCompanyId) {
        // tslint:disable-next-line:radix
        const selectedCompanyId = this.selectedCompanyId;
        const selectCompanyObject = _.find(this.companyList, function (company) {
          return company.companyStringId === selectedCompanyId;
        });
        this.selectedCompany = [];
        this.selectedCompany.push(selectCompanyObject);
        this.userList = null;
        this.contactService.getUserList(selectedCompanyId).subscribe(uList => {
          this.userList = uList;
        });
      }

      if (this.editContact && (this.mode === 'edit' || this.mode === 'view')) {
        const companyId = this.editContact.companyId;
        const selected_UserId = this.editContact ? this.editContact.userId : undefined;
        const selectedCompanyObj = _.find(this.companyList, function (company) {
          return company.companyId === companyId;
        });
        this.selectedCompany = [];
        this.selectedCompany.push(selectedCompanyObj);

        this.userList = null;
        this.contactService.getUserList(companyId).subscribe(uList => {
          this.userList = uList;
          this.selectedUser = '';
          const selectedUserObj = _.find(this.userList, function (user) {
            return user.userId === selected_UserId;
          });

          if (this.selectedUser && selectedUserObj !== undefined) {
            this.selectedUser = selectedUserObj;
          }

        });

      }
    });
  }

  selectCompany(company: Company) {
    if (company) {
      this.companyId = company.companyStringId;
      this.userList = null;
      this.isCompanySelected = true;
      this.contactService.getUserList(this.companyId).subscribe(data => {
        this.userList = data;
      });
    } else {
      this.isCompanySelected = false;
      this.selectedCompany = '';
    }
  }

  selectLocation(locationDetails: any) {
    if (locationDetails) {
      this.locationId = locationDetails.locationId;
      this.isLocationSelected = true;
    } else {
      this.selectedLocation = '';
      this.isLocationSelected = false;
    }
  }

  selectCity(cityDetails: any) {
    if (cityDetails && cityDetails.length > 0) {
      this.cityId = cityDetails[0].locationId;
    } else {
      this.selectedCity = '#';
    }
  }

  selectState(stateDetails: any) {
    if (stateDetails && stateDetails.length > 0) {
      this.stateId = stateDetails[0].locationId;
    } else {
      this.selectedState = '#';
    }
  }

  addUser(userData: any) {
    if (userData) {
      this.userId = userData.userId;
    }
  }

  onSubmit() {
    if (this.validateContactForm()) {
      this.editContact.companyId = this.selectedCompany.companyStringId;
      this.editContact.locationId = this.selectedLocation.locationId;

      // Pass value to second screen
      this._customerService.selectedCompanyId = this.selectedCompany.companyStringId;
      this._customerService.selectedCompanyName = this.selectedCompany.companyName;
      if (this.selectedUser) {
        this.editContact.userId = this.selectedUser.userId;
      } else {
        this.editContact.userId = 0; // if no user belongs to a company then add the system user as a part of contact
      }
      this.contactData(this.editContact, this.editContact.companyId, this.mode);
      this.activeModal.dismiss('Submit');
      if (!this.isCallback) {
        this.router.navigate(['/customer/company/contacts/' + this.editContact.companyId]);
      }
    }

  }

  public contactData(contactData: any, companyId: string, mode: string) {
    if (mode === 'create') {
      this.contactService.contactLoading = true;
      console.log('create contact ', contactData);
      this.contactService.createContact(contactData).subscribe(
        (response) => {
          this.contactService.meetingModalParticipantReload.next();
          if (response['response'].toLowerCase() === FortigoConstant.SUCCESS_RESPONSE.toLowerCase()) {
            Swal.fire('Contact created successfully.', '', 'success');
            this.contactService.contactReload.next();
            this._customerService.refreshAccount.next('');

          } else {
            Swal.fire('Contact creation failed');
            this.contactService.contactLoading = false;
          }
          this.activeModal.dismiss('Submit');
        },
        () => {
          Swal.fire('Please check your internet connection or Login again', '', 'error');
          this.contactService.contactLoading = false;

        },
        () => {
          this.contactService.contactLoading = false;
        }
      );
    } else if (mode === 'edit') {
      this.contactService.contactLoading = true;
      this.contactService.updateContact(contactData).subscribe(
        (response) => {
          if (response['response'].toLowerCase() === FortigoConstant.SUCCESS_RESPONSE.toLowerCase()) {
            Swal.fire('Contact updated successfully.', '', 'success');
            this.contactService.contactReload.next();
            this._customerService.refreshAccount.next('');

          } else {
            Swal.fire('Contact updation Failed');
          }
          this.activeModal.dismiss('Submit');
        },
        () => {
          Swal.fire('Please check your internet connection or Login again', '', 'error');
          this.contactService.contactLoading = false;

        },
        () => {
          this.contactService.contactLoading = false;
        });
    } else if (mode === 'delete') {
      this.contactService.contactLoading = true;
      contactData.meetingStatus = 'inactive';
      this.contactService.deleteContact(contactData).subscribe(
        (data) => {
          Swal.fire('Contact deleted successfully.', '', 'success');
          this.contactService.refresh(companyId);
          this._customerService.refreshAccount.next('');

        },
        () => {
          Swal.fire('Please check your internet connection or Login again', '', 'error');
          this.contactService.contactLoading = false;

        },
        () => {
          this.contactService.contactLoading = false;
        });
    } else {
      alert(' Please select a valid contact mode');
    }
  }

  addlocationPopUp() {
    console.log(' google address inside addlocationPopUp()');
  }

  nextTab() {
    this.matTabGroup.selectedIndex = 1;
  }

  backClicked() {
    this.matTabGroup.selectedIndex = 0;
  }

  public validateContactForm(): boolean {
    if (!this.validateContactTab()) {
      return false;
    }
    if (!this.validateAddressTab()) {
      return false;
    }
    return true;
  }
  public validateContactTab(): boolean {
    if (this.editContact.contactFirstName === undefined || this.editContact.contactFirstName === '') {
      Swal.fire('Please enter the contact first name.');
      return false;
    }
    return true;
  }

  public validateAddressTab(): boolean {
    if (!this.isCompanySelected) {
      Swal.fire('Please select a company.');
      return false;
    } else if (!this.isLocationSelected) {
      Swal.fire('Please select a contact location.');
      return false;
    } else if (this.editContact.postalAddress === undefined || this.editContact.postalAddress === '') {
      Swal.fire('Please enter the postal address.');
      return false;
    }
    return true;
  }
  private setDefautValues() {
    this.editContact.contactLocationMapStatus = this.ContactLocationMapStatus.filter((eachStatus) => {
      if (eachStatus.isDefault) {
        return true;
      }
    })[0].name;
    this.editContact.contactStatus = this.ContactStatus.filter((eachStatus) => {
      if (eachStatus.isDefault) {
        return true;
      }
    })[0].name;
    this.editContact.contactOrientation = this.ContactOrientation.filter((eachStatus) => {
      if (eachStatus.isDefault) {
        return true;
      }
    })[0].name;
    this.editContact.contactCategory = this.ContactCategory.filter((eachStatus) => {
      if (eachStatus.isDefault) {
        return true;
      }
    })[0].name;
    this.editContact.contactRole = this.ContactRole.filter((eachStatus) => {
      if (eachStatus.isDefault) {
        return true;
      }
    })[0].name;
  }

}
