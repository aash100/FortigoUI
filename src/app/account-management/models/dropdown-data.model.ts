export class DropdownData {
  key: string;
  displayName: string;
  isDefault: boolean;

  constructor(key: string, displayName: string, isDefault?: boolean) {
    this.key = key;
    this.displayName = displayName;
    if (isDefault) {
      this.isDefault = isDefault;
    } else {
      this.isDefault = false;
    }
  }
}
