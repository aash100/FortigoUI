/*
 * Created on Fri Feb 01 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class RightClickMenu {
    placeholder: string;
    action: string;
    icon: string;
    isDisabled?: boolean;

    constructor(placeholder: string, action: string, isDisabled?: boolean, icon?: string) {
        this.placeholder = placeholder;
        this.action = action;
        if (isDisabled === undefined) {
            this.isDisabled = false;
        } else {
            this.isDisabled = isDisabled;
        }
        if (icon) {
            this.icon = icon;
        }
    }
}
