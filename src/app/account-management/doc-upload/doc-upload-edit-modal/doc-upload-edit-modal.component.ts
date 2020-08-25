import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DocUploadService } from '../../services/doc-upload.service';
import { Document } from '../../models/document.model';
import { DocType } from '../../models/doc-type.model';
import { DocStatus } from '../../models/doc-status.model';

@Component({
  selector: 'app-doc-upload-edit-modal',
  templateUrl: './doc-upload-edit-modal.component.html',
  styleUrls: ['./doc-upload-edit-modal.component.css']
})
export class DocUploadEditModalComponent implements OnInit {

  closeResult: string;
  fileName: string;
  selectedFile: File;
  currentStatus: string;
  modalRef: NgbModalRef;
  docStatuses: DocStatus[];
  private doc: Document;
  private docTypes: DocType[];
  selectedDocType: DocType;
  selectedDoc: Document;
  selectedDocStatus: DocStatus;

  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private docService: DocUploadService) {
    this.doc = docService.getDoc();
    this.docTypes = docService.docTypes;
  }

  ngOnInit() {
    this.selectedDoc = this.docService.doc;
    this.docStatuses = this.docService.docStatuses;
    this.currentStatus = this.docService.docStatusMap.get(this.doc.docStatus);
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    this.fileName = this.selectedFile.name;
  }

  onSave() {
    if (!this.validateSave()) {
      return;
    }
    this.doc.docId = Date.now();
    this.doc.docTypeId = this.selectedDocType.id;
    this.docService.addDocument(this.selectedFile, this.doc);
    this.activeModal.dismiss('saved');
    this.refresh();
  }

  onEdit() {
    this.doc.docStatus = this.selectedDocStatus.id;
    this.docService.editDocument(this.doc);
    this.activeModal.dismiss('saved');
  }

  validateSave() {
    if (this.doc.docAlias === undefined) {
      alert('Please enter document name');
      return false;
    }
    if (this.doc.docDescription === undefined) {
      alert('Please enter document description');
      return false;
    }
    if (this.selectedDocType === undefined) {
      alert('Please select document type');
      return false;
    }
    if (this.selectedFile === undefined) {
      alert('Please upload a file');
      return false;
    }
    return true;
  }

  validateEdit() {
    if (this.doc.docAlias === undefined) {
      alert('Please enter document name');
      return false;
    }
    if (this.doc.docDescription === undefined) {
      alert('Please enter document description');
      return false;
    }
    if (this.selectedDocType === undefined) {
      alert('Please select document type');
      return false;
    }
    return true;
  }

  refresh(): void {
    window.location.reload();
  }

}
