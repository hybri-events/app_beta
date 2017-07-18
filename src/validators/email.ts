import { FormControl } from '@angular/forms';

export class EmailValidator {

  static isValid(control: FormControl){
    const re = /[a-zA-Z0-9_.]+@[a-zA-Z_.]+?\.[a-zA-Z]{2,3}$/.test(control.value);

    if (re){
      return null;
    }

    return {
      "invalidEmail": true
    };

  }
}
