import { CellActions } from './column.model';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';

export class CellData {
    rowData: any;
    columnName: string;
    action: CellActions;
    rowIndex?: number;
    pageIndex?: number;
    isForExtraData?: boolean;
    // Level at which row expansion is clicked
    rowExpansionLevel?: number;

    constructor(rowData: any, columnName: string, action: CellActions, rowIndex?: number, pageIndex?: number, isForExtraData?: boolean, rowExpansionLevel?: number) {
        this.rowData = rowData;
        this.columnName = columnName;
        this.action = action;
        if (rowIndex !== undefined) {
            this.rowIndex = rowIndex;
        }
        if (isForExtraData) {
            this.isForExtraData = isForExtraData;
        }
        if (pageIndex !== undefined) {
            this.pageIndex = pageIndex;
        } else {
            this.pageIndex = FortigoConstant.STARTING_PAGE_INDEX;
        }
        if (rowExpansionLevel !== undefined) {
            this.rowExpansionLevel = rowExpansionLevel;
        }
    }
}
