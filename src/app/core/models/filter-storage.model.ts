/*
 * Created on Sun Nov 10 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class FilterStorage {
    public time: Date;
    public name: string;
    public value: any;

    constructor(name: string, value: any) {
        this.time = new Date();
        this.name = name;
        this.value = value;
    }
}