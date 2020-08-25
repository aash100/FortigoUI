import { Component, OnInit, HostListener } from '@angular/core';
import { Target } from '../../models/target.model';
import { FortigoButton } from 'src/app/shared/abstracts/button.model';
import { TargetService } from '../../services/target.service';
import Swal from 'sweetalert2';
import { LoginControlService } from 'src/app/app-landing/services/login-control.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-target-form',
  templateUrl: './target-form.component.html',
  styleUrls: ['./target-form.component.css']
})
export class TargetFormComponent implements OnInit {

  targets: Array<Target> = new Array<Target>();
  headButtonList: Array<FortigoButton>;
  calcHeight;
  financialYearList: Array<string>;
  selectedFinancialYear: string;
  isSavingData = false;

  private companyList: Array<Company>;
  private managerList: Array<any>;

  private companyId: string;

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.calcHeight = window.innerHeight - 230;
    this.calcHeight = this.calcHeight + 'px';
  }

  constructor(
    private _targetService: TargetService,
    private _router: Router,
    private _loginControlService: LoginControlService,
    private _customerService: CustomerService,
    private _activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.setFinancialYear();
    this.onResize();
    this.addCard();

    this.companyList = this._loginControlService.companyIdAndCompanyNameList;
    this.managerList = this._customerService.salesManagerList;

    this.headButtonList = [
      new FortigoButton('TARGET')
    ];

    this._activatedRoute.paramMap.subscribe(
      (data) => {
        // ANCHOR @Sachin: please check, it may break
        this.companyId = data.get('id').toString();
        this.targets.length = 0;
        this.addCard();
      }
    );
  }

  private setFinancialYear() {
    this.financialYearList = new Array<string>();

    const currentFY = new Date().getFullYear();
    const nextFY1 = new Date().getFullYear() + 1;
    const nextFY2 = new Date().getFullYear() + 2;

    this.financialYearList.push(currentFY.toString() + '-' + nextFY1.toString().substring(2, 4));
    this.financialYearList.push(nextFY1.toString() + '-' + nextFY2.toString().substring(2, 4));
  }

  public onHeaderButtonClick(buttonName) {
    switch (buttonName) {
      case 'TARGET':
        this.addCard();
        break;
      default:
        console.log('button clicked : ', buttonName);
        break;
    }
  }

  public addCard() {
    this.isSavingData = false;

    if (this.targets.length > 0) {
      this.targets.push(new Target(this.targets[this.targets.length - 1].index + 1, this.companyId));
    } else {
      this.targets.push(new Target(1, this.companyId));
    }
  }

  public onCardSave(target: Target) {
    this.isSavingData = false;

    this.targets.forEach((eachTarget) => {
      if (eachTarget.index === target.index) {
        eachTarget = target;
      }
    });
  }

  public onCardRemove(target: Target) {
    this.isSavingData = false;

    this.targets = this.targets.filter((eachTarget) => {
      return eachTarget.index !== target.index;
    });
  }

  public onButtonClick(buttonName: string) {
    console.log(buttonName);
    switch (buttonName) {
      case 'save':
        this.isSavingData = true;

        let error: Error;

        if (!this.selectedFinancialYear) {
          Swal.fire('Mandatory fields are required', 'Please select Financial Year', 'warning');
          this.isSavingData = false;
          return 0;
        } else {
          error = this.setYearAndCreatedBy();
        }

        if (error.isValid) {
          this._targetService.saveTarget(this.targets).subscribe((response: any) => {
            this.isSavingData = false;
            if (response.errorCode) {
              Swal.fire('Error', response.errorMessage, 'error');
            } else {
              let failureMessage = '';
              let successMessage = '';

              let failureCount = 0;
              let totalCount = 0;
              response.forEach((eachResponse) => {
                totalCount++;

                const companyName = this.companyList.filter((eachCompany) => {
                  if (eachCompany.companyStringId === eachResponse.companyId) {
                    return true;
                  }
                })[0].companyName;

                const managerName = this.managerList.filter((eachManager) => {
                  if (eachManager.salesManagerId.toString() === eachResponse.userId) {
                    return true;
                  }
                })[0].salesManagerName;

                // eachResponse.message === false, error occured
                if (eachResponse.message === 'true') {
                  successMessage += companyName + ' and ' + managerName;
                } else {
                  failureCount++;
                  failureMessage += companyName + ' and ' + managerName;
                }
              });

              switch (failureCount) {
                case 0:
                  Swal.fire('Success', 'Target saved successfully', 'success');
                  break;
                case totalCount:
                  Swal.fire('Failure', 'Unable to save Target, data already exist', 'error');
                  break;
                default:
                  Swal.fire('Success', 'Target saved partially, saved for ' + successMessage + ' failed for ' + failureMessage, 'error');
                  break;
              }

              if (failureCount !== totalCount) {
                this._router.navigateByUrl('/customer/overview');
              }
            }
          });
        } else {
          this.isSavingData = false;
        }

        break;
      case 'clear':
        this.targets.forEach((eachTarget, index) => {
          this.targets[index] = new Target(index + 1);
        });
        break;
      default:
        break;
    }
  }

  private setYearAndCreatedBy(): Error {
    let error: Error = new Error();
    this.targets.forEach((eachTarget) => {
      eachTarget.year = this.selectedFinancialYear.substring(0, 4);
      eachTarget.createdBy = this._loginControlService.userId;

      error = this.validateTarget(eachTarget);
      if (!error.isValid) {
        Swal.fire('Mandatory fields are required', error.errorMessage, 'warning');
      }
    });

    return error;
  }

  private validateTarget(target: Target): Error {

    let error: Error = new Error();

    if (!target.companyId) {
      error.errorMessage = 'Please select Company';
      error.isValid = false;
      return error;
    }
    if (!target.userId) {
      error.errorMessage = 'Please select Manager';
      error.isValid = false;
      return error;
    }

    // target
    target.targetRevenue.monthly.every((dataSet) => {
      if (dataSet.data === undefined) {
        dataSet.data = 0;
      }
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Target - Revenue');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.targetRevenue.quarterly.every((dataSet) => {
      if (dataSet.data === undefined) {
        dataSet.data = 0;
      }
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Target - Revenue');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.targetRevenue.yearly.every((dataSet) => {
      if (dataSet.data === undefined) {
        dataSet.data = 0;
      }
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Target - Revenue');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.targetMargin.monthly.every((dataSet) => {
      if (dataSet.data === undefined) {
        dataSet.data = 0;
      }
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Target - Margin');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.targetMargin.quarterly.every((dataSet) => {
      if (dataSet.data === undefined) {
        dataSet.data = 0;
      }
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Target - Margin');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.targetMargin.yearly.every((dataSet) => {
      if (dataSet.data === undefined) {
        dataSet.data = 0;
      }
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Target - Margin');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    // estimate
    target.estimateRevenue.monthly.every((dataSet) => {
      if (dataSet.data === undefined) {
        dataSet.data = 0;
      }
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Estimate - Revenue');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.estimateRevenue.quarterly.every((dataSet) => {
      if (dataSet.data === undefined) {
        dataSet.data = 0;
      }
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Estimate - Revenue');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.estimateRevenue.yearly.every((dataSet) => {
      if (dataSet.data === undefined) {
        dataSet.data = 0;
      }
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Estimate - Revenue');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.estimateMargin.monthly.every((dataSet) => {
      if (dataSet.data === undefined) {
        dataSet.data = 0;
      }
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Estimate - Margin');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.estimateMargin.quarterly.every((dataSet) => {
      if (dataSet.data === undefined) {
        dataSet.data = 0;
      }
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Estimate - Margin');
      return error.isValid;
    });

    if (!error.isValid) {
      return error;
    }

    target.estimateMargin.yearly.every((dataSet) => {
      if (dataSet.data === undefined) {
        dataSet.data = 0;
      }
      error = this.validateDataSet(dataSet, target.companyId, target.userId, 'Estimate - Margin');
      return error.isValid;
    });

    return error;
  }

  private validateDataSet(dataSet, companyId: string, userId: string, dataSetName: string): Error {
    const error: Error = new Error();

    const companyName = this.companyList.filter((eachCompany) => {
      if (eachCompany.companyStringId === companyId) {
        return true;
      }
    })[0].companyName;

    const managerName = this.managerList.filter((eachManager) => {
      if (eachManager.salesManagerId === userId) {
        return true;
      }
    })[0].salesManagerName;

    if (isNaN(dataSet.data) || dataSet.data < 0 || dataSet.data === '') {
      if (dataSet.data === undefined || dataSet.data === '') {
        error.errorMessage = 'Please enter data for ' + companyName + ' - ' + managerName + ', ' + dataSet.placeholder + ' for ' + dataSetName;
      } else {
        error.errorMessage = 'Please enter VALID data for ' + companyName + ' - ' + managerName + ', ' + dataSet.placeholder + ' for ' + dataSetName;
      }
      error.isValid = false;
    }

    return error;
  }

}

class Error {
  errorMessage: string;
  isValid: boolean;

  constructor() {
    this.isValid = true;
  }
}
