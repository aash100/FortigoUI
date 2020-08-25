/*
* Created on Sat Jan 26 2019
* Created by - 1157: Mayur Ranjan
*
* Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/

export class CardConfiguration {

    // To set CSS for Card
    css: CSS;
    style: Style;

    private debugMessage = '\nCard Configuration: ';

    constructor() {
        this.css = new CSS();
        this.style = new Style();
        this.css.fontSize = '10px';
        this.css.fontWeight = '600';
        this.css.fontColor = '#E66006';
        this.css.marginTop = '8px';
        this.css.marginBottom = '8px';
        this.css.headerBackground = '#d3d3d324';
        this.css.borderBottomLeftRadius = '5px';
        this.css.borderBottomRightRadius = '5px';
        this.css.paddingTop = '20px';
        this.css.marginTopContent = '3px !important';
        this.css.marginBottomCard = '10px';
    }
}

export class CardConfigValidation {
    errorMessages: Array<string>;
    cardConfigDataObject: CardConfiguration;

    constructor(cardConfigDataObject) {
        this.errorMessages = new Array<string>();
        this.cardConfigDataObject = cardConfigDataObject;
    }
}

export class CSS {
    // title
    fontSize: string;
    fontWeight: string;
    fontColor: string;
    marginTop: string;
    marginBottom: string;
    headerBackground: string;
    // content
    contentBackground: string;
    borderBottomLeftRadius: string;
    borderBottomRightRadius: string;
    paddingTop: string;
    marginTopContent: string;
    marginBottomCard: string;
}

class Style {
    card: any;
    header: any;
    headerTitle: any;
    headerSubTitle: any;
    content: any;
    footer: any;
}
