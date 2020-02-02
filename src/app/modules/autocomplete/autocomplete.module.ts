import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteComponent } from './autocomplete.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { FruitService } from './services/fruit.service';

@NgModule({
  declarations: [
    AutocompleteComponent
  ],
  imports: [
    CommonModule,
    PipesModule
  ],
  exports: [
    AutocompleteComponent
  ],
  providers: [
    FruitService
  ]
})
export class AutocompleteModule { }
