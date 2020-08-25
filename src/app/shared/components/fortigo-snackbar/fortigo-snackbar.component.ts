import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';

import { SnackbarModel } from '../../models/snackbar.model';

@Component({
  selector: 'app-fortigo-snackbar',
  templateUrl: './fortigo-snackbar.component.html',
  styleUrls: ['./fortigo-snackbar.component.css']
})
export class FortigoSnackbarComponent {

  constructor(
    public _snackBarRef: MatSnackBarRef<FortigoSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public snackbar: SnackbarModel
  ) { }

  public onActionButtonClick() {
    this._snackBarRef.closeWithAction();
  }
}
