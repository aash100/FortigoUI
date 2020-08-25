/*
 * Created on Mon Sep 30 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
import { Component, ViewChild, Input, ElementRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
import Cropper from 'cropperjs';
import { EditImageData } from '../../models/edit-image-data.model';

@Component({
  selector: 'app-fortigo-image-cropper',
  templateUrl: './fortigo-image-cropper.component.html',
  styleUrls: ['./fortigo-image-cropper.component.css']
})
export class FortigoImageCropperComponent implements AfterViewInit {

  @Input() imageSource: string;

  @Output() undoEdit = new EventEmitter();

  @ViewChild('image',{static:false})
  public imageElement: ElementRef;

  public imageDestination: string;
  private cropper: Cropper;

  @Output() editedImage = new EventEmitter();
  public degree = 0;
  public isNegative = 0;

  constructor() {
    this.imageDestination = '';
  }

  public ngAfterViewInit() {
    this.cropper = new Cropper(this.imageElement.nativeElement, {
      zoomable: true,
      scalable: true,
      aspectRatio: 1,
      rotatable: true,
      crop: () => {
        const canvas = this.cropper.getCroppedCanvas();
        this.imageDestination = canvas.toDataURL('image/png');
        // TODO use this for any changes happened in image.
        // this.editedImage.emit(this.imageDestination);
      }
    });
  }

  /**
   * For Undo Operation
   */
  public undoChanges() {
    this.undoEdit.emit('undoEdit');
  }

  /**
   * To rotate image in a given direction
   * @param  {string} direction: i.e. clockwise/anticlockwise
   */
  public rotateImage(direction: string) {
    switch (direction) {
      case 'clock-wise':
        this.cropper.rotate(90);
        this.degree = this.degree + 90;
        break;
      case 'anti-clock-wise':
        this.cropper.rotate(-90);
        this.degree = this.degree - 90;
        break;
      default:
        break;
    }
    if (this.degree < 0) {
      this.isNegative = 1;
    }
    this.editedImage.emit(new EditImageData(Math.abs(this.degree), this.isNegative));
  }
}


