import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyControllerService {

  searchMeetings = new Subject<string>();
  searchDocuments = new Subject<string>();
  searchContacts = new Subject<string>();
  searchTarget = new Subject<string>();
  constructor() { }
}
