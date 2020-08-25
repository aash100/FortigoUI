export class ContactStatus {
    name: string;
    alias: string;
    isDefault: boolean;
    constructor(name: string, alias: string, isDefault?: boolean) {
        this.name = name;
        this.alias = alias;
        if (isDefault) {
            this.isDefault = isDefault;
        } else {
            this.isDefault = false;
        }
    }
}
