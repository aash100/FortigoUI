import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Document } from '../models/document.model';
import { DocType } from '../models/doc-type.model';
import { DocStatus } from '../models/doc-status.model';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Company } from '../models/company.model';
import Swal from 'sweetalert2';
import { LoginControlService } from 'src/app/app-landing/services/login-control.service';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';

@Injectable({
  providedIn: 'root'
})
export class DocUploadService {
  baseUrl = environment.baseUrl + environment.baseAccountManagementPath;

  public closeDocFilter = new Subject();
  public docListReloadEvent = new Subject<void>();
  public filteredDocListEvent = new Subject();

  private getDocumentUrl: string;
  private getFilteredDocumentUrl: string;
  private removeDocumentUrl: string;
  private addDocUrl: string;
  private addDocObject: any;

  private editDocUrl: string;
  private getDocTypesUrl: string;
  private getDocStatusUrl: string;
  private downloadDocURL: string;

  public companyId: string;
  public doc: Document;
  public docTypes: DocType[];
  public docTypesMap: string[];
  public docTypeMap: any;
  public docStatusMap: any;
  public docStatuses: DocStatus[];
  public internalCompList: Company[];
  public filterDocType: number;

  constructor(
    private http: HttpClient,
    public toastr: ToastrService,
    private _loginControlService: LoginControlService) {

    this.getDocumentUrl = this.baseUrl + '/document/getAllActiveDocuments';
    this.getFilteredDocumentUrl = this.baseUrl + '/document/getFilteredDocuments';
    this.removeDocumentUrl = this.baseUrl + '/document/remove';
    this.addDocUrl = this.baseUrl + '/document/addDocumentFile';
    this.addDocObject = this.baseUrl + '/document/addDocumentObject';
    this.editDocUrl = this.baseUrl + '/document/update';
    this.getDocTypesUrl = this.baseUrl + '/document/getDocTypes';
    this.getDocStatusUrl = this.baseUrl + '/document/getAllStatus';
    this.downloadDocURL = this.baseUrl + '/document/download/';
  }

  setDoc(doc: Document) {
    this.doc = doc;
  }

  getDoc(): Document {
    return this.doc;
  }

  getAllDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.getDocumentUrl + '/' + this.companyId.toString());
  }

  getFilteredDocuments(_docType: number): Observable<Document[]> {
    return this.http.post<Document[]>(this.getFilteredDocumentUrl, { docType: _docType, companyId: this.companyId.toString() });
  }

  setFilterInDoc(docType: number) {
    this.filterDocType = docType;
    this.filteredDocListEvent.next();
  }

  removeDocument(docId: Number): Observable<any> {
    return this.http.get(this.removeDocumentUrl + '?docId=' + docId);
  }

  addDocument(file: File, doc: Document) {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_UPLOAD_HEADER_VALUE);
    const uploadData = new FormData();
    uploadData.append('file', file);
    this.http.post(this.addDocUrl, uploadData, { headers }).subscribe(
      (response) => {
        this.addDocumentData(doc, JSON.parse(response['text']).filePath, response['headers']);
      });
  }

  addDocumentData(doc: Document, fileName: string, boundary: string) {
    // const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_SERVICE_HEADER_VALUE);
    const userId = this._loginControlService.userId;
    const uploadData = new FormData();
    uploadData.append('document', JSON.stringify(doc));
    // uploadData.append('boundary', boundary);
    uploadData.append('filePath', fileName.toString());
    uploadData.append('companyId', this.companyId.toString());
    uploadData.append('userId', userId);
    this.http.post(this.addDocObject, { 'document': doc, 'filePath': fileName, 'companyId': this.companyId, 'userId': userId.toString() }).subscribe(
      (response) => {
        this.docListReloadEvent.next();
        Swal.fire('Document', 'Document data added successfully', 'success');
      });
  }

  editDocument(doc: Document) {
    const uploadData = new FormData();
    const userId = this._loginControlService.userId;
    uploadData.append('document', JSON.stringify(doc));
    uploadData.append('userId', userId);
    this.http.post(this.editDocUrl, { 'document': doc, 'userId': userId.toString() }).subscribe(response => {
      this.docListReloadEvent.next();
      //  this.toastr.success('document updated successfully');
      Swal.fire('Document status updated successfully', '', 'success');
    });
  }

  setDocTypes(docTypes: any) {
    this.docTypes = docTypes;
    const map = new Map();
    this.docTypes.forEach(function (value) {
      map.set(value.id, value.type);
    });
    this.docTypeMap = map;
  }

  getDocTypes(): Observable<any> {
    return this.http.get<DocType[]>(this.getDocTypesUrl);
  }

  setDocStatusMap(docStatuses: any) {
    this.docStatuses = docStatuses;
    const map = new Map();
    this.docStatuses.forEach(function (value) {
      map.set(value.id, value.name);
    });
    this.docStatusMap = map;
  }

  getDocStatuses(): Observable<any> {
    return this.http.get<DocStatus[]>(this.getDocStatusUrl);
  }

  downloadFile(id: number): Observable<any> {
    const headers = new HttpHeaders().set(FortigoConstant.FILE_OPERATION_HEADER_KEY, FortigoConstant.FILE_DOWNLOAD_HEADER_VALUE);
    return this.http.get(this.downloadDocURL + id, { observe: 'response', responseType: 'blob', headers: headers });
  }

  getInternalCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.baseUrl + '/account/list/internalCompanies');
  }
}
