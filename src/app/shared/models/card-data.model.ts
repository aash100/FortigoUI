/*
 * Created on Tue Jul 16 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

// Card data structure.
export class Card {
    data: CardData;
}

// for data purpose of card.
export interface CardData {
    columnRatio?: number;
    title?: string;
    subTitle?: string;
    id: number;
}
