/*
 * Created on Tue Aug 20 2019
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class Target {
    index: number;
    companyId: any;
    userId: any;
    year: string;
    createdBy: any;
    targetRevenue: DurationData;
    targetMargin: DurationData;
    estimateRevenue: DurationData;
    estimateMargin: DurationData;

    constructor(index: number, companyId?: any) {
        this.index = index;
        if (companyId) {
            this.companyId = companyId;
        }
        this.targetRevenue = new DurationData();
        this.targetMargin = new DurationData();
        this.estimateRevenue = new DurationData();
        this.estimateMargin = new DurationData();
    }
}

class DurationData {
    monthly: Array<DataSet>;
    quarterly: Array<DataSet>;
    yearly: Array<DataSet>;

    constructor() {
        this.monthly = new Array<DataSet>();
        this.quarterly = new Array<DataSet>();
        this.yearly = new Array<DataSet>();

        this.monthly.push(new DataSet(4, 'April', 'APR'));
        this.monthly.push(new DataSet(5, 'May', 'MAY'));
        this.monthly.push(new DataSet(6, 'June', 'JUN'));
        this.monthly.push(new DataSet(7, 'July', 'JUL'));
        this.monthly.push(new DataSet(8, 'August', 'AUG'));
        this.monthly.push(new DataSet(9, 'September', 'SEP'));
        this.monthly.push(new DataSet(10, 'October', 'OCT'));
        this.monthly.push(new DataSet(11, 'November', 'NOV'));
        this.monthly.push(new DataSet(12, 'December', 'DEC'));
        this.monthly.push(new DataSet(1, 'January', 'JAN'));
        this.monthly.push(new DataSet(2, 'February', 'FEB'));
        this.monthly.push(new DataSet(3, 'March', 'MAR'));

        this.quarterly.push(new DataSet(2, 'April-June', 'Q1'));
        this.quarterly.push(new DataSet(3, 'July-September', 'Q2'));
        this.quarterly.push(new DataSet(4, 'October-December', 'Q3'));
        this.quarterly.push(new DataSet(1, 'January-March', 'Q4'));

        this.yearly.push(new DataSet(1, 'Yearly', 'Y'));
    }
}

class DataSet {
    data: number;
    id: number;
    name: string;
    placeholder: string;
    targetUpdated: boolean;
    constructor(id: number, name: string, placeholder: string, data?: number, targetUpdated?: boolean) {
        this.id = id;
        this.name = name;
        this.placeholder = placeholder;
        if (data) {
            this.data = data;
        }
    }
}
