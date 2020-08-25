export class ExtraRowsData {
    selectedRowData: Object;
    data: Array<Object>;
    columnName: string;
    rowExpansionLevel: number;

    constructor(selectedRowData?: Object, data?: Array<Object>, columnName?: string, rowExpansionLevel?: number) {
        this.selectedRowData = selectedRowData;
        this.data = data;
        this.columnName = columnName;
        this.rowExpansionLevel = rowExpansionLevel;
    }
}
