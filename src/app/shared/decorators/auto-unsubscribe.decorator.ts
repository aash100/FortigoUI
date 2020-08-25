/*
 * Created on Thu May 03 2019
 * Created by - 1191: Ritesh Kant
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export function AutoUnsubscribe(blackList = []) {
    return function (constructor) {
        // TODO 1. what to do when parent has onDestroy. 2. Add exclude list
        const original = constructor.prototype.ngOnDestroy;

        constructor.prototype.ngOnDestroy = function () {
            // tslint:disable-next-line: forin
            for (let prop in this) {
                const property = this[prop];
                if (!blackList.includes(prop)) {
                    if (property && (typeof property.unsubscribe === 'function')) {
                        property.unsubscribe();
                    }
                }
            }
            // tslint:disable-next-line: no-unused-expression
            original && typeof original === 'function' && original.apply(this, arguments);

        };
    };
}
