/*
 * Created on Mon Nov 11 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { FilterStorage } from 'src/app/core/models/filter-storage.model';
import { TripInvoicingFilter } from './trip-invoicing-filter';

export class TripInvoicingFilterStorage implements FilterStorage {
    public time: Date;
    public name: string;
    public value: TripInvoicingFilter;

    constructor(name: string, value: TripInvoicingFilter) {
        this.time = new Date();
        this.name = name;
        this.value = value;
    }
}
