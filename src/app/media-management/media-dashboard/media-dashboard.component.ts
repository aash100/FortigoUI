/*
 * Created on Thu Jan 02 2020
 * Created by - 1157: Mayur Ranjan
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';

import { GridConfiguration } from 'src/app/shared/models/grid-configuration.model';
import { Column } from 'src/app/shared/models/column.model';
import { FortigoButton } from 'src/app/shared/abstracts/button.model';
import { NewsBlogComponent } from '../news-blog/news-blog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-media-dashboard',
  templateUrl: './media-dashboard.component.html',
  styleUrls: ['./media-dashboard.component.css']
})
export class MediaDashboardComponent implements OnInit {

  public pageTitle: string;
  public gridConfiguration: GridConfiguration = new GridConfiguration();
  public columnsData: Array<Column> = [];
  public rowsData: Array<any>;
  public filterFontSize: number;
  public filterFields: Array<any>;

  public buttons: Array<FortigoButton>;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _title: Title,
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
    this.pageTitle = this._activatedRoute.snapshot.data['title'];
    this._title.setTitle(this._activatedRoute.snapshot.data['title']);

    this.buttons = new Array<FortigoButton>();
    this.buttons.push(new FortigoButton('Add Content'));
    if (environment.name !== 'prod') {
      this.buttons.push(new FortigoButton('Add Banner'));
    }
  }

  /**
   * Triggers whenever head button is clicked
   * @param value event
   */
  public onHeadButtonClick(value: any) {
    if (value === 'Add Content') {
      this._dialog.open(NewsBlogComponent, {
        data: { modalMode: 'new', type: 'news' }, maxHeight: '100%'
      });
    } else {
      this._dialog.open(NewsBlogComponent, {
        data: { modalMode: 'new', type: 'banner' }, maxHeight: '100%'
      });
    }
  }

}
