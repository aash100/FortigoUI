/*
 * Created on Wed Sep 04 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';

import Swal from 'sweetalert2';

import { TextInputField, TextAreaInputField, SelectOption, SelectInputField, UploadInputField, DateInputField, MultiSelectSearchableInputField, SearchableSelectInputField, HiddenInputField } from 'src/app/shared/abstracts/field-type.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { MetadataService } from '../../services/metadata/metadata.service';
import { DocumentService } from '../../services/document/document.service';
import { LoginControlV2Service } from 'src/app/app-landing/services/login-control-v2/login-control-v2.service';
import { FortigoValidators } from 'src/app/shared/models/fortigo-validators.model';
import { Router } from '@angular/router';
import { AccountManagementConstant } from '../../constants/AccountManagementConstant';
import { AccountManagementURL } from '../../constants/AccountManagementURL';

@Component({
  selector: 'app-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.css']
})
export class DocumentFormComponent implements OnInit {

  public fields: Array<any>;
  public selectedFile: any;
  public isReadOnly: boolean;
  public isSubmitEnabled: boolean;
  public modalHeader: string;
  public companyIdFromUrl: any;
  private NEW_DOCUMENT = 'New Document';
  private EDIT_DOCUMENT = 'Edit Document';
  private VIEW_DOCUMENT = 'View Document';
  private _DOCUMENTS = 'DOCUMENTS';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private _dialog: MatDialog, private _metadataService: MetadataService, private _documentService: DocumentService, private _loginControlV2Service: LoginControlV2Service, private _route: Router) {
  }

  ngOnInit() {
    this.isReadOnly = false;
    this.isSubmitEnabled = true;
    // switch between create, view and edit mode
    switch (this.data.mode) {
      case FortigoConstant.FORM_CREATE_MODE:
        this.getDocumentFieldsForCreateMode(this.data.defaultData);
        this.modalHeader = this.NEW_DOCUMENT;
        break;
      case FortigoConstant.FORM_VIEW_MODE:
        this.isReadOnly = true;
        this.isSubmitEnabled = false;
        this.modalHeader = this.VIEW_DOCUMENT;
        this.getDocumentFieldsForEditOrViewModes(this.data.defaultData);
        break;
      case FortigoConstant.FORM_EDIT_MODE:
        this.modalHeader = this.EDIT_DOCUMENT;
        this.getDocumentFieldsForEditOrViewModes(this.data.defaultData);
        break;
      default:
        break;
    }
  }

  /**
   * Create documnet fields for Create Mode
   */
  /**
   * @param  {any} documentwithDefaultValues
   */
  public getDocumentFieldsForCreateMode(documentwithDefaultValues: any) {
    const companyListOptions = new SelectOption('companyName', 'companyStringId', this._metadataService.companyDropdownList);
    const companyList = new SearchableSelectInputField('Select Company', 'companyStringId', companyListOptions, undefined, undefined, (documentwithDefaultValues) ? true : false, undefined, undefined, undefined, (documentwithDefaultValues) ? documentwithDefaultValues['companyStringId'] : undefined);
    const docAlias = new TextInputField('Name', 'docAlias', undefined, undefined, new FortigoValidators(undefined, undefined, true));
    const externalRef = new TextInputField('External Ref', 'docExternalNumber', undefined, undefined, new FortigoValidators(undefined, undefined, true));
    const docStatusOptions = new SelectOption('type', 'id', this._metadataService.documentType);
    const docStatus = new SearchableSelectInputField('Document Type', 'docTypeId', docStatusOptions);
    const docUpload = new UploadInputField('Upload Document', 'doc_upload');
    const fortigoEntityOptions = new SelectOption('companyName', 'companyStringId', this._metadataService.internalCompanyList);
    const fortigoEntity = new SearchableSelectInputField('Fortigo Entity', 'internalCompany', fortigoEntityOptions);
    const validFrom = new DateInputField('Valid From', 'docIssueDate');
    const validTill = new DateInputField('Valid Till', 'docExpiryDate');
    const docDescription = new TextAreaInputField('Description', 'docDescription');
    this.fields = [];
    this.fields =
      [companyList, docAlias, docUpload, docStatus, externalRef, fortigoEntity, validFrom, validTill, docDescription];
  }

  /**
   *  Creates the Fields for Edit / View Document
   * @param  {} documentwithDefaultValues
   */
  public getDocumentFieldsForEditOrViewModes(documentwithDefaultValues: any) {
    const docId = new HiddenInputField('doc', 'docId', undefined, false, undefined, undefined, undefined, documentwithDefaultValues['docId']);
    const docAlias = new TextInputField('Name', 'docAlias', undefined, undefined, new FortigoValidators(undefined, undefined, true), undefined, undefined, (documentwithDefaultValues) ? documentwithDefaultValues['docAlias'] : undefined);
    const externalRef = new TextInputField('External Ref', 'docExternalNumber', undefined, undefined, new FortigoValidators(undefined, undefined, true), undefined, undefined, (documentwithDefaultValues) ? documentwithDefaultValues['docExternalNumber'] : undefined);
    const docTypeOptions = new SelectOption('type', 'id', this._metadataService.documentType);
    const docType = new SearchableSelectInputField('Document Type', 'docTypeId', docTypeOptions, undefined, undefined, undefined, undefined, undefined, undefined, (documentwithDefaultValues) ? documentwithDefaultValues['docTypeId'] : undefined);
    const docStatusOptions = new SelectOption('name', 'id', this._metadataService.documentStatus);
    const docStatus = new SearchableSelectInputField('Document Status', 'docStatus', docStatusOptions, undefined, undefined, undefined, undefined, undefined, undefined, (documentwithDefaultValues) ? documentwithDefaultValues['docStatus'] : undefined);
    const validFrom = new DateInputField('Valid From', 'docIssueDate', undefined, undefined, undefined, undefined, undefined, (documentwithDefaultValues) ? documentwithDefaultValues['docIssueDate'] : undefined);
    const validTill = new DateInputField('Valid Till', 'docExpiryDate', undefined, undefined, undefined, undefined, undefined, (documentwithDefaultValues) ? documentwithDefaultValues['docExpiryDate'] : undefined);
    const docDescription = new TextAreaInputField('Description', 'docDescription', undefined, undefined, undefined, undefined, undefined, (documentwithDefaultValues) ? documentwithDefaultValues['docDescription'] : undefined);
    this.fields = [];
    this.fields =
      [docId, docAlias, docType, externalRef, docStatus, validFrom, validTill, docDescription];
  }

  /**
   * Save document
   * @param  {} document: Document data to be saved
   */
  public onSubmitDocumentForm(document: any) {
    const requestPayload = document;
    for (const key in requestPayload) {
      if (requestPayload[key] === '') {
        delete requestPayload[key];
      }
    }
    switch (this.data.mode) {
      case FortigoConstant.FORM_CREATE_MODE:
        this._documentService.addDocument(this.selectedFile, requestPayload, this._loginControlV2Service.userId.toString()).subscribe((response) => {
          if (!response['errorCode']) {
            this.modalClose();
            this._documentService.reloadDocument.next();
            Swal.fire('Success', 'Document data added successfully', 'success');
            localStorage.setItem(AccountManagementConstant.AM_OPERATION_KEY, this._DOCUMENTS);
            this._route.navigate([AccountManagementURL.AM_LANDING_URL, requestPayload['companyStringId']]);
          } else {
            Swal.fire('Failure', 'Error while uploading Document', 'error');
          }
        });
        break;
      case FortigoConstant.FORM_EDIT_MODE:
        this._documentService.updateDocumentData(requestPayload, this._loginControlV2Service.userId.toString()).subscribe(response => {
          if (!response['errorCode']) {
            this._documentService.reloadDocument.next();
            this.modalClose();
            Swal.fire('Success', 'Document Data updated successfully', 'success');
          } else {
            Swal.fire('Failure', 'Document was not  updated', 'error');
          }
        });
        break;
      default:
        break;
    }
  }

  /** This method is called after the file selection
   * @param  {any} fileList
   */
  public onDocumentSelectedFiles(fileList: any) {
    if (fileList) {
      this.selectedFile = fileList[0];
    }
  }

  /**
   *  This method closes the modal
   * @param  {} data
   */
  public modalClose() {
    this._dialog.closeAll();

  }
}
