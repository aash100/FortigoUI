export class FilterButton {
    text: string;
    toolTipText: string;
    color: string;
    isSelected: boolean;

    constructor(
        text: string,
        toolTipText?: string,
        isSelected?: boolean) {

        this.text = text;
        if (toolTipText) {
            this.toolTipText = toolTipText;
        } else {
            this.toolTipText = text;
        }
        if (isSelected) {
            this.isSelected = isSelected;
        }

    }
}
