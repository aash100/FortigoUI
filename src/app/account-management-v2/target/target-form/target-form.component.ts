/*
 * Created on Tue Aug 20 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';

import { FortigoButton } from 'src/app/shared/abstracts/button.model';
import { Target } from '../../models/target.model';
import { TargetService } from '../../services/target/target.service';

@Component({
  selector: 'app-target-form',
  templateUrl: './target-form.component.html',
  styleUrls: ['./target-form.component.css']
})
export class TargetFormComponent implements OnInit {
  public headButtonList: Array<FortigoButton>;
  public companyId: any;
  public targets: Array<Target> = new Array<Target>();
  public isSavingData: boolean;
  public calcHeight: any;
  public financialYearList: Array<string>;
  public selectedFinancialYear: string;
  public accMgt1 = 'accMgt2';

  private companyList: Array<any>;
  private managerList: Array<any>;

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.calcHeight = window.innerHeight - 230;
    this.calcHeight = this.calcHeight + 'px';
  }

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _targetService: TargetService,
    private _router: Router,
  ) { }

  ngOnInit() {
    this.onResize();
    this.setFinancialYear();
    this.headButtonList = [new FortigoButton('Target')];
    this._activatedRoute.paramMap.subscribe(
      (data) => {
        this.targets.length = 0;
        this.addCard();
      }
    );
  }

  /**
   * Add target feilds
   */
  public addCard() {
    this.isSavingData = false;
    if (this.targets.length > 0) {
      this.targets.push(new Target(this.targets[this.targets.length - 1].index + 1, this.companyId));
    } else {
      this.targets.push(new Target(1, this.companyId));
    }
  }

  /**
   * trigger on click header button
   * @param  {string} data
   */
  public onHeaderButtonClick(data: string) {
    if (data === this.headButtonList[0].placeholder) {
      this.addCard();
    }
  }

  /**
   * Save data
   * @param  {Target} target
   */
  public onCardSave(target: Target) {
    this.isSavingData = false;

    this.targets.forEach((eachTarget) => {
      if (eachTarget.index === target.index) {
        // eachTarget = target;
      }
    });
  }

  /**
   * Remove form from list
   * @param  {Target} target
   */
  public onCardRemove(target: Target) {
    this.isSavingData = false;

    this.targets = this.targets.filter((eachTarget) => {
      return eachTarget.index !== target.index;
    });
  }

  /**
   * Save form value
   * @param  {string} buttonName
   */
  public onButtonClick(buttonName: string) {
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
            console.log('response', response);
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

  /**
   * Set year for the form
   * @returns Error
   */
  private setYearAndCreatedBy(): Error {
    const error: Error = new Error();
    this.targets.forEach((eachTarget) => {
      eachTarget.year = this.selectedFinancialYear.substring(0, 4);
      // eachTarget.createdBy = this._loginControlService.userId;

      // error = this.validateTarget(eachTarget);
      // if (!error.isValid) {
      //   Swal.fire('Mandatory fields are required', error.errorMessage, 'warning');
      // }
    });

    return error;
  }

  /**
   * Set finacial year
   */
  private setFinancialYear() {
    this.financialYearList = new Array<string>();

    const currentFY = new Date().getFullYear();
    const nextFY1 = new Date().getFullYear() + 1;
    const nextFY2 = new Date().getFullYear() + 2;

    this.financialYearList.push(currentFY.toString() + '-' + nextFY1.toString().substring(2, 4));
    this.financialYearList.push(nextFY1.toString() + '-' + nextFY2.toString().substring(2, 4));
  }

}

// this class is used for error management.
class Error {
  errorMessage: string;
  isValid: boolean;

  constructor() {
    this.isValid = true;
  }
}