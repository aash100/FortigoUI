/*
 * Created on Thu Aug 22 2019
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import html2canvas from 'html2canvas';
import { CookieService } from 'ngx-cookie-service';
import { FortigoConstant } from '../constants/FortigoConstant';

export type StorageType = 'LocalStorage' | 'SessionStorage' | 'Cookie';

//  All function in this class should be static.
export class Util {

    /**
     * Function getObjectCopy:
     *
     * This funtion creates a new Copy of Object, decoupled with old object's reference.
     * @param  {Object} data: Object to copy
     * @returns Object: New Copied Object
     */
    public static getObjectCopy(data: Object): Object {
        return JSON.parse(JSON.stringify(data));
    }

    /**
     * Function convertLocalDateTime:
     *
     * This function converts LocalDateTime format to Date object
     * @param  {Array<number>} dateInLocalDateTime: LocalDateTime to be converted
     * @returns Date: Converted date
     */
    public static convertLocalDateTime(dateInLocalDateTime: Array<number>): Date {
        let dateString = '';
        if (!dateInLocalDateTime && !Array.isArray(dateInLocalDateTime)) {
            return null;
        }
        const dateInLocalDateTimeString: Array<string> = <Array<string>>Util.getObjectCopy(dateInLocalDateTime);
        if (dateInLocalDateTimeString) {
            dateString = dateInLocalDateTimeString.map((each, index) => {
                switch (index) {
                    case 0:
                    case 1:
                        return each + '-';
                    case 2:
                        return each + ' ';
                    case 3:
                    case 4:
                        return each + ':';
                    default:
                        break;
                }
            }).join();
            return new Date(dateString);
        }
    }

    /**
     * This function check if the data is a number type
     * @param  {any} data: data to check it's type
     * @returns boolean: returns true if the data number type, else false
     */
    public static isNumber(data: any): boolean {
        if (typeof data === 'number') {
            return true;
        } else {
            return false;
        }
    }

    /**
     * This function check if the data is a string type
     * @param  {any} data: data to check it's type
     * @returns boolean: returns true if the data string type, else false
     */
    public static isString(data: any): boolean {
        if (typeof data === 'string') {
            return true;
        } else {
            return false;
        }
    }

    public static captureScreenshot(): Promise<any> {
        return html2canvas(document.body);
    }

    public static setStorageData(key: string, value: any, storageType: StorageType, cookieService?: CookieService, expires?: number | Date, path = FortigoConstant.SESSION_COOKIE_PATH, domain = FortigoConstant.SESSION_COOKIE_DOMAIN) {
        switch (storageType) {
            case 'LocalStorage':
                localStorage.setItem(key, btoa(JSON.stringify(value)));
                break;
            case 'SessionStorage':
                sessionStorage.setItem(key, btoa(JSON.stringify(value)));
                break;
            case 'Cookie':
                cookieService.set(key, btoa(JSON.stringify(value)), expires, path, domain);
                break;
            default:
                break;
        }
    }

    public static getStorageData(key: string, storageType: StorageType, cookieService?: CookieService) {
        switch (storageType) {
            case 'LocalStorage':
                JSON.parse(atob(localStorage.getItem(key)));
                break;
            case 'SessionStorage':
                JSON.parse(atob(sessionStorage.getItem(key)));
                break;
            case 'Cookie':
                JSON.parse(atob(cookieService.get(key)));
                break;
            default:
                break;
        }
    }
}
