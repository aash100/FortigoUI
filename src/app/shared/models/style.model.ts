/*
 * Created on Thu Sep 12 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export type Height = 'auto' | 'fit-content' | 'inherit' | 'initial' | 'max-content' | 'min-content' | string;
export type Overflow = 'auto' | 'hidden' | 'inherit' | 'initial' | 'overlay' | 'scroll' | 'unset' | 'visible';
export type FontSize = 'inherit' | 'initial' | 'large' | 'larger' | 'medium' | 'small' | 'smaller' | 'unset' | 'x-large' | 'x-small' | 'xx-large' | 'xx-small' | string;
export type Float = 'inherit' | 'initial' | 'left' | 'none' | 'right' | 'unset';
export type AlignSelf = 'auto' | 'stretch' | 'center' | 'flex-start' | 'flex-end' | 'baseline' | 'initial' | 'inherit';

export class Style {
    'height': Height;
    'overflow-x': Overflow;
    'overflow-y': Overflow;
    'font-size': FontSize;
    'color': string;
    'float': Float;
    'align-self': AlignSelf;
    'background': string;

    constructor() {
        this.height = 'initial';
        this['overflow-x'] = 'initial';
        this['overflow-y'] = 'initial';
        this['align-self'] = 'initial';
    }
}
