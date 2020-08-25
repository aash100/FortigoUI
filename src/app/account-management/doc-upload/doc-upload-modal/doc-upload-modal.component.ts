import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { NgbActiveModal, NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DocUploadService } from '../../services/doc-upload.service';
import { CommonService } from '../../services/common.service';
import { Document } from '../../models/document.model';
import { DocType } from '../../models/doc-type.model';
import { Company } from '../../models/company.model';
import { FormControl } from '@angular/forms';
import { ReplaySubject ,  Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MatSelect, VERSION } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { LoginControlService } from 'src/app/app-landing/services/login-control.service';
import { NgModule } from '@angular/core';
import Swal from 'sweetalert2';
import { DocStatus } from '../../models/doc-status.model';
@Component({
  selector: 'app-doc-upload-modal',
  templateUrl: './doc-upload-modal.component.html',
  styleUrls: ['./doc-upload-modal.component.css']
})
@NgModule({
  providers: [LoginControlService]
})
export class DocUploadModalComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(public activeModal: NgbActiveModal,
    public modalService: NgbModal,
    public docService: DocUploadService,
    public commonService: CommonService,
    public router: Router,
    public route: ActivatedRoute,
    public _customerService: CustomerService,
    public loginService: LoginControlService
  ) {
    this.doc = docService.getDoc();
    this.docTypes = docService.docTypes;
  }

  version = VERSION;

  mode = '';
  closeResult: string;
  fileName: string;
  selectedFile: File;
  modalRef: NgbModalRef;
  public doc: Document;
  public docTypes: DocType[];
  selectedDocType: DocType;
  selectedDocTypeId: number;
  selectedCompany: Company;
  public selectedInternalComp: Company;

  @ViewChild('singleSelect',{static:false}) singleSelect: MatSelect;
  private companyList: Company[];
  public internalCompanyList: Company[];
  public companyCtrl: FormControl = new FormControl();
  public companyFilterCtrl: FormControl = new FormControl();
  public filteredCompanies: ReplaySubject<Company[]> = new ReplaySubject<Company[]>(1);
  private _onDestroy = new Subject<void>();

  public selectedDocStatus: Number;
  public docStatuses: DocStatus[];

  ngOnInit() {
    if (this.mode === 'direct') {
      this.getCompanyList();
    }
    if (this.mode === 'edit') {
      const selectedDocTypeId = this.docService.getDoc().docTypeId;
      const selectedDocType = this.docService.docTypeMap.get(selectedDocTypeId);
      console.log('internal company:' + this.docService.getDoc().internalCompany);
      console.log('doc Status:' + this.docService.getDoc().docStatus);
      console.log('docType id :' + selectedDocTypeId.valueOf() + ' type:' + selectedDocType);
      this.selectedDocType = new DocType(selectedDocTypeId.valueOf(), selectedDocType);
      this.selectedDocTypeId = selectedDocTypeId.valueOf();
    }
    this.internalCompanyList = this.docService.internalCompList;
    this.doc = this.docService.getDoc();
    console.log('mode:' + this.mode);
    this.docStatuses = this.docService.docStatuses;
    this.selectedDocStatus = this.docService.getDoc().docStatus;
  }
  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    this.fileName = this.selectedFile.name;
  }

  private getCompanyList() {

    this.companyList = this.loginService.companyIdAndCompanyNameList;
    this.filteredCompanies.next(this.companyList.slice());
    this.companyFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterCompanies();
      });
  }
  private filterCompanies() {
    if (!this.companyList) {
      return;
    }
    let search = this.companyFilterCtrl.value;
    if (!search) {
      this.filteredCompanies.next(this.companyList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredCompanies.next(
      this.companyList.filter(company => company.companyName.toLowerCase().indexOf(search) > -1)
    );
  }

  public setDocType(id: number) {
    this.selectedDocType = this.docTypes.filter((eachDocType) => {
      return eachDocType.id === id;
    })[0];
    console.log(this.selectedDocType);
  }

  onSave() {
    if (!this.validateSave()) {
      return;
    }
    if (this.mode === 'edit') {
      this.doc.docStatus = this.selectedDocStatus;
      this.doc.docTypeId = this.selectedDocTypeId;
      this.docService.editDocument(this.doc);
      this.activeModal.dismiss('saved');
      this.router.navigate(['/customer/company/documents/' + this.docService.companyId]);
      return;
    }

    if (this.mode === 'direct') {
      this.docService.companyId = this.selectedCompany.companyStringId;
    }
    if (this.selectedInternalComp) {
      this.doc.internalCompany = this.selectedInternalComp.companyStringId;
    }
    this.doc.docId = Date.now();
    this.doc.docTypeId = this.selectedDocType.id;
    this.docService.addDocument(this.selectedFile, this.doc);
    this.activeModal.dismiss('saved');
    // Pass value to second screen
    this._customerService.selectedCompanyId = this.docService.companyId + '';
    if (this.mode === 'direct') {
      this._customerService.selectedCompanyName = this.selectedCompany.companyName;
    }
    this.router.navigate(['/customer/company/documents/' + this.docService.companyId]);
  }

  validateSave() {
    if (this.mode === 'direct') {
      if (!this.selectedCompany) {
        Swal.fire('Please select company');
        return false;
      }
    }
    if (!this.doc.docAlias) {
      Swal.fire('Please enter document name');
      return false;
    }
    if (!this.doc.docDescription) {
      Swal.fire('Please enter document description');
      return false;
    }
    if (!this.selectedDocType) {
      Swal.fire('Please select document type');
      return false;
    }
    if (this.mode !== 'edit') {
      if (!this.selectedFile) {
        Swal.fire('Please select a file');
        return false;
      }
    }
    if (this.mode === 'edit') {
      if (!this.selectedDocStatus) {
        Swal.fire('please select status of document');
        return false;
      }
    }
    return true;
  }

  refresh(): void {
    window.location.reload();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  private setInitialValue() {
    this.filteredCompanies
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {

        this.singleSelect.compareWith = (a: Company, b: Company) => {
          if (a && b) {
            if (a['companyStringId'] === b['companyStringId']) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        };
      });
  }
  reloadPage() {
    this.router.navigate([this.router.url]);
  }
}
