/*
 * Created on Thu Jan 09 2020
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class AccessDetail {

    constructor(
        public node_id: number,
        public enabled: boolean,
        public extraInfo: object,
        public children: Array<AccessDetail>
    ) {
        this.node_id = node_id;
        this.enabled = enabled;
        this.extraInfo = extraInfo;
        this.children = children;
    }
}
