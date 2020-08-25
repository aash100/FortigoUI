/*
 * Created on Fri Jan 03 2020
 * Created by - 1214: Sachin Sehgal
 *
 * Copyright (c) 2020 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';

import Swal from 'sweetalert2';

import { TextInputField, SelectOption, SearchableSelectInputField, UploadInputField, CheckBoxInputField, DateInputField, MultiSelectSearchableInputField } from 'src/app/shared/abstracts/field-type.model';
import { MediaService } from '../service/media/media.service';
import { NotificationPayload } from '../models/publish-notification.model';
import { SnackbarModel } from 'src/app/shared/models/snackbar.model';
import { FortigoSnackbarComponent } from 'src/app/shared/components/fortigo-snackbar/fortigo-snackbar.component';
import { FortigoValidators } from 'src/app/shared/models/fortigo-validators.model';
import { FieldGroup } from 'src/app/shared/models/field-group.model';
import { Util } from 'src/app/core/abstracts/util';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-news-blog',
  templateUrl: './news-blog.component.html',
  styleUrls: ['./news-blog.component.css'],
})
export class NewsBlogComponent implements OnInit {

  public fields: Array<any>;
  public buttons: Array<any>;
  public title: string;
  public showModalLoader: boolean;
  public isSubmitDisabled: boolean;
  public formType: string;
  public groups: Array<FieldGroup>;

  private selectedFile: any;
  private snackbarData: SnackbarModel;

  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _mediaService: MediaService,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.groups = new Array();
    this.showModalLoader = false;
    this.isSubmitDisabled = false;
    this.title = 'Create News and Blogs';
    this.buttons = [{ name: 'Submit', icon: 'send', isDisabled: false }];
    if (this._data.type === 'banner') {
      this.getBannerFields();
    } else {
      this.getFields();
    }
  }

  public getFields() {
    const categoryList = [
      { name: 'Industry', id: 'industry' },
      { name: 'Technology', id: 'technology' },
      { name: 'Regulatory', id: 'regulatory' },
      { name: 'Views of Editor', id: 'views_of_editor' }
    ];
    const languageList = [
      { name: 'English', id: '1' },
      { name: 'Hindi', id: '2' },
      { name: 'Tamil', id: '3' },
    ];
    const typeList = [
      { name: 'Original', id: '1' },
      { name: 'Translated', id: '2' },
    ];
    const contentType = [
      { name: 'Link', id: 'link' },
      { name: 'File', id: 'file' },
      { name: 'Text', id: 'text' },
    ];
    const categoryOption = new SelectOption('name', 'id', categoryList);
    const languageOption = new SelectOption('name', 'id', languageList);
    const typeOption = new SelectOption('name', 'id', contentType);
    const title = new TextInputField('Title', 'contentTitle', 6, undefined, {}, undefined, 1, undefined);
    const summary = new TextInputField('Summary', 'contentDesc', 6, undefined, {}, undefined, 1, undefined);
    const category = new SearchableSelectInputField('Category', 'categoryType', categoryOption, 6, false, undefined, {}, undefined, 1, undefined, undefined, undefined);
    const language = new SearchableSelectInputField('Language', 'newsLanguage', languageOption, 6, false, undefined, {}, undefined, undefined, undefined, undefined, undefined);
    const type = new SearchableSelectInputField('Content Type', 'contentType', typeOption, 6, false, undefined, {}, undefined, undefined, undefined, undefined, undefined);
    const tags = new TextInputField('Content Link', 'content', 6, undefined, {}, undefined, 1, undefined);
    const caption = new TextInputField('Image Caption', 'newsImageCaption', 4, undefined, {}, undefined, 1, undefined);
    const checkBox = new CheckBoxInputField('Send Notification', 'checked', 3);

    const ImageUpload = new UploadInputField('Upload Image', 'filePath', 3, undefined, undefined, undefined, undefined, undefined);
    const docUpload = new UploadInputField('Upload Document', 'newsDocument', 4, undefined, undefined, undefined, undefined, undefined);

    this.fields = [
      title,
      category,
      // language,
      type,
      summary,
      tags,
      // caption,
      ImageUpload,
      // docUpload,
      checkBox
    ];
  }

  /**
   * This methos used to create fields for banner form.
   */
  private getBannerFields() {
    this.groups.push({ id: 1, title: '' }, { id: 2, title: '' }, { id: 3, title: 'Mobile Detail' }, { id: 4, title: 'Email Detail' }, { id: 5, title: 'SMS Detail' });
    this.groups.push();

    const loginType = [
      { name: 'Pre First Time Login', id: 'pre_first_time_login' },
      { name: 'Post First Time Login', id: 'post_first_time_login' },
      { name: 'Pre Login', id: 'pre_login' },
      { name: 'Post Login', id: 'post_login' },
      { name: 'Post Logout', id: 'post_logout' },
      { name: 'Always', id: 'always' },

    ];
    const languageList = [
      { name: 'English', id: '1' },
      { name: 'Hindi', id: '2' },
      { name: 'Tamil', id: '3' },
    ];
    const typeList = [
      { name: 'Original', id: '1' },
      { name: 'Translated', id: '2' },
    ];
    const contentType = [
      { name: 'Link', id: 'link' },
      { name: 'File', id: 'file' },
      { name: 'Text', id: 'text' },
    ];
    const buttonType = [
      { name: 'Call', id: 'call' },
      // { name: 'Email', id: 'email' },
      // { name: 'SMS', id: 'sms' },
    ];
    const loginTypeOption = new SelectOption('name', 'id', loginType);
    const languageOption = new SelectOption('name', 'id', languageList);
    const typeOption = new SelectOption('name', 'id', contentType);
    const buttonTypeOption = new SelectOption('name', 'id', buttonType);
    const title = new TextInputField('Title', 'contentTitle', 6, undefined, {}, undefined, 1, undefined, 1);
    const summary = new TextInputField('Summary', 'contentDesc', 6, undefined, {}, undefined, 1, undefined, 1);
    const loginTypeField = new SearchableSelectInputField('Display Trigger', 'displayTrigger', loginTypeOption, 6, false, undefined, new FortigoValidators(undefined, undefined, true), undefined, 1, undefined, undefined, undefined, 1);

    const language = new SearchableSelectInputField('Language', 'newsLanguage', languageOption, 6, false, undefined, {}, undefined, undefined, undefined, undefined, undefined);
    const type = new SearchableSelectInputField('Content Type', 'contentType', typeOption, 6, false, undefined, {}, undefined, undefined, undefined, undefined, undefined, 1);
    const tags = new TextInputField('Content Link', 'content', 6, undefined, {}, undefined, 1, undefined, 1);
    const caption = new TextInputField('Image Caption', 'newsImageCaption', 4, undefined, {}, undefined, 1, undefined);
    const checkBox = new CheckBoxInputField('Send Notification', 'checked', 3);

    const ImageUpload = new UploadInputField('Upload Image', 'filePath', 3, undefined, new FortigoValidators(undefined, undefined, true), undefined, undefined, undefined, 1);
    const docUpload = new UploadInputField('Upload Document', 'newsDocument', 4, undefined, undefined, undefined, undefined, undefined);
    const dateFieldFrom = new DateInputField('Banner Valid From Date', 'validFrom', 6, false, new FortigoValidators(undefined, undefined, true), undefined, 1, undefined, 1, undefined);
    const dateFieldTo = new DateInputField('Banner Valid Till Date', 'validTo', 6, false, new FortigoValidators(undefined, undefined, true), undefined, 1, undefined, 1, undefined);
    const buttonTypeField = new SearchableSelectInputField('Buttons On banner', 'actionOnbanner', buttonTypeOption, 6, true, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 2);
    const actionTriggerField = new TextInputField('Phone no/Email', 'actionTriggerField', 6, undefined, {}, undefined, 1, undefined, 3);
    const buttonIscon = [
      { name: 'English', id: '1' },
      { name: 'Hindi', id: '2' },
      { name: 'Tamil', id: '3' },
    ];
    const buttonIconOption = new SelectOption('name', 'id', buttonIscon);
    const buttonName = new TextInputField('Mobile Button Name', 'mobilebuttonName', 6, undefined, {}, undefined, 1, undefined, 3);
    const buttonIconField = new SearchableSelectInputField('Mobile Icons', 'mobileIcons', buttonIconOption, 6, false, undefined, {}, undefined, undefined, undefined, undefined, undefined, 3);
    const mobile = new TextInputField('Mobile Number', 'mobileNumber', 6, undefined, {}, undefined, 1, undefined, 3);
    const emailIcon = [
      { name: 'English', id: '1' },
      { name: 'Hindi', id: '2' },
      { name: 'Tamil', id: '3' },
    ];

    const emailIconOption = new SelectOption('name', 'id', emailIcon);
    const emailName = new TextInputField('Email Button Name', 'emailButtonName', 6, true, {}, undefined, 1, undefined, 4);
    const emailIconField = new SearchableSelectInputField('Email Icons', 'emailIcons', emailIconOption, 6, false, true, {}, undefined, undefined, undefined, undefined, undefined, 4);
    const emailTo = new TextInputField('Email Reciepents', 'reciepents', 6, true, {}, undefined, 1, undefined, 4);
    const emailCc = new TextInputField('Email CC', 'ccReciepents', 6, true, {}, undefined, 1, undefined, 4);
    const emailSubject = new TextInputField('Email Subject', 'emailSubject', 6, true, {}, undefined, 1, undefined, 4);
    const emailContent = new TextInputField('Email Content', 'emailContent', 6, true, {}, undefined, 1, undefined, 4);

    const icon = [
      { name: 'English', id: '1' },
      { name: 'Hindi', id: '2' },
      { name: 'Tamil', id: '3' },
    ];
    const smsIconOption = new SelectOption('name', 'id', icon);
    const smsButtonName = new TextInputField('SMS Button Name', 'smsButtonName', 6, true, {}, undefined, 1, undefined, 5);
    const smsIconField = new SearchableSelectInputField('SMS Icons', 'smsIcons', smsIconOption, 6, false, true, {}, undefined, undefined, undefined, undefined, undefined, 5);
    const smsMobile = new TextInputField('SMS Mobile Number', 'smsMobileNumber', 6, true, {}, undefined, 1, undefined, 5);
    const smsText = new TextInputField('SMS Text', 'smsText', 6, true, {}, undefined, 1, undefined, 5);

    this.fields = [
      title,
      loginTypeField,
      // language,
      type,
      summary,
      tags,
      // caption,
      ImageUpload,
      // docUpload,
      dateFieldFrom,
      dateFieldTo,
      buttonTypeField,
      // actionTriggerField,
      // emailSubject,
      // emailContent,
      buttonName,
      // buttonIconField,
      mobile,
      emailName,
      // emailIconField,
      emailTo,
      emailCc,
      emailSubject,
      emailContent,
      smsButtonName,
      // smsIconField,
      smsMobile,
      smsText
    ];
  }

  /**
   * This function sets the file selected
   * @param  {any} selectedFiles
   */
  public onFileChanges(selectedFiles: any) {
    if (selectedFiles) {
      this.selectedFile = selectedFiles[0];
    }
  }

  public onSelectChange(event: any) {
    if (event.name === 'actionOnbanner') {
      let tempFields = this.removeItemFromFields(<Array<any>>Util.getObjectCopy(this.fields));

      if (event.value && event.value.length) {
        console.log(event);
        event.value.forEach((eachValue) => {
          switch (eachValue) {
            case 'call':
              tempFields = this.addCallFormFields(tempFields);
              break;
            case 'email':
              tempFields = this.addEmailFormFields(tempFields);
              break;
            case 'sms':
              tempFields = this.addSmsFormFields(tempFields);
              break;
          }
        });
      }
      this.fields = tempFields;
    }
  }

  private removeItemFromFields(fields: Array<any>): Array<any> {
    let fieldLenth = fields.length;
    while (fieldLenth--) {
      const field = fields[fieldLenth].placeholder;
      if (field === 'Mobile Button Name' || field === 'Mobile Icons' || field === 'Mobile Number' || field === 'Email Button Name' || field === 'Email Icons' || field === 'Email Reciepents' || field === 'Email CC' || field === 'Email Subject' || field === 'Email Content' || field === 'SMS Button Name' || field === 'SMS Icons' || field === 'SMS Mobile Number' || field === 'SMS Text') {
        fields.splice(fieldLenth, 1);
      }
    }
    return fields;
  }

  private addCallFormFields(fields: Array<any>): Array<any> {
    this.groups.push({ id: 3, title: '' });
    const icon = [
      { name: 'English', id: '1' },
      { name: 'Hindi', id: '2' },
      { name: 'Tamil', id: '3' },
    ];
    const iconOption = new SelectOption('name', 'id', icon);
    const buttonName = new TextInputField('Mobile Button Name', 'mobileButtonName', 6, undefined, {}, undefined, 1, undefined, 3);
    const iconField = new SearchableSelectInputField('Mobile Icons', 'MobileIcons', iconOption, 6, false, undefined, {}, undefined, undefined, undefined, undefined, undefined, 3);
    const mobile = new TextInputField('Mobile Number', 'mobileNumber', 6, undefined, {}, undefined, 1, undefined, 3);

    fields.splice(fields.length - 1, 0, ...[buttonName, iconField, mobile]);
    return fields;
  }

  private addEmailFormFields(fields: Array<any>): Array<any> {

    this.groups.push({ id: 4, title: 'Email' });
    const icon = [
      { name: 'English', id: '1' },
      { name: 'Hindi', id: '2' },
      { name: 'Tamil', id: '3' },
    ];

    const iconOption = new SelectOption('name', 'id', icon);
    const buttonName = new TextInputField('Email Button Name', 'emailButtonName', 6, undefined, {}, undefined, 1, undefined, 4);
    const iconField = new SearchableSelectInputField('Email Icons', 'emailIcon', iconOption, 6, false, undefined, {}, undefined, undefined, undefined, undefined, undefined, 4);
    const emailTo = new TextInputField('Email Reciepents', 'reciepents', 6, undefined, {}, undefined, 1, undefined, 4);
    const emailCc = new TextInputField('Email CC', 'ccTeciepents', 6, undefined, {}, undefined, 1, undefined, 4);
    const emailSubject = new TextInputField('Email Subject', 'emailSubject', 6, undefined, {}, undefined, 1, undefined, 4);
    const emailContent = new TextInputField('Email Content', 'emailContent', 6, undefined, {}, undefined, 1, undefined, 4);

    fields.splice(fields.length, 0, ...[buttonName, iconField, emailTo, emailCc, emailSubject, emailContent]);
    return fields;
  }

  private addSmsFormFields(fields: Array<any>): Array<any> {
    this.groups.push({ id: 5, title: 'SMS' });
    const icon = [
      { name: 'English', id: '1' },
      { name: 'Hindi', id: '2' },
      { name: 'Tamil', id: '3' },
    ];
    const iconOption = new SelectOption('name', 'id', icon);
    const buttonName = new TextInputField('SMS Button Name', 'smsButtonName', 6, undefined, {}, undefined, 1, undefined, 5);
    const iconField = new SearchableSelectInputField('SMS Icons', 'smsIcon', iconOption, 6, false, undefined, {}, undefined, undefined, undefined, undefined, undefined, 5);
    const mobile = new TextInputField('SMS Mobile Number', 'smsMobileNumber', 6, undefined, {}, undefined, 1, undefined, 5);
    const smsText = new TextInputField('SMS Text', 'smsText', 6, undefined, {}, undefined, 1, undefined, 5);

    fields.splice(fields.length, 0, ...[buttonName, iconField, mobile, smsText]);
    return fields;
  }

  /**
   * This function add marketing content
   * @param  {any} payload: content payload
   */
  public onSubmit(payload) {
    this.showModalLoader = true;
    this.isSubmitDisabled = true;
    payload.marketingContentStatus = 'approved';
    payload.contentCategory = 'broadcast';
    if (environment.name !== 'prod') {
      payload.validFrom = null;
      payload.validTo = null;
      payload.displayTrigger = null;
      payload.uiElementDetails = null;
    }
    const notificationPayload = new NotificationPayload();
    if (this.validateForm(payload)) {
      if (payload.filePath) {
        this._mediaService.addMarketingContentWithDocument(this.selectedFile, payload).subscribe(response => {
          this.showModalLoader = false;
          if (response['errorCode'] === 0) {
            this.isSubmitDisabled = true;
            if (payload.checked) {
              this.sendNotification(notificationPayload);
            }
            Swal.fire('Success', response['errorMessage'], 'success');
            this._dialog.closeAll();
          } else {
            this.isSubmitDisabled = false;
            Swal.fire('Error', response['errorMessage'], 'error');
          }
        });
      } else {
        this._mediaService.addMarketingContent(payload).subscribe(response => {
          this.showModalLoader = false;
          if (response && response['errorCode'] === 0) {
            this.isSubmitDisabled = true;
            if (payload.checked) {
              this.sendNotification(notificationPayload);
            }
            Swal.fire('Success', response['errorMessage'], 'success');
            this._dialog.closeAll();
          } else {
            this.isSubmitDisabled = false;
            Swal.fire('Error', response['errorMessage'], 'error');
          }
        });
      }
    }
  }

  public onSubmitBanner(payload) {
    const actualPayload = this.createJson(payload);
    console.log(actualPayload);
    this.showModalLoader = true;
    this.isSubmitDisabled = true;
    actualPayload.categoryType = 'generic_banner';
    actualPayload.contentCategory = 'subscribed';
    actualPayload.marketingContentStatus = 'approved';
    actualPayload.validFrom = this.changeDateFormat(actualPayload.validFrom);
    actualPayload.validTo = this.changeDateFormat(actualPayload.validTo);
    if (this.validateBannerForm(payload)) {
      this._mediaService.addMarketingContent(actualPayload).subscribe(response => {
        this.showModalLoader = false;
        if (response && response['errorCode'] === 0) {
          if (response['results'] && response['results']['message']) {
            Swal.fire('Error', response['results']['message'], 'error');
            this.isSubmitDisabled = false;
          } else {
            this.isSubmitDisabled = true;
            Swal.fire('Success', response['errorMessage'], 'success');
            this._dialog.closeAll();
          }
        } else {
          Swal.fire('Error', response['errorMessage'], 'error');
        }
      });
    } else {
      this.showModalLoader = false;
      this.isSubmitDisabled = false;
    }
  }

  /**
 * This method return the date .format as 'year-monnth-date'
 * @param  {Date} date
 */
  private changeDateFormat(date: Date) {
    const selectedDate = new Date(date);
    const formatedDate = selectedDate.getFullYear() + '-' + (((selectedDate.getMonth() + 1) >= 10) ? (selectedDate.getMonth() + 1) : '0' + (selectedDate.getMonth() + 1)) + '-' + ((selectedDate.getDate() >= 10) ? selectedDate.getDate() : '0' + selectedDate.getDate());
    return formatedDate;
  }

  private createJson(payload) {
    payload.uiElementDetails = '';
    const jsonArray = [];
    const mobileNumberArray = payload.mobileNumber ? payload.mobileNumber.split(',') : [];
    const emailArray = payload.reciepents ? payload.reciepents.split(',') : [];
    const ccEmailArray = payload.ccReciepents ? payload.ccReciepents.split(',') : [];
    const smsMobileArray = payload.smsMobileNumber ? payload.smsMobileNumber.split(',') : [];
    if (payload.actionOnbanner && payload.actionOnbanner.length) {
      payload.actionOnbanner.forEach(element => {
        switch (element) {
          case 'call':
            jsonArray.push({ action: 'call', reciepents: mobileNumberArray, icon: payload.mobileIcons, buttonName: payload.mobilebuttonName });
            break;
          case 'email':
            jsonArray.push({ action: 'email', reciepents: emailArray, icon: payload.mobileIcons, buttonName: payload.emailButtonName, cc: ccEmailArray, subject: payload.emailSubject, body: payload.emailContent });
            break;
          case 'sms':
            jsonArray.push({ action: 'sms', reciepents: smsMobileArray, icon: payload.smsIcons, buttonName: payload.smsButtonName, body: payload.smsText });
            break;
          default:
            break;
        }
      });
    }
    // if (jsonArray && jsonArray.length) {
    payload.uiElementDetails = JSON.stringify(jsonArray);
    // }
    return payload;
  }

  /**
   * This method is used to send notification
   * @param  {} notificationPayload: notification payload
   */
  private sendNotification(notificationPayload) {
    this._mediaService.sendNotification(notificationPayload).subscribe(response => {
      if (response && response['response_for_topic']) {
        // Snackbar for Notifying Filter Applied
        this.snackbarData = new SnackbarModel('Notification sent');
      } else {
        // Snackbar for Notifying Filter Applied
        this.snackbarData = new SnackbarModel('Unable to send notification');
      }
      this._snackBar.openFromComponent(FortigoSnackbarComponent, { data: this.snackbarData });
    });
  }

  private validateBannerForm(payload) {
    if (!payload.displayTrigger || payload.displayTrigger === '' || payload.displayTrigger === 'NaN') {
      Swal.fire('Please enter the display trigger');
      return false;
    } else if (!payload.filePath || payload.filePath === '' || payload.filePath === 'NaN') {
      Swal.fire('Please select file');
      return false;
    } else if (!payload.validFrom || payload.validFrom === '' || payload.validFrom === 'NaN-0NaN-0NaN') {
      Swal.fire('Please select Banner Valid From Date');
      return false;
    } else if (!payload.validTo || payload.validTo === '' || payload.validTo === 'NaN-0NaN-0NaN') {
      Swal.fire('Please select Banner Valid Till Date');
      return false;
    } else if ((new Date(payload.validTo).getTime() < new Date(payload.validFrom).getTime()) && payload.validTo && payload.validFrom) {
      Swal.fire('Date from cannot be greater than till date');
      return false;
    } else {
      return true;
    }
  }

  /**
 * this funckion validate the required fields of form.
 * @param  {} payload: Form fields.
 * @returns boolean
 */
  private validateForm(payload): boolean {
    if (!payload.contentTitle || payload.contentTitle === '' || payload.contentTitle === 'NaN') {
      Swal.fire('Please enter the title');
      return false;
    } else if (!payload.categoryType || payload.categoryType === '' || payload.categoryType === 'NaN') {
      Swal.fire('Please select category');
      return false;
    } else if (!payload.contentDesc || payload.contentDesc === '' || payload.contentDesc === 'NaN') {
      Swal.fire('Please enter summary');
      return false;
    } else {
      return true;
    }
  }

}
