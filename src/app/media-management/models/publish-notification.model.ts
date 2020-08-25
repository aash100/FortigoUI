/*
 * Created on Fri Jan 03 2020
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export class NotificationPayload {
    public topic: string;
    public notificationType: string;
    public click_action: string;
    public sound: string;
    public status: string;
    public screen: string;

    public extraData: string;
    public deviceToken: string;
    public messageTitle: string;
    public message: string;

    constructor() {
        this.topic = 'transporter';
        this.notificationType = 'text';
        this.click_action = 'FLUTTER_NOTIFICATION_CLICK';
        this.sound = 'default';
        this.status = 'success';
        this.screen = 'news';
        this.extraData = 'test';
        this.deviceToken = null;
        this.messageTitle = 'News for you from 4TiGO';
        this.message = 'Click for news updates';
    }
}
