/*
 * Created on Wed Aug 21 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { PatternModel } from 'src/app/core/constants/FortigoPattern';
import { FortigoFileSize } from 'src/app/core/constants/FortigoConstant';

export class FortigoValidators {
    public minLength?: number; // Min length of the input value.
    public maxLength?: number; // Max length of the input value.
    public required?: boolean; // Is the field required?
    public pattern?: PatternModel; // The desired pattern model that includes regex, description,etc.
    public showError?: boolean; // Show the error caused on input.
    public showHint?: boolean; // Show the hint while taking input.
    public allowKeyInput = true;
    public maxFileSize = FortigoFileSize.DEFAULT_FILE_SIZE; // limit the file input size for upload field.
    constructor(
        minLength?: number,
        maxLength?: number,
        required?: boolean,
        pattern?: PatternModel,
        showError = true,
        showHint?: boolean,
        allowKeyInput = true,
        maxFileSize = FortigoFileSize.DEFAULT_FILE_SIZE
    ) {
        if (minLength) {
            this.minLength = minLength;
        }
        if (maxLength) {
            this.maxLength = maxLength;
        }
        if (required) {
            this.required = required;
        }
        if (pattern) {
            this.pattern = pattern;
        }
        this.showError = showError;
        if (showHint && maxLength) {
            this.showHint = showHint; // Show hint when there is max length validation.
        }
        this.allowKeyInput = allowKeyInput;
        this.maxFileSize = maxFileSize;
    }
}
