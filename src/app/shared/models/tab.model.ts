/*
 * Created on Mon Jun 03 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
export class Tab {
    /**
     * To set a label of Tab
     */
    label: string;
    /**
     * To set a badge of Tab
     */
    badge?: number;
    /**
     * To set a tool tip text of Tab
     */
    toolTipText?: string;
    /**
     * To set to show a tool tip text of Tab
     */
    hideToolTipText?: boolean;
    /**
     * To set a key of Tab, for binding data
     */
    key?: string;
    /**
     * To hide badge
     */
    hideBadge?: boolean;
}
