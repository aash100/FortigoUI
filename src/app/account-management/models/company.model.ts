export class Company {
    companyId: string;
    companyStringId: string;
    companyName: string;

    constructor(cid: string, cname: string, cStringId: string) {
        this.companyId = cid;
        this.companyName = cname;
        this.companyStringId = cStringId;
    }
}
