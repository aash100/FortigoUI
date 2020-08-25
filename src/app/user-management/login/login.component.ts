import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { NgForm, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  @ViewChild('f',{static:false}) form: NgForm;
  email: string;
  password: string;
  constructor(private _title: Title, private _activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this._title.setTitle(this._activatedRoute.snapshot.data['title']);
  }
  public login() {
    console.log('Username', this.email, 'Password', this.password);
    if (this.email && this.password) {
      Swal.fire(this.email + ' Logged in successfully');
    } else {
      alert('Please enter your email id and password');
    }
  }

  public getPassword() { }
  public fblogin() { }
  public createAccount() { }
}
