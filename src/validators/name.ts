import { FormControl } from '@angular/forms';

export class NameValidator {

  static isValid(control: FormControl){
    const re = /^[a-zA-Z ]+$/.test(control.value);

    if (re){
      return null;
    }

    return {
      "invalidName": true
    };

  }
}
