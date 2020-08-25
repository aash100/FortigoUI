/*
 * Created on  Oct 28 2019
 * Created by - 1227: Vinayak K S
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Component, OnInit, Inject } from '@angular/core';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';
import { Column, DataType, DataFormat } from 'src/app/shared/models/column.model';
import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import { UploadManualInvoiceModalComponent } from '../upload-manual-invoice-modal/upload-manual-invoice-modal.component';
import { TripService } from '../../services/trip/trip.service';
import { TripManagementConstant } from '../../constants/TripManagementConstant';
import { environment } from 'src/environments/environment';
import { FieldTypes, SelectOption, TextInputField, TextAreaInputField, SelectInputField, CheckBoxInputField, SearchableSelectInputField } from 'src/app/shared/abstracts/field-type.model';
import Swal from 'sweetalert2';
import { Util } from 'src/app/core/abstracts/util';
import { FortigoValidators } from 'src/app/shared/models/fortigo-validators.model';

@Component({
  selector: 'app-view-generated-invoice-modal',
  templateUrl: './view-generated-invoice-modal.component.html',
  styleUrls: ['./view-generated-invoice-modal.component.css']
})
export class ViewGeneratedInvoiceModalComponent implements OnInit {
  public fields: Array<any>;
  public title: string;
  public columnsData: Array<Column>;
  public rowsData: Array<any>;
  public gridConfigurationData: GridConfiguration;
  public isSubmit: boolean;
  public buttons: Array<any>;
  private requestPayLoad: any;
  private internalCompanyList: Array<any>;
  private isReadOnly: boolean;
  private billToName: any; billToAddress: any; gstn: any;
  private isFormValid: boolean;

  constructor(public _dialogRef: MatDialogRef<UploadManualInvoiceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _tripService: TripService, private _dialog: MatDialog, private _snackBar: MatSnackBar) {
    this.title = 'Update Bill To Details';
  }

  ngOnInit() {
    this.getGridConfiguration();
    this.internalCompanyList = [{ companyStringId: FortigoConstant.FTAPL_COMPANY_ID.toString(), name: 'FTAPL' },
    { companyStringId: FortigoConstant.FNLPL_COMPANY_ID.toString(), name: 'FNLPL' }];
    this.getFormFields();
    this.columnsData = this.getGenerateInvoiceTripColumns();
    this.buttons = [{ name: 'Submit', icon: 'check', isDisabled: false }, { name: 'Cancel', icon: 'close', isDisabled: false }];
    this.rowsData = this._data['responseList'];
    this.rowsData.forEach((eachRow) => {
      eachRow.checkbox1Disable = true;
    });
  }

  /**
   * Intialzes the form
   */
  private getFormFields() {
    const billToName = new TextInputField('Bill To Name', 'bill_to_name', 2, undefined, new FortigoValidators(undefined, undefined, true), undefined, undefined, this.billToName);
    const billToAddress = new TextAreaInputField('Bill to Address', 'bill_to_address', 2, undefined, new FortigoValidators(undefined, undefined, true), undefined, undefined, this.billToAddress);
    const companyListOptions = new SelectOption('name', 'companyStringId', this.internalCompanyList);
    const internalCompany = new SelectInputField('Invoicing Entity', 'invoicer_id', companyListOptions, 2, undefined, new FortigoValidators(undefined, undefined, true));
    const stateList = new SelectOption('name', 'name', this._tripService.tripFilter.allStateCodeList);
    const billToGSTIN = new TextInputField('GSTIN', 'bill_to_gstin', 2, undefined, undefined, undefined, undefined, this.gstn);
    const stateDropDown = new SearchableSelectInputField('State Code', 'bill_to_state_code', stateList, 2, false, this.isReadOnly, new FortigoValidators(undefined, undefined, true));
    const unRegistedFlag = new CheckBoxInputField('Unregistered GST', 'unregistered_flag', 2, this.isReadOnly, new FortigoValidators(undefined, undefined, true), undefined, undefined);
    this.fields = [billToName, billToAddress, billToGSTIN, internalCompany, stateDropDown, unRegistedFlag];
  }

  /**
   * Submits the form to backend
   * @param  {any} formSubmissionData
   */
  formSubmit(formSubmissionData: any) {
    this.formValidation(formSubmissionData);
    if (this.isFormValid) {
      this.requestPayLoad = formSubmissionData;
      this.requestPayLoad['unregistered_flag'] = (formSubmissionData.unregistered_flag) ? formSubmissionData.unregistered_flag : false;
      this.requestPayLoad['bill_to_state_code'] = (formSubmissionData.bill_to_state_code) ? formSubmissionData.bill_to_state_code : '';
      this.requestPayLoad['service_ref_ids'] = this.rowsData.map(eachRowData => eachRowData.serviceReferenceId);
      this.requestPayLoad['source'] = this._data.source;
      this.requestPayLoad['role_id'] = this._data.role_id;
      this.requestPayLoad['user_id'] = this._data.user_id;
      this._tripService.bulkUpdateBillingDetails(this.requestPayLoad).subscribe((response) => {
        if (response['status'] && response['status'] === 'success') {
          if (response['response']) {
            this._snackBar.open(response['response']);
          }
          this.onClose();
          if (this._data.type === 'manualUpload') {
            this._dialog.open(UploadManualInvoiceModalComponent, {
              data: {
                requestPayload: this._data.requestPayload,
                tripList: this._data.tripList,
              }
            });
          } else {
            this._tripService.generateInvoiceReload.next(this._data.actionData);
          }

        } else {
          Swal.fire('Error', response['errorMessage'], 'error');
        }

      });
    }


  }

  formValidation(formSubmissionData: any) {
    this.isFormValid = true;
    if (formSubmissionData.bill_to_name === '' || formSubmissionData.bill_to_address === '' || formSubmissionData.invoicer_id === '') {
      this.isFormValid = false;
    }
    if (formSubmissionData.bill_to_gstin === '' && (formSubmissionData.bill_to_state_code === '' || formSubmissionData.unregistered_flag === false)) {
      this.isFormValid = false;
      Swal.fire('Warning', 'Please enter either GSTIN or Valid State Code and Select the valid Unregistered Flag', 'warning');
    }
  }
  /**
   * Replaces the field at position in form
   * @param  {number} position
   * @param  {any} field
   * 
   */
  onformFieldModify(position: number, field: any) {
    this.fields.splice(position, 1, field);
    this.fields = <Array<any>>Util.getObjectCopy(this.fields);

  }

  /**
   * triggers onChange of Text InpuField this method changes the view of form based on condiiton
   * @param  {any} input
   */
  inputChanges(input: any) {
    if (input.placeholder === 'GSTN') {
      this.gstn = input.value;
      if (this.gstn !== '') {
        this.isReadOnly = true;
      } else {
        this.isReadOnly = false;
      }
      this.onFormViewChange();
    }
  }

  /**
   * Toggles the state of stateDropDown and unRegistedFlag
   */
  private onFormViewChange() {
    const billToGSTIN = new TextInputField('GSTN', 'bill_to_gstin', 2, undefined, new FortigoValidators(undefined, undefined, this.isReadOnly), undefined, undefined, this.gstn);
    const unRegistedFlag = new CheckBoxInputField('Unregistered GST', 'unregistered_flag', 2, this.isReadOnly, new FortigoValidators(undefined, undefined, true), undefined, undefined, !this.isReadOnly);
    const stateList = new SelectOption('name', 'name', this._tripService.tripFilter.allStateCodeList);
    const stateDropDown = new SearchableSelectInputField('State Code', 'bill_to_state_code', stateList, 2, false, this.isReadOnly, new FortigoValidators(undefined, undefined, true));
    this.onformFieldModify(2, billToGSTIN);
    this.onformFieldModify(4, stateDropDown);
    this.onformFieldModify(5, unRegistedFlag);
  }

  /**
  * generates grid configuration for grid data.
  */
  private getGridConfiguration() {
    this.gridConfigurationData = new GridConfiguration();
    this.gridConfigurationData.css.tableFont = FortigoConstant.FONT_MEDIUM + 'px';
    this.gridConfigurationData.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfigurationData.css.tableHeaderBackgroundStyle = '#D3DCE8';
    this.gridConfigurationData.css.tableCalculatedHeaderBackgroundStyle = '#F1F1F1';
    this.gridConfigurationData.css.tableSubHeader1BackgroundStyle = '#F1F1F1';
    this.gridConfigurationData.css.tableTopHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfigurationData.css.tableRightHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfigurationData.css.tableBottomHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfigurationData.css.tableLeftHeaderBorderStyle = '1px solid #cacaca';
    this.gridConfigurationData.css.fixedTableHeight = 'max-content';

    // this.gridConfigurationData.css.tableOverflow = 'hidden';


    this.gridConfigurationData.isCheckbox1Enabled = true;
    this.gridConfigurationData.checkbox1IsDisabledColumnDef = 'checkbox1Disable';
    this.gridConfigurationData.showCheckbox1HeaderText = true;
    //
    this.gridConfigurationData.checkbox1HeaderText = 'Unregistered GST';
    this.gridConfigurationData.checkbox1ColumnDef = 'unregisteredDestination';
    this.gridConfigurationData.isCheckbox1AtEnd = true;


    this.gridConfigurationData.uniqueColumnName = TripManagementConstant.UNIQUE_COLUMN;
  }
  /**
   * method used for closing the dialog.
   */
  private onClose() {
    this._dialogRef.close();
  }

  /**
   * To get columns for trip data of Generate Invoice POP UP screen.
   */
  private getGenerateInvoiceTripColumns(): Array<Column> {

    const generateInvoiceTripColumns: Array<Column> = [
      { columnDef: 'serviceReferenceId', headerName: 'Trip ID', dataType: DataType.Number, css: { userSelect: 'text' } },
      { columnDef: 'customerName', headerName: 'Customer Name', dataType: DataType.String, css: { userSelect: 'all' } },
      { columnDef: 'billToName', headerName: 'Bill To Name', dataType: DataType.String, css: { userSelect: 'all' } },
      { columnDef: 'billToAddress', headerName: 'Billing Address', dataType: DataType.String, css: { userSelect: 'all' } },
      { columnDef: 'billToGSTIN', headerName: 'GSTIN', dataType: DataType.String, css: { userSelect: 'all' }, dataFormat: DataFormat.UpperCase },
      { columnDef: 'invoicingEntityName', headerName: 'Invoicing Entity', dataType: DataType.String, css: { userSelect: 'all' } },
      { columnDef: 'billToStateCode', headerName: 'Bill To State Code', dataType: DataType.String, css: { userSelect: 'all' }, width: '82px' }

    ];
    // if (this._isCheckBoxEnabled) {
    //   generateInvoiceTripColumns.push({ columnDef: 'unregisteredDestination', headerName: 'Unregesiterd Destination', dataType: DataType.Boolean, action: 'edit', editFieldType: FieldTypes.CheckBox });
    //   generateInvoiceTripColumns.push({ columnDef: 'billToStateCode', headerName: 'Bill To State Code', dataType: DataType.String });
    // } else {
    //   generateInvoiceTripColumns.push({ columnDef: 'unregisteredDestination', headerName: 'Unregesiterd Destination', dataType: DataType.Boolean, editFieldType: FieldTypes.CheckBox });
    //   generateInvoiceTripColumns.push({ columnDef: 'billToStateCode', headerName: 'Bill To State Code', dataType: DataType.String, action: 'edit' });
    // }
    return generateInvoiceTripColumns;
  }

}
