
/*
 * Created on Wed Aug 14 2019
 * Created by - 1191: Ritesh Kant
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { FortigoConstant } from "src/app/core/constants/FortigoConstant";

export class HeaderConfiguration {
    /**
     * CSS class to hold all css properties related to head
     */
    public css: HeaderCSS;

    constructor() {
        this.setDefaultValues();
    }

    /**
    * Sets default value of the variable
    */
    private setDefaultValues() {
        this.css = new HeaderCSS();
        this.css.borderColor = FortigoConstant.COLOR_ORANGE;
        this.css.titleFontSize = FortigoConstant.FONT_MEDIUM;
        this.css.subtitleFontSize = FortigoConstant.FONT_MEDIUM;
        this.css.headerMessageFontSize = FortigoConstant.FONT_MEDIUM;
        this.css.miniNotesFontSize = FortigoConstant.FONT_MEDIUM;
        this.css.buttonColor = FortigoConstant.COLOR_ORANGE;
    }

    /**
    * Used to get default value of the configuration
    */
    public getConfiguration(): HeaderCSS {
        return this.css;
    }

}

/**
* CSS class to hold all css properties related to head
*/
export class HeaderCSS {
    /**
      * Border color of header eg: FortigoConstant.COLOR_RED
      */
    public borderColor: string;
    /**
    * Font size of title
    */
    public titleFontSize: number;
    /**
    * Font size of sub-title
    */
    public subtitleFontSize: number;
    /**
    * Font size of header message
    */
    public headerMessageFontSize: number;
    /**
    * Font size of mini notes
    */
    public miniNotesFontSize: number;
    /**
    * Unique name of the Column eg: FortigoConstant.COLOR_RED
    */
    public buttonColor: string;

}