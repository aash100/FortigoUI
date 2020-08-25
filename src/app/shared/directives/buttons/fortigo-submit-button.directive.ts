/*
 * Created on Mon Feb 04 2019
 * Created by - 1191: Ritesh Kant
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Directive, HostListener, ElementRef, Input, HostBinding, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appFortigoSubmitButton]'
})
export class FortigoSubmitButtonDirective implements OnInit {

  // Binding to diable property of a Button
  @Input()
  @HostBinding('disabled')
  disabled: boolean;

  // Listening to mouse enter event of a Button
  @HostListener('mouseenter')
  onMouseEnter() {
    const backgroundColor = 'red';
    this.colorChange(backgroundColor);
  }

  // Listening to mouse enter event of a Button
  @HostListener('mouseleave')
  onMouseLeave() {
    const backgroundColor = '#E66006';
    this.colorChange(backgroundColor);
  }

  constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {
    this._renderer.setStyle(this._elementRef.nativeElement, 'font-size', '12px');
    this._renderer.setStyle(this._elementRef.nativeElement, 'border-radius', '0.25rem');
    this._renderer.setStyle(this._elementRef.nativeElement, 'color', 'white');
    this._renderer.setStyle(this._elementRef.nativeElement, 'padding', '0px 10px');
    this._renderer.setStyle(this._elementRef.nativeElement, 'margin', '0px 10px');
    this._renderer.setStyle(this._elementRef.nativeElement, 'font-family', 'swis721');
    this._renderer.setStyle(this._elementRef.nativeElement, 'line-height', '2.4');
  }

  ngOnInit(): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.
    if (this.disabled) {
      this._renderer.setStyle(this._elementRef.nativeElement, 'cursor', 'not-allowed');
    } else {
      const backgroundColor = '#E66006';
      this.colorChange(backgroundColor);
    }
  }

  /**
   * Function colorChange
   *
   * This function changes the background color of button
   *
   * @param  {string} backgroundColor: Background Color for Button
   */
  private colorChange(backgroundColor: string) {
    this._renderer.setStyle(this._elementRef.nativeElement, 'background-color', backgroundColor);
  }

}
