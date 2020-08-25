/*
 * Created on Wed Feb 13 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class Icons {
    public categories: Array<IconIdsAndName>;
}

class IconIdsAndName {
    public icons: Array<IconId>;
    public name: string;
}

class IconId {
    public id: string;
}
