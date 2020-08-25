/*
* Created on Sun Nov 10 2019
* Created by - 1157: Mayur Ranjan
*
* Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/

export class CollectionListByTab {
    public requested?: CollectionTab;
    public cheque_received?: CollectionTab;
    public approved?: CollectionTab;
    public rejected?: CollectionTab;
    public suspense?: CollectionTab;
    public appropriated?: CollectionTab;
    public all?: CollectionTab;

    constructor() {
        this.requested = new CollectionTab();
        this.cheque_received = new CollectionTab();
        this.approved = new CollectionTab();
        this.rejected = new CollectionTab();
        this.suspense = new CollectionTab();
        this.appropriated = new CollectionTab();
        this.all = new CollectionTab();
    }
}

export class CollectionTab {
    public data: Array<any>;
    public count: number;

    constructor() {
        this.data = undefined;
        this.count = 0;
    }
}
