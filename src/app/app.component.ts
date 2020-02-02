import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FruitService } from './modules/autocomplete/services/fruit.service';
import { Fruit } from './modules/autocomplete/models/fruit';
import { AutocompleteValidator } from 'src/app/validators/autocomplete.validators';
import { Count } from './modules/autocomplete/enums/count.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public Count = Count;
  public loading: boolean;
  public fruits: Fruit[];
  public minChar: number;
  public resultLimit: number;
  public minItemsCount: number;
  public maxItemsCount: number;
  public autocomplete: Fruit[];
  public form: FormGroup;

  constructor(private formBuilder: FormBuilder, private fruitService: FruitService) {
    this.loading = false;
    this.fruits = null;
    this.minChar = Count.MIN_CHAR;
    this.resultLimit = Count.RESULT_LIMIT;
    this.minItemsCount = Count.MIN_ITEMS_COUNT;
    this.maxItemsCount = Count.MAX_ITEMS_COUNT;
    this.autocomplete = new Array<Fruit>();

    this.fruitService.loadingFruits$.subscribe((loading: boolean) => this.loading = loading);
    this.fruitService.getFruits().subscribe((fruits: Fruit[]) => this.onGetFruitsSuccess(fruits));
  }

  public ngOnInit(): void {
    this.createForm();
  }

  public createForm(): void {
    this.form = this.formBuilder.group({
      minChar: [this.minChar, [
        Validators.required,
        Validators.min(0),
        Validators.pattern(AutocompleteValidator.NUMBER_PATTERN)
      ]],
      resultLimit: [this.resultLimit, [
        Validators.required,
        Validators.min(0),
        Validators.max(Count.ITEMS_COUNT),
        Validators.pattern(AutocompleteValidator.NUMBER_PATTERN)
      ]],
      minItemsCount: [this.minItemsCount, [
        Validators.required,
        Validators.min(0),
        Validators.max(Count.ITEMS_COUNT),
        Validators.pattern(AutocompleteValidator.NUMBER_PATTERN)
      ]],
      maxItemsCount: [this.maxItemsCount, [
        Validators.required,
        Validators.min(1),
        Validators.max(Count.ITEMS_COUNT),
        Validators.pattern(AutocompleteValidator.NUMBER_PATTERN)
      ]],
      autocomplete: [this.autocomplete]
    }, {
      validators: AutocompleteValidator.minLessThanMax('minItemsCount', 'maxItemsCount')
    });

    this.formChange();
  }

  public formChange(): void {
    this.form.get('minChar').valueChanges
      .subscribe((minChar: number) => this.minChar = minChar);

    this.form.get('resultLimit').valueChanges
      .subscribe((resultLimit: number) => this.resultLimit = resultLimit);

    this.form.get('minItemsCount').valueChanges.subscribe((minItemsCount: number) => {
      this.minItemsCount = minItemsCount;
    });

    this.form.get('maxItemsCount').valueChanges.subscribe((maxItemsCount: number) => {
      this.maxItemsCount = maxItemsCount;
    });

    this.form.get('autocomplete').valueChanges
      .subscribe((fruits: Fruit[]) => this.autocomplete = fruits);

    this.form.valueChanges.subscribe((value: { minChar: number, resultLimit: number, minItemsCount: number, maxItemsCount: number, autocomplete: Fruit[] }) => {
      if (value.minChar < 0 || value.resultLimit < 0 || value.minItemsCount < 0 || value.maxItemsCount < 0 || value.minItemsCount > value.maxItemsCount) {
        this.form.get('autocomplete').disable({ emitEvent: false });
      } else {
        this.form.get('autocomplete').enable({ emitEvent: false });
      }
    });
  }

  public onGetFruitsSuccess(fruits: Fruit[]): void {
    this.fruits = [...fruits];

    // Disable form and display a message if the list have not been retrived
    if (this.form && this.fruits.length === 0) {
      this.form.disable();
    }
  }
}
