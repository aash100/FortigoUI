import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Contact } from '../contact';
import * as moment from 'moment';
import { ContactsItemComponent } from '../contacts-item/contacts-item.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalDataSource } from 'ng2-smart-table';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContactService } from '../../services/contact.service';
import { CompanyControllerService } from '../../services/company-controller.service';
import Swal from 'sweetalert2';
import { CustomerService } from '../../services/customer.service';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';


@Component({
  selector: 'app-contacts-list',
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.css'],
  providers: [TitleCasePipe]
})
export class ContactsListComponent implements OnInit, OnDestroy {

  companyId: number;
  source: LocalDataSource;
  contactList: Contact[];
  contactData: Contact;
  errorMessage: any;
  startRangeMS: number;
  endRangeMS: number;
  contactMS: number;
  fromDateRange: Date;
  toDateRange: Date;

  contactAddModalRef: Subscription;
  settings = {
    mode: 'external',
    hideSubHeader: true,
    pager: {
      display: true,
      perPage: 13
    },
    actions: {
      add: false,
      edit: false,
      delete: false,
      custom: [
        {
          title: '<i class="fa fa-tv mr-1" style="margin-right:30px" title="view"></i>',
          name: 'view'
        },
        {
          title: '<i class="fa fa-edit mr-1" style="margin-right:30px" title="edit"></i>',
          name: 'edit'
        },
        {
          title: '<i class="fa fa-trash mr-1" title="delete"></i>',
          name: 'delete'
        }
      ],
      position: 'right',
    },
    columns: {
      contactFirstName: {
        title: 'First Name'
      },
      contactLastName: {
        title: 'Last Name'
      },
      contactAlias: {
        title: 'Contact Alias'
      },
      contactMobileNumber: {
        title: 'Mobile Number'
      },
      contactEmail: {
        title: 'Email'
      },
      contactDepartment: {
        title: 'Contact Department'
      },
      contactDesignation: {
        title: 'Contact Designation'
      },
      contactCategory: {
        title: 'Contact Classification'
      },
      contactOrientation: {
        title: 'Contact Orientation'
      },
      contactStatus: {
        title: 'Contact Status'
      },
      // userId: {
      //   title: 'User Id'
      // },
      createdOn: {
        title: 'Created On',
        valuePrepareFunction: (date) => new DatePipe('en-US').transform(date, 'dd-MM-yyyy')
      }
    }
  };
  constructor(
    public contactService: ContactService,
    private customerService: CustomerService,
    private modalService: NgbModal,
    private companyControllerService: CompanyControllerService,
    private route: ActivatedRoute,
    private _titleCasePipe: TitleCasePipe
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.companyId = params['id'];
    });
    this.getContactsList(this.companyId);
    this.contactAddModalRef = this.companyControllerService.searchContacts.subscribe(
      (data) => {
        this.onSearch(data);
      }
    );
    this.contactService.contactFilterApplied.subscribe(
      (data) => {
        this.source = new LocalDataSource(this.getFilteredContacts(data.value));
      }
    );
    this.contactService.contactReload.subscribe(
      (response) => {
        this.source = new LocalDataSource(this.contactList);
        this.getContactsList(this.companyId);
      }
    );
    // this.contactService.contactReload.subscribe(
    //   (response) => {
    //   });
  }

  getContactsList(companyId: number): void {
    this.contactService.contactLoading = true;
    this.contactService.getContactsList(companyId)
      .subscribe(data => {
        data.map(
          (e) => {
            e.contactCategory = this._titleCasePipe.transform(e.contactCategory);
            e.contactOrientation = this._titleCasePipe.transform(e.contactOrientation);
            e.contactStatus = this._titleCasePipe.transform(e.contactStatus);
          }
        );
        this.contactList = data;
        this.contactService.contactList = data;
        this.source = new LocalDataSource(data);
        this.contactService.contactLoading = false;
      }, error => {
        this.errorMessage = <any>error;
        Swal.fire('Please check your internet connection or Login again', '', 'error');
        this.contactService.contactLoading = false;
      });

  }

  openFormModal(value: any) {
    const modalRef = this.modalService.open(ContactsItemComponent, { size: 'lg' });
    modalRef.componentInstance.title = 'NEW CONTACT';
    modalRef.componentInstance.mode = value;
  }

  onCustom(contactData: Contact, contactAction: string) {
    if (contactAction === 'view') {
      this.viewContactDetails(contactData);
    } else if (contactAction === 'edit') {
      this.editContactDetails(contactData);

    } else if (contactAction === 'delete') {

      Swal.fire({
        title: 'Are you sure?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
        cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
        confirmButtonText: 'Yes, delete it!'
      }).then(result => {
        if (result.value) {
          this.deleteContact(contactData);
        }
      });
    }
  }

  onSearch(query: string = '') {
    if (query.trim().length === 0) {
      this.source = new LocalDataSource(this.contactService.contactList);
    } else {

      this.source.setFilter([
        {
          field: 'contactFirstName',
          search: query
        },
        {
          field: 'contactLastName',
          search: query
        },
        {
          field: 'contactAlias',
          search: query
        },
        {
          field: 'contactMobileNumber',
          search: query
        },
        {
          field: 'contactEmail',
          search: query
        },
        {
          field: 'contactDepartment',
          search: query
        },
        {
          field: 'contactDesignation',
          search: query
        },
        {
          field: 'contactCategory',
          search: query
        },
        {
          field: 'contactOrientation',
          search: query
        },
        {
          field: 'contactStatus',
          search: query
        },
        {
          field: 'createdOn',
          search: query
        }
      ], false);
    }
    console.log('filter data: ', this.source);

  }

  viewContactDetails(selectedContact: Contact) {
    if (selectedContact) {
      this.contactService.viewContact(selectedContact.contactId).subscribe(
        data => {
          this.contactData = data;
          this.contactService.setEditContactDetails(this.contactData);
          const modalRef = this.modalService.open(ContactsItemComponent, { size: 'lg' });
          modalRef.componentInstance.title = 'CONTACT DETAILS';
          modalRef.componentInstance.mode = 'view';
        },
        () => {
          // console.log('failed');
          Swal.fire('Please check your internet connection or Login again', '', 'error');

        },
        () => {
          this.contactService.contactLoading = false;
        }
      );
    }
  }

  deleteContact(contactData: Contact) {
    if (contactData.contactId) {
      this.contactService.contactLoading = true;
      this.contactService.deleteContact(contactData).subscribe(
        response => {
          this.contactService.contactReload.next();
          this.contactService.contactLoading = false;
        },
        () => {
          Swal.fire('Please check your internet connection or Login again', '', 'error');
          this.contactService.contactLoading = false;
        }
      );
    }
  }

  editContactDetails(selectedContact: Contact) {
    if (selectedContact) {
      this.contactService.contactLoading = true;
      this.contactService.editContact(selectedContact.contactId).subscribe(
        data => {
          this.contactData = data;

          this.contactService.setEditContactDetails(this.contactData);
          // this.contactService.contactLoading = false;
          const modalRef = this.modalService.open(ContactsItemComponent, { size: 'lg' });
          modalRef.componentInstance.title = 'EDIT CONTACT';
          modalRef.componentInstance.mode = 'edit';
        },
        () => {
          this.contactService.contactLoading = false;
          Swal.fire('Please check your internet connection or Login again', '', 'error');
        },
        () => {
          this.contactService.contactLoading = false;
        }
      );
    }
  }

  public compareDatesInRange(fromDate: Date, toDate: Date, contactDate: Date): boolean {
    let include = false;

    this.startRangeMS = fromDate ? fromDate.getTime() : undefined;
    this.endRangeMS = toDate ? toDate.getTime() + 86400000 : undefined; // added extra 86400000(no. of milliseconds in a day) to get all the contacts of the end date..
    this.contactMS = (moment(contactDate).toDate().getTime());

    if (fromDate && toDate && (this.startRangeMS <= this.contactMS) && (this.contactMS <= this.endRangeMS)) {
      include = true;
    } else if (fromDate && !toDate && (this.startRangeMS <= this.contactMS)) {
      include = true;
    } else if (!fromDate && toDate && (this.contactMS <= this.endRangeMS)) {
      include = true;
    }
    return include;
  }

  public getFilteredContacts(filteredColumn: any): any[] {
    const output = [];
    for (let i = 0; i < this.contactList.length; i++) {
      if (filteredColumn['contactCreatedOnStartDate'] || filteredColumn['contactCreatedOnEndDate']) {
        if (this.compareDatesInRange(filteredColumn['contactCreatedOnStartDate'], filteredColumn['contactCreatedOnEndDate'], this.contactList[i].createdOn)) {
          output.push(this.contactList[i]);
        }
      }
    }
    return output;
  }

  ngOnDestroy(): void {
    this.contactAddModalRef.unsubscribe();
  }

}
