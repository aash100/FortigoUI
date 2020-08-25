import { Component, OnInit, Input, OnDestroy, forwardRef, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, SelectControlValueAccessor, NG_VALIDATORS, AbstractControl, ValidationErrors, Validators, Validator } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FortigoConstant } from 'src/app/core/constants/FortigoConstant';

@Component({
  selector: 'app-fortigo-searchable-select',
  templateUrl: './fortigo-searchable-select.component.html',
  styleUrls: ['./fortigo-searchable-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FortigoSearchableSelectComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FortigoSearchableSelectComponent),
      multi: true,
    }
  ]
})
export class FortigoSearchableSelectComponent extends SelectControlValueAccessor implements OnInit, OnDestroy, Validator, OnChanges {

  @Input() input: any;
  @Output() selectFieldChanged = new EventEmitter();
  @Input() multiple = false;
  @Input() limit: number;
  @Input() public themeAppearance = 'legacy';

  /**used to check search placeholder is required or not */
  @Input() isSearchPlaceHolder: boolean;
  selectCtrl = new FormControl();
  selectFilterCtrl = new FormControl();
  placeholder: any;
  public searchPlaceholder = 'Search';
  data: any;
  dataKey: any;
  dataValue: any;
  selectedFields: any;

  // i.e. the option selected by user in select options.
  selectedValue: any;
  required;
  filteredData = new ReplaySubject(1);
  private _onDestroy = new Subject<void>();

  // For deselecting a given option.
  public deSelected: boolean;

  onChange: (_: any) => void;
  onTouched: () => void;
  compareWith: (o1: any, o2: any) => boolean;
  disabled: boolean;
  writeValue(value: any): void {
    if (this.data && this.data.length > 0) {
      this.filteredData.next(this.data.slice());
    }
    if (this.data && this.data.length > 0 && this.limit !== this.data.length) {
      let tempData: Array<any> = this.data.slice(0, this.limit);
      tempData = tempData.concat(this.data.filter((eachData) => eachData[this.input.option.value] === value));
      this.filteredData.next(tempData);
    }
    this.selectCtrl.patchValue(value);
  }

  registerOnChange(fn: (value: any) => any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    // this.onChange = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.selectCtrl.disable();

    } else {
      this.selectCtrl.enable();
    }
  }
  /**
 * used by Validator
 */
  validate(control: AbstractControl): ValidationErrors {
    this.required = control.hasError('required');
    if (this.required && this.selectCtrl.valid) {
      control.setValidators(null);
    } else if (this.required && this.selectCtrl.invalid) {
      control.setValidators([Validators.required]);
    }
    return { 'required': this.required };
  }
  registerOnValidatorChange?(fn: () => void): void {
    // throw new Error("Method not implemented.");
  }

  ngOnInit() {
    this.setProperties();
    // default limit value
    if (!this.limit) {
      this.limit = FortigoConstant.SEARCHABLE_LIMIT_DEFAULT_VALUE;
    }

    this.selectCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      if (this.data && this.data.length > 0) {
        let tempData: Array<any> = this.data.slice(0, this.limit);
        tempData = tempData.concat(this.data.filter((eachData) => eachData[this.input.option.value] === this.selectCtrl.value));
        this.filteredData.next(tempData);
      }
      // console.log('value changed:');
      if (this.selectCtrl) {
        this.onChange(this.selectCtrl.value);
      }
      // this.onChange(this.selectCtrl);
    });
    // set limit to display dropdown
    if (this.limit === -1) {
      this.limit = this.data.length;
    }
    if (this.data && this.data.length > 0) {
      this.filteredData.next(this.data.slice(0, this.limit));
    }
    // set initial value in drop down
    this.selectFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(
      () => {
        this.filterTheData();
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.onChange(this.selectCtrl.value);
    if (changes.limit) {
      this.limit = changes.limit.currentValue;
    }
  }

  public valueChanged(value) {
    console.log('value changed: ', value);
    this.selectedValue = value.value;
    this.deSelected = false;
    this.selectFieldChanged.emit(value);
  }

  private filterTheData() {
    if (!this.data) {
      return;
    }
    let search = this.selectFilterCtrl.value;
    if (!search && search.trim().length === 0) {

      this.loadFilteredData();
      return;
    } else {
      search = search.toLowerCase();
      let tempData = this.data.filter(eachData => {
        if (typeof eachData[this.dataValue] === 'number') {
          eachData[this.dataValue] = eachData[this.dataValue].toString();
        }
        if (typeof eachData[this.dataKey] === 'number') {
          eachData[this.dataKey] = eachData[this.dataKey].toString();
        }
        return eachData[this.dataKey].toLowerCase().includes(search) || eachData[this.dataValue].toLowerCase().includes(search);
      }).slice(0, this.limit);

      tempData = tempData.concat(this.data.filter((eachData) => eachData[this.input.option.value] === this.selectCtrl.value));

      this.filteredData.next(tempData);
    }
  }

  private loadFilteredData() {
    if (this.data && this.data.length > 0) {
      let tempData: Array<any> = this.data.slice(0, this.limit);
      tempData = tempData.concat(this.data.filter((eachData) => eachData[this.input.option.value] === this.selectCtrl.value));
      this.filteredData.next(tempData);
    }
  }

  private setProperties() {
    if (this.input) {
      this.placeholder = this.input.placeholder;
      if (this.input.placeholder && this.input.placeholder !== '' && this.isSearchPlaceHolder) {
        this.searchPlaceholder += ' ' + this.input.placeholder;
      } this.searchPlaceholder += '...';
      if (this.input.option) {
        this.data = this.input.option.data;
        this.dataKey = this.input.option.key;
        this.dataValue = this.input.option.value;
      }
    }
  }

  ngOnDestroy(): void {
    // this._onDestroy.next();
    // this._onDestroy.complete();
  }

  /**
   * for deselecting the options as per clear click of user.
   */
  public removeOption() {
    this.deSelected = true;
  }
}
