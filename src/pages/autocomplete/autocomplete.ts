import {Component, NgZone} from '@angular/core';
import {ViewController} from 'ionic-angular';

declare var google;

@Component({
  selector: 'page-autocomplete',
  templateUrl: 'autocomplete.html',
})

export class AutocompletePage {
  autocompleteItems;
  autocomplete;
  service = new google.maps.places.AutocompleteService();

  constructor (public viewCtrl: ViewController, private zone: NgZone) {
    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
  }

  ionViewDidLoad(){
    document.getElementById('search').getElementsByTagName('input')[0].focus();
  }

  dismiss() {
    this.viewCtrl.dismiss({desc:'',id:''});
  }

  chooseItem(item: any) {
    this.viewCtrl.dismiss(item);
  }

  updateSearch() {
    if (this.autocomplete.query == '') {
      this.autocompleteItems = [];
      return;
    }
    let me = this;
    this.service.getPlacePredictions({ input: this.autocomplete.query, componentRestrictions: {country: 'BR'} }, function (predictions, status) {
      me.autocompleteItems = [];
      me.zone.run(function () {
        predictions.forEach(function (prediction) {
          me.autocompleteItems.push({desc: prediction.description, id: prediction.place_id});
        });
      });
    });
  }
}
