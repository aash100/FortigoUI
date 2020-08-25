/*
 * Created on Tue Sep 24 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class InputValidation {
    // text against which regex will be matched
    text: string;
    // regex pattern to match
    pattern: string | RegExp;
    // to allow key input from user
    allowKeyInput: boolean;
}
