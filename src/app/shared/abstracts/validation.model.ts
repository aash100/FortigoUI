/*
 * Created on Sat Jan 26 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

enum ValidationTypes { Required = 'required', MaxLength = 'maxlenth', MinLength = 'minlength' }

export abstract class Validation {
    protected label: string;
    protected type: string;
    protected errorMessage: string;

    constructor(label: string) {
        this.label = label;
    }

    protected abstract setType(): void;
    protected abstract setErrorMessage(): void;
}

export class MaxLengthValidation extends Validation {
    private value: number;
    constructor(label: string, value: number, errorMessage?: string) {
        super(label);

        this.value = value;
        if (errorMessage) {
            this.errorMessage = errorMessage;
        } else {
            this.setErrorMessage();
        }
        this.setType();
    }

    protected setType(): void {
        this.type = ValidationTypes.MaxLength;
    }

    protected setErrorMessage(): void {
        this.errorMessage = this.label + ' length can not be more than ' + this.value;
    }
}

export class MinLengthValidation extends Validation {
    private value: number;
    constructor(label: string, value: number, errorMessage?: string) {
        super(label);

        this.value = value;
        if (errorMessage) {
            this.errorMessage = errorMessage;
        } else {
            this.setErrorMessage();
        }
        this.setType();
    }

    protected setType(): void {
        this.type = ValidationTypes.MinLength;
    }

    protected setErrorMessage(): void {
        this.errorMessage = this.label + ' length can not be less than ' + this.value;
    }
}
