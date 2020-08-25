/*
* Created on Sat Jan 26 2019
* Created by - 1157: Mayur Ranjan
*
* Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/

export class FormConfiguration {

    // To set CSS for form
    css: CSS;
    style: Style;

    private debugMessage = '\nForm Configuration: ';

    constructor() {
        this.css = new CSS();
        this.style = new Style();
        this.css.fontSize = '10px';
        this.css.containerMaxWidth = '200px';
    }
}

export class FormConfigValidation {
    errorMessages: Array<string>;
    formConfigDataObject: FormConfiguration;

    constructor(formConfigDataObject) {
        this.errorMessages = new Array<string>();
        this.formConfigDataObject = formConfigDataObject;
    }
}

export class CSS {
    fontSize: string;
    containerMaxWidth: string;
}

class Style {
    containerDiv: any;
}
