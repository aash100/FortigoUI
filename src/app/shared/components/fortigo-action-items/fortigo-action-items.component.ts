/*
 * Created on Fri Feb 01 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RightClickMenu } from '../../models/right-click-menu.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';

@Component({
  selector: 'app-fortigo-action-items',
  templateUrl: './fortigo-action-items.component.html',
  styleUrls: ['./fortigo-action-items.component.css']
})
export class FortigoActionitemsComponent implements OnInit {
  /*
  Input and Output of the Component
  Input:sidemenu item list
  Output: Action occured on clicking of one of the items.
  */
  @Input() actionMenu: Array<RightClickMenu>;
  @Output() sideMenuAction = new EventEmitter<number>();
  @Output() menuClick = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
    this.applyStyleOnMenuItems();
  }

  /**
   * Method used to apply styling on each menu items
   */
  private applyStyleOnMenuItems() {
    this.actionMenu.forEach((eachItem) => {
      const style = {};
      style['cursor'] = eachItem.isDisabled ? 'not-allowed' : 'pointer';
      style['font-size'] = FortigoConstant.DEFAULT_ACTION_ITEM_FONT + 'px';
      eachItem['style'] = style;
    });
  }

  /**
   * Method called when user clicks one of the items in the sidemenu dropdown
   * @param  {number} index: Side menu Input index
   */
  public itemClicked(index: number) {
    this.sideMenuAction.emit(index);
  }

  /**
   * Trigger Changes on Menu Click
   */
  public onMenuClick() {
    this.menuClick.emit();
  }
}
