import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { ActivatedRoute } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TargetModalComponent } from '../target-modal/target-modal.component';
import { Target } from '../../models/target.model';
import { TargetService } from '../../services/target.service';
import { DatePipe } from '@angular/common';
import { CompanyControllerService } from '../../services/company-controller.service';
import { TargetRemarksModalComponent } from '../target-remarks-modal/target-remarks-modal.component';

@Component({
  selector: 'app-target-list',
  templateUrl: './target-list.component.html',
  styleUrls: ['./target-list.component.css'],
  providers: [DatePipe]
})
export class TargetListComponent implements OnInit {
  public loading: boolean;
  private companyId: string;
  source: LocalDataSource;
  public formattedData = new Array<any>();
  public formattedDataBackup = new Array<any>();

  public userNameMap = new Map();
  ngbModalOptionsTargetRemarks: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
  };
  ngbModalOptionsTargetEdit: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg',
    windowClass: 'xtra-large'
  };
  settings = {
    mode: 'external',
    hideSubHeader: 'true',
    actions: {
      add: false,
      edit: false,
      delete: false,
      position: 'right',
      custom: [
        {
          title:
            '<i class="fa fa-edit mr-1" style="margin-right:30px" title="Edit"></i>',
          name: 'Edit'
        },
        {
          title:
            '<i class="fa fa-tv mr-1" style="margin-right:30px" title="View"></i>',
          name: 'View'
        }
      ]
    },
    columns: {
      0: {
        title: 'User Name',
      },
      1: {
        title: 'Year',
      },
      2: {
        title: 'Type',
      },
      3: {
        title: 'Apr',
      },
      4: {
        title: 'May',
      },
      5: {
        title: 'Jun',
      },
      6: {
        title: 'Jul',
      },
      7: {
        title: 'Aug',
      },
      8: {
        title: 'Sep',
      },
      9: {
        title: 'Oct',
      },
      10: {
        title: 'Nov',
      },
      11: {
        title: 'Dec',
      },
      12: {
        title: 'Jan',
      },
      13: {
        title: 'Feb',
      },
      14: {
        title: 'Mar',
      },
      15: {
        title: 'Q1',
      },
      16: {
        title: 'Q2',
      },
      17: {
        title: 'Q3',
      },
      18: {
        title: 'Q4',
      },
      19: {
        title: 'Y1',
      },
    }
  };
  financialYear: string;
  targetList: Array<any>;
  fromDate: string;
  toDate: string;
  mode: string;
  constructor(
    private _customerService: CustomerService,
    private _targetService: TargetService,
    private _activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private _datePipe: DatePipe,
    private _companyControllerService: CompanyControllerService
  ) { }

  ngOnInit() {
    this.loading = true;
    this._activatedRoute.paramMap.subscribe(
      (data) => {
        this.companyId = data.get('id').toString();
        this.loadTargetList();
        this.mode = 'default';
      }
    );
    this._customerService.targetFilterApplied.subscribe(
      (data) => {
        // this.companyId = data.get('id').toString();
        this.loadTargetList(data);
        this.mode = 'filter';
      }
    );
    this._companyControllerService.searchTarget.subscribe(
      (data) => {
        this.searchTarget(data);
      }
    );
    this._customerService.refreshTarget.subscribe(
      () => {
        this.searchTarget('');
      }
    );
  }
  private searchTarget(value) {
    if (value.trim().toLowerCase().length !== 0) {
      this.formattedData = this.formattedDataBackup.filter(
        e => e[0].trim().toLowerCase().includes(value.trim().toLowerCase())
      );
    } else {
      this.formattedData = this.formattedDataBackup;
    }
    this.source = new LocalDataSource(this.formattedData);
  }

  private loadTargetList(value?) {
    if (this.mode === 'filter') {
      this.fromDate = this._datePipe.transform(value.from, 'yyyy-MM-dd');
      this.toDate = this._datePipe.transform(value.to, 'yyyy-MM-dd');
    } else {
      const now = new Date();
      const nowMonth = now.getMonth();
      if ([0, 1, 2].includes(nowMonth)) {
        const from = new Date();
        const to = new Date();
        from.setDate(1);
        from.setMonth(3);
        from.setFullYear(from.getFullYear() - 1);

        to.setDate(31);
        to.setMonth(2);
        to.setFullYear(to.getFullYear());
        this.fromDate = this._datePipe.transform(from, 'yyyy-MM-dd');
        this.toDate = this._datePipe.transform(to, 'yyyy-MM-dd');
      } else {
        const from = new Date();
        const to = new Date();
        from.setDate(1);
        from.setMonth(3);
        from.setFullYear(from.getFullYear());

        to.setDate(31);
        to.setMonth(2);
        to.setFullYear(to.getFullYear() + 1);

        this.fromDate = this._datePipe.transform(from, 'yyyy-MM-dd');
        this.toDate = this._datePipe.transform(to, 'yyyy-MM-dd');
      }
    }
    this._customerService.getTargetList(this.companyId, this.fromDate, this.toDate).subscribe(
      (data1: any) => {
        if (data1.length !== 0) {
          this.targetList = data1;
          if (data1[0]['year'].toString().length === 4) {
            this.financialYear = data1[0]['year'] + '-' + (Number.parseInt(data1[0]['year'].toString().substring(2, 4)) + 1);
          } else {
            this.financialYear = '-';
          }
          this.formattedData.length = 0;
          this.targetList.forEach((eachTarget, index) => {
            this._customerService.getUserName(eachTarget.userId).subscribe(
              (userName: string) => {
                if (!this.userNameMap.has(eachTarget.userId)) {
                  this.userNameMap.set(eachTarget.userId, userName);
                }
                this.formatData(userName, eachTarget, 'targetRevenue');
                this.formatData(userName, eachTarget, 'targetMargin');
                this.formatData(userName, eachTarget, 'estimateRevenue');
                this.formatData(userName, eachTarget, 'estimateMargin');
                if (this.targetList.length - 1 === index) {
                  this.loading = false;
                }
              });
          });
          this.formattedDataBackup = this.formattedData;
          this.source = new LocalDataSource(this.formattedData);

        } else {
          this.source = new LocalDataSource();

          this.loading = false;
        }
      }
    );
  }

  private formatData(userName, data, targetName) {
    let count = 0;
    const row = {};
    row[count++] = userName;
    row[count++] = this.financialYear;
    switch (targetName) {
      case 'targetRevenue':
        row[count++] = 'Target - Revenue';
        break;
      case 'targetMargin':
        row[count++] = 'Target - Margin';
        break;
      case 'estimateRevenue':
        row[count++] = 'Estimate - Revenue';
        break;
      case 'estimateMargin':
        row[count++] = 'Estimate - Margin';
        break;
      default:
        break;
    }
    const monthly = data[targetName].monthly.map(e => e.data);
    const yearly = data[targetName].yearly.map(e => e.data);
    const quarterly = data[targetName].quarterly.map(e => e.data);
    monthly.forEach(
      (e, i) => {
        row[count] = e;
        count++;
      }
    );
    quarterly.forEach(
      (e, i) => {
        row[count] = e;
        count++;
      }
    );
    row[count++] = yearly[0];
    this.formattedData.push(row);
    this.source.refresh();
  }

  public onCustom(value) {
    this._targetService.getTargetEditEvent().subscribe(() => {
      this.loadTargetList();
      this.source.refresh();
    });

    let modalRef: NgbModalRef;
    switch (value['action']) {
      case 'View':
        modalRef = this.modalService.open(
          TargetRemarksModalComponent,
          this.ngbModalOptionsTargetRemarks
        );
        modalRef.componentInstance.targetList = this.targetList.filter((eachTarget: Target) => {
          return this.userNameMap.get(eachTarget.userId) === value['data'][0];
        })[0];
        modalRef.componentInstance.title = 'VIEW TARGET - REMARKS (all amounts are in Lakhs)';
        break;
      case 'Edit':
        modalRef = this.modalService.open(
          TargetModalComponent,
          this.ngbModalOptionsTargetEdit
        );
        modalRef.componentInstance.targetList = this.targetList.filter((eachTarget: Target) => {
          return this.userNameMap.get(eachTarget.userId) === value['data'][0];
        })[0];
        modalRef.componentInstance.title = 'EDIT TARGET';
        break;
      default:
        break;
    }
  }
}
