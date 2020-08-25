/*
 * Created on Sat Jan 26 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Validation } from '../abstracts/validation.model';
import { FieldType } from '../abstracts/field-type.model';

export class FormFields {
    public placeholder: string;
    public hint: string;
    public id: string;
    public label: string;
    public value: string;
    public validations: Array<Validation>;
    public fieldTypes: Array<FieldType>;
}
