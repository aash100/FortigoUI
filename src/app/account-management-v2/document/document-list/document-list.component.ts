
/*
 * Created on Wed Sep 04 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

import Swal from 'sweetalert2';

import { DocumentService } from '../../services/document/document.service';
import { MetadataService } from '../../services/metadata/metadata.service';
import { Column, DataType, DataFormat } from 'src/app/shared/models/column.model';
import { GridConfiguration, GridActionIcon } from 'src/app/shared/models/grid-configuration.model';
import { DocumentFormComponent } from '../document-form/document-form.component';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { AutoUnsubscribe } from 'src/app/shared/decorators/auto-unsubscribe.decorator';
import { AccountManagementConstant } from '../../constants/AccountManagementConstant';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
@AutoUnsubscribe()
export class DocumentListComponent implements OnInit {
  private companyId: number;
  public rowsData: Array<any>;
  public columnsData: Array<Column>;
  public gridConfiguration: GridConfiguration = new GridConfiguration();
  private _documentTypeData: any;
  private _documentStatus: any;

  constructor(private _activatedRoute: ActivatedRoute, private _metadataService: MetadataService, private _documentService: DocumentService, private _dialog: MatDialog) {
    //  Used to get companyid from url
    this._activatedRoute.params.subscribe((params) => {
      if (params['companyId']) {
        this.companyId = params['companyId'];
      } else {
        Swal.fire('Error', 'No company details found', 'error');
      }
    });
    this.getColumnData();
    this._documentTypeData = this._metadataService.documentType;
    this._documentStatus = this._metadataService.documentStatus;
  }

  ngOnInit() {
    this.loadData();
    this.getGridConfiguration();
    this._documentService.reloadDocument.subscribe((data) => {
      if (data) {
        switch (data[AccountManagementConstant.HEADER_ACTION]) {
          case AccountManagementConstant.FILTER:
            console.log('FIlterer Document ', data);
            if (data['data']['docTypeId'] != null) {
              this.loadFilteredData(data['data']['docTypeId']);
            }
            break;
          case AccountManagementConstant.SEARCH:
            this.searchData(data['data']);
            break;
          default:
            break;
        }
      } else {
        console.log('here in data');
        this.loadData();
      }
      this.getGridConfiguration();

    });
  }

  /**
   * Search string data
   * @param query searchable string
   */
  private searchData(query: any) {
    this.rowsData = this.rowsData.filter((row) => {
      if (row.docAlias.toString().toLowerCase().includes(query.toString().toLowerCase()) || row.docDescription.toString().toLowerCase().includes(query.toString().toLowerCase()) || row.docId.toString().toLowerCase().includes(query.toString().toLowerCase())) {
        return true;
      }
    });
  }

  /**
   * loads  documents fitered on thier type
   * @param  {} docTypeId
   */
  private loadFilteredData(docTypeId) {
    this._documentService.getFilteredDocuments(docTypeId, this.companyId).subscribe((response: any) => {
      this.rowsData = response;
      this.transformRowData();

    });
  }

  /**
   * loads all documents of company from DB
   */
  private loadData() {
    this._documentService.getAllDocuments(this.companyId).subscribe((response: any) => {
      this.rowsData = response;
      this.transformRowData();
    });
  }


  /**
   * transforms row data as required 
   */
  private transformRowData() {
    this.rowsData = this.rowsData.map((element) => {
      const dataAfterTransformation = {
        docId: element.docId,
        docAlias: element.docAlias,
        docDescription: element.docDescription,
        docTypeName: this._documentTypeData.find((docType) => docType.id === element.docTypeId)['type'],
        docTypeId: element.docTypeId,
        docIssueDate: element.docIssueDate,
        docExpiryDate: element.docExpiryDate,
        docExternalNumber: element.docExternalNumber,
        docStatus: element.docStatus,
        docStatusName: this._documentStatus.find((docStatus) => docStatus.id === element.docStatus)['name'],
        createdOn: element.createdOn,
        updatedOn: element.updatedOn
      };
      return dataAfterTransformation;
    });
  }

  /**
   * Added grid Configuration
   */
  private getGridConfiguration() {
    this.gridConfiguration.isSortingEnabled = true;
    this.gridConfiguration.isPaginaionEnabled = true;
    this.gridConfiguration.actionIconList.length = 0;
    this.gridConfiguration.sortColumnName = 'createdOn';
    this.gridConfiguration.sortOrder = 'desc';
    this.gridConfiguration.showLoader = false;
    this.gridConfiguration.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfiguration.actionIconList.push(new GridActionIcon('visibility', 'View'));
    this.gridConfiguration.actionIconList.push(new GridActionIcon('edit', 'Edit'));
    this.gridConfiguration.actionIconList.push(new GridActionIcon('cloud_download', 'Download'));
    this.gridConfiguration.actionIconList.push(new GridActionIcon('delete', 'Delete'));

  }

  /**
   * Set Data table properties
   */
  private getColumnData() {
    this.columnsData = [
      { columnDef: 'docAlias', headerName: 'Name (Alias)', dataType: DataType.String },
      { columnDef: 'docDescription', headerName: 'Description', dataType: DataType.String },
      { columnDef: 'docTypeName', headerName: 'Document Type', dataType: DataType.Object },
      { columnDef: 'docIssueDate', headerName: 'Valid From', dataType: DataType.String },
      { columnDef: 'docExpiryDate', headerName: 'Valid Till', dataType: DataType.String },
      { columnDef: 'docId', headerName: 'Internal Ref', dataType: DataType.String },
      { columnDef: 'docExternalNumber', headerName: 'External Ref', dataType: DataType.String },
      { columnDef: 'docStatusName', headerName: 'Status', dataType: DataType.String },
      { columnDef: 'createdOn', headerName: 'Created On', dataType: DataType.Date, dataFormat: DataFormat.LocalDate, css: { horizontalAlign: 'left' } },
      { columnDef: 'updatedOn', headerName: 'Updated On', dataType: DataType.Date, dataFormat: DataFormat.LocalDate, css: { horizontalAlign: 'left' } }
    ];
  }

  /**
   * Trigger on click delete button
   * @param  {any} data
   */
  public onActionExtraButtonClick(data: any) {
    switch (data.index) {
      case 0:
        this._dialog.open(DocumentFormComponent, {
          data: {
            mode: FortigoConstant.FORM_VIEW_MODE,
            defaultData: data['data']
          }
        });
        break;
      case 1:
        this._dialog.open(DocumentFormComponent, {
          data: {
            mode: FortigoConstant.FORM_EDIT_MODE,
            defaultData: data['data']
          }
        });
        break;
      case 2:
        this._documentService.downloadDocument(data['data']['docId']).subscribe((response) => {
          if (response) {
            this.saveToFileSystem(response);
          }
        });
        break;
      case 3:
        this.deleteDocument(data['data']['docId']);
        break;
      default:
        break;
    }
  }

  /**
   * saves the file from blob
   * @param  {any} response
   */
  public saveToFileSystem(response: any) {
    const contentDispositionHeader: string = response.headers.get('Content-Disposition');
    const parts: string[] = contentDispositionHeader.split(';');
    let fileName = decodeURI(parts[1].split('=')[1]);
    const blob = new Blob([response.body], { type: response.headers.get('Content-Type') });
    fileName = fileName.replace('"', '').split('.').splice(0, fileName.split('.').length - 1).join();
    saveAs(blob, fileName);
  }

  /**
   * delete document
   * @param  {} docId
   */
  private deleteDocument(docId: number) {
    Swal.fire({
      title: 'Are you sure?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: FortigoConstant.DEFAULT_SWAL_CONFIRM_BUTTON_COLOR,
      cancelButtonColor: FortigoConstant.DEFAULT_SWAL_CANCEL_BUTTON_COLOR,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.value) {
        this._documentService.removeDocument(docId)
          .subscribe(response => {
            if (!response['errorCode']) {
              this._documentService.reloadDocument.next();
              Swal.fire('Successful', 'Deleted successfully', 'success');
            } else {
              Swal.fire('Failed', 'Failed to Delete', 'error');
            }
          });
      }
    });
  }
}
