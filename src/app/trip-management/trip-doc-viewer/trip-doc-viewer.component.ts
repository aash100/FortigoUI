/*
 * Created on Wed Oct 09 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Component, OnInit } from '@angular/core';
import { FortigoTreeNode } from 'src/app/shared/models/FortigoTreeNode';
import { TripService } from '../services/trip/trip.service';
import { TextInputField, DateInputField, NumberInputField, UploadInputField } from 'src/app/shared/abstracts/field-type.model';
import { FortigoTreeNodeValue } from 'src/app/shared/models/FortigoTreeNodeValue';
import { FortigoConstant, RoleId } from 'src/app/core/constants/FortigoConstant';
import { EditImageData } from 'src/app/shared/models/edit-image-data.model';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { TripDocUploadRequestPayload } from '../models/trip-doc-upload-request-payload.model';

@Component({
  selector: 'app-trip-doc-viewer',
  templateUrl: './trip-doc-viewer.component.html',
  styleUrls: ['./trip-doc-viewer.component.css']
})
export class TripDocViewerComponent implements OnInit {
  public docData: Array<FortigoTreeNode>;
  public imageFields: Array<any>;
  public rowData: any;
  public uploadFields: Array<any>;

  constructor(private _tripService: TripService, private _title: Title, private loginService: LoginControlV2Service) { }

  ngOnInit() {
    if (localStorage.getItem('tripDocData') && localStorage.getItem('tripDocData') !== 'null' && JSON.parse(localStorage.getItem('tripDocData')).tripData) {
      this.rowData = JSON.parse(localStorage.getItem('tripDocData')).tripData;

      this._title.setTitle(this.rowData.tripId + ' | Trip Documents');

      this.getAllDocData();
      this.imageFields = [
        new TextInputField('Trip ID', 'tripId', 2, undefined, undefined, undefined, undefined, this.rowData.tripId),
        new TextInputField('EC Name', 'ecName', 2, undefined, undefined, undefined, undefined, this.rowData.customer.name),
        new DateInputField('Start Date', 'startDate', 2),
        new TextInputField('From Location', 'fromLocation', 1, undefined, undefined, undefined, undefined, this.rowData.from.town),
        new TextInputField('To Location', 'toLocation', 1, undefined, undefined, undefined, undefined, this.rowData.to.town),
        new NumberInputField('EC Contract Value', 'ecContractValue', 2, undefined, undefined, undefined, undefined, this.rowData.ecPrice),
        new TextInputField('Cont Party Name', 'contPartyName', 2)
      ];
      const roleId = Number.parseInt(this.loginService.roleId.toString());
      if (RoleId.FORTIGO_SALES_REGIONAL_AND_OPERATIONS_ROLES.includes(roleId)) {
        this.uploadFields = [new UploadInputField('Upload', 'upload', 2)];
      }

    }
    // removing filter from local storage
    if (localStorage.getItem('tripDocData')) {
      localStorage.removeItem('tripDocData');
    }
  }

  private getAllDocData() {
    this._tripService.getImage(this.rowData.tripId).subscribe((response) => {
      if (response) {
        this.docData = this.getDocData(response['results']);
      }
    });
  }

  /**
   * To generate doc Data in the format required for doc previewer.
   * @param  {} docData data coming from server side.
   * @returns Array: DocData in required doc previewer format.
   */
  private getDocData(docData: any): Array<FortigoTreeNode> {
    const docDataMap = new Array<FortigoTreeNode>();
    docData.forEach((eachDoc) => {
      const docUrl = new Array<FortigoTreeNode>();
      if (eachDoc['document_name']) {
        if (eachDoc['doc_data']) {
          const keyValue = Object.getOwnPropertyNames(eachDoc['doc_data']);
          keyValue.forEach((key) => {
            if (eachDoc['doc_data'][key].path) {
              docUrl.push({ key: key, value: new FortigoTreeNodeValue(undefined, undefined, eachDoc['doc_data'][key].path) });
            }
          });
        }
        let color: any;
        let isChecked = false;
        if (eachDoc['isVerified'] && eachDoc['isVerified'] !== null) {
          isChecked = true;
          switch (eachDoc['isVerified']) {
            case '0':
              color = 'green';
              break;
            case '1':
              color = FortigoConstant.COLOR_BLUE;
              break;
          }
        }
        docDataMap.push(new FortigoTreeNode(eachDoc['document_name'], new FortigoTreeNodeValue(eachDoc['did'], undefined, undefined, isChecked, color, eachDoc['docNo']), docUrl));
      }
    });
    return docDataMap;
  }

  /**
   * To save the image.
   * @param  {EditImageData} $event
   */
  public saveImageTrip($event: EditImageData) {
    // $event.from = 'txnDashboard';
    this._tripService.saveImage($event).subscribe((response) => {
      console.log('Saved Image Response', response);
      Swal.fire('Success', response['error']['errMsg'], 'success');
    });
  }

  /**
   *reset all doc data and refresh it. 
   */
  public onRefresh() {
    this.getAllDocData();
  }

  /**
   * Upload Document
   * @param  {any} data
   */
  public uploadDocument(data: any) {
    console.log('node', data.docData);
    const parentNode = this.isChildNode(data.docData) ? this.getParentNode(data.docData) : data.docData;
    const requestPayloadDoc = new TripDocUploadRequestPayload(this.rowData.tripId, parentNode.value.currentNodeId, parentNode.value.docNo, undefined);
    Swal.fire({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
      cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
      confirmButtonText: 'Yes, Upload the file!',
    }).then(result => {
      if (result.value) {
        this.uploadDoc(data, requestPayloadDoc);
      } else {
        this.uploadFields = [new UploadInputField('Upload', 'upload', 2)];
      }
    });
  }
  private uploadDoc(data: any, requestPayloadDoc: TripDocUploadRequestPayload) {
    this._tripService.submitManualDocumentWithDocument(data.file[0], requestPayloadDoc).subscribe((response) => {
      if (response) {
        if (response['response']) {
          this.onRefresh();
          Swal.fire('Success', response['response'], 'success');
        } else if (response['errorMessage']) {
          Swal.fire('Error', response['errorMessage'], 'error');
        } else {
          Swal.fire('Error', 'No Message', 'error');
        }
      }
    });
  }
  private isChildNode(currentDocData: FortigoTreeNode): boolean {
    return currentDocData.value.parentNodeId ? true : false;
  }

  /**
   * To get Parent Node from child node in FortigoTreeNode
   * @param  {FortigoTreeNode} docData
   * @returns FortigoTreeNode
   */
  private getParentNode(currentDocData: FortigoTreeNode): FortigoTreeNode {
    for (let i = 0; i < this.docData.length; i++) {
      if (this.docData[i].value.currentNodeId === currentDocData.value.parentNodeId) {
        return this.docData[i];
      }
    }
  }

}
