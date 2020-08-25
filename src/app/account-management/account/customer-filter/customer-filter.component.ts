import { Component, OnInit, EventEmitter, Output, ViewChild, AfterViewInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgForm, FormControl } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { ToastrService } from 'ngx-toastr';
import { AccountFilterCriteria } from '../../models/account-filter-model';
import { LoginControlService } from 'src/app/app-landing/services/login-control.service';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MatSelect } from '@angular/material';

@Component({
  selector: 'app-customer-filter',
  templateUrl: './customer-filter.component.html',
  styleUrls: ['./customer-filter.component.css']
})
export class CustomerFilterComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() selectedTab;
  constructor(
    private _customerService: CustomerService,
    private _toastrService: ToastrService,
    private _loginControlService: LoginControlService) { }

  @Output() backClicked = new EventEmitter<void>();
  @Output() isFilterApplied = new EventEmitter<boolean>();

  @Input() removedFilter: string;

  @ViewChild('filterForm',{static:false}) filterForm: NgForm;
  @ViewChild('singleSelect',{static:false}) singleSelect: MatSelect;

  clearFormClicked: boolean;

  managerList: Array<any>;
  selectedAccountManager: any;

  public managerCtrl: FormControl = new FormControl();
  public managerFilterCtrl: FormControl = new FormControl();
  public filteredManagers: ReplaySubject<Array<any>> = new ReplaySubject<Array<any>>(1);
  private _onDestroy = new Subject<void>();
  public selectKey;
  public selectValue;
  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this._customerService.searchFilterToggler.subscribe((data: string) => {
      switch (data) {
        case 'search':
          if (this._customerService.filterSelectedField.length > 0) {
            this.clearForm();
            this._customerService.filterSelectedField = new Array<AccountFilterCriteria>();
          }
          break;
        default:
          break;
      }
    });

    this.getManagerList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.
    if (changes.selectedTab) {
      this.selectedTab = changes.selectedTab.currentValue;
      this.getManagerList();
      this.clearForm('silent');
    }
    if (changes.removedFilter) {
      this.removedFilter = changes.removedFilter.currentValue;
      if (this.removedFilter) {
        switch (this.removedFilter) {
          case 'contactPerson':
            this.filterForm.reset('contactPerson');
            break;
          case 'accountManager':
            this.selectedAccountManager = null;
            break;
        }

        this._toastrService.success('Filter removed successfully');
        this.applyFilter(this.filterForm);
      }
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  private filterManagers(field) {
    if (!this.managerList) {
      return;
    }
    let search = this.managerFilterCtrl.value;
    if (!search) {
      this.filteredManagers.next(this.managerList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the managers
    this.filteredManagers.next(
      this.managerList.filter(manager => manager[field].toLowerCase().indexOf(search) > -1)
    );
  }



  public applyFilter(formValue: NgForm) {
    this._customerService.filterSelectedField = new Array<AccountFilterCriteria>();
    this._customerService.searchFilterToggler.next('filter');
    if (this.selectedTab === 0) {
      this.applyFilterOnTab1(formValue);
    } else if (this.selectedTab === 2) {
      this.applyFilterOnTab2(formValue);
    }
    this.backIsClicked();
  }

  public clearForm(value?) {
    this.clearFormClicked = true;
    this.filterForm.reset();
    this.selectedAccountManager = undefined;
    if (this.selectedTab === 0) {
      this.filterForm.value['contactPerson'] = '';
    }
    // this.selectedAccountManager = null;
    this.managerCtrl.reset();
    this.applyFilter(this.filterForm);
    this.backIsClicked();
    if (value !== 'silent') {
      this._toastrService.success('Filter cleared successfully');
    }
  }
  public getManagerList() {
    if (this.selectedTab === 0) {
      this.selectKey = 'accountNationalManagerName';
      this._customerService.getNationalAccountManagerList().subscribe(
        (response: any[]) => {
          this.managerList = response;
          this.filteredManagers.next(this.managerList.slice());
          this.managerFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.filterManagers(this.selectKey);
            });
        },
        (error) => {
          // Swal.fire('Error', error, 'error');
        });
    }
    if (this.selectedTab === 2) {
      this.selectKey = 'salesManagerName';
      this._customerService.getSalesManager().subscribe(
        (response: any[]) => {
          this.managerList = response;
          this.filteredManagers.next(this.managerList.slice());
          this.managerFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.filterManagers(this.selectKey);
            });
        },
      );
    }
  }
  private setInitialValue() {
    this.filteredManagers
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.singleSelect.compareWith = (a: any, b: any) => {
          if (a && b) {
            return a.accountNationalManagerID === b.accountNationalManagerID;
          }
        };
      });
  }
  public backIsClicked() {
    this.backClicked.emit();
  }
  applyFilterOnTab1(formValue: NgForm) {
    this._customerService.filterSelectedField.length = 0;
    if (this.clearFormClicked) {
      this._customerService.customerReload.next();
      this.clearFormClicked = false;
      this.isFilterApplied.emit(false);
      this.backIsClicked();
      return;
    }
    if ((formValue.value['contactPerson'] !== null && formValue.value['contactPerson'] !== undefined && formValue.value['contactPerson'] !== '') || (this.selectedAccountManager !== null && this.selectedAccountManager !== undefined)) {
      this.isFilterApplied.emit(true);
      this._toastrService.success('Filter applied successfully');
    } else {
      this._customerService.customerReload.next();
    }
    if (formValue.value['contactPerson']) {
      this._customerService.filterSelectedField.push(new AccountFilterCriteria('contactPerson', formValue.value['contactPerson'], 'Contact Person'));
    }

    if (formValue.value['contactPerson'] && !this.selectedAccountManager) {
      let request: any;
      if (this._loginControlService.isReadOnlyUser) {
        request = this._customerService.applyAccountFilter({ contactPerson: formValue.value['contactPerson'] });
      } else {
        request = this._customerService.applyAccountFilterWithHierarchy(formValue.value['contactPerson']);
      }

      request.subscribe((res) => {
        this._customerService.accountFilteredData = res;
        this._customerService.accountFilter.next();
      });
    }
    if (this.selectedAccountManager) {
      this._customerService.filterSelectedField.push(new AccountFilterCriteria('accountManager', this.selectedAccountManager.accountNationalManagerName, 'Account Manager'));
      this._loginControlService.getCompanyIds(this.selectedAccountManager.accountNationalManagerID).subscribe((data) => {
        const temp: JSON = data['results'];
        let companyIds = '';
        if (temp['nationalCompanyIds']) {
          companyIds += temp['nationalCompanyIds'];
        }

        // FIXME: Implement user hierarchy
        console.log('company ids:' + companyIds);
        const companyListAndUserId = { 'companyIds': companyIds, 'userIds': this.selectedAccountManager.accountNationalManagerID.toString() };

        this._loginControlService.loadCompanies(false, companyListAndUserId).subscribe((response) => {
          this._customerService.accountFilteredData = response;
          this._customerService.accountFilter.next();
          console.log('filtered company:' + response);
        });
      });
    }
  }
  applyFilterOnTab2(formValue: NgForm) {
    this._customerService.filterSelectedField.length = 0;
    if (this.clearFormClicked) {
      this._customerService.salesReload.next();
      this.clearFormClicked = false;
      this.isFilterApplied.emit(false);
      this.backIsClicked();
      return;
    }
    if ((this.selectedAccountManager !== null && this.selectedAccountManager !== undefined)) {
      this.isFilterApplied.emit(true);
      this._toastrService.success('Filter applied successfully');
    } else {
      this._customerService.salesReload.next();
    }

    if (this.selectedAccountManager) {
      this._customerService.filterSelectedField.push(new AccountFilterCriteria('accountManager', this.selectedAccountManager.salesManagerName, 'Sales Manager'));
      this._customerService.salesFilter.next(this.selectedAccountManager.salesManagerId);

    }
  }
}
