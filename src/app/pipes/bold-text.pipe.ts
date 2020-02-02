import { Pipe, PipeTransform, Sanitizer, SecurityContext } from '@angular/core';

@Pipe({
  name: 'boldText'
})
/**
 * Source: https://stackoverflow.com/a/55241923
 */
export class BoldTextPipe implements PipeTransform {
  constructor(private sanitizer: Sanitizer) { }

  public transform(value: string, regex: any): any {
    return this.sanitize(this.replace(value, regex));
  }

  public replace(str: string, regex: any): string {
    if (!regex) { return str; }
    return str.replace(new RegExp(`(${regex})`, 'i'), '<strong>$1</strong>');
  }

  public sanitize(str: string): string {
    return this.sanitizer.sanitize(SecurityContext.HTML, str);
  }
}