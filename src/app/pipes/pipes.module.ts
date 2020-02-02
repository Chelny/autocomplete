import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { BoldTextPipe } from './bold-text.pipe';

@NgModule({
  declarations: [
    BoldTextPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BoldTextPipe
  ]
})
export class PipesModule {
}
