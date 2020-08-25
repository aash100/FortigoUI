import { Component, OnInit } from '@angular/core';
import { DocUploadService } from '../services/doc-upload.service';
import { Document } from '../models/document.model';
import { DocUploadModalComponent } from './doc-upload-modal/doc-upload-modal.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LocalDataSource } from 'ng2-smart-table';
import { DomSanitizer } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { DocUploadEditModalComponent } from './doc-upload-edit-modal/doc-upload-edit-modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyControllerService } from '../services/company-controller.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-doc-upload',
  templateUrl: './doc-upload.component.html',
  styleUrls: ['./doc-upload.component.css']
})
export class DocUploadComponent implements OnInit {

  constructor(private service: DocUploadService, private modalService: NgbModal, private sanitizer: DomSanitizer,
    private companyControllerService: CompanyControllerService,
    private route: ActivatedRoute,
    private router: Router,
    public toastr: ToastrService) { }

  dataSource: LocalDataSource;
  docs: Document[];
  ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    size: 'lg'
  };
  settings = {
    mode: 'external',
    hideSubHeader: 'true',
    pager: {
      display: true,
      perPage: 13
    },
    actions: {
      add: false,
      edit: false,
      delete: false,
      custom: [
        {
          title: '<i class="fa fa-edit mr-1" style="margin-right:30px" title="edit"></i>',
          name: 'edit'
        },
        {
          title: '<i class="fa fa-trash mr-1" title="delete"></i>',
          name: 'delete'
        },
        {
          title: '<i class="fa fa-download mr-1" title="download"></i>',
          name: 'download'
        }
      ],
      position: 'right',
    },
    columns: {
      docAlias: {
        title: 'Name (Alias)',
      },
      docDescription: {
        title: 'Description',
      },
      docTypeId: {
        title: 'document type',
        valuePrepareFunction: (value) => {
          return this.service.docTypeMap === undefined ? undefined : this.service.docTypeMap.get(value);
        }
      },
      docIssueDate: {
        title: 'Valid From',
        valuePrepareFunction: (value) => {
          if (value) {
            let arr: any[];
            arr = value.split('-');
            return arr[2] + '-' + arr[1] + '-' + arr[0];
          }
          return value;
        }
      },
      docExpiryDate: {
        title: 'Valid Till',
        valuePrepareFunction: (value) => {
          if (value) {
            let arr: any[];
            arr = value.split('-');
            return arr[2] + '-' + arr[1] + '-' + arr[0];
          }
          return value;
        }
      },
      docId: {
        title: 'Internal Ref',
      },
      docExternalNumber: {
        title: 'External Ref',
      },
      docStatus: {
        title: 'Status',
        valuePrepareFunction: (value) => {
          return this.service.docStatusMap === undefined ? undefined : this.service.docStatusMap.get(value);
        }
      },
      createdOn: {
        title: 'Created On',
        valuePrepareFunction: (value) => {
          return value[2] + '-' + value[1] + '-' + value[0] + ' ' + value[3] + ':' + value[4] + ':' + value[5];
        }
      },
      updatedOn: {
        title: 'Updated On',
        valuePrepareFunction: (value) => {
          return value[2] + '-' + value[1] + '-' + value[0] + ' ' + value[3] + ':' + value[4] + ':' + value[5];
        }
      },
    }
  };
  ngOnInit() {
    this.service.docListReloadEvent.subscribe(
      () => {
        this.getDocuments();
      }
    );
    this.service.filteredDocListEvent.subscribe(
      () => {
        this.getFilteredDocuments(this.service.filterDocType);
      }
    );
    this.route.params.subscribe(params => {
      this.service.companyId = params['id'];
    });
    this.getDocuments();
    this.companyControllerService.searchDocuments.subscribe(
      (data) => {
        this.onSearch(data);
      }
    );
  }
  getDocuments(): void {
    this.service.getAllDocuments().subscribe(
      documents => {
        this.docs = documents;
        this.dataSource = new LocalDataSource(documents);
      }
    );
  }
  getFilteredDocuments(docType: number): void {
    this.service.getFilteredDocuments(docType).subscribe(
      documents => {
        this.docs = documents;
        this.dataSource = new LocalDataSource(documents);
      }
    );
  }
  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
  public openDocUploadModal(value: any) {

    this.service.setDoc(new Document());
    const modalRef = this.modalService.open(DocUploadModalComponent, this.ngbModalOptions);
    modalRef.componentInstance.title = 'Upload Document';
    modalRef.componentInstance.mode = 'value';
  }
  openEditDocumentModal(doc: Document) {
    this.service.setDoc(doc);
    const modalRef = this.modalService.open(
      DocUploadModalComponent,
      this.ngbModalOptions
    );
    modalRef.componentInstance.title = 'Upload Document';
    modalRef.componentInstance.mode = 'edit';
  }
  openDocUploadModalEdit(selectedDoc: Document) {
    this.service.setDoc(selectedDoc);
    const modalRef = this.modalService.open(DocUploadEditModalComponent, { backdrop: 'static', keyboard: false, size: 'sm' });
    modalRef.componentInstance.title = 'Edit Document';
    modalRef.componentInstance.mode = 'edit';
  }
  onCustom(event: any) {
    if (event.action === 'edit') {
      this.openEditDocumentModal(event.data);
    }
    if (event.action === 'delete') {
      this.removeDocument(event.data.docId, event.data.docAlias);
    }
    if (event.action === 'download') {
      this.saveFile(event.data.docId);
    }
  }
  removeDocument(docId: number, docAlias: string): void {
    Swal.fire({
      title: 'Confirm',
      text: 'Do you want to delete document ' + docAlias + '?',
      type: 'info',
      showCancelButton: true
    }).then((result) => {
      if (result.value) {
        this.service.removeDocument(docId).subscribe(response => {
          this.getDocuments();
          //  this.toastr.success('document deleted successfully');
          Swal.fire('Document deleted successfully', '', 'success');
        });
      }
    });
  }
  reloadPage() {
    this.router.navigate([this.router.url]);
  }
  refresh(): void {
    window.location.reload();
  }
  onSearch(query: string = '') {
    if (query.trim().length === 0) {
      this.dataSource = new LocalDataSource(this.docs);

    } else {
      this.dataSource.setFilter([
        {
          field: 'docId',
          search: query
        },
        {
          field: 'docAlias',
          search: query
        },
        {
          field: 'docDescription',
          search: query
        }
      ], false);
    }
  }
  saveFile(id: number) {
    this.service.downloadFile(id).subscribe(response => {
      this.saveToFileSystem(response);
    },
      err => {
        console.log(err);
      });
  }

  saveToFileSystem(response: any) {
    const contentDispositionHeader: string = response.headers.get('Content-Disposition');
    const parts: string[] = contentDispositionHeader.split(';');
    let fileName = decodeURI(parts[1].split('=')[1]);
    const blob = new Blob([response.body], { type: response.headers.get('Content-Type') });
    fileName = fileName.replace('"', '').split('.').splice(0, fileName.split('.').length - 1).join();
    saveAs(blob, fileName);
  }
}
