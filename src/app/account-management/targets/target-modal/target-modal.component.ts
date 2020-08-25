import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Target } from '../../models/target.model';
import { TargetFormCardComponent } from '../target-form-card/target-form-card.component';
import { CustomerService } from '../../services/customer.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TargetService } from '../../services/target.service';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { Util } from 'src/app/core/abstracts/util';

@Component({
  selector: 'app-target-modal',
  templateUrl: './target-modal.component.html',
  styleUrls: ['./target-modal.component.css']
})
export class TargetModalComponent implements OnInit {
  @ViewChild('targetCard',{static:false}) targetCard: TargetFormCardComponent;
  public targetList: Target;
  public originalList: Target;
  public title: string;
  public form = new FormGroup({
    remarks: new FormControl('', Validators.required)
  });
  data: any;
  isDataUpdated: boolean;
  constructor(
    public activeModal: NgbActiveModal,
    public _customerService: CustomerService,
    public _targetService: TargetService
  ) { }

  ngOnInit() {
    this.originalList = <any>Util.getObjectCopy(this.targetList);
    console.log('target list: ', this.targetList);
    const target = new Target(1);
    // this.targetList = target;
    target.estimateMargin.monthly.forEach((eachMonth) => {
      const value = this.targetList.estimateMargin.monthly.filter((innerEachMonth) => innerEachMonth.id === eachMonth.id)[0];
      if (value) {
        eachMonth.placeholder = value.placeholder;
      }
    });
  }

  onSubmit() {
    this.data = this.targetCard.data;

    this.checkIsUpdated('estimateMargin');
    this.checkIsUpdated('estimateRevenue');
    this.checkIsUpdated('targetMargin');
    this.checkIsUpdated('targetRevenue');
    this.data['targetRemarks'] = this.form.controls.remarks.value;

    let error: Error = new Error();
    error = this.validateTarget(this.data);
    if (!error.isValid) {
      Swal.fire('Mandatory fields are required', error.errorMessage, 'warning');
    } else {
      if (!this.form.valid) {
        Swal.fire('Warning', 'Please enter remarks', 'warning');
      } else if (!this.isDataUpdated) {
        Swal.fire('Warning', 'None of the fields are updated', 'warning');
      } else {
        this._customerService.updateTargetList(this.data).subscribe(
          (data) => {
            if (data['response'].toLowerCase() === FortigoConstant.SUCCESS_RESPONSE.toLowerCase()) {
              Swal.fire('Success', 'Target updated successfully', 'success');
              this._targetService.targetEdited.next();
              this.activeModal.dismiss('close');
            } else {
              Swal.fire('Error', 'Target failed to update', 'error');
            }
          });
      }
    }
  }

  public checkIsUpdated(typeName: string) {
    console.log(typeName);
    // checks for monthly
    this.data[typeName].monthly.forEach((e, index) => {
      if (this.originalList[typeName].monthly[index].data !== this.data[typeName].monthly[index].data) {
        this.data[typeName].monthly[index].targetUpdated = true;
        this.isDataUpdated = true;
      }
    });
    this.data[typeName].quarterly.forEach((e, index) => {
      // checks for quarterly
      if (this.originalList[typeName].quarterly[index].data !== this.data[typeName].quarterly[index].data) {
        this.data[typeName].quarterly[index].targetUpdated = true;
        this.isDataUpdated = true;
      }
    });
    // checks for yearly
    if (this.originalList[typeName].yearly[0].data !== this.data[typeName].yearly[0].data) {
      this.data[typeName].yearly[0].targetUpdated = true;
      this.isDataUpdated = true;
    }
  }

  private validateTarget(target: Target): Error {

    let error: Error = new Error();

    // target
    target.targetRevenue.monthly.every((dataSet) => {
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Target - Revenue');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.targetRevenue.quarterly.every((dataSet) => {
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Target - Revenue');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.targetRevenue.yearly.every((dataSet) => {
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Target - Revenue');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.targetMargin.monthly.every((dataSet) => {
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Target - Margin');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.targetMargin.quarterly.every((dataSet) => {
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Target - Margin');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.targetMargin.yearly.every((dataSet) => {
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Target - Margin');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    // estimate
    target.estimateRevenue.monthly.every((dataSet) => {
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Estimate - Revenue');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.estimateRevenue.quarterly.every((dataSet) => {
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Estimate - Revenue');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.estimateRevenue.yearly.every((dataSet) => {
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Estimate - Revenue');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.estimateMargin.monthly.every((dataSet) => {
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Estimate - Margin');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.estimateMargin.quarterly.every((dataSet) => {
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Estimate - Margin');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.estimateMargin.yearly.every((dataSet) => {
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Estimate - Margin');
      return error.isValid;
    });

    return error;
  }

  private validateDataSet(dataSet, companyId: string, userId: string, dataSetName: string): Error {
    const error: Error = new Error();

    if (isNaN(dataSet.data) || dataSet.data < 0 || dataSet.data === '') {
      if (dataSet.data === undefined || dataSet.data === '') {
        error.errorMessage = 'Please enter data for ' + dataSet.placeholder + ' for ' + dataSetName;
      } else {
        error.errorMessage = 'Please enter VALID data for ' + dataSet.placeholder + ' for ' + dataSetName;
      }
      error.isValid = false;
    }

    return error;
  }

  public reset() {
    this.data = <any>Util.getObjectCopy(this.originalList);
    this.targetList = <Target>Util.getObjectCopy(this.originalList);
    Swal.fire('Success', 'Reset successfully', 'success');
  }
}

class Error {
  errorMessage: string;
  isValid: boolean;

  constructor() {
    this.isValid = true;
  }
}
