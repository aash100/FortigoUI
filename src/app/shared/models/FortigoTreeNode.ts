/*
 * Created on Mon Sep 30 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { FortigoTreeNodeValue } from './FortigoTreeNodeValue';

export class FortigoTreeNode {
  key: string;
  value?: FortigoTreeNodeValue;
  node?: Array<FortigoTreeNode>;

  constructor(key: string, value?: FortigoTreeNodeValue, node?: Array<FortigoTreeNode>) {
    this.key = key;
    if (value) {
      this.value = value;
    }
    if (node) {
      this.node = node;
      this.node.forEach((eachNode) => {
        eachNode.value.parentNodeId = this.value.currentNodeId;
      });
    }
  }
}
