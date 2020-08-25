/*
 * Created on Wed Oct 23 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-fortigo-modal-header',
  templateUrl: './fortigo-modal-header.component.html',
  styleUrls: ['./fortigo-modal-header.component.css']
})
export class FortigoModalHeaderComponent implements OnInit {
  /**
   * set close visibility
   */
  @Input() isCloseVisible = true;
  /**
   * on Modal Close emit
   */
  @Output() modalClose = new EventEmitter();

  // to show focus overlay on mouse over
  public showFocusOverlay = true;

  constructor() { }

  ngOnInit() {
  }

  public onCloseClick() {
    this.modalClose.emit();
  }

  public onMouseHover() {
    this.showFocusOverlay = false;
  }
}
