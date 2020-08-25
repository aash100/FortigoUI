import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Target } from '../models/target.model';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TargetService {
  baseUrl = environment.baseUrl + environment.baseAccountManagementPath;

  targetEdited = new Subject<any>();

  constructor(private http: HttpClient) { }

  public saveTarget(data: Array<Target>) {
    return this.http.post(this.baseUrl + '/target/create', data);
  }

  public getTargetEditEvent(): Observable<any> {
    return this.targetEdited.asObservable();
  }

  public getTargetWithRemarks(targetId: number) {
    return this.http.get(this.baseUrl + '/target/viewTarget/' + targetId);
  }
}
