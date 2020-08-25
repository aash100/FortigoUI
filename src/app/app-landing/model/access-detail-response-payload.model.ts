
/*
* Created on Thu Jan 09 2020
* Created by - 1157: Mayur Ranjan
*
* Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/

import { AccessDetail } from './access-detail.model';

export class AccessDetailResponsePayload {

    constructor(
        public status: string,
        public message: string,
        public errorCode: number,
        public errorMessage: string,
        public entityAccessDetails: AccessDetail
    ) {
        this.status = status;
        this.message = message;
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }
}
