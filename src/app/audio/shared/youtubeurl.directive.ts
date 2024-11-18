import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';
import { youtubeUrlValidator } from './youtubeurl.validator';

@Directive({
  selector: '[appYoutubeUrl]',
  standalone: true,
  providers: [{provide: NG_VALIDATORS, useExisting: YoutubeUrlDirective, multi: true}],
})
export class YoutubeUrlDirective implements Validator {
  validate(control: AbstractControl): { [key: string]: any } | null {
    return youtubeUrlValidator()(control);
  }
}
