/*
 * Created on Tue Aug 09 2019
 * Created by - 1191: Ritesh Kant
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class Note {
    /**
     * To set the text of a note
     */
    public text: string;
    /**
     * To add CSS style classes to Column
     */
    public horizontalAlign?: Align;
    /**
     * To set, if a Column shows Expanded Row Icon
     */
    public textColor?: Color;
        /**
     * To set, if a Column shows Expanded Row Icon
     */
    public fontWeight?: FontWeight;

}

export type Align = 'center' | 'left' | 'right';
export type Color = 'blue' | 'red' | 'maroon' | 'green' | 'black' | 'orange';
export type FontWeight = 'bold' | 'bolder' | 'normal' | 'lighter';

