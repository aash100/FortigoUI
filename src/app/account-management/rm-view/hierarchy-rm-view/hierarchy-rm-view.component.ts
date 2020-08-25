import { Component, OnInit, Input, SimpleChanges, OnChanges, HostListener } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { LoginControlService } from 'src/app/app-landing/services/login-control.service';
import { HeaderCalculationResponse } from '../../models/header-calculation.model';
import { TreeNode } from 'primeng/api';
import { Util } from 'src/app/core/abstracts/util';

@Component({
  selector: 'app-hierarchy-rm-view',
  templateUrl: './hierarchy-rm-view.component.html',
  styleUrls: ['./hierarchy-rm-view.component.css']
})
export class HierarchyRmViewComponent implements OnInit, OnChanges {

  @Input() display;
  @Input() search = '';
  treeData: Array<TreeNode>;
  rMDetails: Array<any>;
  sMDetails: Array<any>;
  namDetails: Array<any>;
  smList: Set<string>;
  rmSmMap: Object;

  paginator: boolean;
  multiSortMeta: any;
  totalRow: number;
  loading: boolean;
  calcTableHeight: any;
  isPaginating: boolean;
  visible: boolean;
  smData: any[];
  smAsNamData: any[];
  selectedMode: string;

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.calcTableHeight = window.innerHeight - 290;
    this.calcTableHeight = this.calcTableHeight + 'px';
  }

  constructor(
    public _customerService: CustomerService,
    public _loginService: LoginControlService,
  ) {
    this.multiSortMeta = [];
    this.multiSortMeta.push({ field: 'actualAnnualRevenue', order: -1 });
    this.rmSmMap = new Object();
  }

  ngOnInit() {
    this.onResize();
    this.treeData = new Array<TreeNode>();
    if (this._customerService.managerViewData.length === 0) {
      this.loading = true;
      this.getRMList();
    } else {
      this.treeData = this._customerService.managerViewData.filter(
        (eachTreeData) => {
          if (!eachTreeData.data.rmAccountManager.includes('as NAM')) {
            return true;
          }
          return false;
        }
      );
      this._customerService.loadingManager = false;
      this.visible = true;
    }
    this._customerService.managerReload.subscribe(
      () => {
        this.reload();
      }
    );
    this._customerService.managerFilter.subscribe(
      (data) => {

        // this.treeData = [];
        data.accountNationalManagerName = data.accountNationalManagerName.toString();
        // if manager name = empty and showData = empty
        if (data.accountNationalManagerName.trim().length === 0 && data.showData.trim().length === 0) {
          this.applyFieldsFilter(undefined, undefined);
        } else
          // if manager name = empty and showData = not empty

          if (data.accountNationalManagerName.trim().length === 0 && data.showData.trim().length !== 0) {

            this.applyFieldsFilter(undefined, data.showData);

          } else
            // if manager name = not empty and showData = empty
            if (data.accountNationalManagerName.trim().length !== 0 && data.showData.trim().length === 0) {
              this.applyFieldsFilter(data.accountNationalManagerName, undefined);

            } else
              // if manager name = not empty and showData = not empty
              if (data.accountNationalManagerName.trim().length !== 0 && data.showData.trim().length !== 0) {
                this.applyFieldsFilter(data.accountNationalManagerName, data.showData);

              }
        // this.applyFilter(data);
      }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.search) {
      this.search = changes.search.currentValue;
      this.searchDashboard();
    }
  }
  /** reload */
  private reload() {
    this.treeData = this._customerService.managerViewData;
    // set loading of manager view to false
    this._customerService.loadingManager = false;

  }

  // will be remove by applyFieldsFilter
  /** applyFilter */
  private applyFilter(value) {
    this.treeData = this._customerService.managerViewData.filter(
      (eachTreeData) => {
        if (eachTreeData.data.rmAccountManagerId === +value) {
          return true;
        }
        return false;
      }
    );
    // set loading of manager view to false
    this._customerService.loadingManager = false;
  }

  /** applyFieldFilter */
  private applyFieldsFilter(managerName, showData) {
    this.selectedMode = showData;
    if (!managerName && !showData) {
      this.treeData = this._customerService.managerViewData;
    } else if (!managerName && showData) {
      this.filterShowData(showData);
    } else if (managerName && !showData) {
      this.treeData = this._customerService.managerViewData.filter(
        (eachTreeData) => {
          if (eachTreeData.data.rmAccountManagerId === +managerName) {
            return true;
          }
          return false;
        }
      );
    } else if (managerName && showData) {

      this.filterShowData(showData);
      this.treeData = this.treeData.filter(
        (eachTreeData) => {
          if (eachTreeData.data.rmAccountManagerId === +managerName) {
            return true;
          }
          return false;
        }
      );

    }

    // set loading of manager view to false
    this._customerService.loadingManager = false;
  }

  filterShowData(showData) {
    if (showData.trim() === 'asSM') {
      this.treeData = this._customerService.managerViewData.filter(
        (eachTreeData) => {
          if (!eachTreeData.data.rmAccountManager.includes('as NAM')) {
            return true;
          }
          return false;
        }
      );
    } else if (showData.trim() === 'asNAM') {
      this.treeData = this._customerService.managerViewData.filter(
        (eachTreeData) => {
          if (eachTreeData.data.rmAccountManager.includes('as NAM')) {
            return true;
          }
          return false;
        }
      );
    } else if (showData.trim() === 'asBoth') {
      this.treeData = this._customerService.managerViewData;
    }

  }
  /**check customer data if exist then fetch it otherwise make a rest call */
  private getRMList() {
    // get dataset for RM and NAM
    this.rMDetails = this._customerService.rMDetails;
    this.namDetails = this._customerService.rmAsNamData;

    if (this.rMDetails.length === 0 && this.namDetails.length === 0) {
      this.loading = false;
    }

    let rowCount = 0;
    // create tree node for rm's
    this.rMDetails.forEach((eachRM, rmIndex) => {
      this.treeData[rmIndex] = new Object();
      this.treeData[rmIndex].data = eachRM;
      rowCount = rmIndex + 1;

    });
    // create tree node of nam's
    this.namDetails.forEach((eachNAM, namIndex) => {
      this.treeData[rowCount] = new Object();
      this.treeData[rowCount].data = eachNAM;
      rowCount++;
    });

    // get all sm related to rm
    this._customerService.listSMForRM().subscribe((response1: Array<any>) => {
      // list of all sm's
      this.smList = new Set<string>();
      this.rMDetails.forEach((eachRMDetails) => {
        response1.forEach((eachResponse) => {
          if (eachRMDetails['rmAccountManagerId'].toString() === eachResponse['rmUserStringId']) {
            this.smList.add(eachResponse['smUserStringID']);
            if (this.rmSmMap[eachRMDetails['rmAccountManagerId']]) {
              this.rmSmMap[eachRMDetails['rmAccountManagerId']] += ',' + eachResponse['smUserStringID'];
            } else {
              this.rmSmMap[eachRMDetails['rmAccountManagerId']] = eachResponse['smUserStringID'];
            }
          }
        });
      });

      // if a logged in user role is READ-ONLY or REGIONAL MANAGER
      if (this._loginService.roleId.toString() !== '1' && this._loginService.roleId.toString() !== '28') {
        this.smList.clear();
        this.smList.add(this._loginService.userId);
      }

      const smStringList = Array.from(this.smList).join();
      // get all sm's data
      this._customerService.getSalesManagerDataList(smStringList).subscribe((response2: Array<any>) => {
        this.sMDetails = response2;

        if (this.sMDetails === null || this.sMDetails === undefined) {
          this.sMDetails = [];
        }

        // create's dataset for sm and nam
        this.smData = this.sMDetails.filter(e => !e.userAsNAM);
        this.smAsNamData = this.sMDetails.filter(e => e.userAsNAM);
        //////////////// inserting sm and nam data in tree node/////////////////////////////////////////
        let noOfSMData = 0;
        this.treeData.forEach((eachTreeData: TreeNode, index1: number) => {
          let matchedSMIndex = 0;
          let matchedNAMIndex = 0;
          ////////////////////// insert SM data///////////////////////////////////////
          this.smData.forEach((eachSMDetails, smDataIndex) => {
            // create children if not present
            if (!this.treeData[index1].children) {
              this.treeData[index1].children = new Array<TreeNode>();
            }
            // create sm inside rm
            if (this.rmSmMap[eachTreeData.data['rmAccountManagerId']] && this.rmSmMap[eachTreeData.data['rmAccountManagerId']].includes(eachSMDetails['salesManagerId']) && eachSMDetails['salesManagerId'] !== 0 && !eachTreeData.data['userAsNAM']) {
              this.treeData[index1].children[matchedSMIndex] = new Object();
              this.treeData[index1].children[matchedSMIndex].data = eachSMDetails;
              // create children for company level data
              this.treeData[index1].children[matchedSMIndex].children = new Array<TreeNode>();
              if (this.treeData[index1].children[matchedSMIndex].data) {
                noOfSMData++;
                this._customerService.getCompaniesForSalesManager(this.treeData[index1].children[matchedSMIndex].data['salesManagerId']).subscribe((companySMResponse: Array<Object>) => {
                  let companyDetails = companySMResponse.sort((a, b) => b['actualAnnualRevenue'] - a['actualAnnualRevenue']);
                  companyDetails = this.setStatus(companyDetails);

                  // adding children level
                  companyDetails.forEach((eachCompanyDetail, companyDetailIndex) => {
                    delete eachCompanyDetail['salesManagerName'];
                    for (let index2 = 0; index2 < matchedSMIndex; index2++) {
                      if (this.treeData[index1].children[index2].data && this.treeData[index1].children[index2].data['salesManagerId'] === eachCompanyDetail['salesManagerId']) {
                        this.treeData[index1].children[index2].children[companyDetailIndex] = new Object();
                        this.treeData[index1].children[index2].children[companyDetailIndex].data = eachCompanyDetail;
                      }
                    }
                  });
                  this.visible = true;

                  noOfSMData--;
                  if (noOfSMData === 0) {
                    this._customerService.isManagerDataLoaded.next({ event: 'smLoaded', data: this.treeData });
                    this._customerService.managerViewData = this.treeData;
                    this.loading = false;
                  }
                });
              }
              matchedSMIndex++;
            }
          });
          ////////////////////// insert NAM data///////////////////////////////////////
          // populate tree node with as nam data
          const tempSmAsNamData: Array<any> = <Array<any>>Util.getObjectCopy(this.smAsNamData);
          const smAsNamSMIds = tempSmAsNamData.map(eachSmAsNamData => eachSmAsNamData['salesManagerId'].toString()).join();

          this._customerService.listSMasNAMCompanyView(smAsNamSMIds).subscribe((response: Array<any>) => {
            this._customerService.namData = response;
            this._customerService.namData = this.setStatus(this._customerService.namData);

            this.smAsNamData.forEach((eachNAM) => {
              // create children if not present
              if (!this.treeData[index1].children) {
                this.treeData[index1].children = new Array<TreeNode>();
              }
              // create sm inside rm
              if (this.rmSmMap[eachTreeData.data['rmAccountManagerId']] && this.rmSmMap[eachTreeData.data['rmAccountManagerId']].includes(eachNAM['salesManagerId']) && eachNAM['salesManagerId'] !== 0 && eachTreeData.data['userAsNAM']) {
                this.treeData[index1].children[matchedNAMIndex] = new Object();
                this.treeData[index1].children[matchedNAMIndex].data = eachNAM;
                // create children object for company level data
                this.treeData[index1].children[matchedNAMIndex].children = new Array<TreeNode>();

                // populate companies in hierarchy(used for NAM level)
                if (this.treeData[index1].data['rmAccountManagerId'] !== 0 && eachNAM['salesManagerId'] !== 0) {
                  const smLevelCompany = this._customerService.namData.filter((eachNAMData) => {
                    return eachNAMData['salesManagerId'] === this.treeData[index1].children[matchedNAMIndex].data['salesManagerId'];
                  });
                  smLevelCompany.forEach((eachNAMData, index) => {
                    this.treeData[index1].children[matchedNAMIndex].children[index] = new Object();
                    delete eachNAMData['salesManagerName'];
                    this.treeData[index1].children[matchedNAMIndex].children[index].data = eachNAMData;
                  });
                }
                matchedNAMIndex++;
              }
            });

            if (this.treeData.length - 1 === index1) {
              this._customerService.isManagerDataLoaded.next({ event: 'namLoaded', data: this.treeData });
            }
          });
        });
      });
    });

    this.visible = true;
  }


  private searchDashboard() {
    if (this.search.trim() === '') {
      this.treeData = this._customerService.managerViewData;
    }

    if (this.treeData && this.search.trim().length !== 0) {
      this.treeData = this.treeData.filter(value => value.data.rmAccountManager.trim().toLowerCase().includes(this.search.trim().toLowerCase()));
    }
    this.search = '';
  }

  public setStatus(values): Array<Object> {
    values.forEach(value => {
      if (value.companyStatus) {
        switch (value.companyStatus.toLowerCase()) {
          case 'prospecting':
            value['companyStatusClass'] = 'prospecting-text';
            break;
          case 'dropped':
            value['companyStatusClass'] = 'dropped-text';
            break;
          case 'suspended':
            value['companyStatusClass'] = 'suspended-text';
            break;
          case 'active':
            value['companyStatusClass'] = 'active-text';
            break;
          case 'inactive':
            value['companyStatusClass'] = 'inactive-text';
            break;
          case 'others':
            value['companyStatusClass'] = 'others-text';
            break;
          default:
            break;
        }
      }
    });

    return values;
  }
  private getCalcHeaderOnMode(key) {
    var temp = this._customerService.managerViewData.filter(
      (eachTreeData) => {
        if (!eachTreeData.data.rmAccountManager.includes('as NAM')) {
          return true;
        }
        return false;
      }
    );
    const count = temp.map(t => {
      if (!t.data['userAsNAM']) {
        return t.data[key];
      }
    });
    return count;
  }
  public getHeaderCalc(action: string, key: string, mode = 'asNAM') {
    // if ((this.customerService.filterSelectedField && this.customerService.filterSelectedField.length > 0) || this.customerService.isSearchApplied) {
    if (this.treeData) {
      switch (action.trim()) {
        case 'count':
          let count;
          if (mode === 'asBoth') {
            count = this.getCalcHeaderOnMode(key);
          } else {
            count = this.treeData
              .map(t => {
                return t.data[key];
              });
          }
          count = count.reduce(function (acc, total): number {
            return (
              acc + (total !== '' && total !== null && total !== undefined ? 1 : 0)
            );
          }, 0);
          return count;
        case 'sum':
          let sum;

          if (mode === 'asBoth') {
            sum = this.getCalcHeaderOnMode(key);
          } else {
            sum = this.treeData
              .map(t => {
                return t.data[key];
              })
          }
          sum = sum.reduce(function (acc, total): number {
            if (total) {
              return acc + total;
            } else {
              return acc;
            }
          }, 0);
          return sum;
        case 'weightedAverage':
          let weightedTimeSum;
          if (mode === 'asBoth') {
            weightedTimeSum = this.getCalcHeaderOnMode(key);
          }
          else {
            weightedTimeSum = this.treeData
              .map(t => {
                return t.data['weightedTime'];
              });
          }
          weightedTimeSum = weightedTimeSum.reduce((acc, total): number => {
            if (total) {
              return acc + total;
            } else {
              return acc;
            }
          }, 0);
          let tripCompletedRevenueSum;
          if (mode === 'asBoth') {
            tripCompletedRevenueSum = this.getCalcHeaderOnMode(key);
          } else {
            tripCompletedRevenueSum = this.treeData
              .map(t => {
                return t.data['tripCompletedRevenue'];
              })
          }
          tripCompletedRevenueSum = tripCompletedRevenueSum.reduce((acc, total): number => {
            if (total) {
              return acc + total;
            } else {
              return acc;
            }
          }, 0);
          return isNaN(weightedTimeSum / tripCompletedRevenueSum) === true ? 0 : (weightedTimeSum / tripCompletedRevenueSum);

        default:
          break;
      }
      return 0;
      // }
    } else {
      return this.getHeaderCalculation(action, key) !== undefined ? this.getHeaderCalculation(action, key) : 0;
    }
  }

  public getHeaderCalculation(action: string, key: string) {
    const headerValues: Array<HeaderCalculationResponse> = this._customerService.headerCalculatedValues.filter((headerCalculationResponse: HeaderCalculationResponse) => {
      return headerCalculationResponse.uiKey === key && headerCalculationResponse.method === action;
    });
    if (headerValues && headerValues.length > 0 && headerValues[0]) {
      return headerValues[0]['result'];
    } else {
      return 0;
    }
  }

}
