import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SearchableSelectInputField, SelectOption } from 'src/app/shared/abstracts/field-type.model';
import { Target } from '../../models/target.model';
import { CustomerService } from '../../services/customer.service';
import { LoginControlService } from 'src/app/app-landing/services/login-control.service';

@Component({
  selector: 'app-target-form-card',
  templateUrl: './target-form-card.component.html',
  styleUrls: ['./target-form-card.component.css']
})
export class TargetFormCardComponent implements OnInit, OnChanges {
  @Input() data: Target;
  @Input() financialYear: string;
  @Input() mode: string;
  @Output() removedCard = new EventEmitter<Target>();
  @Output() savedCard = new EventEmitter<Target>();


  public fields: Array<any>;
  private currentFinancialYear: string;
  formData: any;

  constructor(public _loginService: LoginControlService, private _customerService: CustomerService) { }

  public ngOnInit() {
    this.createFields();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.

    if (this.financialYear) {
      const currentYear = this.financialYear.split('-')[0];
      const nextYear = currentYear.substring(0, 2) + this.financialYear.split('-')[1];

      if (this.currentFinancialYear === undefined || this.currentFinancialYear === this.financialYear) {
        this.setFinancialYear(currentYear, nextYear);
      } else {
        this.setFinancialYear(currentYear, nextYear, true);
      }

      this.currentFinancialYear = this.financialYear;
    }

    if (this.data) {
      this.createFields();
    }
  }

  private setFinancialYear(currentYear: string, nextYear: string, removeOld?: boolean) {
    // target revenue
    this.data.targetRevenue.monthly.forEach((dataSet) => {
      this.setMonthlyFinancialYear(dataSet, currentYear, nextYear, removeOld);
    });
    this.data.targetRevenue.quarterly.forEach((dataSet) => {
      this.setQuarterlyFinancialYear(dataSet, currentYear, nextYear, removeOld);
    });
    this.data.targetRevenue.yearly.forEach((dataSet) => {
      this.setYearlyFinancialYear(dataSet, removeOld);
    });

    // target margin
    this.data.targetMargin.monthly.forEach((dataSet) => {
      this.setMonthlyFinancialYear(dataSet, currentYear, nextYear, removeOld);
    });
    this.data.targetMargin.quarterly.forEach((dataSet) => {
      this.setQuarterlyFinancialYear(dataSet, currentYear, nextYear, removeOld);
    });
    this.data.targetMargin.yearly.forEach((dataSet) => {
      this.setYearlyFinancialYear(dataSet, removeOld);
    });

    // estimate revenue
    this.data.estimateRevenue.monthly.forEach((dataSet) => {
      this.setMonthlyFinancialYear(dataSet, currentYear, nextYear, removeOld);
    });
    this.data.estimateRevenue.quarterly.forEach((dataSet) => {
      this.setQuarterlyFinancialYear(dataSet, currentYear, nextYear, removeOld);
    });
    this.data.estimateRevenue.yearly.forEach((dataSet) => {
      this.setYearlyFinancialYear(dataSet, removeOld);
    });

    // estimate margin
    this.data.estimateMargin.monthly.forEach((dataSet) => {
      this.setMonthlyFinancialYear(dataSet, currentYear, nextYear, removeOld);
    });
    this.data.estimateMargin.quarterly.forEach((dataSet) => {
      this.setQuarterlyFinancialYear(dataSet, currentYear, nextYear, removeOld);
    });
    this.data.estimateMargin.yearly.forEach((dataSet) => {
      this.setYearlyFinancialYear(dataSet, removeOld);
    });
  }

  private setMonthlyFinancialYear(dataSet: any, currentYear: string, nextYear: string, removeOld: boolean): Object {
    if (removeOld) {
      dataSet.placeholder = dataSet.placeholder.split(' ')[0];
    }
    if (dataSet.id > 3) {
      dataSet.placeholder += ' ' + currentYear;
    } else {
      dataSet.placeholder += ' ' + nextYear;
    }
    return dataSet;
  }

  private setQuarterlyFinancialYear(dataSet: any, currentYear: string, nextYear: string, removeOld: boolean): Object {
    if (removeOld) {
      dataSet.placeholder = dataSet.placeholder.split(' ')[0];
    }
    if (dataSet.id > 1) {
      dataSet.placeholder += ' ' + currentYear;
    } else {
      dataSet.placeholder += ' ' + nextYear;
    }
    return dataSet;
  }

  private setYearlyFinancialYear(dataSet: any, removeOld: boolean): Object {
    if (removeOld) {
      dataSet.placeholder = dataSet.placeholder.split(' ')[0];
    }
    dataSet.placeholder += ' ' + this.financialYear;
    return dataSet;
  }

  private createFields() {
    const companyDropDown = new SelectOption('companyName', 'companyStringId', this._loginService.companyList);
    const companySearchableField = new SearchableSelectInputField('Select Company', 'companyStringId', companyDropDown, undefined, false, this.mode === 'edit' ? true : false, ['required'], undefined, undefined, this.data.companyId);

    const managerDropDown = new SelectOption('salesManagerName', 'salesManagerId', this._customerService.salesManagerList);
    const managerSearchableField = new SearchableSelectInputField('Select Manager', 'salesManagerId', managerDropDown, undefined, false, this.mode === 'edit' ? true : false, ['required'], undefined, undefined, +this.data.userId);

    this.fields = new Array<any>();

    if (this.mode === 'edit') {
      this.fields.push(managerSearchableField);
    } else {
      this.fields.push(companySearchableField);
      this.fields.push(managerSearchableField);
    }
  }

  public onRemove() {
    this.removedCard.emit(this.data);
  }

  public saveData() {
    this.savedCard.emit(this.data);
  }
  public onSelectChange(value) {
    console.log('changes in form card: ', value);
    const selectedValue: string = value.value;
    const selectedName: string = value.name;

    switch (selectedName.trim()) {
      case 'companyStringId':
        this.data.companyId = selectedValue;
        break;
      case 'salesManagerId':
        this.data.userId = selectedValue;
        break;
      default:
        break;
    }
  }

}
