/*
* Created on Sat Jan 26 2019
* Created by - 1157: Mayur Ranjan
*
* Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/

import { Optional } from '@angular/core';

import { RightClickMenu } from './right-click-menu.model';
import { AppMetadataService } from 'src/app/core/services/metadata/app-metadata.service';
import { Tab } from './tab.model';
import { FormConfiguration } from './form-configuration.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';

type IconColor = '#FFB100' | '#0A50A1';
type IconAlignment = 'left' | 'right';
type BackgroundStyle = 'inherit' | 'white' | '#D5D5D5' | '#E4E4E4' | '#EBEDF0' | '#D3DCE8' | '#F1F1F1' | '#E7E7E7';
type OverflowStyle = 'auto' | 'hidden' | 'inherit' | 'initial' | 'overlay' | 'scroll' | 'unset' | 'visible';
type SortOrder = 'asc' | 'desc';
type Position = 'before' | 'after';
export type RowType = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';

export class GridConfiguration {

    public readonly DEFAULT_COLLAPSED_ICON: string = 'keyboard_arrow_right';
    public readonly DEFAULT_EXPANDED_ICON: string = 'keyboard_arrow_down';

    /**
     * Unique name of the Column
     */
    uniqueColumnName: string;
    /**
    * Unique name of the Level 1 Row Expansion Column
    */
    uniqueLevel1RowExpansionColumnName: string;
    /**
    * Unique name of the Level 2 Row Expansion Column
    */
    uniqueLevel2RowExpansionColumnName: string;
    /**
    * Unique name of the Level 3 Row Expansion Column
    */
    uniqueLevel3RowExpansionColumnName: string;
    /**
     * To enable sorting
     */
    isSortingEnabled: boolean;
    /**
     * To enable filter - on data set
     */
    isFilterEnabled: boolean;
    /**
     * To set Filter Tab
     */
    isFilterTabEnabled: boolean;
    /**
     * To enable pagination - on data set
     * If this is enabled, this this forces grid to show/hide paginator
     */
    isPaginaionEnabled: boolean;
    /**
     * To set Page Size Options
     */
    pageSizeOptions: Array<number>;
    /**
     * To set Page Size Options
     */
    defaultPageSize: number;
    /**
     * To enable radio-button
     */
    isRadioButtonEnabled: boolean;
    /**
     * The zero-based index of the position of the checkbox.
     */
    radioButtonPostion: number;
    /**
     * To set radio-button at the starting index
     */
    isRadioButtonAtStart: boolean;
    /**
     * To set radio-button at the end
     */
    isRadioButtonAtEnd: boolean;
    /**
     * To set RadioButton Header Text
     */
    radioButtonHeaderText: string;
    /**
     * To set RadioButton Header with Text or RadioButton
     */
    showRadioButtonHeaderText = false;
    /**
     * To enable checkbox 1
     */
    isCheckbox1Enabled: boolean;
    /**
     * The zero-based index of the position of the checkbox 1.
     */
    checkbox1Postion: number;
    /**
     * To set checkbox 1 at the starting index
     */
    isCheckbox1AtStart: boolean;
    /**
     * To set checkbox 1 at the end
     */
    isCheckbox1AtEnd: boolean;
    /**
     * To set Checkbox 1 Header Text
     */
    checkbox1HeaderText: string;
    /**
     * To set Checkbox 1 Column Defination
     */
    checkbox1ColumnDef: string;
    /**
     * To set Checkbox 1 Is Disabled Column Defination
     */
    checkbox1IsDisabledColumnDef: string;
    /**
     * To set Checkbox 1 Header with Text or Checkbox
     */
    showCheckbox1HeaderText = false;
    /**
     * To enable checkbox 2
     */
    isCheckbox2Enabled: boolean;
    /**
     * The zero-based index of the position of the checkbox 2.
     */
    checkbox2Postion: number;
    /**
     * To set checkbox 2 at the starting index
     */
    isCheckbox2AtStart: boolean;
    /**
     * To set checkbox 2 at the end
     */
    isCheckbox2AtEnd: boolean;
    /**
     * To set Checkbox 2 Header Text
     */
    checkbox2HeaderText: string;
    /**
     * To set Checkbox 2 Column Defination
     */
    checkbox2ColumnDef: string;
    /**
     * To set Checkbox 2 Is Disabled Column Defination
     */
    checkbox2IsDisabledColumnDef: string;
    /**
     * To set Checkbox 2 Header with Text or Checkbox
     */
    showCheckbox2HeaderText = false;
    /**
     * To enable Action Buttons
     */
    isActionButtonEnabled: boolean;
    /**
     * To enable Action Buttons
     */
    actionButtonColumnWidth: string;
    /**
     * To enable Extra Action Buttons
     */
    isActionExtraButtonEnabled: boolean;
    /**
     * To enable Extra Action Icon
     */
    isActionIconEnabled: boolean;
    /**
     * To set Extra Action Button's label
     */
    actionExtraButtonLabelList: Array<RightClickMenu>;
    /**
     * To set Extra Action Icon List
     */
    actionIconList: Array<GridActionIcon>;
    /**
     * To set Footer
     */
    isFooterEnabled: boolean;
    /**
     * To set Filter Tab's Label
     */
    filterTabList: Array<Tab>;
    /**
     * To set Header Sticky
     */
    isStickyHeader: boolean;
    /**
     * To set Footer Sticky
     */
    isStickyFooter: boolean;
    /**
     * To set Icon for Expansion of Row
     */
    rowExpansionIcon: string;
    /**
     * To set Icon for Collapse of Row
     */
    rowCollapseIcon: string;
    /**
     * To set Icon for Expansion of Column
     */
    columnExpansionIcon: string;
    /**
     * To set Icon for Collapse of Column
     */
    columnCollapseIcon: string;
    /**
     * To set CSS for cells
     */
    css: CSS;
    /**
     * To set Default Sorting of Column
     */
    sortColumnName: string;
    /**
     * To set Default Sorting order of Column
     */
    sortOrder: SortOrder;
    /**
     * To disable Row Tool Tip Text, use column disable for disabling a particular column's tooltip text
     */
    disableRowToolTipText: boolean;
    /**
     * To disable Header Tool Tip Text, use column disable for disabling a particular column's tooltip text
     */
    disableHeaderToolTipText: boolean;
    /**
     * To disable Sub Header 1 Tool Tip Text, use column disable for disabling a particular column's tooltip text
     */
    disableSubHeader1ToolTipText: boolean;
    /**
     * To disable Sub Header 2 Tool Tip Text, use column disable for disabling a particular column's tooltip text
     */
    disableSubHeader2ToolTipText: boolean;
    /**
     * To disable header ToolTip Text for All Calculated Header, use column disable for disabling a particular column's tooltip text
     */
    disableCalcHeaderToolTipText: boolean;
    /**
     * To disable Action Item Header ToolTip Text
     */
    disableActionItemToolTipText: boolean;
    /**
     * To set Number of Sticky Rows at Top
     */
    noOfStickyHeaderRows: number;
    /**
     * To set Number of Sticky Rows at Bottom
     */
    noOfStickyFooterRows: number;
    /**
     * To set loader inside Grid
     */
    showLoader: boolean;
    // TODO change
    /**
     * To be implemented in grid
     * To set sticky top row
     */
    isStickyTopRow: boolean;
    // TODO change
    /**
     * To be implemented in grid
     * To set sticky Bottom row
     */
    isStickyBottomRow: boolean;
    /**
     * To set Sub Header 1 Position
     */
    subHeader1Position: Position;
    /**
     * To set Sub Header 2 Position
     */
    subHeader2Position: Position;
    /**
     * To set Custom Footer Message
     */
    customFooterMessage: string;
    /**
     * To set Custom Footer Message
     */
    iconCSS: IconCSS;
    /**
     * To set Form Configuration
     */
    editableFormConfiguration: FormConfiguration;
    /**
     * To set Expand All and Collapse all icon button configuration
     */
    showExpandCollapseAllIcon: boolean;

    private debugMessage = '\nGrid Configuration: ';

    constructor(@Optional() private _metadataService?: AppMetadataService) {
        this.isSortingEnabled = false;
        this.isFilterEnabled = false;
        this.isCheckbox1Enabled = false;
        this.isCheckbox2Enabled = false;
        this.isRadioButtonEnabled = false;
        this.pageSizeOptions = FortigoConstant.DEFAULT_GRID_PAGE_SIZE_OPTIONS;
        this.actionExtraButtonLabelList = new Array<RightClickMenu>();
        this.actionIconList = new Array<GridActionIcon>();
        this.editableFormConfiguration = new FormConfiguration();
        this.css = new CSS();
        this.css.tableFont = '10px';
        this.css.tableOverflow = 'auto';
        this.css.tableOverflowX = 'auto';
        this.css.tableOverflowY = 'auto';
        this.css.tableRowHeight = '40px';

        this.css.tableTopHeaderBorderStyle = 'none';
        this.css.tableRightHeaderBorderStyle = 'none';
        this.css.tableBottomHeaderBorderStyle = 'none';
        this.css.tableLeftHeaderBorderStyle = 'none';

        this.css.tableTopCellBorderStyle = 'none';
        this.css.tableRightCellBorderStyle = 'none';
        this.css.tableBottomCellBorderStyle = '1px solid #d9d9d9';
        this.css.tableLeftCellBorderStyle = 'none';

        this.css.tableTopFooterBorderStyle = 'none';
        this.css.tableRightFooterBorderStyle = 'none';
        this.css.tableBottomFooterBorderStyle = 'none';
        this.css.tableLeftFooterBorderStyle = 'none';

        this.css.tableCalculatedHeaderBackgroundStyle = 'white';
        this.css.tableSubHeader1BackgroundStyle = 'white';
        this.css.tableSubHeader2BackgroundStyle = 'white';
        this.css.tableHeaderBackgroundStyle = 'white';
        this.css.tableCellBackgroundStyle = 'inherit';
        this.css.tableFooterBackgroundStyle = 'white';

        this.iconCSS = new IconCSS();

        this.iconCSS.expandIconColor = '#0A50A1';
        this.iconCSS.collapseIconColor = '#FFB100';
        this.iconCSS.alignment = 'right';

        this.isStickyTopRow = false;
        this.isStickyBottomRow = false;
        this.subHeader1Position = 'before';
        this.subHeader2Position = 'before';
        this.disableCalcHeaderToolTipText = true;
        this.disableHeaderToolTipText = true;
        this.disableRowToolTipText = true;
        this.disableSubHeader1ToolTipText = true;
        this.disableSubHeader2ToolTipText = true;
        this.disableActionItemToolTipText = true;

        this.actionButtonColumnWidth = 'inherit';

        this.rowExpansionIcon = this.DEFAULT_EXPANDED_ICON;
        this.rowCollapseIcon = this.DEFAULT_COLLAPSED_ICON;

        this.showExpandCollapseAllIcon = false;
    }

    /**
     * Function validateGridOptions:
     *
     * This function validates Grid Configuration
     * and shows debug warnings
     *
     * @param  {GridConfiguration} gridConfigDataObject: Input data to validate
     * @returns GridConfigValidation: Returns data with warning messages
     */
    public validateGridOptions(gridConfigDataObject: GridConfiguration): GridConfigValidation {
        const validation: GridConfigValidation = new GridConfigValidation(gridConfigDataObject);
        delete gridConfigDataObject._metadataService;
        let tempValidation: GridConfigValidation;

        if (gridConfigDataObject.actionExtraButtonLabelList && gridConfigDataObject.actionExtraButtonLabelList.length > 0) {
            gridConfigDataObject.isActionButtonEnabled = true;
            gridConfigDataObject.isActionExtraButtonEnabled = true;
        }

        if (gridConfigDataObject.actionIconList && gridConfigDataObject.actionIconList.length > 0) {
            gridConfigDataObject.isActionButtonEnabled = true;
            gridConfigDataObject.isActionIconEnabled = true;
        }

        if (gridConfigDataObject.isCheckbox1Enabled) {
            tempValidation = this.checkCheckbox(gridConfigDataObject, 1);
            validation.errorMessages = validation.errorMessages.concat(tempValidation.errorMessages);
            validation.gridConfigDataObject = tempValidation.gridConfigDataObject;
        }

        if (gridConfigDataObject.isCheckbox2Enabled) {
            tempValidation = this.checkCheckbox(gridConfigDataObject, 2);
            validation.errorMessages = validation.errorMessages.concat(tempValidation.errorMessages);
            validation.gridConfigDataObject = tempValidation.gridConfigDataObject;
        }

        if (gridConfigDataObject.isRadioButtonEnabled) {
            tempValidation = this.checkRadioButton(gridConfigDataObject);
            validation.errorMessages = validation.errorMessages.concat(tempValidation.errorMessages);
            validation.gridConfigDataObject = tempValidation.gridConfigDataObject;
        }

        if (gridConfigDataObject.isFilterEnabled) {
            tempValidation = this.checkFilterTab(gridConfigDataObject);
            validation.errorMessages = validation.errorMessages.concat(tempValidation.errorMessages);
            validation.gridConfigDataObject = tempValidation.gridConfigDataObject;
        }

        if (gridConfigDataObject.isActionButtonEnabled && gridConfigDataObject.isActionExtraButtonEnabled) {
            tempValidation = this.checkActionExtraButton(gridConfigDataObject);
            validation.errorMessages = validation.errorMessages.concat(tempValidation.errorMessages);
            validation.gridConfigDataObject = tempValidation.gridConfigDataObject;
        }
        return tempValidation;
    }

    /**
     * Function checkCheckbox:
     *
     * This function validates Checkbox configuration
     * @param  {GridConfiguration} gridConfigDataObject: Input data to validate
     * @param  {number} checkboxNumber: Checkbox to validate
     * @returns GridConfigValidation
     */
    private checkCheckbox(gridConfigDataObject: GridConfiguration, checkboxNumber: number): GridConfigValidation {
        const validation: GridConfigValidation = new GridConfigValidation(gridConfigDataObject);

        switch (checkboxNumber) {
            case 1:
                if ((gridConfigDataObject.isCheckbox1AtStart && gridConfigDataObject.isCheckbox1AtEnd)
                    || (gridConfigDataObject.isCheckbox1AtStart && gridConfigDataObject.checkbox1Postion)
                    || (gridConfigDataObject.isCheckbox1AtEnd && gridConfigDataObject.checkbox1Postion)) {
                    validation.errorMessages.push(JSON.stringify(gridConfigDataObject)
                        + gridConfigDataObject.debugMessage
                        + 'checkbox 1 configuration is wrong.');

                    // resetting `isCheckbox1AtEnd` and `isCheckbox1AtStart`, if `checkbox1Postion` is available
                    if (gridConfigDataObject.checkbox1Postion) {
                        gridConfigDataObject.isCheckbox1AtEnd = false;
                        gridConfigDataObject.isCheckbox1AtStart = false;
                    }

                    if (gridConfigDataObject.isCheckbox1AtStart && gridConfigDataObject.isCheckbox1AtEnd) {
                        gridConfigDataObject.isCheckbox1AtEnd = false;
                        gridConfigDataObject.checkbox1Postion = undefined;
                    }

                    validation.gridConfigDataObject = gridConfigDataObject;
                }
                break;
            case 2:
                if ((gridConfigDataObject.isCheckbox2AtStart && gridConfigDataObject.isCheckbox2AtEnd)
                    || (gridConfigDataObject.isCheckbox2AtStart && gridConfigDataObject.checkbox2Postion)
                    || (gridConfigDataObject.isCheckbox2AtEnd && gridConfigDataObject.checkbox2Postion)) {
                    validation.errorMessages.push(JSON.stringify(gridConfigDataObject)
                        + gridConfigDataObject.debugMessage
                        + 'checkbox 2 configuration is wrong.');

                    // resetting `isCheckbox2AtEnd` and `isCheckbox2AtStart`, if `checkbox2Postion` is available
                    if (gridConfigDataObject.checkbox2Postion) {
                        gridConfigDataObject.isCheckbox2AtEnd = false;
                        gridConfigDataObject.isCheckbox2AtStart = false;
                    }

                    if (gridConfigDataObject.isCheckbox2AtStart && gridConfigDataObject.isCheckbox2AtEnd) {
                        gridConfigDataObject.isCheckbox2AtEnd = false;
                        gridConfigDataObject.checkbox2Postion = undefined;
                    }

                    validation.gridConfigDataObject = gridConfigDataObject;
                }
                break;
            default:
                break;
        }
        return validation;
    }

    /**
     * Function checkRadioButton:
     *
     * This function validates RadioButton configuration
     * @param  {GridConfiguration} gridConfigDataObject: Input data to validate
     * @returns GridConfigValidation
     */
    private checkRadioButton(gridConfigDataObject: GridConfiguration): GridConfigValidation {
        const validation: GridConfigValidation = new GridConfigValidation(gridConfigDataObject);
        if ((gridConfigDataObject.isRadioButtonAtStart && gridConfigDataObject.isRadioButtonAtEnd)
            || (gridConfigDataObject.isRadioButtonAtStart && gridConfigDataObject.radioButtonPostion)
            || (gridConfigDataObject.isRadioButtonAtEnd && gridConfigDataObject.radioButtonPostion)) {
            validation.errorMessages.push(JSON.stringify(gridConfigDataObject)
                + gridConfigDataObject.debugMessage
                + 'radio-button configuration is wrong.');

            // resetting `isRadioButtonAtEnd` or `isRadioButtonAtStart`, if `radioButtonPostion` is available
            if (gridConfigDataObject.radioButtonPostion) {
                gridConfigDataObject.isRadioButtonAtEnd = false;
                gridConfigDataObject.isRadioButtonAtStart = false;
            }

            if (gridConfigDataObject.isRadioButtonAtStart && gridConfigDataObject.isRadioButtonAtEnd) {
                gridConfigDataObject.isRadioButtonAtEnd = false;
                gridConfigDataObject.radioButtonPostion = undefined;
            }
            validation.gridConfigDataObject = gridConfigDataObject;
        }
        return validation;
    }

    private checkFilterTab(gridConfigDataObject: GridConfiguration): GridConfigValidation {
        const validation: GridConfigValidation = new GridConfigValidation(gridConfigDataObject);
        if (gridConfigDataObject.filterTabList && gridConfigDataObject.filterTabList.length === 0) {
            validation.errorMessages.push(JSON.stringify(gridConfigDataObject)
                + gridConfigDataObject.debugMessage
                + 'filter tab configuration is wrong.');
        }
        return validation;
    }

    private checkActionExtraButton(gridConfigDataObject: GridConfiguration): GridConfigValidation {
        const validation: GridConfigValidation = new GridConfigValidation(gridConfigDataObject);
        if (gridConfigDataObject.actionExtraButtonLabelList && gridConfigDataObject.actionExtraButtonLabelList.length === 0) {
            validation.errorMessages.push(JSON.stringify(gridConfigDataObject)
                + gridConfigDataObject.debugMessage
                + 'action button configuration is wrong.');
        }
        return validation;
    }
}

