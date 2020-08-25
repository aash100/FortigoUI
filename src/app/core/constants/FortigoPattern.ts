/*
 * Created on Wed Aug 21 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
export class PatternModel {
    public ruleName: string; // Unique Rule Name of Pattern
    public fieldName: string; // Field name of Pattern
    public regex: RegExp | string; // Regular expression for Pattern
    public errorCode: string; // Error code for Pattern
    public description: string; // Description for Pattern

    constructor(ruleName: string, fieldName: string, regex: RegExp | string, errorCode: string, description?: string) {
        this.ruleName = ruleName;
        this.fieldName = fieldName;
        this.regex = regex;
        this.errorCode = errorCode;
        if (description !== undefined) {
            this.description = description;
        }
    }
}
export class FortigoPattern {
    public static GST_PATTERN: PatternModel = new PatternModel('gstPattern', 'GST', '^([0-9]{2})([a-zA-Z]{5})([0-9]{4})([a-zA-Z]{1})([a-zA-Z0-9]{1})([zZ]{1})([a-zA-Z0-9]{1})', 'GST_ERROR', 'GST is Wrong');
    public static NON_DECIMAL_NUMBER_PATTERN: PatternModel = new PatternModel('numberPattern', 'NUMBER', '^[0-9]*$', 'NUMBER_ERROR', 'Number is Wrong');
}
