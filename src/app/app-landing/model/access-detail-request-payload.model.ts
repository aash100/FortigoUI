/*
 * Created on Thu Jan 09 2020
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class AccessDetailRequestPayload {

    constructor(
        public userId: string,
        public roleId: string,
        public rootId: string,
        public rootName: string
    ) {
        this.userId = userId;
        this.roleId = roleId;
        this.rootId = rootId;
        this.rootName = rootName;
    }
}
