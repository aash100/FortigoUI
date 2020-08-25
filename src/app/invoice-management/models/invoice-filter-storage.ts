/*
 * Created on Tue Jan 07 2020
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { FilterStorage } from 'src/app/core/models/filter-storage.model';
import { InvoiceFilter } from './invoice-filter';

export class InvoiceFilterStorage implements FilterStorage {
    public time: Date;
    public name: string;
    public value: InvoiceFilter;

    constructor(name: string, value: InvoiceFilter) {
        this.time = new Date();
        this.name = name;
        this.value = value;
    }
}
