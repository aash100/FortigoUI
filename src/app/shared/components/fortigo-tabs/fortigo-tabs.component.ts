/*
 * Created on Thu Jan 31 2019
 * Created by - 1191: Ritesh Kant
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, } from '@angular/core';

import { Tab } from '../../models/tab.model';

@Component({
  selector: 'app-fortigo-tabs',
  templateUrl: './fortigo-tabs.component.html',
  styleUrls: ['./fortigo-tabs.component.css']
})
export class FortigoTabsComponent implements OnInit, OnChanges {
  /**
   * accept array of tab indexs to hide tab
   */
  @Input() hideTab: Array<number>;
  /**
   * Accepts array of strings to arrange in the tabs
   */
  @Input() tabList: Array<Tab>;
  /**
   * accept input index to select tab
   */
  @Input() selectTab: number;

  // To check the tab is used is for form.
  @Input() isForm = false;
  /**
   *  this triggers a tabClicked event whenever tab is changed
   */
  @Output() tabClicked = new EventEmitter<number>();
  /**
   *  captures active tab
   */
  public activeLink: any;
  /**
   * handle underline
   */
  public clicked: Array<boolean>;
  /**
   * array to control display:none
   */
  public displayNone: Array<boolean>;
  // To set default style for tab nav bar.
  // ANCHOR put it in constant.
  public tabNavBarStyle = { 'margin-bottom': '5px' };

  constructor() { }

  ngOnInit() {
    if (this.tabList && Array.isArray(this.tabList)) {
      // used to hide the tab
      this.displayNone = new Array<boolean>(this.tabList.length);
      this.displayNone.fill(false);
      if (this.hideTab) {
        this.hideTab.forEach((value, index) => {
          this.displayNone[value] = true;
        });
      }

      // close hide tab
      this.clicked = new Array<boolean>(this.tabList.length);

      this.selectFortigoTab();
      if (this.tabList.length > 0) {
        this.activeLink = this.tabList[0].label;
      }
    }
    if (this.isForm) {
      // ANCHOR put it in constant.
      this.tabNavBarStyle['margin-bottom'] = '18px';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.selectTab !== null && this.selectTab !== undefined) {
      this.selectTab = changes.selectTab.currentValue;
      if (this.clicked && !this.clicked[this.selectTab]) {
        this.selectFortigoTab();
      }
    }

    if (this.tabList && this.tabList.length > 0) {
      this.tabList.forEach((eachTab: Tab) => {
        if (!eachTab.toolTipText) {
          eachTab.toolTipText = eachTab.label;
        }

        if (!eachTab.badge && !this.isForm) {
          eachTab.badge = 0;
        }
      });
    }

    if (this.isForm) {
      // TODO @Aashish put it in constant.
      this.tabNavBarStyle['margin-bottom'] = '18px';
    }
  }

  private selectFortigoTab() {
    if (this.clicked) {
      this.clicked.fill(false);
    }
    if (this.selectTab) {
      this.tabIsClicked(this.selectTab);
    } else if (this.clicked && Array.isArray(this.clicked) && this.clicked.length > 0) {
      this.clicked[0] = true;
    }
  }

  /**
   * This function is called whenever tab is changed, to emit tab change index
   * @param  {number} index: Tab index of the selected tab
   */
  public tabIsClicked(index: number) {
    this.tabClicked.emit(index);
    this.tabChanged(index);
  }

  /**
   * This is called to make text underlined
   * @param  {number} index: tab index of the selected tab
   */
  public tabChanged(index: number) {
    this.clicked.fill(false);
    this.clicked[index] = true;
  }
}
