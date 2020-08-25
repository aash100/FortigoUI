/*
* Created on Sun Nov 10 2019
* Created by - 1157: Mayur Ranjan
*
* Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/

import { FilterStorage } from 'src/app/core/models/filter-storage.model';
import { CollectionFilter } from './collection-filter';

export class CollectionFilterStorage implements FilterStorage {
    public time: Date;
    public name: string;
    public value: CollectionFilter;

    constructor(name: string, value: CollectionFilter) {
        this.time = new Date();
        this.name = name;
        this.value = value;
    }
}
