
/*
* Created on Sat Jan 26 2019
* Created by - 1157: Mayur Ranjan
*
* Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/
import { FieldTypes, SelectOption, Prefix, Suffix } from '../abstracts/field-type.model';

export enum CalculationDataType { Count = 'count', Sum = 'sum', Average = 'average', RoundedSum = 'roundedSum' }
export enum DataType { String = 'string', Number = 'number', BigInt = 'bigint', Boolean = 'boolean', Object = 'object', Date = 'date' }
export enum DataFormat { Currency = 'currency', CurrencyInLac = 'currencyInLac', LocalDate = 'localDate', LocalDateTime = 'localDateTime', Date = 'date', Time = 'time', DateAndTime = 'dateAndTime', DateAndTimeInSec = 'dateAndTimeInSec', BigText = 'bigText', BigTextWithCopy = 'bigTextWithCopy', Status = 'status', Title = 'title', None = 'none', UpperCase = 'upperCase' }
export enum DataCalculationFormat { Currency = 'currency', CurrencyInLac = 'currencyInLac' }

export type EditExpandableFieldType = 'main-rows' | 'expanded-rows';
export type CellActions = 'click' | 'hover' | 'view' | 'data-expand-collapse' | 'edit';
export type HorizontalAlign = 'center' | 'left' | 'right' | 'initial';
export type VerticalAlign = 'top' | 'middle' | 'bottom';
export type IconAlign = 'left' | 'right';
export type ImageAlign = 'left' | 'right';
export type Color = 'blue' | 'red' | 'maroon' | 'green' | 'black' | 'orange' | 'red-shade-1' | 'red-shade-2' | 'red-shade-3' | 'red-shade-4' | 'red-shade-5' | 'dark-greyish-magenta' | 'very-dark-greyish-violet';
export type FontWeight = 'bold' | 'bolder' | 'normal' | 'lighter';
export type FontSize = 'inherit' | 'initial' | 'large' | 'larger' | 'medium' | 'small' | 'smaller';
export type Margin = 'small' | 'medium' | 'large';
export type UserSelect = 'all' | 'auto' | 'inherit' | 'initial' | 'none' | 'text' | 'unset';
export type Width = 'auto' | 'fit-content' | 'inherit' | 'initial' | 'max-content' | 'min-content' | 'unset' | string;

export class Column {
    /**
     * Unique defination of a Column
     */
    public columnDef: string;
    /**
     * To set the name of a Column, to show in Header
     */
    public headerName: string;
    /**
     * Unique defination of a Column Sub Header 1
     */
    public subHeader1ColumnDef?: string;
    /**
     * To set the name of a Column Sub Header 1, to show in Sub Header
     */
    public subHeader1Name?: string;
    /**
     * To set the no of Row Span for Sub Header 1
     */
    public subHeader1Rowspan?: number;
    /**
     * To set the no of Column Span for Sub Header 1
     */
    public subHeader1Colspan?: number;
    /**
     * Unique defination of a Column Sub Header 1
     */
    public subHeader2ColumnDef?: string;
    /**
     * To set the name of a Column Sub Header 2, to show in Sub Header
     */
    public subHeader2Name?: string;
    /**
     * To set the no of Row Span for Sub Header 2
     */
    public subHeader2Rowspan?: number;
    /**
     * To set the no of Column Span for Sub Header 2
     */
    public subHeader2Colspan?: number;
    /**
     * Unique defination of a Column Calculated Header
     */
    public calculatedSubHeaderColumnDef?: string;
    /**
     * To set the name of a Column Calculated Header, to show in Sub Header
     */
    public calculatedSubHeaderName?: string;
    /**
     * To set data of a Column
     */
    public cell?: any;
    /**
     * To set Data Type of a Column
     */
    public dataType?: DataType;
    /**
     * To set Edit Data Format of a Column
     */
    public editDataFormat?: DataFormat;
    /**
     * To set Data Format of a Column
     */
    public dataFormat?: DataFormat;
    /**
     * To set Data Calculation Format of a Column
     */
    public dataCalculationFormat?: DataCalculationFormat;
    /**
     * To set Big Text Length of a Column of Data Format of type `BigText`
     */
    public bigTextLength?: number;
    /**
     * To disable header ToolTip Text for particular Column Header
     */
    public disableHeaderToolTipText?: boolean;
    /**
     * To disable header ToolTip Text for particular Column Sub Header 1
     */
    public disableSubHeader1ToolTipText?: boolean;
    /**
     * To disable header ToolTip Text for particular Column Sub Header 2
     */
    public disableSubHeader2ToolTipText?: boolean;
    /**
     * To disable ToolTip Text for particular Column's Row
     */
    public disableRowToolTipText?: boolean;
    /**
     * To disable header ToolTip Text for particular Calculated Column Header
     */
    public disableCalcHeaderToolTipText?: boolean;
    /**
     * To set particular Column Data's ToolTip Text Format
     */
    public rowToolTipTextFormat?: DataFormat;
    /**
     * To set no of Inner Cells in a Column
     */
    public innerCells?: number;
    /**
     * To set, if a Column will have footer
     */
    public isHavingFooter?: boolean;
    /**
     * To set a Column's Calculated Footer Data Type
     */
    public footerCalculatedDataType?: CalculationDataType;
    /**
     * To set a Column's Calculated Header Data Type
     */
    public headerCalculatedDataType?: CalculationDataType;
    /**
     * To set type of Action a Column will have
     */
    public action?: CellActions;
    /**
     * To set, if a Column contains Expandable Row
     */
    public isExpandableRow?: boolean;
    /**
     * To set, if a Column is Expandable
     */
    public isExpandableColumn?: boolean;
    /**
     * To set a Column Tooltip Text
     */
    public title?: string;
    /**
     * To set a Column Hidden in Grid
     */
    public isHidden?: boolean;
    /**
     * To set a Unique (Identifiable) Column in Grid
     */
    public isUnique?: boolean;
    /**
     * To add CSS style classes to Column
     */
    public css?: CSS;
    /**
     * To add CSS style classes to Column - for Template
     */
    public cssClass?: any;
    /**
     * To set, if a Column shows Expanded Row Icon
     */
    public showExpandedRow?: boolean;
    /**
     * To set, if a Column contains icon
     */
    public icon?: Icon;
    /**
     * To set, if a Column contains image
     */
    public image?: Image;
    /**
     * To set a Column Width
     */
    public width?: string;
    /**
     * To set if Sorting is Disabled
     */
    public isSortingDisabled?: boolean;
    /**
     * To set, if we have to show count of collapsed child
     */
    public showExpandedCount?: boolean;
    /**
     * To set, EditFieldType for edit purpose in grid.
     */
    public editFieldType?: FieldTypes;
    /**
     * To set, EditFieldType for edit purpose in grid.
     */
    public editExpandableFieldType?: EditExpandableFieldType;
    /**
     * To set, Edit Dropdown option for edit purpose in grid.
     */
    public editDropdownOption?: SelectOption;
    /**
     * To set, hiding of description data inside bracket i.e., ().
     */
    public hideDescriptionData?: boolean;
    /**
    * To set minDate in case of input type date
    */
    public minDate?: Date;
    /**
    * To set maxDate in case of input type date
    */
    public maxDate?: Date;
    /**
    * To set editable field prefix
    */
    public editPrefix?: Prefix;
    /**
    * To set editable field suffix
    */
    public editSuffix?: Suffix;
}

export class CSS {
    horizontalAlign?: HorizontalAlign;
    verticalAlign?: VerticalAlign;
    textColor?: Color;
    fontWeight?: FontWeight;
    fontSize?: FontSize;
    marginTop?: Margin;
    marginRight?: Margin;
    marginBottom?: Margin;
    marginLeft?: Margin;
    userSelect?: UserSelect;
    width?: Width;
}

export class Icon {
    isIconOnly?: boolean;
    isIconAndText?: boolean;
    alignment?: IconAlign;
    css?: CSS;
}

export class Image {
    isImageOnly?: boolean;
    isImageAndText?: boolean;
    alignment?: ImageAlign;
    css?: CSS;
}
