import { AbstractControl, ValidatorFn } from '@angular/forms';

export function youtubeUrlValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const url = control.value;
    if (!url) {
      return null; // Return if the control is empty; 'required' validator will handle this
    }

    const pattern = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    const valid = pattern.test(url);
    return valid ? null : { invalidYoutubeUrl: true };
  };
}
