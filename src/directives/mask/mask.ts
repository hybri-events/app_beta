import { Directive, Attribute } from '@angular/core';
import { NgModel } from '@angular/forms';
import * as masker from 'vanilla-masker';

@Directive({
    selector: '[mask]',
    host: {
        '(keyup)': 'onInputChange($event)',
    },
    providers: [NgModel]
})
export class MaskDirective {

    pattern: string;

    constructor(
        public model: NgModel,
        @Attribute('mask') pattern: string
    ) {
        this.pattern = pattern;
    }

    onInputChange(event) {
        let value = event.target.value;
        let pattern = this.pattern;
        if (value.length > this.pattern.length) {
        	value = value.substring(0, this.pattern.length);
        }else{
        	value = masker.toPattern(value, pattern);
        }
        this.model.update.emit(value);
    }

}