export class GridConfigValidation {
    errorMessages: Array<string>;
    gridConfigDataObject: GridConfiguration;

    constructor(gridConfigDataObject) {
        this.errorMessages = new Array<string>();
        this.gridConfigDataObject = gridConfigDataObject;
    }
}

export class CSS {
    tableFont: string;
    tableHeadFont: string;
    tableSubHeadFont: string;
    tableRowFont: string;
    tableSubRowFont: string;
    tableRowHeight: string;
    fixedTableHeight: string;
    tableOverflow: OverflowStyle;
    tableOverflowX: OverflowStyle;
    tableOverflowY: OverflowStyle;
    // height which is above table
    tableOuterHeight: string;

    // Border table style - Calculated Header
    tableTopCalculatedHeaderBorderStyle: string;
    tableRightCalculatedHeaderBorderStyle: string;
    tableBottomCalculatedHeaderBorderStyle: string;
    tableLeftCalculatedHeaderBorderStyle: string;
    // Border table style - Sub Header 1
    tableTopSubHeader1BorderStyle: string;
    tableRightSubHeader1BorderStyle: string;
    tableBottomSubHeader1BorderStyle: string;
    tableLeftSubHeader1BorderStyle: string;
    // Border table style - Sub Header 2
    tableTopSubHeader2BorderStyle: string;
    tableRightSubHeader2BorderStyle: string;
    tableBottomSubHeader2BorderStyle: string;
    tableLeftSubHeader2BorderStyle: string;
    // Border table style - Header
    tableTopHeaderBorderStyle: string;
    tableRightHeaderBorderStyle: string;
    tableBottomHeaderBorderStyle: string;
    tableLeftHeaderBorderStyle: string;
    // Border table style - Cell
    tableTopCellBorderStyle: string;
    tableRightCellBorderStyle: string;
    tableBottomCellBorderStyle: string;
    tableLeftCellBorderStyle: string;
    // Border table style - Footer
    tableTopFooterBorderStyle: string;
    tableRightFooterBorderStyle: string;
    tableBottomFooterBorderStyle: string;
    tableLeftFooterBorderStyle: string;

    // Cell Background
    tableCellBackgroundStyle: BackgroundStyle;
    // Calculated Header Background
    tableCalculatedHeaderBackgroundStyle: BackgroundStyle;
    // Sub Header 1 Background
    tableSubHeader1BackgroundStyle: BackgroundStyle;
    // Sub Header 2 Background
    tableSubHeader2BackgroundStyle: BackgroundStyle;
    // Header Background
    tableHeaderBackgroundStyle: BackgroundStyle;
    // Footer Background
    tableFooterBackgroundStyle: BackgroundStyle;
}

class IconCSS {
    expandIconColor: IconColor;
    collapseIconColor: IconColor;
    alignment: IconAlignment;
}

export class GridActionIcon {
    iconName: string;
    toolTipText: string;
    iconColor: string;

    constructor(iconName: string, toolTipText: string, iconColor?: string) {
        this.iconName = iconName;
        this.toolTipText = toolTipText;
        this.iconColor = iconColor;
    }
}
