/*
 * Created on Wed Jul 10 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';

import { Card } from '../../models/card-data.model';
import { CardConfiguration } from '../../models/card-configuration.model';
import { Style } from '../../models/style.model';

@Component({
  selector: 'app-fortigo-card',
  templateUrl: './fortigo-card.component.html',
  styleUrls: ['./fortigo-card.component.css']
})
export class FortigoCardComponent implements OnChanges {

  // Card
  @Input() card: Card;
  @Input() cardConfiguration: CardConfiguration;

  ngOnChanges(changes: SimpleChanges): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.

    if (changes.cardConfiguration) {
      this.cardConfiguration = changes.cardConfiguration.currentValue;
      this.applyCardConfigurationStyle();
    }

    if (changes.card) {
      this.card = changes.card.currentValue;
      if (this.card && this.card.data && this.card.data.title === '') {
        this.cardConfiguration.css.headerBackground = 'none';
        this.applyCardConfigurationStyle();
      }
    }
  }

  private applyCardConfigurationStyle() {
    if (this.cardConfiguration && this.cardConfiguration.css) {
      this.cardConfiguration.style.header = new Style();
      this.cardConfiguration.style.header['background'] = this.cardConfiguration.css.headerBackground;

      this.cardConfiguration.style.card = new Object();
      this.cardConfiguration.style.card['margin-bottom'] = this.cardConfiguration.css.marginBottomCard;

      this.cardConfiguration.style.headerTitle = new Object();
      this.cardConfiguration.style.headerTitle['font-size'] = this.cardConfiguration.css.fontSize;
      this.cardConfiguration.style.headerTitle['font-weight'] = this.cardConfiguration.css.fontWeight;
      this.cardConfiguration.style.headerTitle['color'] = this.cardConfiguration.css.fontColor;
      this.cardConfiguration.style.headerTitle['margin-top'] = this.cardConfiguration.css.marginTop;
      this.cardConfiguration.style.headerTitle['margin-bottom'] = this.cardConfiguration.css.marginBottom;

      this.cardConfiguration.style.content = new Object();
      this.cardConfiguration.style.content['margin-top'] = this.cardConfiguration.css.marginTopContent;
      this.cardConfiguration.style.content['background'] = this.cardConfiguration.css.contentBackground;
      this.cardConfiguration.style.content['border-bottom-left-radius'] = this.cardConfiguration.css.borderBottomLeftRadius;
      this.cardConfiguration.style.content['border-bottom-right-radius'] = this.cardConfiguration.css.borderBottomRightRadius;
      this.cardConfiguration.style.content['padding-top'] = this.cardConfiguration.css.paddingTop;
    }
  }
}
