/*
* Created on Sun Nov 10 2019
* Created by - 1157: Mayur Ranjan
*
* Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/

export class CollectionListResponsePayload {
    public collectionList?: Array<any>;
    public statusCount?: Array<StatusCount>;
    public errorCode?: number;
    public errorMessage?: string;
}

export class StatusCount {
    public receiptCount: number;
    public collectionStatus: string;
}
