export class AccountFilterCriteria {
    criteria: string;
    value: string;
    alias: string;

    constructor(criteria: string, value: string, alias?: string) {
        this.criteria = criteria;
        this.value = value;
        this.alias = alias;
    }
}
