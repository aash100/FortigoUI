/*
* Created on Wed Jul 10 2019
* Created by - 1149: Aashish Kumar
*
* Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
*/
import { CardData } from './card-data.model';

export class FieldGroup implements CardData {
    id: number;
    title?: string;
    columnRatio?: number;
    groupCSSClass?: any;
}

export class FieldGroupList {
    /**
     * Function getArrangedData:
     *
     * For Arranging the group list in the ascending order of the id,
     * and adding default group at the last index.
     *
     * @param  {Array<FieldGroup>} data i.e. the list of group for field items.
     * @returns Array of groups.
     */
    public static getArrangedData(data: Array<FieldGroup>): Array<FieldGroup> {
        if (data && data.length > 0) {
            data.sort((object1: FieldGroup, object2: FieldGroup) => {
                return object1.id - object2.id;
            });
        } else {
            data = new Array<FieldGroup>();
        }
        data.push({ id: -1 }); // pushing default group at the last
        return data;
    }
}
