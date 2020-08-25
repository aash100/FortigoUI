import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TargetService } from '../../services/target.service';
import { CustomerService } from '../../services/customer.service';
import { DatePipe } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-target-remarks-modal',
  templateUrl: './target-remarks-modal.component.html',
  styleUrls: ['./target-remarks-modal.component.css'],
  providers: [DatePipe]
})
export class TargetRemarksModalComponent implements OnInit {

  public loading: boolean;
  public targetList: any;
  public title: string;
  public source: LocalDataSource;
  private user: string;
  public settings = {
    mode: 'external',
    hideSubHeader: 'true',
    actions: {
      add: false,
      edit: false,
      delete: false,
      position: 'right'
    },
    columns: {
      0: {
        title: 'User Name',
        width: '10%'
      },
      1: {
        title: 'Year',
        width: '10%'
      },
      2: {
        title: 'Type',
        width: '10%'
      },
      3: {
        title: 'Date',
        width: '10%'
      },
      4: {
        title: 'Updated By',
        width: '10%'
      },
      5: {
        title: 'Revenue',
        width: '10%'
      },
      6: {
        title: 'Revenue - Remarks',
        width: '15%'
      },
      7: {
        title: 'Margin',
        width: '10%'
      },
      8: {
        title: 'Margin - Remarks',
        width: '15%'
      }
    }
  };
  public data = new Array<any>();

  constructor(private _targetService: TargetService,
    private _customerService: CustomerService,
    private _datePipe: DatePipe,
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.loading = true;
    this.loadTargetRemarksList(this.targetList.targetId);
    this.user = this._customerService.users.filter(eachUser => this.targetList.userId.toString() === eachUser.userId.toString())[0];
  }


  private loadTargetRemarksList(targetId: number) {
    this._targetService.getTargetWithRemarks(targetId).subscribe((response1: Array<any>) => {
      this.loading = false;
      if (response1 && response1.length > 0) {
        response1.forEach((eachResponse) => {
          this.formatData(eachResponse);
        });
      }
    });
  }

  private formatData(eachRow: any) {
    const updatedBy = this._customerService.users.filter(eachUser => eachRow.updatedBy === eachUser.userId)[0];
    let financialYear: string;
    if (eachRow.financialYear.toString().length === 4) {
      financialYear = eachRow.financialYear + '-' + (Number.parseInt(eachRow.financialYear.toString().substring(2, 4)) + 1);
    } else {
      financialYear = '-';
    }
    const date = this.getDate(eachRow.targetDate, eachRow.targetDuration);

    let count = 0;
    const row = {};
    if (this.user) {
      row[count++] = this.user['firstName'] + ' ' + this.user['lastName'];
    } else {
      row[count++] = '';
    }
    row[count++] = financialYear;
    row[count++] = eachRow.projectionType;
    row[count++] = date;
    if (eachRow.updatedBy === 0 || eachRow.updatedBy === '0') {
      row[count++] = '-';
    } else {
      row[count++] = updatedBy['firstName'] + ' ' + updatedBy['lastName'];
    }
    row[count++] = eachRow.revenue;
    if (eachRow.targetRevenueRemarks) {
      row[count++] = eachRow.targetRevenueRemarks.substring(0, 10).concat('...');
    } else {
      row[count++] = '';
    }
    // row[count++] = eachRow.targetRevenueRemarks;
    row[count++] = eachRow.margin;
    if (eachRow.targetMarginRemarks) {
      row[count++] = eachRow.targetMarginRemarks.substring(0, 10).concat('...');
    } else {
      row[count++] = '';
    }
    // row[count++] = eachRow.targetMarginRemarks;

    this.data.push(row);
    this.source = new LocalDataSource(this.data);
    this.source.refresh();
  }

  private getDate(date: Date, dateType: string): string {
    let dateFormat: string;
    let dateInString: string;
    switch (dateType) {
      case 'monthly':
        dateFormat = 'MMM';
        dateInString = this._datePipe.transform(date, dateFormat);
        break;
      case 'quarterly':
        dateFormat = 'M';
        if (Number.parseInt(this._datePipe.transform(date, dateFormat)) >= 4 && Number.parseInt(this._datePipe.transform(date, dateFormat)) <= 6) {
          dateInString = 'Q1';
        }
        if (Number.parseInt(this._datePipe.transform(date, dateFormat)) >= 7 && Number.parseInt(this._datePipe.transform(date, dateFormat)) <= 9) {
          dateInString = 'Q2';
        }
        if (Number.parseInt(this._datePipe.transform(date, dateFormat)) >= 10 && Number.parseInt(this._datePipe.transform(date, dateFormat)) <= 12) {
          dateInString = 'Q3';
        }
        if (Number.parseInt(this._datePipe.transform(date, dateFormat)) >= 1 && Number.parseInt(this._datePipe.transform(date, dateFormat)) <= 3) {
          dateInString = 'Q4';
        }
        break;
      case 'yearly':
        dateFormat = 'yyyy';
        dateInString = this._datePipe.transform(date, dateFormat);
        break;
      default:
        break;
    }
    return dateInString;
  }

}
