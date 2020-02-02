import { ValidatorFn, ValidationErrors, AbstractControl, FormGroup } from '@angular/forms';

export class AutocompleteValidator {
  public static NUMBER_PATTERN = /^\d+$/;

  /**
   * Check if "minItemsCount" value is not greater than "maxItemsCount" value
   * @param minControlName form key name
   * @param maxControlName form key name
   */
  public static minLessThanMax(minControlName: string, maxControlName: string): ValidatorFn {
    return (form: FormGroup): ValidationErrors | null => {
      if (form.get(minControlName).value > form.get(maxControlName).value) {
        return { minLessThanMax: true };
      }

      return null;
    }
  }

  /**
   * Check if selected items count is in the range defined by user
   * @param min 
   * @param max 
   */
  public static selectionValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value.length < min) {
        return { minItemsCount: true };
      }

      if (control.value.length > max) {
        return { maxItemsCount: true };
      }

      return null;
    }
  }
}