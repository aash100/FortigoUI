/*
 * Created on Tue Oct 01 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
export class EditImageData {
    path?: string;
    from?: string;
    degree: number;
    isNegative: number;
    constructor(degree = 0, isNegative = 0, path?: string, from?: string) {
        this.degree = degree;
        this.isNegative = isNegative;
        if (path) {
            this.path = path;
        }
        if (from) {
            this.from = from;
        }
    }
}
