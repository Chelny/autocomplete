import { Component, Input, HostListener, ViewChild, ElementRef, Renderer2, forwardRef, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Fruit } from './models/fruit';
import { AutocompleteValidator } from 'src/app/validators/autocomplete.validators';
import { Count } from './enums/count.enum';

@Component({
  selector: 'autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true
    }
  ]
})
export class AutocompleteComponent implements ControlValueAccessor {
  public Count = Count;
  @Input() public minChar: number;
  @Input() public resultLimit: number;
  @Input() public minItemsCount: number;
  @Input() public maxItemsCount: number;
  @ViewChild('controlRef', { static: false }) public controlRef: ElementRef;
  @ViewChild('resultRef', { static: false }) public resultRef: ElementRef;
  public disabled: boolean;
  public query: string;
  public result: Fruit[];
  public model: Fruit[];
  private focusLocation: number;
  private onChange = (value: Fruit[]) => { }; // Function to call when the model changes.
  private onTouched = () => { }; // Function to call when the input is touched.
  private _items: Fruit[];

  constructor(private renderer: Renderer2) {
    this.disabled = false;
    this.query = '';
    this.result = new Array<Fruit>();
    this.model = new Array<Fruit>();
    this.focusLocation = 0;
    this._items = new Array<Fruit>();
  }

  public get items(): Array<Fruit> {
    return this._items;
  }

  @Input() public set items(items: Array<Fruit>) {
    this._items = items;
  }

  public updateControl(): void {
    this.onChange(this.model);
    this.onTouched();
  }

  // Allows Angular to update the model.
  // Update the model and changes needed for the view here.
  public writeValue(value: Fruit[]): void {
    this.model = value;
    this.onChange(value);
  }

  // Allows Angular to register a function to call when the model changes.
  // Save the function as a property to call later here.
  public registerOnChange(fn: (value: Fruit[]) => void): void {
    this.onChange = fn;
  }

  // Allows Angular to register a function to call when the input has been touched.
  // Save the function as a property to call later here.
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Allows Angular to disable the input.
  public setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  public validate(control: FormControl): ValidationErrors | null {
    const validator: ValidatorFn = AutocompleteValidator
      .selectionValidator(this.minItemsCount, this.maxItemsCount);

    return validator(control);
  }

  @HostListener('document:click', ['$event']) public onClick(event: any): void {
    const isControl: boolean = event.target.closest('.control-wrapper') || [...event.target.classList].includes('model');

    if (isControl) {
      this.controlRef.nativeElement.focus();
    } else {
      this.clearResult();
    }
  }

  @HostListener('focusin', ['$event']) public onFocus(event: any): void {
    if (this.model.length < this.maxItemsCount) {
      this.enableResult();

      if (this.minChar <= 0) {
        this.fetchData(this.controlRef.nativeElement.value);
      }
    } else {
      event.target.blur();
      this.enableResult(false);
    }
  }

  @HostListener('input', ['$event']) public onInput(event: any): void {
    const query: string = (event.target as any).value;

    if (this.model.length < this.maxItemsCount) {
      this.enableResult();

      if (query.length >= this.minChar) {
        this.fetchData(query);
      } else {
        this.clearResult();
      }
    } else {
      this.enableResult(false);
    }
  }

  @HostListener('keydown', ['$event']) public onKeydown(event: any): void {
    if (this.disabled || !this.resultRef) { return; }

    const keyCode: number = event.keyCode;

    const selectItem = () => {
      const focusedItem: any = this.resultRef.nativeElement.children[this.focusLocation - 1];
      let itemName: string = '';

      if (focusedItem) {
        itemName = focusedItem.innerText;
      } else {
        // If none of the items on the result list is focused and there's only ONE item matching the query, add it to the model on ENTER
        if (this.result.length === 1) {
          itemName = this.result[0].name;
        } else {
          return;
        }
      }

      const item: Fruit = this._items.find((item: Fruit) => item.name === itemName);

      this.model.push(item);
      this.updateControl();
      this.clearResult(true);
    };

    const setFocus = (): void => {
      // Focus on first element, set next focus on last element
      if (this.focusLocation <= 0) {
        this.focusLocation = this.result.length;
      }

      // Focus on last element, set next focus on first element
      if (this.focusLocation > this.result.length) {
        this.focusLocation = 1;
      }

      const resultItem: any = this.resultRef.nativeElement.children[this.focusLocation - 1];

      if (resultItem) {
        resultItem.focus();
      }
    };

    switch (keyCode) {
      case 13: // ENTER
        selectItem();
        break;
      case 38: // UP
        this.focusLocation--;
        setFocus();
        break;
      case 40: // DOWN
        this.focusLocation++;
        setFocus();
        break;
      default:
        break;
    }
  }

  /**
   * Blur focused item on "mouseenter" on the result list
   * @param event 
   */
  public onMouseenter(event: any): void {
    if (!this.resultRef) { return; }
    event.target.focus();
    this.focusLocation = event.target.tabIndex;
  }

  /**
   * Fetch data based on entered query
   * @param query 
   */
  public fetchData(query: string = ''): void {
    this.query = this.normalize(query);

    this.result = this._items
      // Filter out selected items from the result list
      .filter((item: Fruit) => this.model ? this.model.map((modelItem: Fruit) => this.normalize(modelItem.name)).indexOf(this.normalize(item.name)) === -1 : item.name)
      // Filter items based on entered query
      .filter((item: Fruit) => this.normalize(item.name).indexOf(this.query) !== -1)
      // Max results to display on search (resultLimit <= 0 will display all results)
      .slice(0, this.resultLimit <= 0 ? this._items.length : this.resultLimit);
  }

  /**
   * Select item from result list
   * @param item - item to be added to model
   */
  public selectItem(item: Fruit): void {
    const maxItemsCountReached: boolean = this.maxItemsCount > 0 && this.model.length >= this.maxItemsCount;
    const itemExists: boolean = this.model.findIndex((modelItem: Fruit) => modelItem.id === item.id) !== -1;

    if (!maxItemsCountReached && !itemExists) {
      this.model.push(item);
      this.updateControl();
      this.clearResult(true);
    }
  }

  /**
   * Remove item from model
   * @param item - clicked item from input
   */
  public removeItem(item: Fruit): void {
    if (this.disabled) { return; }

    this.enableResult();

    this.model.splice(this.model.findIndex((modelItem: Fruit) => modelItem.id === item.id), 1);
    this.updateControl();
  }

  /**
   * Clear result list (and input)
   * @param clearInput (optional - default: false)
   */
  public clearResult(clearInput: boolean = false): void {
    this.result = [];
    this.focusLocation = 0;

    if (clearInput) {
      this.renderer.setProperty(this.controlRef.nativeElement, 'value', '');
    }
  }

  public enableResult(enable: boolean = true): void {
    const cursor: string = enable ? 'text' : 'default';

    this.renderer.setStyle(this.controlRef.nativeElement, 'cursor', cursor);
  }

  /**
   * Function returns the Unicode Normalization Form of the given string
   * @param value 
   */
  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

}
