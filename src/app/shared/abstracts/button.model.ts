/*
 * Created on Tue Mar 05 2019
 * Created by - 1191: Ritesh Kant
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

export abstract class ButtonProperty {
    constructor(
    protected placeholder?: string
  ) {}
}

export class FortigoButton extends ButtonProperty {
  constructor(
    public placeholder?: string,
    public buttonIcon?: string
  ) {
    super(placeholder);
  }
}
