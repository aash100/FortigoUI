/*
 * Created on Mon Sep 30 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class FortigoTreeNodeValue {
  currentNodeId: string;
  parentNodeId: string;
  nodePathValue: string;
  isChecked = false;
  style?: any;
  docNo?: string;

  constructor(currentNodeId?: string, parentNodeId?: string, nodePathValue?: string, isChecked = false, color?: string, docNo?: string) {
    this.currentNodeId = currentNodeId;
    this.parentNodeId = parentNodeId;
    this.nodePathValue = nodePathValue;
    this.isChecked = isChecked;
    this.style = new Object();
    this.style['float'] = 'right';
    if (color) {
      this.style['color'] = color;
    }
    this.docNo = docNo;
  }
}
