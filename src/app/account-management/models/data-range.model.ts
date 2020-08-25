export class DataRange {
    key: string;
    displayName: string;
    lowerRange: number;
    upperRange: number;

    constructor(key: string, displayName: string, lowerRange: number, upperRange: number) {
        this.key = key;
        this.displayName = displayName;
        this.lowerRange = lowerRange;
        this.upperRange = upperRange;
    }
}
